"use client";

import { useEffect } from "react";
import { ensureMandatoryUtm, readUtmParams } from "@/lib/utm";
import { resolveCenter } from "@/lib/lead-attribution";

type CtaAction = "call" | "whatsapp" | "book";

const VISITOR_STORAGE_KEY = "santaan_visitor_id";
const PHONE_REGEX = /^tel:/i;
const WHATSAPP_REGEX = /(wa\.me|whatsapp\.com|api\.whatsapp\.com)/i;

const buildVisitorId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const getVisitorId = () => {
    if (typeof window === "undefined") return "visitor_server";
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;
    const next = buildVisitorId();
    localStorage.setItem(VISITOR_STORAGE_KEY, next);
    return next;
};

const resolveActionFromElement = (element: HTMLElement): { action: CtaAction; target: string; center?: string } | null => {
    const ctaKind = element.dataset.ctaKind?.toLowerCase();
    const ctaCenter = element.dataset.center;
    const ctaTarget = element.dataset.ctaTarget;

    if (ctaKind === "call" || ctaKind === "whatsapp" || ctaKind === "book") {
        if (ctaTarget) {
            return { action: ctaKind, target: ctaTarget, center: ctaCenter };
        }

        if (element instanceof HTMLAnchorElement && element.href) {
            return { action: ctaKind, target: element.href, center: ctaCenter };
        }

        return { action: ctaKind, target: window.location.href, center: ctaCenter };
    }

    if (element instanceof HTMLAnchorElement) {
        const rawHref = element.getAttribute("href") || "";
        const href = rawHref || element.href || "";

        if (PHONE_REGEX.test(href)) {
            return { action: "call", target: href, center: ctaCenter };
        }

        if (WHATSAPP_REGEX.test(href)) {
            return { action: "whatsapp", target: href, center: ctaCenter };
        }

        const normalizedHref = href.toLowerCase();
        if (normalizedHref.includes("/at-home-fertility-testing") || normalizedHref.includes("book-assessment")) {
            return { action: "book", target: href, center: ctaCenter };
        }
    }

    if (element.tagName === "BUTTON") {
        const text = element.textContent?.toLowerCase() || "";
        if (text.includes("book")) {
            return { action: "book", target: window.location.href, center: ctaCenter };
        }
    }

    return null;
};

const sendCtaIntent = (payload: Record<string, unknown>) => {
    const body = JSON.stringify(payload);

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon("/api/track-call", blob)) return;
    }

    fetch("/api/track-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
    }).catch(() => {
        // Ignore network failures so CTA flow is never blocked.
    });
};

export default function CtaContactTracker() {
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.location.pathname.startsWith("/admin")) return;

        const handleClick = (event: MouseEvent) => {
            const origin = event.target as HTMLElement | null;
            if (!origin) return;

            const trackable = origin.closest<HTMLElement>("[data-cta-kind],a[href],button");
            if (!trackable) return;

            const cta = resolveActionFromElement(trackable);
            if (!cta) return;

            const landingPath = `${window.location.pathname}${window.location.search}`;
            const utm = ensureMandatoryUtm({ ...readUtmParams(), landing_path: landingPath });
            const center = resolveCenter({
                center: cta.center || new URL(window.location.href).searchParams.get("center"),
                landingPath,
                target: cta.target,
            });

            sendCtaIntent({
                action: cta.action,
                target: cta.target,
                center,
                landingPath,
                visitorId: getVisitorId(),
                utm,
            });
        };

        document.addEventListener("click", handleClick, { capture: true });
        return () => document.removeEventListener("click", handleClick, { capture: true });
    }, []);

    return null;
}

