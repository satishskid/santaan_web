"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, IndianRupee, Megaphone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AgencyRow {
  id: number;
  reportDate: string;
  platform: "meta" | "google" | "youtube";
  center: "bhubaneswar" | "berhampur" | "bangalore";
  campaignId: string;
  campaignName: string;
  utmSource: string;
  utmMedium: "paid_social" | "cpc" | "video";
  utmCampaign: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  registrations: number;
  notes?: string | null;
}

interface AgencyForm {
  reportDate: string;
  platform: "meta" | "google" | "youtube";
  center: "bhubaneswar" | "berhampur" | "bangalore";
  campaignId: string;
  campaignName: string;
  utmSource: "meta" | "google" | "youtube";
  utmMedium: "paid_social" | "cpc" | "video";
  utmCampaign: string;
  spend: string;
  impressions: string;
  clicks: string;
  leads: string;
  qualifiedLeads: string;
  registrations: string;
  notes: string;
}

const initialForm: AgencyForm = {
  reportDate: new Date().toISOString().slice(0, 10),
  platform: "meta",
  center: "bhubaneswar",
  campaignId: "",
  campaignName: "",
  utmSource: "meta",
  utmMedium: "paid_social",
  utmCampaign: "",
  spend: "",
  impressions: "0",
  clicks: "0",
  leads: "0",
  qualifiedLeads: "0",
  registrations: "0",
  notes: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function downloadAgencyTemplate() {
  const template = [
    "report_date,platform,center,campaign_id,campaign_name,utm_source,utm_medium,utm_campaign,spend,impressions,clicks,leads,qualified_leads,registrations,notes",
    "2026-02-22,meta,bhubaneswar,bbsr_ivf_001,BBSR IVF Leadgen,meta,paid_social,fy26q1_bbsr_ivf_leadgen_v1,12500,23000,980,34,16,5,top creative A",
    "2026-02-22,google,berhampur,brp_pcos_003,BRP PCOS Search,google,cpc,fy26q1_brp_pcos_search_v1,9600,18000,740,21,8,3,high intent keywords",
  ].join("\n");
  const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "santaan_agency_daily_template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AgencyPerformanceManagement() {
  const [rows, setRows] = useState<AgencyRow[]>([]);
  const [form, setForm] = useState<AgencyForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/agency-performance", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to fetch agency rows");
      setRows(payload.rows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agency rows");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  const totals = useMemo(() => {
    const spend = rows.reduce((sum, row) => sum + Number(row.spend || 0), 0);
    const leads = rows.reduce((sum, row) => sum + Number(row.leads || 0), 0);
    const registrations = rows.reduce((sum, row) => sum + Number(row.registrations || 0), 0);
    const cpl = leads > 0 ? spend / leads : 0;
    const cpr = registrations > 0 ? spend / registrations : 0;
    return { spend, leads, registrations, cpl, cpr };
  }, [rows]);

  async function saveRow() {
    if (!form.campaignId.trim() || !form.campaignName.trim() || !form.utmCampaign.trim() || !form.spend.trim()) {
      setError("campaignId, campaignName, utmCampaign, and spend are required.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/agency-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportDate: form.reportDate,
          platform: form.platform,
          center: form.center,
          campaignId: form.campaignId,
          campaignName: form.campaignName,
          utmSource: form.utmSource,
          utmMedium: form.utmMedium,
          utmCampaign: form.utmCampaign,
          spend: Number(form.spend),
          impressions: Number(form.impressions || 0),
          clicks: Number(form.clicks || 0),
          leads: Number(form.leads || 0),
          qualifiedLeads: Number(form.qualifiedLeads || 0),
          registrations: Number(form.registrations || 0),
          notes: form.notes || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to save agency row");

      const savedRow = payload?.row as AgencyRow | undefined;
      const deduped = Boolean(payload?.deduped);
      setNotice(deduped ? "Agency daily row updated (existing entry refreshed)." : "Agency daily row added.");
      const nextMedium = form.platform === "google" ? "cpc" : form.platform === "youtube" ? "video" : "paid_social";
      setForm({
        ...initialForm,
        reportDate: form.reportDate,
        center: form.center,
        platform: form.platform,
        utmSource: form.platform,
        utmMedium: nextMedium,
      });
      if (savedRow?.id) {
        setRows((prev) => {
          const next = [savedRow, ...prev.filter((row) => row.id !== savedRow.id)];
          return next;
        });
      }
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save agency row");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id: number) {
    if (!confirm("Delete this agency row?")) return;
    try {
      const response = await fetch(`/api/admin/agency-performance?id=${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to delete row");
      setNotice("Agency row deleted.");
      setRows((prev) => prev.filter((row) => row.id !== id));
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete row");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-santaan-teal" />
          Agency Daily Performance Input
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Mandatory by 11:00 AM IST. One row per campaign per day. UTM fields are mandatory for ROI visibility.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input type="date" value={form.reportDate} onChange={(e) => setForm((p) => ({ ...p, reportDate: e.target.value }))} />

          <select
            value={form.platform}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                platform: e.target.value as AgencyForm["platform"],
                utmSource: e.target.value as AgencyForm["utmSource"],
                utmMedium: e.target.value === "google" ? "cpc" : e.target.value === "youtube" ? "video" : "paid_social",
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="meta">meta</option>
            <option value="google">google</option>
            <option value="youtube">youtube</option>
          </select>

          <select
            value={form.center}
            onChange={(e) => setForm((p) => ({ ...p, center: e.target.value as AgencyForm["center"] }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="bhubaneswar">bhubaneswar</option>
            <option value="berhampur">berhampur</option>
            <option value="bangalore">bangalore</option>
          </select>

          <Input placeholder="campaign_id" value={form.campaignId} onChange={(e) => setForm((p) => ({ ...p, campaignId: e.target.value }))} />
          <Input
            placeholder="campaign_name"
            value={form.campaignName}
            onChange={(e) => setForm((p) => ({ ...p, campaignName: e.target.value }))}
          />
          <Input
            placeholder="utm_campaign"
            value={form.utmCampaign}
            onChange={(e) => setForm((p) => ({ ...p, utmCampaign: e.target.value }))}
          />

          <select
            value={form.utmMedium}
            onChange={(e) => setForm((p) => ({ ...p, utmMedium: e.target.value as AgencyForm["utmMedium"] }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="paid_social">paid_social</option>
            <option value="cpc">cpc</option>
            <option value="video">video</option>
          </select>

          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="spend (INR)"
            value={form.spend}
            onChange={(e) => setForm((p) => ({ ...p, spend: e.target.value }))}
          />
          <Input type="number" min="0" placeholder="impressions" value={form.impressions} onChange={(e) => setForm((p) => ({ ...p, impressions: e.target.value }))} />
          <Input type="number" min="0" placeholder="clicks" value={form.clicks} onChange={(e) => setForm((p) => ({ ...p, clicks: e.target.value }))} />
          <Input type="number" min="0" placeholder="leads" value={form.leads} onChange={(e) => setForm((p) => ({ ...p, leads: e.target.value }))} />
          <Input
            type="number"
            min="0"
            placeholder="qualified_leads"
            value={form.qualifiedLeads}
            onChange={(e) => setForm((p) => ({ ...p, qualifiedLeads: e.target.value }))}
          />
          <Input
            type="number"
            min="0"
            placeholder="registrations"
            value={form.registrations}
            onChange={(e) => setForm((p) => ({ ...p, registrations: e.target.value }))}
          />
        </div>

        <div className="mt-3">
          <textarea
            className="w-full min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="notes (optional)"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={saveRow} disabled={saving}>
            <Plus className="w-4 h-4 mr-2" /> Add Agency Row
          </Button>
          <Button type="button" variant="outline" onClick={downloadAgencyTemplate}>
            <Download className="w-4 h-4 mr-2" /> CSV Template
          </Button>
          <div className="ml-auto text-sm text-gray-700 flex items-center gap-5">
            <span className="flex items-center gap-1">
              <IndianRupee className="w-3 h-3" /> Spend: <strong>{formatCurrency(totals.spend)}</strong>
            </span>
            <span>Leads: <strong>{totals.leads}</strong></span>
            <span>Regs: <strong>{totals.registrations}</strong></span>
            <span>CPL: <strong>{formatCurrency(totals.cpl)}</strong></span>
            <span>CPR: <strong>{formatCurrency(totals.cpr)}</strong></span>
          </div>
        </div>

        {notice ? <p className="text-sm text-emerald-700 mt-3">{notice}</p> : null}
        {error ? <p className="text-sm text-rose-700 mt-3">{error}</p> : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Center</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Regs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Loading agency rows...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No agency rows logged yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.reportDate}</TableCell>
                  <TableCell className="font-medium">{row.platform}</TableCell>
                  <TableCell>{row.center}</TableCell>
                  <TableCell>
                    <div className="font-medium">{row.campaignName}</div>
                    <div className="text-xs text-gray-500">{row.utmCampaign}</div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(row.spend || 0))}</TableCell>
                  <TableCell className="text-right">{row.leads}</TableCell>
                  <TableCell className="text-right">{row.registrations}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => deleteRow(row.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
