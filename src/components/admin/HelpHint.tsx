"use client";

import { CircleHelp } from "lucide-react";

interface HelpHintProps {
  text: string;
}

export default function HelpHint({ text }: HelpHintProps) {
  return (
    <span className="relative inline-flex items-center group" aria-label={text}>
      <CircleHelp className="h-3.5 w-3.5 text-slate-400 cursor-help" />
      <span className="pointer-events-none absolute right-0 top-5 z-20 hidden min-w-[220px] max-w-[320px] rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[11px] leading-5 text-slate-700 shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}

