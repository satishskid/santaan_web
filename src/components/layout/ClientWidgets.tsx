"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const StickyContactBar = dynamic(() => import("@/components/layout/StickyContactBar"), { ssr: false });

export default function ClientWidgets() {
  const pathname = usePathname();

  if (pathname?.startsWith("/login") || pathname?.startsWith("/profile")) {
    return null;
  }

  return <StickyContactBar />;
}
