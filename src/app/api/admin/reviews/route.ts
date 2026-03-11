import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { reputationReviews } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import {
  computeReviewSummary,
  extractThemes,
  inferSentiment,
  isAllowedReviewValue,
  normalizeReviewToken,
  parseRating,
  parseReviewDate,
  REVIEW_CENTERS,
  REVIEW_RESPONSE_STATUS,
  REVIEW_SOURCES,
} from "@/lib/reviews";

const READ_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "marketing_manager", "agency_ops", "performance_marketer", "counselor"]);
const WRITE_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "marketing_manager", "agency_ops", "performance_marketer", "counselor"]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

function normalizeFilterToken(value?: string | null) {
  const token = normalizeReviewToken(value);
  if (!token || token === "all") return null;
  return token;
}

async function requireReviewsAccess() {
  const session = await auth();
  const sessionRole = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  const authorized = await isAuthorizedOpsUser(session?.user?.email, sessionRole);
  return { authorized, role: sessionRole || "admin" };
}

export async function GET(request: NextRequest) {
  try {
    const { authorized, role } = await requireReviewsAccess();
    if (!authorized || !READ_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = parseReviewDate(searchParams.get("from"));
    const to = parseReviewDate(searchParams.get("to"));
    const center = normalizeFilterToken(searchParams.get("center"));
    const source = normalizeFilterToken(searchParams.get("source"));
    const responseStatus = normalizeFilterToken(searchParams.get("responseStatus"));
    const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : null;

    const conditions = [];
    if (from) conditions.push(gte(reputationReviews.reviewDate, from));
    if (to) conditions.push(lte(reputationReviews.reviewDate, to));
    if (center) conditions.push(eq(reputationReviews.center, center));
    if (source) conditions.push(eq(reputationReviews.source, source));
    if (responseStatus) conditions.push(eq(reputationReviews.responseStatus, responseStatus));
    if (minRating && Number.isFinite(minRating)) conditions.push(gte(reputationReviews.rating, minRating));

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;
    const rows = await db
      .select()
      .from(reputationReviews)
      .where(whereClause)
      .orderBy(desc(reputationReviews.reviewDate), desc(reputationReviews.id));

    return NextResponse.json({ rows, summary: computeReviewSummary(rows) });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, role } = await requireReviewsAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const source = normalizeReviewToken(body?.source);
    const center = normalizeReviewToken(body?.center);
    const reviewerName = String(body?.reviewerName || "").trim() || null;
    const rating = parseRating(body?.rating);
    const reviewDate = parseReviewDate(body?.reviewDate);
    const headline = String(body?.headline || "").trim() || null;
    const reviewText = String(body?.reviewText || "").trim();
    const publicUrl = String(body?.publicUrl || "").trim() || null;
    const responseStatus = normalizeReviewToken(body?.responseStatus || "pending");
    const responseOwner = String(body?.responseOwner || "").trim() || null;
    const responseText = String(body?.responseText || "").trim() || null;
    const notes = String(body?.notes || "").trim() || null;
    const isFeatured = Boolean(body?.isFeatured);

    if (!isAllowedReviewValue(source, REVIEW_SOURCES)) {
      return NextResponse.json({ error: "source must be google/meta/manual" }, { status: 400 });
    }
    if (!isAllowedReviewValue(center, REVIEW_CENTERS)) {
      return NextResponse.json({ error: "center must be bhubaneswar/berhampur/bangalore/angul/network" }, { status: 400 });
    }
    if (!rating || !reviewDate || !reviewText) {
      return NextResponse.json({ error: "rating, reviewDate, and reviewText are required" }, { status: 400 });
    }
    if (!isAllowedReviewValue(responseStatus, REVIEW_RESPONSE_STATUS)) {
      return NextResponse.json({ error: "responseStatus must be pending/responded/escalated/not_needed" }, { status: 400 });
    }

    const themes = extractThemes(reviewText);
    const sentiment = inferSentiment(rating, reviewText);
    const respondedAt = responseStatus === "responded" ? new Date().toISOString() : null;

    const inserted = await db
      .insert(reputationReviews)
      .values({
        source,
        center,
        reviewerName,
        rating,
        reviewDate,
        headline,
        reviewText,
        publicUrl,
        sentiment,
        themes: JSON.stringify(themes),
        responseStatus,
        responseOwner,
        responseText,
        respondedAt,
        isFeatured,
        notes,
      })
      .returning();

    return NextResponse.json({ success: true, row: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { authorized, role } = await requireReviewsAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
    }

    const source = normalizeReviewToken(body?.source);
    const center = normalizeReviewToken(body?.center);
    const reviewerName = String(body?.reviewerName || "").trim() || null;
    const rating = parseRating(body?.rating);
    const reviewDate = parseReviewDate(body?.reviewDate);
    const headline = String(body?.headline || "").trim() || null;
    const reviewText = String(body?.reviewText || "").trim();
    const publicUrl = String(body?.publicUrl || "").trim() || null;
    const responseStatus = normalizeReviewToken(body?.responseStatus || "pending");
    const responseOwner = String(body?.responseOwner || "").trim() || null;
    const responseText = String(body?.responseText || "").trim() || null;
    const notes = String(body?.notes || "").trim() || null;
    const isFeatured = Boolean(body?.isFeatured);
    const isActive = body?.isActive === undefined ? true : Boolean(body.isActive);

    if (!isAllowedReviewValue(source, REVIEW_SOURCES)) {
      return NextResponse.json({ error: "source must be google/meta/manual" }, { status: 400 });
    }
    if (!isAllowedReviewValue(center, REVIEW_CENTERS)) {
      return NextResponse.json({ error: "center must be bhubaneswar/berhampur/bangalore/angul/network" }, { status: 400 });
    }
    if (!rating || !reviewDate || !reviewText) {
      return NextResponse.json({ error: "rating, reviewDate, and reviewText are required" }, { status: 400 });
    }
    if (!isAllowedReviewValue(responseStatus, REVIEW_RESPONSE_STATUS)) {
      return NextResponse.json({ error: "responseStatus must be pending/responded/escalated/not_needed" }, { status: 400 });
    }

    const themes = extractThemes(reviewText);
    const sentiment = inferSentiment(rating, reviewText);
    const respondedAt = responseStatus === "responded" ? new Date().toISOString() : null;

    const updated = await db
      .update(reputationReviews)
      .set({
        source,
        center,
        reviewerName,
        rating,
        reviewDate,
        headline,
        reviewText,
        publicUrl,
        sentiment,
        themes: JSON.stringify(themes),
        responseStatus,
        responseOwner,
        responseText,
        respondedAt,
        isFeatured,
        isActive,
        notes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reputationReviews.id, id))
      .returning();

    return NextResponse.json({ success: true, row: updated[0] });
  } catch (error) {
    console.error("Reviews PUT error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { authorized, role } = await requireReviewsAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
    }

    await db.delete(reputationReviews).where(eq(reputationReviews.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reviews DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
