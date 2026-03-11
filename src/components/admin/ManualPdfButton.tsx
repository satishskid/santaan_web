"use client";

import { Download } from "lucide-react";

export default function ManualPdfButton() {
  const handleDownload = () => {
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      aria-label="Download manual as PDF"
    >
      <Download className="h-4 w-4" />
      Download PDF
    </button>
  );
}
