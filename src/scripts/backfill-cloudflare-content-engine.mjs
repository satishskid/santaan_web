import "dotenv/config";
import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
const engineUrl = String(process.env.CF_CONTENT_ENGINE_URL || "").trim().replace(/\/+$/, "");
const engineToken = String(process.env.CF_CONTENT_ENGINE_TOKEN || "").trim();

if (!tursoUrl || !tursoAuthToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN.");
  process.exit(1);
}

if (!engineUrl || !engineToken) {
  console.error("Missing CF_CONTENT_ENGINE_URL or CF_CONTENT_ENGINE_TOKEN.");
  process.exit(1);
}

const db = createClient({ url: tursoUrl, authToken: tursoAuthToken });

function parseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    }
  } catch {
    // fall through
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function post(path, body) {
  const response = await fetch(`${engineUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${engineToken}`,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `${path} failed with ${response.status}`);
  }
  return payload;
}

function toArticlePayload(row) {
  const secondaryKeywords = parseJsonArray(row.secondary_keywords);
  return {
    assetId: `${row.asset_type}-${row.id}`,
    title: row.title,
    url: row.url || undefined,
    type: row.asset_type,
    center: row.center || "network",
    audience: row.audience || "patient",
    funnelStage: row.funnel_stage || "awareness",
    primaryKeyword: row.primary_keyword || undefined,
    secondaryKeywords,
    publishedAt: row.published_at || undefined,
    contentMarkdown: [
      `# ${row.title}`,
      row.primary_keyword ? `Primary keyword: ${row.primary_keyword}` : "",
      secondaryKeywords.length ? `Secondary keywords: ${secondaryKeywords.join(", ")}` : "",
      row.tags ? `Tags: ${parseJsonArray(row.tags).join(", ")}` : "",
      row.notes ? `Notes: ${row.notes}` : "",
      row.url ? `Source URL: ${row.url}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

function toBlogPayload(row) {
  return {
    assetId: `blog-${row.id}`,
    title: row.title,
    url: row.type === "doctor" ? `/clinical-insights/${row.slug}` : `/fertility-insights/${row.slug}`,
    type: row.type === "doctor" ? "clinical_brief" : "blog",
    center: "network",
    audience: row.type === "doctor" ? "doctor" : "patient",
    funnelStage: row.type === "doctor" ? "consideration" : "awareness",
    primaryKeyword: String(row.slug || "").replaceAll("-", " "),
    secondaryKeywords: parseJsonArray(row.tags),
    publishedAt: row.published_at || undefined,
    contentMarkdown: [
      `# ${row.title}`,
      row.excerpt ? `Excerpt: ${row.excerpt}` : "",
      stripHtml(row.html),
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

function toFeedbackPayload(row) {
  return {
    source: row.source,
    priority: row.priority || "medium",
    center: row.center || "network",
    theme: row.suggested_keyword || row.topic,
    summary: row.patient_question || row.notes || row.topic,
    linkedAssetId: null,
    rawContext: {
      id: row.id,
      topic: row.topic,
      patientQuestion: row.patient_question || null,
      suggestedKeyword: row.suggested_keyword || null,
      notes: row.notes || null,
      audience: row.audience || "patient",
      funnelStage: row.funnel_stage || "awareness",
    },
  };
}

async function fetchRows(sqlText) {
  const result = await db.execute(sqlText);
  return result.rows || [];
}

async function tableExists(tableName) {
  const rows = await fetchRows(`select name from sqlite_master where type='table' and name='${tableName}'`);
  return rows.length > 0;
}

async function main() {
  console.log("Checking Cloudflare content engine health...");
  const health = await fetch(`${engineUrl}/health`).then((res) => res.json());
  console.log(JSON.stringify(health, null, 2));

  const hasContentAssets = await tableExists("content_assets");
  const hasBlogPosts = await tableExists("blog_posts");
  const hasContentFeedback = await tableExists("content_feedback");

  const [manualAssets, blogPosts, feedbackRows] = await Promise.all([
    hasContentAssets
      ? fetchRows("select id, asset_type, title, url, center, audience, funnel_stage, primary_keyword, secondary_keywords, tags, notes, published_at from content_assets order by id asc")
      : Promise.resolve([]),
    hasBlogPosts
      ? fetchRows("select id, slug, title, excerpt, html, tags, type, published_at from blog_posts where is_active = 1 order by id asc")
      : Promise.resolve([]),
    hasContentFeedback
      ? fetchRows("select id, source, center, topic, suggested_keyword, patient_question, audience, funnel_stage, priority, notes from content_feedback order by id asc")
      : Promise.resolve([]),
  ]);

  let assetCount = 0;
  for (const row of manualAssets) {
    await post("/ingest/article", toArticlePayload(row));
    assetCount += 1;
  }

  let blogCount = 0;
  for (const row of blogPosts) {
    await post("/ingest/article", toBlogPayload(row));
    blogCount += 1;
  }

  let feedbackCount = 0;
  for (const row of feedbackRows) {
    await post("/ingest/feedback", toFeedbackPayload(row));
    feedbackCount += 1;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        ingested: {
          manualAssets: assetCount,
          blogPosts: blogCount,
          feedback: feedbackCount,
          skipped: {
            contentAssets: !hasContentAssets,
            blogPosts: !hasBlogPosts,
            contentFeedback: !hasContentFeedback,
          },
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Cloudflare content backfill failed:", error);
  process.exit(1);
});
