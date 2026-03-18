export type UtmParams = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    center?: string;
    asset?: string;
    landing_path?: string;
};

const STORAGE_KEY = "santaan_utm";
const TOKEN_PATTERN = /[^a-z0-9_-]/gi;

export const MANDATORY_UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

export const UTM_DEFAULTS: Required<Pick<UtmParams, "utm_source" | "utm_medium" | "utm_campaign">> = {
    utm_source: "direct",
    utm_medium: "website",
    utm_campaign: "always_on",
};

const normalizeToken = (value: string | null | undefined, fallback: string) => {
    if (!value) return fallback;
    const normalized = value.trim().toLowerCase().replace(TOKEN_PATTERN, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
    return normalized || fallback;
};

export const ensureMandatoryUtm = (params: UtmParams = {}): UtmParams => ({
    utm_source: normalizeToken(params.utm_source, UTM_DEFAULTS.utm_source),
    utm_medium: normalizeToken(params.utm_medium, UTM_DEFAULTS.utm_medium),
    utm_campaign: normalizeToken(params.utm_campaign, UTM_DEFAULTS.utm_campaign),
    utm_term: params.utm_term ? normalizeToken(params.utm_term, "") : undefined,
    utm_content: params.utm_content ? normalizeToken(params.utm_content, "") : undefined,
    center: params.center ? normalizeToken(params.center, "") : undefined,
    asset: params.asset ? normalizeToken(params.asset, "") : undefined,
    landing_path: params.landing_path,
});

export const readUtmParams = (): UtmParams => {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as UtmParams) : {};
        return ensureMandatoryUtm(parsed);
    } catch {
        return { ...UTM_DEFAULTS };
    }
};

export const writeUtmParams = (params: UtmParams) => {
    if (typeof window === "undefined") return;
    try {
        const normalized = ensureMandatoryUtm(params);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));

        // Legacy keys retained for existing form components.
        localStorage.setItem("utm_source", normalized.utm_source || UTM_DEFAULTS.utm_source);
        localStorage.setItem("utm_medium", normalized.utm_medium || UTM_DEFAULTS.utm_medium);
        localStorage.setItem("utm_campaign", normalized.utm_campaign || UTM_DEFAULTS.utm_campaign);
        if (normalized.utm_term) localStorage.setItem("utm_term", normalized.utm_term);
        if (normalized.utm_content) localStorage.setItem("utm_content", normalized.utm_content);
    } catch {
        // ignore
    }
};

export const captureUtmParams = (url: string) => {
    if (typeof window === "undefined") return;
    const parsed = new URL(url, window.location.origin);
    const params = parsed.searchParams;

    const existing = readUtmParams();
    const next: UtmParams = {
        utm_source: params.get("utm_source") || existing.utm_source || UTM_DEFAULTS.utm_source,
        utm_medium: params.get("utm_medium") || existing.utm_medium || UTM_DEFAULTS.utm_medium,
        utm_campaign: params.get("utm_campaign") || existing.utm_campaign || UTM_DEFAULTS.utm_campaign,
        utm_term: params.get("utm_term") || existing.utm_term || undefined,
        utm_content: params.get("utm_content") || existing.utm_content || undefined,
        center: params.get("center") || existing.center || undefined,
        asset: params.get("asset") || existing.asset || undefined,
        landing_path: existing.landing_path || parsed.pathname || undefined,
    };

    writeUtmParams(next);
};

type TrackedLinkInput = {
    url: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_term?: string;
    utm_content?: string;
    center?: string;
    asset?: string;
};

export const buildMandatoryTrackedUrl = ({ url, ...rest }: TrackedLinkInput): string => {
    const normalized = ensureMandatoryUtm(rest);
    const base =
        typeof window !== "undefined"
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://santaan.in");
    const parsed = new URL(url, base);

    parsed.searchParams.set("utm_source", normalized.utm_source || UTM_DEFAULTS.utm_source);
    parsed.searchParams.set("utm_medium", normalized.utm_medium || UTM_DEFAULTS.utm_medium);
    parsed.searchParams.set("utm_campaign", normalized.utm_campaign || UTM_DEFAULTS.utm_campaign);

    if (normalized.utm_term) parsed.searchParams.set("utm_term", normalized.utm_term);
    if (normalized.utm_content) parsed.searchParams.set("utm_content", normalized.utm_content);
    if (normalized.center) parsed.searchParams.set("center", normalized.center);
    if (normalized.asset) parsed.searchParams.set("asset", normalized.asset);

    return parsed.toString();
};
