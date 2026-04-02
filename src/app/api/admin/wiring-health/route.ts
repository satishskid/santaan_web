import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { campaignSpend, contacts } from "@/db/schema";
import { isAuthorizedAdmin } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";

function normalizeToken(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeTags(value?: string | null) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function parseTimestamp(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) return parsed;

  const sqliteLike = trimmed.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?$/);
  if (sqliteLike) {
    const iso = `${sqliteLike[1]}T${sqliteLike[2]}${sqliteLike[3] || ""}Z`;
    const parsedIso = Date.parse(iso);
    return Number.isNaN(parsedIso) ? null : parsedIso;
  }

  return null;
}

function clampNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function sourceBucket(contact: {
  leadSource?: string | null;
  utmSource?: string | null;
  preferredChannel?: string | null;
  tags?: string | null;
}) {
  const leadSource = normalizeToken(contact.leadSource);
  const utmSource = normalizeToken(contact.utmSource);
  const preferredChannel = normalizeToken(contact.preferredChannel);
  const tags = normalizeTags(contact.tags);

  const hay = `${leadSource} ${utmSource} ${preferredChannel} ${tags.join(" ")}`.trim();

  if (leadSource === "neodove_webhook" || hay.includes("neodove")) return "neodove";
  if (leadSource === "voice_ai_inbound" || hay.includes("voice_ai")) return "voice_ai";
  if (leadSource === "call_inbound" || hay.includes("call")) return "calls";
  if (leadSource.startsWith("cta_") || hay.includes("cta_")) return "website_cta";
  if (leadSource === "whatsapp_inbound" || preferredChannel === "whatsapp" || hay.includes("whatsapp")) return "whatsapp";
  if (leadSource === "telegram" || preferredChannel === "telegram" || hay.includes("telegram")) return "telegram";
  if (leadSource === "at_home_page" || hay.includes("at_home_test")) return "at_home";
  if (tags.includes("newsletter") || leadSource === "website" && tags.includes("newsletter")) return "newsletter";
  if (contact.leadSource === null && tags.includes("seminar") || tags.includes("seminar_registered")) return "seminar";
  return "other";
}

function statusBucket(status?: string | null) {
  const token = normalizeToken(status);
  if (token.includes("convert") || token.includes("won")) return "converted";
  if (token.includes("lost") || token.includes("dispose") || token.includes("drop") || token.includes("closed")) return "lost";
  if (token.includes("qualif")) return "qualified";
  if (token.includes("contact") || token.includes("progress")) return "contacted";
  return "new";
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!(await isAuthorizedAdmin(session?.user?.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = Date.now();
    const lookbackMs = 24 * 60 * 60 * 1000;
    const since = now - lookbackMs;

    const recentContacts = await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.lastContact), desc(contacts.createdAt), desc(contacts.id))
      .limit(1500);

    const buckets: Record<string, { total24h: number; converted24h: number; lastSeenAt: number | null }> = {};
    const ensureBucket = (key: string) => {
      if (!buckets[key]) {
        buckets[key] = { total24h: 0, converted24h: 0, lastSeenAt: null };
      }
      return buckets[key];
    };

    for (const contact of recentContacts) {
      const key = sourceBucket(contact);
      const bucket = ensureBucket(key);
      const anchor =
        parseTimestamp((contact as { lastMessageAt?: string | null }).lastMessageAt) ||
        parseTimestamp((contact as { lastContact?: string | null }).lastContact) ||
        parseTimestamp((contact as { createdAt?: string | null }).createdAt);

      if (anchor !== null) {
        bucket.lastSeenAt = bucket.lastSeenAt === null ? anchor : Math.max(bucket.lastSeenAt, anchor);
      }

      if (anchor !== null && anchor >= since) {
        bucket.total24h += 1;
        if (statusBucket((contact as { status?: string | null }).status) === "converted") {
          bucket.converted24h += 1;
        }
      }
    }

    const spendRows = await db.select().from(campaignSpend).orderBy(desc(campaignSpend.spendDate), desc(campaignSpend.id)).limit(250);
    const spendSummary = spendRows.reduce(
      (acc, row) => {
        acc.total += Number(row.amount || 0);
        acc.count += 1;
        const parsed = parseTimestamp(`${row.spendDate}T00:00:00Z`);
        if (parsed !== null) {
          acc.lastSeenAt = acc.lastSeenAt === null ? parsed : Math.max(acc.lastSeenAt, parsed);
        }
        return acc;
      },
      { total: 0, count: 0, lastSeenAt: null as number | null }
    );

    const requiredBuckets = ["neodove", "voice_ai", "calls", "website_cta", "whatsapp", "telegram", "at_home", "newsletter", "seminar"];
    requiredBuckets.forEach((key) => ensureBucket(key));

    return NextResponse.json({
      ok: true,
      now: new Date(now).toISOString(),
      last24h: {
        since: new Date(since).toISOString(),
        buckets,
      },
      spend: {
        count: clampNonNegative(spendSummary.count),
        total: clampNonNegative(spendSummary.total),
        lastSeenAt: spendSummary.lastSeenAt ? new Date(spendSummary.lastSeenAt).toISOString() : null,
      },
      debug: {
        contactsScanned: recentContacts.length,
        requestUrl: request.url,
      },
    });
  } catch (error) {
    console.error("Wiring health error:", error);
    return NextResponse.json({ error: "Failed to load wiring health" }, { status: 500 });
  }
}
