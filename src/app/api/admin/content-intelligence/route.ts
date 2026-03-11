import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { blogPosts, contentAssets, contentFeedback, reputationReviews } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  CONTENT_ASSET_STATUS,
  CONTENT_ASSET_TYPES,
  CONTENT_AUDIENCES,
  CONTENT_CENTERS,
  CONTENT_FEEDBACK_PRIORITY,
  CONTENT_FEEDBACK_SOURCES,
  CONTENT_FEEDBACK_STATUS,
  CONTENT_FUNNEL_STAGES,
  CONTENT_RECOMMENDED_ACTIONS,
  computeContentOpportunityBoard,
  computeContentSummary,
  isAllowedContentValue,
  normalizeContentToken,
  parseContentDate,
} from "@/lib/content-intelligence";
import { computeReviewSummary } from "@/lib/reviews";
import { fetchGa4DashboardSnapshot, readGa4Config } from "@/lib/ga4";
import {
  fetchCFContentEngineHealth,
  fetchTopicRecommendationsFromCFContentEngine,
  ingestAssetToCFContentEngine,
  ingestFeedbackToCFContentEngine,
} from "@/lib/cf-content-engine";

export const runtime = "nodejs";

const READ_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "telecaller_manager",
  "ivr_manager",
  "counselor",
  "field_exec",
]);
const WRITE_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "telecaller_manager",
  "counselor",
  "field_exec",
]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

async function requireContentAccess() {
  const session = await auth();
  const sessionRole = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  const authorized = await isAuthorizedOpsUser(session?.user?.email, sessionRole);
  return { authorized, role: sessionRole || "admin" };
}

function parseJsonArrayFromBody(value: unknown) {
  if (Array.isArray(value)) {
    return JSON.stringify(value.map((item) => String(item || "").trim()).filter(Boolean));
  }
  if (typeof value === "string" && value.trim()) {
    const csv = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return JSON.stringify(csv);
  }
  return JSON.stringify([]);
}

function mapBlogType(type?: string | null) {
  const normalized = normalizeContentToken(type || "blog");
  if (normalized === "doctor") return "clinical_brief";
  if (normalized === "news") return "social_post";
  return "blog";
}

async function buildDashboardPayload() {
  const [manualAssets, feedbackRows, blogRows, reviewRows] = await Promise.all([
    db.select().from(contentAssets).orderBy(desc(contentAssets.publishedAt), desc(contentAssets.id)),
    db.select().from(contentFeedback).orderBy(desc(contentFeedback.feedbackDate), desc(contentFeedback.id)),
    db.select().from(blogPosts).where(eq(blogPosts.isActive, true)).orderBy(desc(blogPosts.publishedAt)),
    db.select().from(reputationReviews).where(eq(reputationReviews.isActive, true)).orderBy(desc(reputationReviews.reviewDate), desc(reputationReviews.id)),
  ]);

  const blogAssets = blogRows.map((row) => ({
    id: `blog-${row.id}`,
    source: "blog_sync",
    assetType: mapBlogType(row.type),
    title: row.title,
    url: row.type === "doctor" ? `/clinical-insights/${row.slug}` : `/fertility-insights/${row.slug}`,
    center: "network",
    audience: row.type === "doctor" ? "doctor" : "patient",
    funnelStage: row.type === "doctor" ? "consideration" : "awareness",
    primaryKeyword: row.slug.replaceAll("-", " "),
    secondaryKeywords: row.tags,
    tags: row.tags,
    sourcePlatform: "website",
    status: row.isActive ? "published" : "archived",
    owner: row.author,
    notes: row.excerpt,
    publishedAt: row.publishedAt,
    createdAt: row.syncedAt,
    thumbnail: row.thumbnail,
    readMinutes: row.readMinutes,
  }));

  const manualAssetRows = manualAssets.map((row) => ({
    ...row,
    source: "manual",
  }));

  const combinedAssets = [...manualAssetRows, ...blogAssets].sort((a, b) => {
    const left = Date.parse(String(a.publishedAt || a.createdAt || ""));
    const right = Date.parse(String(b.publishedAt || b.createdAt || ""));
    return (Number.isNaN(right) ? 0 : right) - (Number.isNaN(left) ? 0 : left);
  });

  const reviewsSummary = computeReviewSummary(reviewRows);
  const opportunities = computeContentOpportunityBoard({
    assets: combinedAssets,
    feedback: feedbackRows,
    reviewThemes: reviewsSummary.topThemes,
  });
  const summary = computeContentSummary({
    combinedAssets,
    manualAssets: manualAssetRows,
    feedback: feedbackRows,
    opportunities,
  });

  const ga4Config = readGa4Config();
  let ga4Content: {
    configured: boolean;
    message?: string;
    topContentPages: Array<{ path: string; sessions: number; activeUsers: number }>;
  } = {
    configured: false,
    message: "GA4 content signals not configured yet.",
    topContentPages: [],
  };

  if (ga4Config) {
    try {
      const snapshot = await fetchGa4DashboardSnapshot(ga4Config, 30);
      ga4Content = {
        configured: true,
        message: undefined,
        topContentPages: (snapshot.topLandingPages || []).filter((page) => {
          const path = String(page.path || "");
          return path.includes("/fertility-insights") || path.includes("/clinical-insights") || path.includes("/blog") || path.includes("/ivf") || path.includes("/fertility");
        }).slice(0, 8),
      };
    } catch (error) {
      ga4Content = {
        configured: false,
        message: error instanceof Error ? error.message : "Failed to fetch GA4 content signals.",
        topContentPages: [],
      };
    }
  }

  const [engineHealth, engineRecommendations] = await Promise.all([
    fetchCFContentEngineHealth(),
    fetchTopicRecommendationsFromCFContentEngine({ center: "network", audience: "patient", lookbackDays: 30 }),
  ]);

  return {
    summary,
    opportunities,
    feedback: feedbackRows,
    manualAssets: manualAssetRows,
    recentAssets: combinedAssets.slice(0, 24),
    ga4Content,
    reviewSignals: reviewsSummary,
    contentEngine: {
      configured: engineHealth.configured,
      healthy: engineHealth.ok,
      message: engineHealth.message,
      bindings: engineHealth.health?.bindings || null,
      recommendations: engineRecommendations.recommendations || [],
      recommendationMessage: engineRecommendations.message || null,
    },
  };
}

export async function GET() {
  try {
    const { authorized, role } = await requireContentAccess();
    if (!authorized || !READ_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await buildDashboardPayload();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Content intelligence GET error:", error);
    return NextResponse.json({ error: "Failed to fetch content intelligence" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, role } = await requireContentAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const entity = normalizeContentToken(body?.entity);

    if (entity === "asset") {
      const assetType = normalizeContentToken(body?.assetType);
      const title = String(body?.title || "").trim();
      const center = normalizeContentToken(body?.center || "network");
      const audience = normalizeContentToken(body?.audience || "patient");
      const funnelStage = normalizeContentToken(body?.funnelStage || "awareness");
      const status = normalizeContentToken(body?.status || "published");
      const publishedAt = parseContentDate(body?.publishedAt);

      if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
      if (!isAllowedContentValue(assetType, CONTENT_ASSET_TYPES)) {
        return NextResponse.json({ error: "invalid assetType" }, { status: 400 });
      }
      if (!isAllowedContentValue(center, CONTENT_CENTERS)) {
        return NextResponse.json({ error: "invalid center" }, { status: 400 });
      }
      if (!isAllowedContentValue(audience, CONTENT_AUDIENCES)) {
        return NextResponse.json({ error: "invalid audience" }, { status: 400 });
      }
      if (!isAllowedContentValue(funnelStage, CONTENT_FUNNEL_STAGES)) {
        return NextResponse.json({ error: "invalid funnelStage" }, { status: 400 });
      }
      if (!isAllowedContentValue(status, CONTENT_ASSET_STATUS)) {
        return NextResponse.json({ error: "invalid status" }, { status: 400 });
      }

      const inserted = await db.insert(contentAssets).values({
        assetType,
        title,
        url: String(body?.url || "").trim() || null,
        center,
        audience,
        funnelStage,
        primaryKeyword: String(body?.primaryKeyword || "").trim() || null,
        secondaryKeywords: parseJsonArrayFromBody(body?.secondaryKeywords),
        tags: parseJsonArrayFromBody(body?.tags),
        sourcePlatform: String(body?.sourcePlatform || "manual").trim() || "manual",
        status,
        owner: String(body?.owner || "").trim() || null,
        notes: String(body?.notes || "").trim() || null,
        publishedAt,
      }).returning();

      await ingestAssetToCFContentEngine(inserted[0]).catch((error) => {
        console.error("Content engine asset ingest failed:", error);
      });

      return NextResponse.json({ success: true, row: inserted[0] }, { status: 201 });
    }

    if (entity === "feedback") {
      const feedbackDate = parseContentDate(body?.feedbackDate);
      const source = normalizeContentToken(body?.source);
      const center = normalizeContentToken(body?.center || "network");
      const topic = String(body?.topic || "").trim();
      const audience = normalizeContentToken(body?.audience || "patient");
      const funnelStage = normalizeContentToken(body?.funnelStage || "awareness");
      const priority = normalizeContentToken(body?.priority || "medium");
      const recommendedAction = normalizeContentToken(body?.recommendedAction || "write_blog");
      const status = normalizeContentToken(body?.status || "open");
      const occurrenceCount = Math.max(1, Number(body?.occurrenceCount || 1));

      if (!feedbackDate || !topic) {
        return NextResponse.json({ error: "feedbackDate and topic are required" }, { status: 400 });
      }
      if (!isAllowedContentValue(source, CONTENT_FEEDBACK_SOURCES)) {
        return NextResponse.json({ error: "invalid source" }, { status: 400 });
      }
      if (!isAllowedContentValue(center, CONTENT_CENTERS)) {
        return NextResponse.json({ error: "invalid center" }, { status: 400 });
      }
      if (!isAllowedContentValue(audience, CONTENT_AUDIENCES)) {
        return NextResponse.json({ error: "invalid audience" }, { status: 400 });
      }
      if (!isAllowedContentValue(funnelStage, CONTENT_FUNNEL_STAGES)) {
        return NextResponse.json({ error: "invalid funnelStage" }, { status: 400 });
      }
      if (!isAllowedContentValue(priority, CONTENT_FEEDBACK_PRIORITY)) {
        return NextResponse.json({ error: "invalid priority" }, { status: 400 });
      }
      if (!isAllowedContentValue(recommendedAction, CONTENT_RECOMMENDED_ACTIONS)) {
        return NextResponse.json({ error: "invalid recommendedAction" }, { status: 400 });
      }
      if (!isAllowedContentValue(status, CONTENT_FEEDBACK_STATUS)) {
        return NextResponse.json({ error: "invalid status" }, { status: 400 });
      }

      const inserted = await db.insert(contentFeedback).values({
        feedbackDate,
        source,
        center,
        topic,
        suggestedKeyword: String(body?.suggestedKeyword || "").trim() || null,
        patientQuestion: String(body?.patientQuestion || "").trim() || null,
        audience,
        funnelStage,
        priority,
        occurrenceCount,
        recommendedAction,
        owner: String(body?.owner || "").trim() || null,
        status,
        notes: String(body?.notes || "").trim() || null,
      }).returning();

      await ingestFeedbackToCFContentEngine(inserted[0]).catch((error) => {
        console.error("Content engine feedback ingest failed:", error);
      });

      return NextResponse.json({ success: true, row: inserted[0] }, { status: 201 });
    }

    return NextResponse.json({ error: "entity must be asset or feedback" }, { status: 400 });
  } catch (error) {
    console.error("Content intelligence POST error:", error);
    return NextResponse.json({ error: "Failed to save content intelligence row" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { authorized, role } = await requireContentAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const entity = normalizeContentToken(body?.entity);
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "valid id is required" }, { status: 400 });
    }

    if (entity === "asset") {
      const assetType = normalizeContentToken(body?.assetType);
      const title = String(body?.title || "").trim();
      const center = normalizeContentToken(body?.center || "network");
      const audience = normalizeContentToken(body?.audience || "patient");
      const funnelStage = normalizeContentToken(body?.funnelStage || "awareness");
      const status = normalizeContentToken(body?.status || "published");
      const publishedAt = parseContentDate(body?.publishedAt);

      if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
      if (!isAllowedContentValue(assetType, CONTENT_ASSET_TYPES) || !isAllowedContentValue(center, CONTENT_CENTERS) || !isAllowedContentValue(audience, CONTENT_AUDIENCES) || !isAllowedContentValue(funnelStage, CONTENT_FUNNEL_STAGES) || !isAllowedContentValue(status, CONTENT_ASSET_STATUS)) {
        return NextResponse.json({ error: "invalid asset payload" }, { status: 400 });
      }

      const updated = await db.update(contentAssets).set({
        assetType,
        title,
        url: String(body?.url || "").trim() || null,
        center,
        audience,
        funnelStage,
        primaryKeyword: String(body?.primaryKeyword || "").trim() || null,
        secondaryKeywords: parseJsonArrayFromBody(body?.secondaryKeywords),
        tags: parseJsonArrayFromBody(body?.tags),
        sourcePlatform: String(body?.sourcePlatform || "manual").trim() || "manual",
        status,
        owner: String(body?.owner || "").trim() || null,
        notes: String(body?.notes || "").trim() || null,
        publishedAt,
        updatedAt: new Date().toISOString(),
      }).where(eq(contentAssets.id, id)).returning();

      if (updated[0]) {
        await ingestAssetToCFContentEngine(updated[0]).catch((error) => {
          console.error("Content engine asset re-ingest failed:", error);
        });
      }

      return NextResponse.json({ success: true, row: updated[0] });
    }

    if (entity === "feedback") {
      const feedbackDate = parseContentDate(body?.feedbackDate);
      const source = normalizeContentToken(body?.source);
      const center = normalizeContentToken(body?.center || "network");
      const topic = String(body?.topic || "").trim();
      const audience = normalizeContentToken(body?.audience || "patient");
      const funnelStage = normalizeContentToken(body?.funnelStage || "awareness");
      const priority = normalizeContentToken(body?.priority || "medium");
      const recommendedAction = normalizeContentToken(body?.recommendedAction || "write_blog");
      const status = normalizeContentToken(body?.status || "open");
      const occurrenceCount = Math.max(1, Number(body?.occurrenceCount || 1));

      if (!feedbackDate || !topic) return NextResponse.json({ error: "feedbackDate and topic are required" }, { status: 400 });
      if (!isAllowedContentValue(source, CONTENT_FEEDBACK_SOURCES) || !isAllowedContentValue(center, CONTENT_CENTERS) || !isAllowedContentValue(audience, CONTENT_AUDIENCES) || !isAllowedContentValue(funnelStage, CONTENT_FUNNEL_STAGES) || !isAllowedContentValue(priority, CONTENT_FEEDBACK_PRIORITY) || !isAllowedContentValue(recommendedAction, CONTENT_RECOMMENDED_ACTIONS) || !isAllowedContentValue(status, CONTENT_FEEDBACK_STATUS)) {
        return NextResponse.json({ error: "invalid feedback payload" }, { status: 400 });
      }

      const updated = await db.update(contentFeedback).set({
        feedbackDate,
        source,
        center,
        topic,
        suggestedKeyword: String(body?.suggestedKeyword || "").trim() || null,
        patientQuestion: String(body?.patientQuestion || "").trim() || null,
        audience,
        funnelStage,
        priority,
        occurrenceCount,
        recommendedAction,
        owner: String(body?.owner || "").trim() || null,
        status,
        notes: String(body?.notes || "").trim() || null,
        updatedAt: new Date().toISOString(),
      }).where(eq(contentFeedback.id, id)).returning();

      if (updated[0]) {
        await ingestFeedbackToCFContentEngine(updated[0]).catch((error) => {
          console.error("Content engine feedback re-ingest failed:", error);
        });
      }

      return NextResponse.json({ success: true, row: updated[0] });
    }

    return NextResponse.json({ error: "entity must be asset or feedback" }, { status: 400 });
  } catch (error) {
    console.error("Content intelligence PUT error:", error);
    return NextResponse.json({ error: "Failed to update content intelligence row" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { authorized, role } = await requireContentAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entity = normalizeContentToken(searchParams.get("entity"));
    const id = Number(searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "valid id is required" }, { status: 400 });
    }

    if (entity === "asset") {
      await db.delete(contentAssets).where(eq(contentAssets.id, id));
      return NextResponse.json({ success: true });
    }
    if (entity === "feedback") {
      await db.delete(contentFeedback).where(eq(contentFeedback.id, id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "entity must be asset or feedback" }, { status: 400 });
  } catch (error) {
    console.error("Content intelligence DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete content intelligence row" }, { status: 500 });
  }
}
