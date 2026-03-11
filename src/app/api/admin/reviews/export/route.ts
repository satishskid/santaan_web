import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { reputationReviews } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";

export const runtime = "nodejs";

const READ_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "marketing_manager", "agency_ops", "performance_marketer", "counselor"]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

function escapeCsv(value: unknown) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const role = normalizeRole((session?.user as { role?: string } | undefined)?.role) || "admin";
  const authorized = await isAuthorizedOpsUser(session?.user?.email, role);
  if (!authorized || !READ_ROLES.has(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const format = String(searchParams.get("format") || "csv").trim().toLowerCase();
  const featuredOnly = searchParams.get("featured") !== "false";
  const center = String(searchParams.get("center") || "").trim().toLowerCase();

  const conditions = [];
  if (featuredOnly) conditions.push(eq(reputationReviews.isFeatured, true));
  if (center && center !== "all") conditions.push(eq(reputationReviews.center, center));

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;
  const rows = await db
    .select()
    .from(reputationReviews)
    .where(whereClause)
    .orderBy(desc(reputationReviews.rating), desc(reputationReviews.reviewDate));

  if (format === "json") {
    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      featuredOnly,
      count: rows.length,
      rows,
    });
  }

  const csvRows = [
    [
      "source",
      "center",
      "reviewer_name",
      "rating",
      "review_date",
      "review_text",
      "response_status",
      "is_featured",
      "themes",
      "notes",
    ].join(","),
    ...rows.map((row) =>
      [
        row.source,
        row.center,
        row.reviewerName,
        row.rating,
        row.reviewDate,
        row.reviewText,
        row.responseStatus,
        row.isFeatured ? "true" : "false",
        row.themes,
        row.notes,
      ]
        .map(escapeCsv)
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(csvRows, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="santaan_featured_reviews_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
