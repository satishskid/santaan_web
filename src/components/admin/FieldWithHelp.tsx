"use client";

import type { ReactNode } from "react";
import HelpHint from "@/components/admin/HelpHint";

interface FieldWithHelpProps {
  label: string;
  help: string;
  required?: boolean;
  children: ReactNode;
}

export default function FieldWithHelp({ label, help, required = false, children }: FieldWithHelpProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          {label}
          {required ? <span className="text-rose-600"> *</span> : null}
        </label>
        <HelpHint text={help} />
      </div>
      {children}
    </div>
  );
}

