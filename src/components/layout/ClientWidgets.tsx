"use client";

import dynamic from "next/dynamic";

const StickyContactBar = dynamic(() => import("@/components/layout/StickyContactBar"), { ssr: false });

export default function ClientWidgets() {
  return (
    <>
      <StickyContactBar />
    </>
  );
}
