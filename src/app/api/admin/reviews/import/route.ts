import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { reputationReviews } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import {
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

const WRITE_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "marketing_manager", "agency_ops", "performance_marketer", "counselor"]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, role);
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (!rows.length) {
      return NextResponse.json({ error: "rows are required" }, { status: 400 });
    }

    const toInsert = [];
    const errors = [];

    for (let index = 0; index < rows.length; index += 1) {
      const raw = rows[index] || {};
      const source = normalizeReviewToken(raw.source);
      const center = normalizeReviewToken(raw.center);
      const rating = parseRating(raw.rating);
      const reviewDate = parseReviewDate(raw.reviewDate || raw.date);
      const reviewText = String(raw.reviewText || raw.review_text || raw.text || "").trim();
      const responseStatus = normalizeReviewToken(raw.responseStatus || raw.response_status || "pending");

      if (!isAllowedReviewValue(source, REVIEW_SOURCES) || !isAllowedReviewValue(center, REVIEW_CENTERS) || !rating || !reviewDate || !reviewText || !isAllowedReviewValue(responseStatus, REVIEW_RESPONSE_STATUS)) {
        errors.push({ row: index + 2, error: "Invalid source/center/rating/reviewDate/reviewText/responseStatus" });
        continue;
      }

      toInsert.push({
        source,
        center,
        reviewerName: String(raw.reviewerName || raw.reviewer_name || "").trim() || null,
        rating,
        reviewDate,
        headline: String(raw.headline || "").trim() || null,
        reviewText,
        publicUrl: String(raw.publicUrl || raw.public_url || "").trim() || null,
        sentiment: inferSentiment(rating, reviewText),
        themes: JSON.stringify(extractThemes(reviewText)),
        responseStatus,
        responseOwner: String(raw.responseOwner || raw.response_owner || "").trim() || null,
        responseText: String(raw.responseText || raw.response_text || "").trim() || null,
        respondedAt: responseStatus === "responded" ? new Date().toISOString() : null,
        isFeatured: ["1", "true", "yes"].includes(String(raw.isFeatured || raw.is_featured || "").trim().toLowerCase()),
        isActive: true,
        notes: String(raw.notes || "").trim() || null,
      });
    }

    if (toInsert.length) {
      await db.insert(reputationReviews).values(toInsert);
    }

    return NextResponse.json({ success: true, imported: toInsert.length, failed: errors.length, errors });
  } catch (error) {
    console.error("Reviews import error:", error);
    return NextResponse.json({ error: "Failed to import reviews" }, { status: 500 });
  }
}
