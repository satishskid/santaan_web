"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, MonitorPlay, Plus, Radio, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TvAdRow {
  id: number;
  airingDate: string;
  center: "bhubaneswar" | "berhampur" | "bangalore";
  channelName: string;
  programName: string;
  timeSlot: string;
  spotDurationSec: number;
  spotsCount: number;
  spend: number;
  creativeCode: string;
  tvCampaignCode: string;
  utmCampaign: string;
  qrCodeId?: string | null;
  ivrNumber?: string | null;
  whatsappKeyword?: string | null;
  notes?: string | null;
}

interface TvForm {
  airingDate: string;
  center: "bhubaneswar" | "berhampur" | "bangalore";
  channelName: string;
  programName: string;
  timeSlot: string;
  spotDurationSec: string;
  spotsCount: string;
  spend: string;
  creativeCode: string;
  tvCampaignCode: string;
  utmCampaign: string;
  qrCodeId: string;
  ivrNumber: string;
  whatsappKeyword: string;
  notes: string;
}

const initialForm: TvForm = {
  airingDate: new Date().toISOString().slice(0, 10),
  center: "bhubaneswar",
  channelName: "",
  programName: "",
  timeSlot: "",
  spotDurationSec: "20",
  spotsCount: "1",
  spend: "0",
  creativeCode: "",
  tvCampaignCode: "",
  utmCampaign: "",
  qrCodeId: "",
  ivrNumber: "",
  whatsappKeyword: "",
  notes: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function downloadTvTemplate() {
  const template = [
    "airing_date,center,channel_name,program_name,time_slot,spot_duration_sec,spots_count,spend,creative_code,tv_campaign_code,utm_campaign,qr_code_id,ivr_number,whatsapp_keyword,notes",
    "2026-02-22,bhubaneswar,ETV Odisha,Prime News,20:30,20,3,75000,tv_bbsr_prime_v1,tv_fy26q1_bbsr_prime,fy26q1_bbsr_tv_prime,qr_tv_bbsr_01,9692081966,bbsr_ivf,evening burst",
    "2026-02-22,berhampur,OTV,Family Hour,19:00,30,2,42000,tv_brp_family_v1,tv_fy26q1_brp_family,fy26q1_brp_tv_family,qr_tv_brp_02,9692081966,brp_pcos,regional test",
  ].join("\n");
  const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "santaan_tv_spot_template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function TvAdManagement() {
  const [rows, setRows] = useState<TvAdRow[]>([]);
  const [form, setForm] = useState<TvForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/tv-ads");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to fetch TV ad rows");
      setRows(payload.rows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch TV ad rows");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  const totals = useMemo(() => {
    const spend = rows.reduce((sum, row) => sum + Number(row.spend || 0), 0);
    const spots = rows.reduce((sum, row) => sum + Number(row.spotsCount || 0), 0);
    return { spend, spots };
  }, [rows]);

  async function saveRow() {
    if (
      !form.channelName.trim() ||
      !form.programName.trim() ||
      !form.timeSlot.trim() ||
      !form.creativeCode.trim() ||
      !form.tvCampaignCode.trim() ||
      !form.utmCampaign.trim()
    ) {
      setError("channelName, programName, timeSlot, creativeCode, tvCampaignCode, and utmCampaign are required.");
      return;
    }

    if (!form.qrCodeId.trim() && !form.ivrNumber.trim() && !form.whatsappKeyword.trim()) {
      setError("At least one tracking handle is required: QR Code ID, IVR Number, or WhatsApp Keyword.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/tv-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airingDate: form.airingDate,
          center: form.center,
          channelName: form.channelName,
          programName: form.programName,
          timeSlot: form.timeSlot,
          spotDurationSec: Number(form.spotDurationSec || 20),
          spotsCount: Number(form.spotsCount || 1),
          spend: Number(form.spend || 0),
          creativeCode: form.creativeCode,
          tvCampaignCode: form.tvCampaignCode,
          utmCampaign: form.utmCampaign,
          qrCodeId: form.qrCodeId || null,
          ivrNumber: form.ivrNumber || null,
          whatsappKeyword: form.whatsappKeyword || null,
          notes: form.notes || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to save TV ad row");

      setNotice("TV ad row added.");
      setForm({ ...initialForm, airingDate: form.airingDate, center: form.center });
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save TV ad row");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id: number) {
    if (!confirm("Delete this TV ad row?")) return;
    try {
      const response = await fetch(`/api/admin/tv-ads?id=${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to delete row");
      setNotice("TV ad row deleted.");
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete row");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MonitorPlay className="w-4 h-4 text-santaan-teal" />
          TV Ad Input
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Mandatory spot-level logging with trackable handles (QR / IVR / WhatsApp keyword).
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input type="date" value={form.airingDate} onChange={(e) => setForm((p) => ({ ...p, airingDate: e.target.value }))} />
          <select
            value={form.center}
            onChange={(e) => setForm((p) => ({ ...p, center: e.target.value as TvForm["center"] }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="bhubaneswar">bhubaneswar</option>
            <option value="berhampur">berhampur</option>
            <option value="bangalore">bangalore</option>
          </select>
          <Input placeholder="channel_name" value={form.channelName} onChange={(e) => setForm((p) => ({ ...p, channelName: e.target.value }))} />
          <Input placeholder="program_name" value={form.programName} onChange={(e) => setForm((p) => ({ ...p, programName: e.target.value }))} />
          <Input placeholder="time_slot (e.g. 20:30)" value={form.timeSlot} onChange={(e) => setForm((p) => ({ ...p, timeSlot: e.target.value }))} />
          <Input
            type="number"
            min="1"
            placeholder="spot_duration_sec"
            value={form.spotDurationSec}
            onChange={(e) => setForm((p) => ({ ...p, spotDurationSec: e.target.value }))}
          />
          <Input type="number" min="1" placeholder="spots_count" value={form.spotsCount} onChange={(e) => setForm((p) => ({ ...p, spotsCount: e.target.value }))} />
          <Input type="number" min="0" placeholder="spend" value={form.spend} onChange={(e) => setForm((p) => ({ ...p, spend: e.target.value }))} />
          <Input placeholder="creative_code" value={form.creativeCode} onChange={(e) => setForm((p) => ({ ...p, creativeCode: e.target.value }))} />
          <Input
            placeholder="tv_campaign_code"
            value={form.tvCampaignCode}
            onChange={(e) => setForm((p) => ({ ...p, tvCampaignCode: e.target.value }))}
          />
          <Input placeholder="utm_campaign" value={form.utmCampaign} onChange={(e) => setForm((p) => ({ ...p, utmCampaign: e.target.value }))} />
          <Input placeholder="qr_code_id" value={form.qrCodeId} onChange={(e) => setForm((p) => ({ ...p, qrCodeId: e.target.value }))} />
          <Input placeholder="ivr_number" value={form.ivrNumber} onChange={(e) => setForm((p) => ({ ...p, ivrNumber: e.target.value }))} />
          <Input
            placeholder="whatsapp_keyword"
            value={form.whatsappKeyword}
            onChange={(e) => setForm((p) => ({ ...p, whatsappKeyword: e.target.value }))}
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
            <Plus className="w-4 h-4 mr-2" /> Add TV Row
          </Button>
          <Button type="button" variant="outline" onClick={downloadTvTemplate}>
            <Download className="w-4 h-4 mr-2" /> CSV Template
          </Button>
          <div className="ml-auto text-sm text-gray-700 flex items-center gap-5">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3" /> Spots: <strong>{totals.spots}</strong>
            </span>
            <span>Spend: <strong>{formatCurrency(totals.spend)}</strong></span>
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
              <TableHead>Center</TableHead>
              <TableHead>Channel/Program</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead className="text-right">Spots</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Loading TV rows...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No TV rows logged yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.airingDate}</TableCell>
                  <TableCell>{row.center}</TableCell>
                  <TableCell>
                    <div className="font-medium">{row.channelName}</div>
                    <div className="text-xs text-gray-500">{row.programName} ({row.timeSlot})</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.tvCampaignCode}</div>
                    <div className="text-xs text-gray-500">{row.utmCampaign}</div>
                  </TableCell>
                  <TableCell className="text-right">{row.spotsCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(row.spend || 0))}</TableCell>
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
