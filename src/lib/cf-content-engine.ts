type EngineHealth = {
  ok: boolean;
  service?: string;
  env?: string;
  bindings?: {
    vectorize?: boolean;
    draftsBucket?: boolean;
    assetsBucket?: boolean;
    mediaBucket?: boolean;
    aiGatewayReady?: boolean;
    tursoReady?: boolean;
  };
  timestamp?: string;
};

type EngineTopicRecommendation = {
  status?: string;
  filters?: Record<string, unknown>;
  recommendations?: Array<Record<string, unknown>>;
  message?: string;
};

type EngineConfig = {
  enabled: boolean;
  url: string | null;
  token: string | null;
};

function normalizeBaseUrl(raw?: string | null) {
  const value = String(raw || "").trim();
  if (!value) return null;
  return value.replace(/\/+$/, "");
}

export function readCFContentEngineConfig(): EngineConfig {
  const url = normalizeBaseUrl(process.env.CF_CONTENT_ENGINE_URL);
  const token = String(process.env.CF_CONTENT_ENGINE_TOKEN || "").trim() || null;
  const flag = String(process.env.ENABLE_CF_CONTENT_ENGINE || "").trim().toLowerCase();
  const disabled = flag === "0" || flag === "false" || flag === "off";

  return {
    enabled: Boolean(url && token && !disabled),
    url,
    token,
  };
}

async function engineFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = readCFContentEngineConfig();
  if (!config.enabled || !config.url || !config.token) {
    throw new Error("Cloudflare content engine is not configured.");
  }

  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${config.token}`);
  if (!headers.has("content-type") && init.body) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : `Content engine request failed with ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export async function fetchCFContentEngineHealth() {
  const config = readCFContentEngineConfig();
  if (!config.enabled || !config.url) {
    return {
      configured: false,
      ok: false,
      message: "Cloudflare content engine is not configured.",
      health: null as EngineHealth | null,
    };
  }

  try {
    const response = await fetch(`${config.url}/health`, { cache: "no-store" });
    const health = (await response.json()) as EngineHealth;
    return {
      configured: true,
      ok: response.ok && Boolean(health?.ok),
      message: response.ok ? null : "Content engine health check failed.",
      health,
    };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      message: error instanceof Error ? error.message : "Content engine is unreachable.",
      health: null as EngineHealth | null,
    };
  }
}

function parseJsonArray(value?: string | null) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    }
  } catch {
    // fall through to csv parse
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export async function ingestAssetToCFContentEngine(row: {
  id: number | string;
  assetType: string;
  title: string;
  url?: string | null;
  center?: string | null;
  audience?: string | null;
  funnelStage?: string | null;
  primaryKeyword?: string | null;
  secondaryKeywords?: string | null;
  notes?: string | null;
  owner?: string | null;
  tags?: string | null;
  publishedAt?: string | null;
  html?: string | null;
  excerpt?: string | null;
}) {
  const config = readCFContentEngineConfig();
  if (!config.enabled) {
    return { skipped: true, reason: "disabled" as const };
  }

  const secondary = parseJsonArray(row.secondaryKeywords);
  const tags = parseJsonArray(row.tags);
  const body = [
    `# ${row.title}`.trim(),
    row.primaryKeyword ? `Primary keyword: ${row.primaryKeyword}` : "",
    secondary.length ? `Secondary keywords: ${secondary.join(", ")}` : "",
    tags.length ? `Tags: ${tags.join(", ")}` : "",
    row.notes ? `Notes: ${row.notes}` : "",
    row.excerpt ? `Excerpt: ${row.excerpt}` : "",
    row.owner ? `Owner: ${row.owner}` : "",
    row.url ? `Source URL: ${row.url}` : "",
    row.html ? stripHtml(row.html) : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return engineFetch("/ingest/article", {
    method: "POST",
    body: JSON.stringify({
      assetId: `${row.assetType}-${row.id}`,
      title: row.title,
      url: row.url || undefined,
      type: row.assetType,
      center: row.center || "network",
      audience: row.audience || "patient",
      funnelStage: row.funnelStage || "awareness",
      primaryKeyword: row.primaryKeyword || undefined,
      secondaryKeywords: secondary,
      contentMarkdown: body || `# ${row.title}`,
      publishedAt: row.publishedAt || undefined,
    }),
  });
}

export async function ingestFeedbackToCFContentEngine(row: {
  id: number | string;
  source: string;
  center?: string | null;
  topic: string;
  priority?: string | null;
  patientQuestion?: string | null;
  suggestedKeyword?: string | null;
  notes?: string | null;
}) {
  const config = readCFContentEngineConfig();
  if (!config.enabled) {
    return { skipped: true, reason: "disabled" as const };
  }

  return engineFetch("/ingest/feedback", {
    method: "POST",
    body: JSON.stringify({
      source: row.source,
      priority: row.priority || "medium",
      center: row.center || "network",
      theme: row.suggestedKeyword || row.topic,
      summary: row.patientQuestion || row.notes || row.topic,
      linkedAssetId: null,
      rawContext: {
        id: row.id,
        topic: row.topic,
        patientQuestion: row.patientQuestion || null,
        suggestedKeyword: row.suggestedKeyword || null,
        notes: row.notes || null,
      },
    }),
  });
}

export async function fetchTopicRecommendationsFromCFContentEngine(filters: {
  center?: string;
  audience?: string;
  lookbackDays?: number;
}) {
  const config = readCFContentEngineConfig();
  if (!config.enabled) {
    return {
      configured: false,
      message: "Cloudflare content engine is not configured.",
      recommendations: [] as Array<Record<string, unknown>>,
    };
  }

  try {
    const payload = await engineFetch<EngineTopicRecommendation>("/recommend/topics", {
      method: "POST",
      body: JSON.stringify(filters),
    });
    return {
      configured: true,
      message: payload.message || null,
      recommendations: payload.recommendations || [],
    };
  } catch (error) {
    return {
      configured: true,
      message: error instanceof Error ? error.message : "Failed to fetch content-engine recommendations.",
      recommendations: [] as Array<Record<string, unknown>>,
    };
  }
}
