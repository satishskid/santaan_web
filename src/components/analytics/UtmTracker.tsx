"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/lib/utm";

export default function UtmTracker() {
    useEffect(() => {
        if (typeof window === "undefined") return;
        captureUtmParams(window.location.href);
    }, []);

    return null;
}
