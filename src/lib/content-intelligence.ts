export const CONTENT_CENTERS = ["network", "bhubaneswar", "berhampur", "bangalore", "angul"] as const;
export const CONTENT_ASSET_TYPES = ["blog", "clinical_brief", "reel", "social_post", "landing_page", "faq", "email", "ad_copy"] as const;
export const CONTENT_AUDIENCES = ["patient", "doctor", "couple", "referral", "mixed"] as const;
export const CONTENT_FUNNEL_STAGES = ["awareness", "consideration", "decision", "retention"] as const;
export const CONTENT_ASSET_STATUS = ["draft", "published", "refresh_needed", "archived"] as const;
export const CONTENT_FEEDBACK_SOURCES = ["telecaller", "counselor", "review", "agency", "search", "social", "whatsapp", "field", "manual"] as const;
export const CONTENT_FEEDBACK_PRIORITY = ["high", "medium", "low"] as const;
export const CONTENT_FEEDBACK_STATUS = ["open", "planned", "done", "ignored"] as const;
export const CONTENT_RECOMMENDED_ACTIONS = ["write_blog", "make_reel", "refresh_page", "add_faq", "update_ad_copy", "build_landing_page", "publish_doctor_brief"] as const;

export type ContentCenter = (typeof CONTENT_CENTERS)[number];
export type ContentAssetType = (typeof CONTENT_ASSET_TYPES)[number];
export type ContentAudience = (typeof CONTENT_AUDIENCES)[number];
export type ContentFunnelStage = (typeof CONTENT_FUNNEL_STAGES)[number];
export type ContentAssetStatus = (typeof CONTENT_ASSET_STATUS)[number];
export type ContentFeedbackSource = (typeof CONTENT_FEEDBACK_SOURCES)[number];
export type ContentFeedbackPriority = (typeof CONTENT_FEEDBACK_PRIORITY)[number];
export type ContentFeedbackStatus = (typeof CONTENT_FEEDBACK_STATUS)[number];
export type ContentRecommendedAction = (typeof CONTENT_RECOMMENDED_ACTIONS)[number];

export interface ContentAssetLike {
  assetType: string;
  title: string;
  url?: string | null;
  center?: string | null;
  audience?: string | null;
  funnelStage?: string | null;
  primaryKeyword?: string | null;
  secondaryKeywords?: string | null;
  tags?: string | null;
  sourcePlatform?: string | null;
  status?: string | null;
  publishedAt?: string | null;
  owner?: string | null;
}

export interface ContentFeedbackLike {
  topic: string;
  suggestedKeyword?: string | null;
  patientQuestion?: string | null;
  source: string;
  center?: string | null;
  audience?: string | null;
  funnelStage?: string | null;
  priority?: string | null;
  occurrenceCount?: number | null;
  recommendedAction?: string | null;
  status?: string | null;
}

export function normalizeContentToken(value?: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function isAllowedContentValue<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
  return (allowed as readonly string[]).includes(value);
}

export function parseContentDate(value?: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function parseJsonArray(value?: string | null) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    }
  } catch {
    // fall through
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function tokenize(value?: string | null) {
  return uniqueStrings(
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );
}

export function themeLabel(theme: string) {
  return theme
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function textForAsset(asset: ContentAssetLike) {
  return [
    asset.title,
    asset.primaryKeyword,
    ...parseJsonArray(asset.secondaryKeywords),
    ...parseJsonArray(asset.tags),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferRecommendedAction(row: ContentFeedbackLike, coveredCount: number): ContentRecommendedAction {
  const audience = normalizeContentToken(row.audience || "patient");
  const stage = normalizeContentToken(row.funnelStage || "awareness");

  if (coveredCount > 0) {
    if (stage === "decision") return "add_faq";
    if (audience === "doctor") return "publish_doctor_brief";
    return "refresh_page";
  }

  if (audience === "doctor") return "publish_doctor_brief";
  if (stage === "decision") return "build_landing_page";
  if (stage === "consideration") return "write_blog";
  return "make_reel";
}

export function computeContentOpportunityBoard(args: {
  assets: ContentAssetLike[];
  feedback: ContentFeedbackLike[];
  reviewThemes?: Array<{ theme: string; count: number }>;
}) {
  const assets = args.assets || [];
  const feedback = args.feedback || [];
  const reviewThemes = args.reviewThemes || [];

  const assetCorpus = assets.map((asset) => ({
    text: textForAsset(asset),
    assetType: normalizeContentToken(asset.assetType),
    center: normalizeContentToken(asset.center || "network"),
    audience: normalizeContentToken(asset.audience || "patient"),
  }));

  const signalMap = new Map<
    string,
    {
      label: string;
      count: number;
      sources: Set<string>;
      centers: Set<string>;
      audiences: Set<string>;
      funnelStages: Set<string>;
      recommendedActions: string[];
      questionSnippets: string[];
    }
  >();

  for (const row of feedback) {
    const key = normalizeContentToken(row.suggestedKeyword || row.topic);
    if (!key) continue;
    const count = Math.max(1, Number(row.occurrenceCount || 1));
    if (!signalMap.has(key)) {
      signalMap.set(key, {
        label: row.suggestedKeyword?.trim() || row.topic.trim(),
        count: 0,
        sources: new Set<string>(),
        centers: new Set<string>(),
        audiences: new Set<string>(),
        funnelStages: new Set<string>(),
        recommendedActions: [],
        questionSnippets: [],
      });
    }
    const signal = signalMap.get(key)!;
    signal.count += count;
    signal.sources.add(normalizeContentToken(row.source));
    signal.centers.add(normalizeContentToken(row.center || "network"));
    signal.audiences.add(normalizeContentToken(row.audience || "patient"));
    signal.funnelStages.add(normalizeContentToken(row.funnelStage || "awareness"));
    if (row.recommendedAction) signal.recommendedActions.push(normalizeContentToken(row.recommendedAction));
    if (row.patientQuestion) signal.questionSnippets.push(row.patientQuestion.trim());
  }

  for (const theme of reviewThemes) {
    const key = normalizeContentToken(theme.theme);
    if (!key) continue;
    if (!signalMap.has(key)) {
      signalMap.set(key, {
        label: themeLabel(theme.theme),
        count: 0,
        sources: new Set<string>(),
        centers: new Set<string>(["network"]),
        audiences: new Set<string>(["patient"]),
        funnelStages: new Set<string>(["consideration"]),
        recommendedActions: [],
        questionSnippets: [],
      });
    }
    const signal = signalMap.get(key)!;
    signal.count += Math.max(1, Number(theme.count || 1));
    signal.sources.add("review");
  }

  return Array.from(signalMap.entries())
    .map(([key, signal]) => {
      const coveredBy = assetCorpus.filter((asset) => asset.text.includes(key));
      const coveredCount = coveredBy.length;
      const action = signal.recommendedActions[0] || inferRecommendedAction(
        {
          topic: signal.label,
          suggestedKeyword: key,
          source: Array.from(signal.sources)[0] || "manual",
          center: Array.from(signal.centers)[0] || "network",
          audience: Array.from(signal.audiences)[0] || "patient",
          funnelStage: Array.from(signal.funnelStages)[0] || "awareness",
        },
        coveredCount
      );

      const status = coveredCount === 0 ? "gap" : signal.count >= 3 ? "refresh" : "covered";
      return {
        key,
        label: signal.label,
        count: signal.count,
        coverageCount: coveredCount,
        status,
        action,
        sources: Array.from(signal.sources),
        centers: Array.from(signal.centers),
        audiences: Array.from(signal.audiences),
        funnelStages: Array.from(signal.funnelStages),
        questionExample: signal.questionSnippets[0] || null,
      };
    })
    .sort((a, b) => {
      const statusRank = { gap: 0, refresh: 1, covered: 2 } as Record<string, number>;
      return statusRank[a.status] - statusRank[b.status] || b.count - a.count;
    })
    .slice(0, 18);
}

export function computeContentSummary(args: {
  combinedAssets: ContentAssetLike[];
  manualAssets: ContentAssetLike[];
  feedback: ContentFeedbackLike[];
  opportunities: Array<{ status: string }>;
}) {
  const combinedAssets = args.combinedAssets || [];
  const manualAssets = args.manualAssets || [];
  const feedback = args.feedback || [];
  const opportunities = args.opportunities || [];

  const assetTypeCount = new Map<string, number>();
  for (const asset of combinedAssets) {
    const type = normalizeContentToken(asset.assetType || "unknown");
    assetTypeCount.set(type, (assetTypeCount.get(type) || 0) + 1);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentAssets = combinedAssets.filter((asset) => {
    const raw = parseContentDate(asset.publishedAt);
    if (!raw) return false;
    const date = new Date(raw);
    return !Number.isNaN(date.getTime()) && date >= thirtyDaysAgo;
  }).length;

  return {
    totalAssets: combinedAssets.length,
    blogAssets: (assetTypeCount.get("blog") || 0) + (assetTypeCount.get("clinical_brief") || 0),
    socialAssets: (assetTypeCount.get("reel") || 0) + (assetTypeCount.get("social_post") || 0),
    landingAssets: (assetTypeCount.get("landing_page") || 0) + (assetTypeCount.get("faq") || 0),
    manualAssets: manualAssets.length,
    recentAssets,
    feedbackItems: feedback.length,
    openFeedback: feedback.filter((item) => normalizeContentToken(item.status || "open") === "open").length,
    opportunityGaps: opportunities.filter((item) => item.status === "gap").length,
    refreshTargets: opportunities.filter((item) => item.status === "refresh").length,
  };
}
