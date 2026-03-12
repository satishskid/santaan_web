interface Env {
  APP_ENV: string;
  VECTOR_INDEX_NAME: string;
  DRAFTS_BUCKET_NAME: string;
  ASSETS_BUCKET_NAME: string;
  MEDIA_BUCKET_NAME: string;
  CF_CONTENT_ENGINE_TOKEN?: string;
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  GEMINI_API_KEY?: string;
  CONTENT_VECTORIZE?: VectorizeIndex;
  CONTENT_DRAFTS?: R2Bucket;
  CONTENT_ASSETS?: R2Bucket;
  CONTENT_MEDIA?: R2Bucket;
  AI: Ai;
}

type JsonRecord = Record<string, unknown>;

type ArticleIngestPayload = {
  assetId: string;
  title: string;
  url?: string;
  type: string;
  center?: string;
  audience?: string;
  funnelStage?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  contentMarkdown: string;
  publishedAt?: string;
};

type FeedbackIngestPayload = {
  source: string;
  priority?: string;
  center?: string;
  audience?: string;
  funnelStage?: string;
  recommendedAction?: string;
  theme?: string;
  summary: string;
  linkedAssetId?: string;
  rawContext?: JsonRecord;
};

type InternalLinkRequest = {
  assetId: string;
  draftText: string;
  center?: string;
  audience?: string;
};

type TopicRecommendationRequest = {
  center?: string;
  audience?: string;
  lookbackDays?: number;
};

type StoredArticle = {
  payload: ArticleIngestPayload;
  chunks: Array<{
    chunkId: string;
    text: string;
    tokenEstimate: number;
  }>;
  ingestedAt: string;
};

type StoredFeedback = {
  payload: FeedbackIngestPayload;
  ingestedAt: string;
};

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
const DEFAULT_INTERNAL_LINK_TOP_K = 10;
const DEFAULT_TOPIC_TOP_K = 6;
const FEEDBACK_PAGE_SIZE = 200;

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data, null, 2), { ...init, headers });
}

function normalizeAuthToken(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return request.headers.get("x-content-engine-token")?.trim() || "";
}

function ensureAuthorized(request: Request, env: Env) {
  if (!env.CF_CONTENT_ENGINE_TOKEN) {
    return json({ error: "Content engine auth is not configured" }, { status: 503 });
  }
  const provided = normalizeAuthToken(request);
  if (provided && provided === env.CF_CONTENT_ENGINE_TOKEN) {
    return null;
  }
  return json({ error: "Unauthorized" }, { status: 401 });
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[>*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeParagraphs(markdown: string) {
  const blocks = markdown
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const chunks: Array<{ chunkId: string; text: string; tokenEstimate: number }> = [];
  let buffer = "";
  let index = 1;

  for (const block of blocks) {
    const next = buffer ? `${buffer}\n\n${block}` : block;
    if (next.length > 1400 && buffer) {
      chunks.push({
        chunkId: `chunk-${index++}`,
        text: buffer,
        tokenEstimate: Math.max(1, Math.ceil(buffer.length / 4)),
      });
      buffer = block;
    } else {
      buffer = next;
    }
  }

  if (buffer) {
    chunks.push({
      chunkId: `chunk-${index}`,
      text: buffer,
      tokenEstimate: Math.max(1, Math.ceil(buffer.length / 4)),
    });
  }

  return chunks;
}

async function parseBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

function validateArticlePayload(payload: Partial<ArticleIngestPayload>) {
  if (!payload.assetId || !payload.title || !payload.type || !payload.contentMarkdown) {
    return "assetId, title, type, and contentMarkdown are required";
  }
  return null;
}

function validateFeedbackPayload(payload: Partial<FeedbackIngestPayload>) {
  if (!payload.source || !payload.summary) {
    return "source and summary are required";
  }
  return null;
}

function extractVectors(node: unknown): number[][] {
  if (!node) return [];
  if (Array.isArray(node)) {
    if (!node.length) return [];
    if (typeof node[0] === "number") {
      return [node as number[]];
    }
    if (Array.isArray(node[0])) {
      return node as number[][];
    }
    if (typeof node[0] === "object" && node[0] && "embedding" in (node[0] as Record<string, unknown>)) {
      return (node as Array<{ embedding?: unknown }>)
        .map((item) => (Array.isArray(item.embedding) ? (item.embedding as number[]) : null))
        .filter((item): item is number[] => Array.isArray(item));
    }
    return [];
  }

  if (typeof node === "object") {
    const record = node as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      const data = record.data;
      if (data.length && typeof data[0] === "number") {
        const shape = Array.isArray(record.shape) ? (record.shape as number[]) : [];
        if (shape.length === 2 && shape[0] > 0 && shape[1] > 0) {
          const vectors: number[][] = [];
          for (let i = 0; i < shape[0]; i += 1) {
            const start = i * shape[1];
            vectors.push((data as number[]).slice(start, start + shape[1]));
          }
          return vectors;
        }
      }
      return extractVectors(record.data);
    }

    if ("result" in record) {
      return extractVectors(record.result);
    }

    if ("embeddings" in record) {
      return extractVectors(record.embeddings);
    }
  }

  return [];
}

async function embedTexts(env: Env, texts: string[]) {
  if (!env.AI) {
    throw new Error("Workers AI binding is not configured.");
  }
  if (!texts.length) return [] as number[][];

  const normalized = texts.map((text) => stripMarkdown(text).slice(0, 8000));
  const result = await env.AI.run(EMBEDDING_MODEL, { text: normalized });
  const vectors = extractVectors(result);

  if (vectors.length !== normalized.length) {
    throw new Error(`Embedding count mismatch. Expected ${normalized.length}, received ${vectors.length}.`);
  }
  return vectors;
}

function toVectorMetadata(payload: ArticleIngestPayload, chunkId: string, chunkText: string): VectorizeMetadata {
  return {
    assetId: payload.assetId,
    title: payload.title,
    url: payload.url || null,
    type: payload.type,
    center: payload.center || "network",
    audience: payload.audience || "patient",
    funnelStage: payload.funnelStage || "awareness",
    primaryKeyword: payload.primaryKeyword || null,
    secondaryKeywords: JSON.stringify(payload.secondaryKeywords || []),
    publishedAt: payload.publishedAt || null,
    chunkId,
    preview: stripMarkdown(chunkText).slice(0, 240),
  };
}

function parseQueryMatches(result: unknown): VectorizeMatch[] {
  if (!result || typeof result !== "object") return [];
  const matches = (result as { matches?: VectorizeMatch[] }).matches;
  return Array.isArray(matches) ? matches : [];
}

async function listR2Json<T>(bucket: R2Bucket | undefined, prefix: string): Promise<T[]> {
  if (!bucket) return [];

  const rows: T[] = [];
  let cursor: string | undefined;

  do {
    const listing = await bucket.list({ prefix, cursor, limit: FEEDBACK_PAGE_SIZE });
    for (const object of listing.objects || []) {
      const item = await bucket.get(object.key);
      if (!item) continue;
      try {
        rows.push((await item.json<T>()) as T);
      } catch {
        const raw = await item.text();
        rows.push(JSON.parse(raw) as T);
      }
    }
    cursor = listing.truncated ? listing.cursor : undefined;
  } while (cursor);

  return rows;
}

function isWithinLookback(dateLike: string | undefined, lookbackDays: number) {
  if (!dateLike) return true;
  const parsed = Date.parse(dateLike);
  if (Number.isNaN(parsed)) return true;
  const threshold = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  return parsed >= threshold;
}

function recommendationStatus(coverageCount: number): "gap" | "refresh" | "covered" {
  if (coverageCount === 0) return "gap";
  if (coverageCount < 2) return "refresh";
  return "covered";
}

function recommendationAction(coverageCount: number) {
  if (coverageCount === 0) return "write_blog";
  if (coverageCount < 2) return "refresh_asset";
  return "create_faq";
}

async function handleHealth(env: Env) {
  return json({
    ok: true,
    service: "santaan-content-engine",
    env: env.APP_ENV,
    bindings: {
      vectorize: Boolean(env.CONTENT_VECTORIZE),
      draftsBucket: Boolean(env.CONTENT_DRAFTS),
      assetsBucket: Boolean(env.CONTENT_ASSETS),
      mediaBucket: Boolean(env.CONTENT_MEDIA),
      aiGatewayReady: Boolean(env.GEMINI_API_KEY),
      tursoReady: Boolean(env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN),
    },
    timestamp: new Date().toISOString(),
  });
}

async function handleIngestArticle(request: Request, env: Env) {
  const payload = await parseBody<ArticleIngestPayload>(request);
  const validationError = validateArticlePayload(payload);
  if (validationError) {
    return json({ error: validationError }, { status: 400 });
  }

  const chunks = tokenizeParagraphs(payload.contentMarkdown);
  const ingestedAt = new Date().toISOString();
  const storageKey = `articles/${payload.assetId}.json`;

  if (env.CONTENT_DRAFTS) {
    const article: StoredArticle = { payload, chunks, ingestedAt };
    await env.CONTENT_DRAFTS.put(storageKey, JSON.stringify(article, null, 2), {
      httpMetadata: { contentType: "application/json" },
    });
  }

  let vectorizedCount = 0;
  if (env.CONTENT_VECTORIZE && chunks.length) {
    const embeddings = await embedTexts(env, chunks.map((chunk) => chunk.text));
    await env.CONTENT_VECTORIZE.upsert(
      chunks.map((chunk, index) => ({
        id: `${payload.assetId}:${chunk.chunkId}`,
        values: embeddings[index],
        metadata: toVectorMetadata(payload, chunk.chunkId, chunk.text),
      }))
    );
    vectorizedCount = chunks.length;
  }

  if (env.CONTENT_ASSETS) {
    await env.CONTENT_ASSETS.put(
      `assets/${payload.assetId}.json`,
      JSON.stringify(
        {
          assetId: payload.assetId,
          title: payload.title,
          url: payload.url || null,
          type: payload.type,
          center: payload.center || "network",
          audience: payload.audience || "patient",
          funnelStage: payload.funnelStage || "awareness",
          primaryKeyword: payload.primaryKeyword || null,
          secondaryKeywords: payload.secondaryKeywords || [],
          publishedAt: payload.publishedAt || null,
          ingestedAt,
          chunkCount: chunks.length,
        },
        null,
        2
      ),
      { httpMetadata: { contentType: "application/json" } }
    );
  }

  return json({
    accepted: true,
    assetId: payload.assetId,
    storedKey: env.CONTENT_DRAFTS ? storageKey : null,
    chunkCount: chunks.length,
    vectorizedCount,
    chunks: chunks.map((chunk) => ({
      chunkId: chunk.chunkId,
      tokenEstimate: chunk.tokenEstimate,
      preview: stripMarkdown(chunk.text).slice(0, 120),
    })),
  });
}

async function handleIngestFeedback(request: Request, env: Env) {
  const payload = await parseBody<FeedbackIngestPayload>(request);
  const validationError = validateFeedbackPayload(payload);
  if (validationError) {
    return json({ error: validationError }, { status: 400 });
  }

  const ingestedAt = new Date().toISOString();
  const storageKey = `feedback/${Date.now()}-${crypto.randomUUID()}.json`;
  if (env.CONTENT_ASSETS) {
    const storedFeedback: StoredFeedback = { payload, ingestedAt };
    await env.CONTENT_ASSETS.put(storageKey, JSON.stringify(storedFeedback, null, 2), {
      httpMetadata: { contentType: "application/json" },
    });
  }

  return json({
    accepted: true,
    storedKey: env.CONTENT_ASSETS ? storageKey : null,
    normalized: {
      source: payload.source,
      priority: payload.priority || "medium",
      center: payload.center || "network",
      audience: payload.audience || "patient",
      funnelStage: payload.funnelStage || "consideration",
      theme: payload.theme || "unspecified",
      linkedAssetId: payload.linkedAssetId || null,
    },
  });
}

async function handleRecommendInternalLinks(request: Request, env: Env) {
  const payload = await parseBody<InternalLinkRequest>(request);
  if (!payload.assetId || !payload.draftText) {
    return json({ error: "assetId and draftText are required" }, { status: 400 });
  }
  if (!env.CONTENT_VECTORIZE) {
    return json({
      assetId: payload.assetId,
      status: "unavailable",
      recommendations: [],
      message: "Vectorize binding is not configured.",
    });
  }

  const [draftVector] = await embedTexts(env, [payload.draftText]);
  const queryResult = await env.CONTENT_VECTORIZE.query(draftVector, {
    topK: DEFAULT_INTERNAL_LINK_TOP_K,
    returnMetadata: "all",
  });

  const recommendations = new Map<string, Record<string, unknown>>();
  for (const match of parseQueryMatches(queryResult)) {
    const metadata = match.metadata || {};
    const assetId = String(metadata.assetId || "");
    if (!assetId || assetId === payload.assetId || recommendations.has(assetId)) continue;
    recommendations.set(assetId, {
      assetId,
      title: metadata.title || assetId,
      url: metadata.url || null,
      type: metadata.type || null,
      center: metadata.center || "network",
      audience: metadata.audience || "patient",
      funnelStage: metadata.funnelStage || "awareness",
      primaryKeyword: metadata.primaryKeyword || null,
      preview: metadata.preview || null,
      score: typeof match.score === "number" ? Number(match.score.toFixed(4)) : null,
    });
  }

  return json({
    assetId: payload.assetId,
    status: "ready",
    recommendations: Array.from(recommendations.values()).slice(0, 5),
    message: recommendations.size
      ? "Related content suggestions generated from the indexed Santaan corpus."
      : "No related content found yet. Ingest more corpus or broaden the draft text.",
  });
}

async function handleRecommendTopics(request: Request, env: Env) {
  const payload = await parseBody<TopicRecommendationRequest>(request);
  const center = payload.center || "network";
  const audience = payload.audience || "patient";
  const lookbackDays = payload.lookbackDays || 30;
  const feedbackRows = await listR2Json<StoredFeedback>(env.CONTENT_ASSETS, "feedback/");

  const aggregates = new Map<
    string,
    {
      theme: string;
      count: number;
      sources: Set<string>;
      example: string | null;
      summaries: string[];
    }
  >();

  for (const row of feedbackRows) {
    if (!isWithinLookback(row.ingestedAt, lookbackDays)) continue;
    const feedbackCenter = row.payload.center || "network";
    const feedbackAudience = row.payload.audience || "patient";
    if (center !== "network" && feedbackCenter !== center) continue;
    if (audience !== "mixed" && feedbackAudience !== audience && feedbackAudience !== "mixed") continue;

    const theme = String(row.payload.theme || row.payload.summary || "untagged").trim();
    if (!theme) continue;
    const key = theme.toLowerCase();
    const existing = aggregates.get(key) || {
      theme,
      count: 0,
      sources: new Set<string>(),
      example: null,
      summaries: [],
    };
    existing.count += 1;
    existing.sources.add(row.payload.source);
    if (!existing.example) {
      existing.example = row.payload.summary;
    }
    if (row.payload.summary) {
      existing.summaries.push(row.payload.summary);
    }
    aggregates.set(key, existing);
  }

  if (!aggregates.size) {
    return json({
      status: "ready",
      filters: { center, audience, lookbackDays },
      recommendations: [],
      message: "No feedback signals are available yet for topic recommendations.",
    });
  }

  const ranked = Array.from(aggregates.values()).sort((left, right) => right.count - left.count);
  const recommendations = [];

  for (const item of ranked.slice(0, DEFAULT_TOPIC_TOP_K)) {
    let relatedAssets: Array<Record<string, unknown>> = [];
    let coverageCount = 0;

    if (env.CONTENT_VECTORIZE) {
      const [themeVector] = await embedTexts(env, [item.summaries.join("\n") || item.theme]);
      const queryResult = await env.CONTENT_VECTORIZE.query(themeVector, {
        topK: 6,
        returnMetadata: "all",
      });
      const relatedMap = new Map<string, Record<string, unknown>>();
      for (const match of parseQueryMatches(queryResult)) {
        const metadata = match.metadata || {};
        const assetId = String(metadata.assetId || "");
        if (!assetId || relatedMap.has(assetId)) continue;
        relatedMap.set(assetId, {
          assetId,
          title: metadata.title || assetId,
          url: metadata.url || null,
          type: metadata.type || null,
          center: metadata.center || "network",
          primaryKeyword: metadata.primaryKeyword || null,
          score: typeof match.score === "number" ? Number(match.score.toFixed(4)) : null,
        });
      }
      relatedAssets = Array.from(relatedMap.values()).slice(0, 3);
      coverageCount = relatedAssets.length;
    }

    recommendations.push({
      theme: item.theme,
      signalCount: item.count,
      status: recommendationStatus(coverageCount),
      action: recommendationAction(coverageCount),
      coverageCount,
      sources: Array.from(item.sources.values()),
      example: item.example,
      relatedAssets,
    });
  }

  return json({
    status: "ready",
    filters: { center, audience, lookbackDays },
    recommendations,
    message: "Topic recommendations generated from recent feedback and indexed coverage.",
  });
}

async function handleBlogChat(request: Request, env: Env) {
  const payload = await parseBody<{ assetId: string; question: string }>(request);
  if (!payload.assetId || !payload.question) {
    return json({ error: "assetId and question are required" }, { status: 400 });
  }
  if (!env.CONTENT_VECTORIZE) {
    return json({
      status: "unavailable",
      assetId: payload.assetId,
      answer: "The grounded blog chat is not active yet because the vector index is unavailable.",
      citations: [],
    });
  }

  const [questionVector] = await embedTexts(env, [payload.question]);
  const queryResult = await env.CONTENT_VECTORIZE.query(questionVector, {
    topK: 4,
    returnMetadata: "all",
  });
  const citations = parseQueryMatches(queryResult)
    .filter((match) => match.metadata?.assetId)
    .map((match) => ({
      assetId: match.metadata?.assetId,
      title: match.metadata?.title || match.metadata?.assetId,
      url: match.metadata?.url || null,
      preview: match.metadata?.preview || null,
      score: typeof match.score === "number" ? Number(match.score.toFixed(4)) : null,
    }));

  return json({
    status: "grounded_preview",
    assetId: payload.assetId,
    answer:
      citations.length > 0
        ? "Grounded blog chat is in retrieval-preview mode. Use the cited content below to answer safely and avoid unsupported medical claims."
        : "No grounded context was found for this question yet.",
    citations,
  });
}

async function routeRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  if (request.method === "GET" && pathname === "/health") {
    return handleHealth(env);
  }

  const unauthorized = ensureAuthorized(request, env);
  if (unauthorized) {
    return unauthorized;
  }

  if (request.method === "POST" && pathname === "/ingest/article") {
    return handleIngestArticle(request, env);
  }

  if (request.method === "POST" && pathname === "/ingest/feedback") {
    return handleIngestFeedback(request, env);
  }

  if (request.method === "POST" && pathname === "/recommend/internal-links") {
    return handleRecommendInternalLinks(request, env);
  }

  if (request.method === "POST" && pathname === "/recommend/topics") {
    return handleRecommendTopics(request, env);
  }

  if (request.method === "POST" && pathname === "/chat/blog") {
    return handleBlogChat(request, env);
  }

  return json({ error: "Not found" }, { status: 404 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await routeRequest(request, env);
    } catch (error) {
      console.error("content-engine error", error);
      return json(
        {
          error: "Internal error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
};
