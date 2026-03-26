import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { contacts, neodoveEvents, metaConversionEvents } from "@/db/schema";
import { fetchMetaDashboardSnapshot, readMetaAdsConfig } from "@/lib/meta-ads";
import { fetchSearchConsoleSnapshot, readSearchConsoleConfig } from "@/lib/search-console";

export const runtime = "nodejs";

const AUTHORIZED_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, role);

    if (!authorized || !AUTHORIZED_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks: any[] = [];
    const now = new Date().toISOString();
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. NeoDove Sync Errors (Last 24h)
    const syncErrors = await db
      .select()
      .from(neodoveEvents)
      .where(
        and(
          eq(neodoveEvents.processStatus, "error"),
          gte(neodoveEvents.receivedAt, last24h)
        )
      )
      .limit(5);

    syncErrors.forEach((err) => {
      tasks.push({
        id: `neodove_err_${err.id}`,
        type: "system",
        priority: "high",
        title: "NeoDove Sync Error",
        description: `Failed to push lead ${err.mobile || "unknown"} to NeoDove: ${err.errorMessage}`,
        status: "pending",
        actionLabel: "Fix & Retry",
        metadata: { eventId: err.id, mobile: err.mobile },
      });
    });

    // 2. Meta CAPI Errors (Last 24h)
    const capiErrors = await db
      .select()
      .from(metaConversionEvents)
      .where(
        and(
          eq(metaConversionEvents.processStatus, "error"),
          gte(metaConversionEvents.receivedAt, last24h)
        )
      )
      .limit(5);

    capiErrors.forEach((err) => {
      tasks.push({
        id: `meta_capi_err_${err.id}`,
        type: "system",
        priority: "medium",
        title: "Meta Signal Error",
        description: `Failed to send conversion signal for lead ${err.contactId}: ${err.errorMessage}`,
        status: "pending",
        actionLabel: "Check Signal",
        metadata: { eventId: err.id, contactId: err.contactId },
      });
    });

    // 3. Missing Follow-ups for Qualified Leads
    const missingFollowups = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.neodoveMappedStatus, "Qualified"),
          isNull(contacts.nextFollowUpAt)
        )
      )
      .limit(5);

    missingFollowups.forEach((contact) => {
      tasks.push({
        id: `followup_${contact.id}`,
        type: "followup",
        priority: "high",
        title: "Missing Follow-up Date",
        description: `Lead ${contact.name || contact.phone} is Qualified but has no follow-up date scheduled.`,
        status: "pending",
        actionLabel: "Schedule Call",
        contactId: contact.id,
      });
    });

    // 4. Leakage Detective: High-Intent Leads Breaching 24h SLA
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const leakedLeads = await db
      .select({
        id: contacts.id,
        name: contacts.name,
        phone: contacts.phone,
        utmCampaign: contacts.utmCampaign,
        createdAt: contacts.createdAt,
      })
      .from(contacts)
      .where(
        and(
          // Created more than 24 hours ago
          sql`${contacts.createdAt} < ${twentyFourHoursAgo}`,
          // But still in 'New' status (meaning telecallers haven't touched them)
          eq(contacts.status, "New")
        )
      )
      .limit(10);

    if (leakedLeads.length > 0) {
      // Group them by campaign to give better context
      const campaignsAffected = [...new Set(leakedLeads.map(l => l.utmCampaign || 'Organic/Direct'))].join(', ');
      
      tasks.push({
        id: `leakage_alert_${Date.now()}`,
        type: "system",
        priority: "high",
        title: "SLA Leakage: Leads Ignored > 24h",
        description: `${leakedLeads.length} new leads have been sitting untouched for over 24 hours.`,
        reasoning: `Marketing spent money to acquire these leads from campaigns like '${campaignsAffected}', but they are going cold because the sales team hasn't initiated the first call. Speed to lead is critical for conversion.`,
        status: "pending",
        actionLabel: "Nudge Sales Team",
        guidedAction: {
          type: "copy_message",
          message: `Hi Team, we currently have ${leakedLeads.length} leads in the CRM that were generated over 24 hours ago but haven't been called yet. Let's prioritize these immediately before they go cold!`,
        },
      });
    }

    // 6. Content Idea Generator (NeoDove Lost Reasons + Search Console)
    try {
      const gscConfig = readSearchConsoleConfig();
      if (gscConfig) {
        // Find the top reasons leads were lost in the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const lostReasons = await db
          .select({
            reason: contacts.neodoveDisposeReason,
            count: sql<number>`count(*)`,
          })
          .from(contacts)
          .where(
            and(
              eq(contacts.status, "Lost"),
              gte(contacts.createdAt, sevenDaysAgo),
              sql`${contacts.neodoveDisposeReason} IS NOT NULL`
            )
          )
          .groupBy(contacts.neodoveDisposeReason)
          .orderBy(desc(sql`count(*)`))
          .limit(3)
          .all();

        if (lostReasons.length > 0) {
          const topReason = lostReasons[0].reason;
          
          // Get trending search queries from GSC to align with content creation
          const gscSnapshot = await fetchSearchConsoleSnapshot(gscConfig, 7);
          const topQueries = gscSnapshot.topQueries.slice(0, 3).map((q: any) => q.query).join(", ");

          tasks.push({
            id: `content_idea_${Date.now()}`,
            type: "marketing",
            priority: "medium",
            title: "Content Idea: Address Patient Objections",
            description: `We lost ${lostReasons[0].count} leads this week due to: '${topReason}'.`,
            reasoning: `Your telecallers are struggling with the objection '${topReason}'. Meanwhile, patients are actively searching Google for: '${topQueries}'. Creating content that addresses this objection using these keywords will capture high-intent traffic and give your sales team a resource to send to hesitant patients.`,
            status: "pending",
            actionLabel: "Generate Brief",
            guidedAction: {
              type: "copy_message",
              message: `Draft a blog post brief addressing the patient concern: "${topReason}". Ensure the content includes the following keywords that are currently trending on our Google Search Console: ${topQueries}. The goal is to provide a reassuring answer that our telecallers can share via WhatsApp when patients raise this objection.`,
            },
          });
        }
      }
    } catch (gscErr) {
      console.error("Action board GSC check error:", gscErr);
    }
    try {
      const metaConfig = readMetaAdsConfig();
      if (metaConfig) {
        const reportingTimeZone = process.env.META_REPORTING_TIMEZONE || "Asia/Kolkata";
        const untilDate = new Date();
        const sinceDate = new Date();
        sinceDate.setDate(untilDate.getDate() - 6); // Last 7 days

        const formatDate = (date: Date) => {
          return new Intl.DateTimeFormat("en-CA", {
            timeZone: reportingTimeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(date);
        };

        const snapshot = await fetchMetaDashboardSnapshot({
          since: formatDate(sinceDate),
          until: formatDate(untilDate),
          windowDays: 7,
        });

        // Get actual conversions from DB for these campaigns
        const campaignNames = snapshot.campaigns.map(c => c.campaignName).filter(Boolean) as string[];
        const dbConversions = await db
          .select({
            campaign: contacts.utmCampaign,
            convertedCount: sql<number>`SUM(CASE WHEN ${contacts.neodoveMappedStatus} = 'Converted' THEN 1 ELSE 0 END)`,
            qualifiedCount: sql<number>`SUM(CASE WHEN ${contacts.neodoveMappedStatus} = 'Qualified' THEN 1 ELSE 0 END)`,
          })
          .from(contacts)
          .where(sql`${contacts.utmCampaign} IN ${campaignNames}`)
          .groupBy(contacts.utmCampaign)
          .all();

        const conversionMap = new Map(dbConversions.map(c => [c.campaign, c]));

        const underperforming = snapshot.campaigns.filter(c => c.spend > 3000);
        
        underperforming.forEach(c => {
          const dbData = conversionMap.get(c.campaignName || '');
          const actualConverted = dbData?.convertedCount || 0;
          const actualQualified = dbData?.qualifiedCount || 0;
          
          // Rule: If spend > 3k and (Leads are 0 OR actual Converted is 0)
          if (c.leads === 0 || actualConverted === 0) {
            const reason = c.leads === 0 
              ? `This campaign spent ₹${Math.round(c.spend)} but generated 0 leads in the last 7 days.`
              : `This campaign got ${c.leads} leads in Meta, but 0 have converted to patients in NeoDove. The lead quality is poor.`;

            tasks.push({
              id: `agency_challenge_${c.campaignId || 'unknown'}`,
              type: "marketing",
              priority: actualConverted === 0 && c.spend > 5000 ? "high" : "medium",
              title: "Agency Challenger: Poor ROI",
              description: reason,
              reasoning: `Proof of the Pudding: Meta spent ₹${Math.round(c.spend)} on '${c.campaignName}', but NeoDove shows ${actualConverted} conversions and ${actualQualified} qualified leads.`,
              status: "pending",
              actionLabel: "Challenge Agency",
              guidedAction: {
                type: "copy_message",
                message: `Hi Team, I'm reviewing the '${c.campaignName}' campaign. It has spent ₹${Math.round(c.spend)} this week but we have ${actualConverted} patient conversions in our CRM. Let's pause this and shift the budget to our better performing campaigns.`,
              },
              metadata: { campaignId: c.campaignId, spend: c.spend },
            });
          }
        });
      }
    } catch (metaErr) {
      console.error("Action board Meta check error:", metaErr);
    }

    return NextResponse.json({
      ok: true,
      tasks: tasks.sort((a, b) => {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return (priorityScore[b.priority as keyof typeof priorityScore] || 0) - (priorityScore[a.priority as keyof typeof priorityScore] || 0);
      }),
    });
  } catch (error) {
    console.error("Action board tasks API error:", error);
    return NextResponse.json({ error: "Failed to load action tasks" }, { status: 500 });
  }
}
