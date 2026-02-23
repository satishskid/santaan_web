"use client";

import { useMemo, useState } from "react";
import { BarChart3, MapPinned, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/Button";
import AgencyPerformanceManagement from "@/components/admin/AgencyPerformanceManagement";
import FieldActivityManagement from "@/components/admin/FieldActivityManagement";
import TvAdManagement from "@/components/admin/TvAdManagement";

type OpsTab = "agency" | "field" | "tv";

interface OpsInputsManagementProps {
  userRole?: string;
}

const AGENCY_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "agency_ops", "marketing_manager", "performance_marketer"]);
const FIELD_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "field_exec", "agency_ops", "marketing_manager"]);
const TV_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "agency_ops", "marketing_manager", "performance_marketer"]);

function normalizeRole(role?: string | null) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

export default function OpsInputsManagement({ userRole }: OpsInputsManagementProps) {
  const role = normalizeRole(userRole);
  const availableTabs = useMemo(() => {
    const tabs: OpsTab[] = [];
    if (AGENCY_ROLES.has(role)) tabs.push("agency");
    if (FIELD_ROLES.has(role)) tabs.push("field");
    if (TV_ROLES.has(role)) tabs.push("tv");
    return tabs;
  }, [role]);

  const [activeTab, setActiveTab] = useState<OpsTab>("agency");

  const fallbackTab = availableTabs[0] || "agency";
  const effectiveTab = availableTabs.includes(activeTab) ? activeTab : fallbackTab;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Mandatory Team Inputs</h3>
        <p className="text-sm text-gray-600 mt-1">
          Use this module to enforce daily data capture from agency, field teams, and TV operations in one place.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {availableTabs.includes("agency") ? (
            <Button variant={effectiveTab === "agency" ? "default" : "outline"} onClick={() => setActiveTab("agency")}>
              <BarChart3 className="w-4 h-4 mr-2" /> Agency
            </Button>
          ) : null}
          {availableTabs.includes("field") ? (
            <Button variant={effectiveTab === "field" ? "default" : "outline"} onClick={() => setActiveTab("field")}>
              <MapPinned className="w-4 h-4 mr-2" /> Field Team
            </Button>
          ) : null}
          {availableTabs.includes("tv") ? (
            <Button variant={effectiveTab === "tv" ? "default" : "outline"} onClick={() => setActiveTab("tv")}>
              <MonitorPlay className="w-4 h-4 mr-2" /> TV Ads
            </Button>
          ) : null}
        </div>
        {availableTabs.length === 0 ? (
          <p className="mt-4 text-sm text-rose-700">
            Your role does not have input access for agency, field, or TV modules.
          </p>
        ) : null}
      </div>

      {effectiveTab === "agency" && availableTabs.includes("agency") ? <AgencyPerformanceManagement /> : null}
      {effectiveTab === "field" && availableTabs.includes("field") ? <FieldActivityManagement /> : null}
      {effectiveTab === "tv" && availableTabs.includes("tv") ? <TvAdManagement /> : null}
    </div>
  );
}
