"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/lib/utm";
import { captureMarketingAttribution } from "@/lib/marketing-attribution";

export default function UtmTracker() {
    useEffect(() => {
        if (typeof window === "undefined") return;
        captureUtmParams(window.location.href);
        captureMarketingAttribution(window.location.href);
    }, []);

    return null;
}
