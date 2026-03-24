"use client";

import { useEffect, useMemo, useState } from "react";
import { IndianRupee, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SpendEntry {
  id: number;
  spendDate: string;
  channel: string;
  utmCampaign: string;
  center: string;
  asset: string | null;
  amount: number;
  notes: string | null;
}

interface SpendForm {
  id?: number;
  spendDate: string;
  channel: string;
  utmCampaign: string;
  center: string;
  asset: string;
  amount: string;
  notes: string;
}

const initialForm: SpendForm = {
  spendDate: new Date().toISOString().slice(0, 10),
  channel: "meta",
  utmCampaign: "",
  center: "network",
  asset: "",
  amount: "",
  notes: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

type SpendImportRow = {
  spendDate?: string;
  channel?: string;
  utmCampaign?: string;
  center?: string;
  asset?: string;
  amount?: string | number;
  notes?: string;
};

function parseSpendCsv(text: string): SpendImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const idx = {
    spendDate: headers.findIndex((h) => ["spend_date", "date", "spenddate"].includes(h)),
    channel: headers.findIndex((h) => ["channel", "source"].includes(h)),
    utmCampaign: headers.findIndex((h) => ["utm_campaign", "campaign", "utmcampaign"].includes(h)),
    center: headers.findIndex((h) => ["center", "city", "branch"].includes(h)),
    asset: headers.findIndex((h) => ["asset", "creative", "adset"].includes(h)),
    amount: headers.findIndex((h) => ["amount", "spend", "cost"].includes(h)),
    notes: headers.findIndex((h) => ["notes", "remark", "remarks"].includes(h)),
  };

  const rows: SpendImportRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    const row: SpendImportRow = {
      spendDate: idx.spendDate >= 0 ? cols[idx.spendDate] : undefined,
      channel: idx.channel >= 0 ? cols[idx.channel] : undefined,
      utmCampaign: idx.utmCampaign >= 0 ? cols[idx.utmCampaign] : undefined,
      center: idx.center >= 0 ? cols[idx.center] : undefined,
      asset: idx.asset >= 0 ? cols[idx.asset] : undefined,
      amount: idx.amount >= 0 ? cols[idx.amount] : undefined,
      notes: idx.notes >= 0 ? cols[idx.notes] : undefined,
    };
    rows.push(row);
  }
  return rows;
}

function downloadSpendTemplate() {
  const template = [
    "spend_date,channel,utm_campaign,center,asset,amount,notes",
    "2026-02-21,meta,ivf_bhubaneswar_q1,bhubaneswar,reel_v1,5000,launch day",
    "2026-02-21,google,pcos_berhampur_q1,berhampur,search_ad_1,3200,high intent keywords",
  ].join("\n");
  const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "santaan_spend_template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function SpendManagement() {
  const [entries, setEntries] = useState<SpendEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SpendForm>(initialForm);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [syncingMeta, setSyncingMeta] = useState(false);

  const isEditing = Boolean(form.id);

  async function fetchSpend() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/spend", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch spend entries");
      }
      setEntries(payload.spend || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch spend entries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSpend();
  }, []);

  const totalSpend = useMemo(
    () => entries.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [entries]
  );

  function resetForm() {
    setForm(initialForm);
  }

  function editEntry(entry: SpendEntry) {
    setForm({
      id: entry.id,
      spendDate: entry.spendDate,
      channel: entry.channel,
      utmCampaign: entry.utmCampaign,
      center: entry.center || "network",
      asset: entry.asset || "",
      amount: String(entry.amount),
      notes: entry.notes || "",
    });
    setNotice(null);
    setError(null);
  }

  async function saveEntry() {
    if (!form.spendDate || !form.channel.trim() || !form.utmCampaign.trim() || !form.amount) {
      setError("Date, channel, campaign, and amount are required.");
      return;
    }

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Amount must be a valid number.");
      return;
    }

    setSaving(true);
    setNotice(null);
    setError(null);

    try {
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch("/api/admin/spend", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          spendDate: form.spendDate,
          channel: form.channel,
          utmCampaign: form.utmCampaign,
          center: form.center,
          asset: form.asset || null,
          amount,
          notes: form.notes || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save spend entry");
      }

      setNotice(isEditing ? "Spend entry updated." : "Spend entry created.");
      resetForm();
      await fetchSpend();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save spend entry");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: number) {
    if (!confirm("Delete this spend entry?")) return;
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/spend?id=${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete spend entry");
      }
      setNotice("Spend entry deleted.");
      await fetchSpend();
      if (form.id === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete spend entry");
    } finally {
      setSaving(false);
    }
  }

  async function importCsv(file: File) {
    setImporting(true);
    setNotice(null);
    setError(null);
    try {
      const text = await file.text();
      const rows = parseSpendCsv(text);
      if (!rows.length) {
        throw new Error("No valid CSV rows found. Use template headers.");
      }

      const response = await fetch("/api/admin/spend/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to import CSV");
      }

      const imported = Number(payload?.imported || 0);
      const failed = Number(payload?.failed || 0);
      const firstError = Array.isArray(payload?.errors) && payload.errors.length
        ? ` First error: row ${payload.errors[0].row} - ${payload.errors[0].error}`
        : "";
      setNotice(`CSV import completed. Imported: ${imported}, Failed: ${failed}.${firstError}`);
      await fetchSpend();
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV import failed");
    } finally {
      setImporting(false);
    }
  }

  async function syncMetaSpend() {
    setSyncingMeta(true);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/spend/sync-meta?date=${encodeURIComponent(form.spendDate)}`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "Meta sync failed");
      }

      const total = formatCurrency(Number(payload?.totalSpend || 0));
      setNotice(
        `Meta sync completed for ${payload?.reportDate || form.spendDate}. Rows: ${payload?.syncedRows || 0}, campaigns: ${payload?.campaigns || 0}, spend: ${total}.`
      );
      await fetchSpend();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Meta sync failed");
    } finally {
      setSyncingMeta(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-santaan-teal" />
          Campaign Spend Tracking
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Log channel spend by campaign. This powers CPL and CPP in Analytics and CEO Command.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            type="date"
            value={form.spendDate}
            onChange={(event) => setForm((prev) => ({ ...prev, spendDate: event.target.value }))}
          />
          <Input
            placeholder="channel (meta/google/offline)"
            value={form.channel}
            onChange={(event) => setForm((prev) => ({ ...prev, channel: event.target.value }))}
          />
          <Input
            placeholder="utm_campaign"
            value={form.utmCampaign}
            onChange={(event) => setForm((prev) => ({ ...prev, utmCampaign: event.target.value }))}
          />
          <Input
            placeholder="center (bhubaneswar/berhampur/bangalore/network)"
            value={form.center}
            onChange={(event) => setForm((prev) => ({ ...prev, center: event.target.value }))}
          />
          <Input
            placeholder="asset (optional)"
            value={form.asset}
            onChange={(event) => setForm((prev) => ({ ...prev, asset: event.target.value }))}
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="amount (INR)"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
          />
        </div>

        <div className="mt-3">
          <textarea
            className="w-full min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={saveEntry} disabled={saving}>
            {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isEditing ? "Update Spend" : "Add Spend"}
          </Button>
          <label className="inline-flex">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  importCsv(file);
                }
                event.currentTarget.value = "";
              }}
              disabled={importing}
            />
            <Button type="button" variant="outline" disabled={importing || saving}>
              {importing ? "Importing..." : "Import CSV"}
            </Button>
          </label>
          <Button type="button" variant="outline" onClick={downloadSpendTemplate} disabled={saving || importing}>
            Download Template
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={syncMetaSpend}
            disabled={saving || importing || syncingMeta}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncingMeta ? "animate-spin" : ""}`} />
            {syncingMeta ? "Syncing Meta..." : "Sync Meta"}
          </Button>
          {isEditing ? (
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Cancel Edit
            </Button>
          ) : null}
          <div className="ml-auto text-sm text-gray-700 self-center">
            Total logged spend: <span className="font-semibold">{formatCurrency(totalSpend)}</span>
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
              <TableHead>Channel</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Center</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading spend entries...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No spend entries logged yet.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-gray-700">{entry.spendDate}</TableCell>
                  <TableCell className="font-medium text-gray-900">{entry.channel}</TableCell>
                  <TableCell className="text-gray-700">{entry.utmCampaign}</TableCell>
                  <TableCell className="text-gray-700">{entry.center || "network"}</TableCell>
                  <TableCell className="text-right text-gray-900 font-medium">
                    {formatCurrency(Number(entry.amount || 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editEntry(entry)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
