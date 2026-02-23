import { CENTER_CONTACTS } from "@/data/centers";

const CENTER_NAME_MAP: Record<string, string> = {
    bhubaneswar: "Bhubaneswar",
    bbsr: "Bhubaneswar",
    berhampur: "Berhampur",
    brahmapur: "Berhampur",
    bangalore: "Bangalore",
    bengaluru: "Bangalore",
    aecs: "Bangalore",
};

const CLEAN_PHONE = /[^0-9]/g;

const centerPhones = CENTER_CONTACTS.flatMap((center) => {
    const canonical = CENTER_NAME_MAP[center.city.toLowerCase()] || center.city;
    return center.phones.map((phone) => ({
        center: canonical,
        phone: phone.replace(CLEAN_PHONE, "").slice(-10),
    }));
});

const findCenterByHint = (value: string): string | undefined => {
    const normalized = value.trim().toLowerCase();
    for (const [hint, center] of Object.entries(CENTER_NAME_MAP)) {
        if (normalized.includes(hint)) return center;
    }
    return undefined;
};

const getPhoneFromTarget = (target?: string | null): string | undefined => {
    if (!target) return undefined;
    const trimmed = target.trim();

    if (trimmed.startsWith("tel:")) {
        return trimmed.replace("tel:", "").replace(CLEAN_PHONE, "").slice(-10);
    }

    try {
        const parsed = new URL(trimmed, "https://santaan.in");
        if (parsed.hostname.includes("wa.me")) {
            return parsed.pathname.replace("/", "").replace(CLEAN_PHONE, "").slice(-10);
        }

        const phoneFromQuery = parsed.searchParams.get("phone") || parsed.searchParams.get("to");
        if (phoneFromQuery) return phoneFromQuery.replace(CLEAN_PHONE, "").slice(-10);
    } catch {
        const fallback = trimmed.replace(CLEAN_PHONE, "");
        if (fallback.length >= 10) return fallback.slice(-10);
    }

    return undefined;
};

export const inferCenterFromLandingPath = (landingPath?: string | null): string | undefined => {
    if (!landingPath) return undefined;
    return findCenterByHint(landingPath);
};

export const inferCenterFromTarget = (target?: string | null): string | undefined => {
    if (!target) return undefined;
    const byHint = findCenterByHint(target);
    if (byHint) return byHint;

    const phone = getPhoneFromTarget(target);
    if (!phone) return undefined;

    return centerPhones.find((item) => item.phone === phone)?.center;
};

export const resolveCenter = (input: {
    center?: string | null;
    landingPath?: string | null;
    target?: string | null;
}): string => {
    const explicit = input.center ? findCenterByHint(input.center) || input.center : undefined;
    return explicit || inferCenterFromLandingPath(input.landingPath) || inferCenterFromTarget(input.target) || "Network";
};

