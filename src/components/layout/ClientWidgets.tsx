"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget"), { ssr: false });
const StickyContactBar = dynamic(() => import("@/components/layout/StickyContactBar"), { ssr: false });

export default function ClientWidgets() {
  const pathname = usePathname();

  // Hide widgets on admin/CRM routes
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      <ChatWidget />
      <StickyContactBar />
    </>
  );
}

