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
  theme?: string;
  summary: string;
  linkedAssetId?: string;
  rawContext?: JsonRecord;
};

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

function tokenizeParagraphs(markdown: string) {
  return markdown
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((text, index) => ({
      chunkId: `chunk-${index + 1}`,
      text,
      tokenEstimate: Math.max(1, Math.ceil(text.length / 4)),
    }));
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
  const storageKey = `articles/${payload.assetId}.json`;

  if (env.CONTENT_DRAFTS) {
    await env.CONTENT_DRAFTS.put(
      storageKey,
      JSON.stringify({ payload, chunks, ingestedAt: new Date().toISOString() }, null, 2),
      { httpMetadata: { contentType: "application/json" } }
    );
  }

  return json({
    accepted: true,
    assetId: payload.assetId,
    storedKey: env.CONTENT_DRAFTS ? storageKey : null,
    chunkCount: chunks.length,
    chunks,
    next: [
      "generate embeddings",
      "upsert vectors into Cloudflare Vectorize",
      "compute related-content graph",
    ],
  });
}

async function handleIngestFeedback(request: Request, env: Env) {
  const payload = await parseBody<FeedbackIngestPayload>(request);
  const validationError = validateFeedbackPayload(payload);
  if (validationError) {
    return json({ error: validationError }, { status: 400 });
  }

  const storageKey = `feedback/${Date.now()}-${crypto.randomUUID()}.json`;
  if (env.CONTENT_ASSETS) {
    await env.CONTENT_ASSETS.put(
      storageKey,
      JSON.stringify({ payload, ingestedAt: new Date().toISOString() }, null, 2),
      { httpMetadata: { contentType: "application/json" } }
    );
  }

  return json({
    accepted: true,
    storedKey: env.CONTENT_ASSETS ? storageKey : null,
    normalized: {
      source: payload.source,
      priority: payload.priority || "medium",
      center: payload.center || "network",
      theme: payload.theme || "unspecified",
      linkedAssetId: payload.linkedAssetId || null,
    },
  });
}

async function handleRecommendInternalLinks(request: Request) {
  const payload = await parseBody<{ assetId: string; draftText: string; center?: string; audience?: string }>(request);
  if (!payload.assetId || !payload.draftText) {
    return json({ error: "assetId and draftText are required" }, { status: 400 });
  }

  return json({
    assetId: payload.assetId,
    status: "stub",
    recommendations: [],
    message: "Internal-link recommendations will activate after vector indexing is connected.",
  });
}

async function handleRecommendTopics(request: Request) {
  const payload = await parseBody<{ center?: string; audience?: string; lookbackDays?: number }>(request);
  return json({
    status: "stub",
    filters: {
      center: payload.center || "network",
      audience: payload.audience || "patient",
      lookbackDays: payload.lookbackDays || 30,
    },
    recommendations: [],
    message: "Topic recommendations will activate after feedback and content indexes are connected.",
  });
}

async function handleBlogChat(request: Request) {
  const payload = await parseBody<{ assetId: string; question: string }>(request);
  if (!payload.assetId || !payload.question) {
    return json({ error: "assetId and question are required" }, { status: 400 });
  }

  return json({
    status: "stub",
    assetId: payload.assetId,
    answer: "The grounded blog chat is not active yet. This endpoint is reserved for the retrieval-backed release.",
    citations: [],
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
    return handleRecommendInternalLinks(request);
  }

  if (request.method === "POST" && pathname === "/recommend/topics") {
    return handleRecommendTopics(request);
  }

  if (request.method === "POST" && pathname === "/chat/blog") {
    return handleBlogChat(request);
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
