"use client";

import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget"), { ssr: false });
const StickyContactBar = dynamic(() => import("@/components/layout/StickyContactBar"), { ssr: false });

export default function ClientWidgets() {
  return (
    <>
      <ChatWidget />
      <StickyContactBar />
    </>
  );
}

