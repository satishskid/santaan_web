import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { campaignSpend, contacts } from "@/db/schema";
import { gte } from "drizzle-orm";

export const runtime = "nodejs";

const READ_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
]);

const DEFAULT_RULES = {
  minQualified: 4,
  maxQualifiedCpa: 1800,
  pauseSpendThreshold: 3000,
  maxQualifiedCpaForPause: 4000,
};

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

function normalizeToken(value?: string | null, fallback = "unknown") {
  const token = String(value || "").trim().toLowerCase();
  return token || fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, role);

    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = new URL(req.url).searchParams;
    const windowDays = clamp(parseNumber(params.get("days"), 30), 7, 90);
    const rules = {
      minQualified: Math.max(1, Math.round(parseNumber(params.get("minQualified"), DEFAULT_RULES.minQualified))),
      maxQualifiedCpa: Math.max(100, Math.round(parseNumber(params.get("maxQualifiedCpa"), DEFAULT_RULES.maxQualifiedCpa))),
      pauseSpendThreshold: Math.max(500, Math.round(parseNumber(params.get("pauseSpendThreshold"), DEFAULT_RULES.pauseSpendThreshold))),
      maxQualifiedCpaForPause: Math.max(500, Math.round(parseNumber(params.get("maxQualifiedCpaForPause"), DEFAULT_RULES.maxQualifiedCpaForPause))),
    };

    const sinceDate = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const [spendRows, contactRows] = await Promise.all([
      db
        .select()
        .from(campaignSpend)
        .where(gte(campaignSpend.spendDate, sinceDate)),
      db.select().from(contacts),
    ]);

    const spendByCampaign = spendRows.reduce((acc, row) => {
      const token = normalizeToken(row.utmCampaign, "organic");
      acc[token] = (acc[token] || 0) + Number(row.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const byCampaign = contactRows.reduce((acc, contact) => {
      if (!contact.utmCampaign) return acc;
      const campaign = normalizeToken(contact.utmCampaign, "organic");
      if (!acc[campaign]) {
        acc[campaign] = { leads: 0, qualified: 0, converted: 0 };
      }
      const status = String(contact.status || "").toLowerCase();
      const createdAt = parseDate(contact.createdAt);
      if (createdAt && createdAt < Date.now() - windowDays * 24 * 60 * 60 * 1000) {
        return acc;
      }
      acc[campaign].leads += 1;
      if (status === "qualified" || status === "converted") acc[campaign].qualified += 1;
      if (status === "converted") acc[campaign].converted += 1;
      return acc;
    }, {} as Record<string, { leads: number; qualified: number; converted: number }>);

    const qualifiedRecommendations = Object.entries(byCampaign)
      .map(([campaign, data]) => {
        const spend = spendByCampaign[normalizeToken(campaign, "organic")] || 0;
        const qualifiedCpa = data.qualified > 0 ? spend / data.qualified : Number.POSITIVE_INFINITY;
        return {
          campaign,
          leads: data.leads,
          qualified: data.qualified,
          converted: data.converted,
          spend,
          qualifiedCpa,
        };
      })
      .filter((row) => row.spend > 0)
      .sort((a, b) => a.qualifiedCpa - b.qualifiedCpa);

    const scaleQualified = qualifiedRecommendations
      .filter((row) => row.qualified >= rules.minQualified && row.qualifiedCpa <= rules.maxQualifiedCpa)
      .slice(0, 5);

    const pauseQualified = qualifiedRecommendations
      .filter(
        (row) =>
          (row.spend >= rules.pauseSpendThreshold && row.qualified === 0) ||
          (row.qualified >= rules.minQualified && row.qualifiedCpa >= rules.maxQualifiedCpaForPause)
      )
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      windowDays,
      rules,
      scaleQualified,
      pauseQualified,
    });
  } catch (error) {
    console.error("Performance rules fetch error:", error);
    return NextResponse.json({ error: "Failed to load performance rules" }, { status: 500 });
  }
}
