import { NextRequest, NextResponse } from "next/server";
import { syncMetaAudiences } from "@/lib/meta-audiences";

export const runtime = "nodejs";

function isVercelCron(req: NextRequest) {
  const cronHeader = req.headers.get("x-vercel-cron");
  if (cronHeader) return true;
  const scheduledHeader = req.headers.get("x-vercel-scheduled");
  if (scheduledHeader) return true;
  const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
  return userAgent.includes("vercel-cron");
}

function isAuthorized(req: NextRequest) {
  if (isVercelCron(req)) return true;
  const secret = String(process.env.META_AUDIENCE_SYNC_SECRET || "").trim();
  if (!secret) return false;
  const header = req.headers.get("x-cron-secret") || req.headers.get("authorization");
  const token = new URL(req.url).searchParams.get("token");
  return header === secret || token === secret || header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await syncMetaAudiences("all");
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error("Meta cron audience sync error:", error);
    const message = error instanceof Error ? error.message : "Meta audience cron sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
