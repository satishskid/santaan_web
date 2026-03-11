"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, MessageSquareQuote, Save, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FieldWithHelp from "@/components/admin/FieldWithHelp";
import { REVIEW_CENTERS, REVIEW_RESPONSE_STATUS, REVIEW_SOURCES, themeLabel } from "@/lib/reviews";

type ReviewSource = (typeof REVIEW_SOURCES)[number];
type ReviewCenter = (typeof REVIEW_CENTERS)[number];
type ReviewResponseStatus = (typeof REVIEW_RESPONSE_STATUS)[number];

interface ReviewRow {
  id: number;
  source: ReviewSource;
  center: ReviewCenter;
  reviewerName?: string | null;
  rating: number;
  reviewDate: string;
  headline?: string | null;
  reviewText: string;
  publicUrl?: string | null;
  sentiment: "positive" | "neutral" | "negative";
  themes: string;
  responseStatus: ReviewResponseStatus;
  responseOwner?: string | null;
  responseText?: string | null;
  respondedAt?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  notes?: string | null;
}

interface ReviewsSummary {
  total: number;
  averageRating: number;
  lowRatedPending: number;
  responded: number;
  featured: number;
  new30d: number;
  topThemes: Array<{ theme: string; count: number }>;
}

interface ReviewForm {
  id?: number;
  source: ReviewSource;
  center: ReviewCenter;
  reviewerName: string;
  rating: string;
  reviewDate: string;
  headline: string;
  reviewText: string;
  publicUrl: string;
  responseStatus: ReviewResponseStatus;
  responseOwner: string;
  responseText: string;
  isFeatured: boolean;
  notes: string;
}

const initialForm: ReviewForm = {
  source: "google",
  center: "bhubaneswar",
  reviewerName: "",
  rating: "5",
  reviewDate: new Date().toISOString().slice(0, 10),
  headline: "",
  reviewText: "",
  publicUrl: "",
  responseStatus: "pending",
  responseOwner: "",
  responseText: "",
  isFeatured: false,
  notes: "",
};

function formatRating(value: number) {
  return `${value.toFixed(1)} / 5`;
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

function parseReviewsCsv(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cols[index] || "";
    });
    return row;
  });
}

function downloadTemplate() {
  const csv = [
    "source,center,reviewer_name,rating,review_date,headline,review_text,public_url,response_status,response_owner,response_text,is_featured,notes",
    "google,bhubaneswar,Patient A,5,2026-03-10,Very supportive team,The doctors and staff explained everything clearly and made the process easy.,https://example.com/review,responded,crm.ops01,Thank you for trusting Santaan.,true,good for homepage trust block",
    "manual,berhampur,Patient B,2,2026-03-10,Long waiting time,The team was caring but waiting time was too long.,,pending,counselor.bam,,false,needs response and ops correction",
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "santaan_reviews_template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReviewsManagement() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [summary, setSummary] = useState<ReviewsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [debuggingGoogle, setDebuggingGoogle] = useState(false);
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [centerFilter, setCenterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState<ReviewForm>(initialForm);

  async function loadReviews() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (centerFilter !== "all") params.set("center", centerFilter);
      if (statusFilter !== "all") params.set("responseStatus", statusFilter);
      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to fetch reviews");
      setRows(payload.rows || []);
      setSummary(payload.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [sourceFilter, centerFilter, statusFilter]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.reviewerName, row.headline, row.reviewText, row.center, row.source, row.responseOwner, row.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [rows, query]);

  function resetForm() {
    setForm(initialForm);
  }

  function downloadFeaturedExport() {
    window.open("/api/admin/reviews/export?featured=true&format=csv", "_blank", "noopener,noreferrer");
  }

  async function runGoogleSync() {
    setSyncingGoogle(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/reviews/sync-google", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || payload?.error || "Failed to sync Google reviews");
      setNotice(`Google review sync completed. Synced ${payload?.synced || 0} reviews across ${payload?.locations || 0} locations.`);
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync Google reviews");
    } finally {
      setSyncingGoogle(false);
    }
  }

  async function runGoogleDebug() {
    setDebuggingGoogle(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/reviews/google-debug");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || payload?.error || "Failed to inspect Google review config");
      setNotice(
        payload?.configured
          ? `Google review config is ready. Accounts: ${payload?.accountCount || 0}, Locations: ${payload?.locationCount || 0}.`
          : payload?.message || "Google review config is not ready yet."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to inspect Google review config");
    } finally {
      setDebuggingGoogle(false);
    }
  }

  async function saveReview() {
    if (!form.reviewText.trim() || !form.reviewDate || !form.rating) {
      setError("rating, review date, and review text are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const method = form.id ? "PUT" : "POST";
      const response = await fetch("/api/admin/reviews", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          source: form.source,
          center: form.center,
          reviewerName: form.reviewerName,
          rating: Number(form.rating),
          reviewDate: form.reviewDate,
          headline: form.headline,
          reviewText: form.reviewText,
          publicUrl: form.publicUrl,
          responseStatus: form.responseStatus,
          responseOwner: form.responseOwner,
          responseText: form.responseText,
          isFeatured: form.isFeatured,
          notes: form.notes,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to save review");
      setNotice(form.id ? "Review updated." : "Review added.");
      resetForm();
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setSaving(false);
    }
  }

  async function importCsv(file: File) {
    setImporting(true);
    setError(null);
    setNotice(null);
    try {
      const text = await file.text();
      const rows = parseReviewsCsv(text);
      if (!rows.length) throw new Error("No valid CSV rows found. Use template headers.");
      const response = await fetch("/api/admin/reviews/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to import reviews");
      const firstError = Array.isArray(payload?.errors) && payload.errors.length
        ? ` First error: row ${payload.errors[0].row} - ${payload.errors[0].error}`
        : "";
      setNotice(`Reviews import completed. Imported: ${payload?.imported || 0}, Failed: ${payload?.failed || 0}.${firstError}`);
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import reviews");
    } finally {
      setImporting(false);
    }
  }

  async function deleteReview(id: number) {
    if (!confirm("Delete this review record?")) return;
    try {
      const response = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to delete review");
      setNotice("Review deleted.");
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    }
  }

  function editRow(row: ReviewRow) {
    setForm({
      id: row.id,
      source: row.source,
      center: row.center,
      reviewerName: row.reviewerName || "",
      rating: String(row.rating),
      reviewDate: row.reviewDate,
      headline: row.headline || "",
      reviewText: row.reviewText,
      publicUrl: row.publicUrl || "",
      responseStatus: row.responseStatus,
      responseOwner: row.responseOwner || "",
      responseText: row.responseText || "",
      isFeatured: Boolean(row.isFeatured),
      notes: row.notes || "",
    });
    setNotice(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquareQuote className="w-4 h-4 text-santaan-teal" />
          Review Intelligence
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Google-first trust intelligence for SEO, conversion, and operational correction. Meta recommendations can be logged too, but Google remains the primary reputation signal.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Average Rating</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{summary ? formatRating(summary.averageRating) : "0.0 / 5"}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Reviews</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{summary?.total || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">New 30 Days</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{summary?.new30d || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Low-rated Pending</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{summary?.lowRatedPending || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Featured Ready</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{summary?.featured || 0}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">How Santaan should use this</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>4-5 star reviews: website trust blocks, ad copy, reel hooks, center credibility.</li>
              <li>1-3 star reviews: CEO action queue, staff coaching, waiting-time/cost/transparency fixes.</li>
              <li>Recurring themes: input for blogs, FAQs, counselor scripts, and local landing page messaging.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Operating rule</p>
            <p className="mt-2">
              Reviews are not only testimonials. They are a trust and operations signal. Low-rated pending reviews should be answered quickly and reviewed in CEO Command.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(summary?.topThemes || []).map((item) => (
                <span key={item.theme} className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-900">
                  {themeLabel(item.theme)} · {item.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Review Response SOP</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Ask for Google reviews after positive consult, treatment milestone, or delivery outcome.</li>
            <li>Low-rated reviews must get an owner on the same day.</li>
            <li>If the issue is valid, fix ops first, then respond publicly.</li>
            <li>Feature only honest, center-relevant reviews that strengthen trust.</li>
          </ol>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <FieldWithHelp label="Source" required help="Use google for GBP reviews, meta for Facebook recommendations, manual for curated or imported records.">
            <select value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value as ReviewSource }))} className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full">
              {REVIEW_SOURCES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </FieldWithHelp>
          <FieldWithHelp label="Center" required help="Map every review to a center so leadership can see local reputation by branch.">
            <select value={form.center} onChange={(e) => setForm((p) => ({ ...p, center: e.target.value as ReviewCenter }))} className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full">
              {REVIEW_CENTERS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </FieldWithHelp>
          <FieldWithHelp label="Reviewer Name" help="Use public display name if available.">
            <Input value={form.reviewerName} onChange={(e) => setForm((p) => ({ ...p, reviewerName: e.target.value }))} placeholder="reviewer name" />
          </FieldWithHelp>
          <FieldWithHelp label="Rating" required help="Integer rating from 1 to 5.">
            <select value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full">
              {[1,2,3,4,5].map((value) => <option key={value} value={String(value)}>{value}</option>)}
            </select>
          </FieldWithHelp>
          <FieldWithHelp label="Review Date" required help="Date the review was published.">
            <Input type="date" value={form.reviewDate} onChange={(e) => setForm((p) => ({ ...p, reviewDate: e.target.value }))} />
          </FieldWithHelp>
          <FieldWithHelp label="Headline" help="Optional short headline if available.">
            <Input value={form.headline} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))} placeholder="headline" />
          </FieldWithHelp>
          <FieldWithHelp label="Public URL" help="Optional review URL for proof and response workflow.">
            <Input value={form.publicUrl} onChange={(e) => setForm((p) => ({ ...p, publicUrl: e.target.value }))} placeholder="https://..." />
          </FieldWithHelp>
          <FieldWithHelp label="Response Status" required help="Track whether the review still needs a response or escalation.">
            <select value={form.responseStatus} onChange={(e) => setForm((p) => ({ ...p, responseStatus: e.target.value as ReviewResponseStatus }))} className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full">
              {REVIEW_RESPONSE_STATUS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </FieldWithHelp>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldWithHelp label="Review Text" required help="This powers theme extraction and sentiment classification.">
            <textarea className="w-full min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.reviewText} onChange={(e) => setForm((p) => ({ ...p, reviewText: e.target.value }))} placeholder="Paste review text" />
          </FieldWithHelp>
          <div className="space-y-3">
            <FieldWithHelp label="Response Owner" help="Who owns the reply or escalation: counselor, CRM ops, marketing, etc.">
              <Input value={form.responseOwner} onChange={(e) => setForm((p) => ({ ...p, responseOwner: e.target.value }))} placeholder="response owner" />
            </FieldWithHelp>
            <FieldWithHelp label="Response Text" help="Store actual or draft response so the team can reuse approved language.">
              <textarea className="w-full min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.responseText} onChange={(e) => setForm((p) => ({ ...p, responseText: e.target.value }))} placeholder="response text" />
            </FieldWithHelp>
            <FieldWithHelp label="Notes" help="Use for internal coaching, escalation, or content reuse notes.">
              <textarea className="w-full min-h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="notes (optional)" />
            </FieldWithHelp>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} />
              Mark as featured-ready for website/ad use
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={saveReview} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {form.id ? "Update Review" : "Add Review"}
          </Button>
          <label className="inline-flex">
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) importCsv(file); e.currentTarget.value = ""; }} disabled={importing} />
            <Button type="button" variant="outline" disabled={importing || saving}>
              <Upload className="w-4 h-4 mr-2" /> {importing ? "Importing..." : "Import CSV"}
            </Button>
          </label>
          <Button type="button" variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" /> Download Template
          </Button>
          <Button type="button" variant="outline" onClick={downloadFeaturedExport}>
            <Download className="w-4 h-4 mr-2" /> Export Featured
          </Button>
          <Button type="button" variant="outline" onClick={runGoogleSync} disabled={syncingGoogle || saving || importing}>
            {syncingGoogle ? "Syncing..." : "Sync Google Reviews"}
          </Button>
          <Button type="button" variant="outline" onClick={runGoogleDebug} disabled={debuggingGoogle || syncingGoogle}>
            {debuggingGoogle ? "Checking..." : "Google Review Debug"}
          </Button>
          {form.id ? <Button type="button" variant="outline" onClick={resetForm}>Reset</Button> : null}
        </div>
        {notice ? <p className="text-sm text-emerald-700 mt-3">{notice}</p> : null}
        {error ? <p className="text-sm text-rose-700 mt-3">{error}</p> : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-56">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search review text, center, or owner..." />
          </div>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="all">All sources</option>
            {REVIEW_SOURCES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="all">All centers</option>
            {REVIEW_CENTERS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="all">All statuses</option>
            {REVIEW_RESPONSE_STATUS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Themes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">Loading reviews...</TableCell></TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No reviews logged yet.</TableCell></TableRow>
              ) : (
                filteredRows.map((row) => {
                  let themes: string[] = [];
                  try { themes = JSON.parse(String(row.themes || "[]")); } catch {}
                  return (
                    <TableRow key={row.id}>
                      <TableCell>{row.reviewDate}</TableCell>
                      <TableCell className="font-medium uppercase text-xs text-gray-600">{row.source}</TableCell>
                      <TableCell>{row.center}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 font-medium text-slate-900"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> {row.rating}</span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{row.reviewerName || row.headline || "Reviewer"}</div>
                        <div className="text-xs text-gray-600 line-clamp-2 max-w-xl">{row.reviewText}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs border ${row.responseStatus === 'responded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : row.responseStatus === 'escalated' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{row.responseStatus}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-56">
                          {themes.length ? themes.slice(0, 3).map((theme) => (
                            <span key={theme} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">{themeLabel(theme)}</span>
                          )) : <span className="text-xs text-gray-400">-</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => editRow(row)}>Edit</Button>
                          <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => deleteReview(row.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
