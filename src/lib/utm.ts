export type UtmParams = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    landing_path?: string;
};

const STORAGE_KEY = "santaan_utm";

export const readUtmParams = (): UtmParams => {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as UtmParams) : {};
    } catch {
        return {};
    }
};

export const writeUtmParams = (params: UtmParams) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
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
        utm_source: params.get("utm_source") || existing.utm_source || undefined,
        utm_medium: params.get("utm_medium") || existing.utm_medium || undefined,
        utm_campaign: params.get("utm_campaign") || existing.utm_campaign || undefined,
        utm_term: params.get("utm_term") || existing.utm_term || undefined,
        utm_content: params.get("utm_content") || existing.utm_content || undefined,
        landing_path: existing.landing_path || parsed.pathname || undefined,
    };

    writeUtmParams(next);
};
