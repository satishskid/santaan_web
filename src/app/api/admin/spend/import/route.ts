import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaignSpend } from "@/db/schema";
import { requireSpendAccess } from "@/lib/spend-auth";

type IncomingSpendRow = {
  spendDate?: string;
  channel?: string;
  utmCampaign?: string;
  center?: string;
  asset?: string;
  amount?: string | number;
  notes?: string;
};

function normalizeToken(value?: string | null, fallback = "") {
  if (!value) return fallback;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || fallback;
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const safe = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safe)) return null;
  return safe;
}

function parseAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}

export async function POST(request: NextRequest) {
  try {
    const { authorized } = await requireSpendAccess();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? (body.rows as IncomingSpendRow[]) : [];
    if (!rows.length) {
      return NextResponse.json({ error: "rows[] is required" }, { status: 400 });
    }

    const maxRows = 1000;
    if (rows.length > maxRows) {
      return NextResponse.json({ error: `Maximum ${maxRows} rows per import` }, { status: 400 });
    }

    const errors: Array<{ row: number; error: string }> = [];
    let imported = 0;

    for (let index = 0; index < rows.length; index += 1) {
      const raw = rows[index];
      const rowNo = index + 1;
      const spendDate = parseDate(raw?.spendDate);
      const channel = normalizeToken(raw?.channel);
      const utmCampaign = normalizeToken(raw?.utmCampaign);
      const center = normalizeToken(raw?.center, "network");
      const asset = normalizeToken(raw?.asset || "", "");
      const amount = parseAmount(raw?.amount);

      if (!spendDate || !channel || !utmCampaign || amount === null) {
        errors.push({
          row: rowNo,
          error: "Invalid/missing spendDate, channel, utmCampaign, or amount",
        });
        continue;
      }

      try {
        await db.insert(campaignSpend).values({
          spendDate,
          channel,
          utmCampaign,
          center,
          asset: asset || null,
          amount,
          notes: typeof raw?.notes === "string" ? raw.notes.trim() : null,
        });
        imported += 1;
      } catch (error) {
        errors.push({
          row: rowNo,
          error: error instanceof Error ? error.message : "Failed to insert row",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      failed: errors.length,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    console.error("Spend import error:", error);
    return NextResponse.json({ error: "Failed to import spend rows" }, { status: 500 });
  }
}
