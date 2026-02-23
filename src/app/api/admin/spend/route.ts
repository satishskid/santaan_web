import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { campaignSpend } from "@/db/schema";
import { isAuthorizedAdmin } from "@/lib/auth-helper";

async function requireAdmin() {
  const session = await auth();
  return isAuthorizedAdmin(session?.user?.email);
}

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

function parseAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const safe = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safe)) return null;
  return safe;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));

    const whereClause =
      from && to
        ? and(gte(campaignSpend.spendDate, from), lte(campaignSpend.spendDate, to))
        : from
          ? gte(campaignSpend.spendDate, from)
          : to
            ? lte(campaignSpend.spendDate, to)
            : undefined;

    const rows = await db
      .select()
      .from(campaignSpend)
      .where(whereClause)
      .orderBy(desc(campaignSpend.spendDate), desc(campaignSpend.id));

    const totalRow = await db
      .select({ total: sql<number>`COALESCE(SUM(${campaignSpend.amount}), 0)` })
      .from(campaignSpend)
      .where(whereClause)
      .get();

    return NextResponse.json({
      spend: rows,
      summary: {
        total: Number(totalRow?.total || 0),
        count: rows.length,
      },
    });
  } catch (error) {
    console.error("Fetch spend error:", error);
    return NextResponse.json({ error: "Failed to fetch spend entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const spendDate = parseDate(body?.spendDate);
    const channel = normalizeToken(body?.channel);
    const utmCampaign = normalizeToken(body?.utmCampaign);
    const center = normalizeToken(body?.center, "network");
    const asset = normalizeToken(body?.asset || "", "");
    const amount = parseAmount(body?.amount);

    if (!spendDate || !channel || !utmCampaign || amount === null) {
      return NextResponse.json(
        { error: "spendDate, channel, utmCampaign, and valid amount are required" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(campaignSpend)
      .values({
        spendDate,
        channel,
        utmCampaign,
        center,
        asset: asset || null,
        amount,
        notes: typeof body?.notes === "string" ? body.notes.trim() : null,
      })
      .returning();

    return NextResponse.json({ success: true, entry: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Create spend error:", error);
    return NextResponse.json({ error: "Failed to create spend entry" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body?.spendDate !== undefined) {
      const spendDate = parseDate(body.spendDate);
      if (!spendDate) return NextResponse.json({ error: "Invalid spendDate" }, { status: 400 });
      updateData.spendDate = spendDate;
    }
    if (body?.channel !== undefined) {
      const channel = normalizeToken(body.channel);
      if (!channel) return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
      updateData.channel = channel;
    }
    if (body?.utmCampaign !== undefined) {
      const utmCampaign = normalizeToken(body.utmCampaign);
      if (!utmCampaign) return NextResponse.json({ error: "Invalid utmCampaign" }, { status: 400 });
      updateData.utmCampaign = utmCampaign;
    }
    if (body?.center !== undefined) {
      updateData.center = normalizeToken(body.center, "network");
    }
    if (body?.asset !== undefined) {
      updateData.asset = normalizeToken(body.asset, "") || null;
    }
    if (body?.amount !== undefined) {
      const amount = parseAmount(body.amount);
      if (amount === null) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      updateData.amount = amount;
    }
    if (body?.notes !== undefined) {
      updateData.notes = typeof body.notes === "string" ? body.notes.trim() : null;
    }

    const updated = await db
      .update(campaignSpend)
      .set(updateData)
      .where(eq(campaignSpend.id, id))
      .returning();

    if (!updated[0]) {
      return NextResponse.json({ error: "Spend entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, entry: updated[0] });
  } catch (error) {
    console.error("Update spend error:", error);
    return NextResponse.json({ error: "Failed to update spend entry" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
    }

    await db.delete(campaignSpend).where(eq(campaignSpend.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete spend error:", error);
    return NextResponse.json({ error: "Failed to delete spend entry" }, { status: 500 });
  }
}
