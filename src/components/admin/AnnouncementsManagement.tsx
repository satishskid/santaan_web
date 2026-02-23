"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AnnouncementType = "news" | "award" | "campaign" | "event";

interface AnnouncementRecord {
  id: number;
  title: string;
  content: string | null;
  type: AnnouncementType;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  isActive: boolean;
  isPinned: boolean;
  publishDate: string;
  expiryDate: string | null;
}

interface AnnouncementFormState {
  id?: number;
  title: string;
  content: string;
  type: AnnouncementType;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  isActive: boolean;
  isPinned: boolean;
  publishDate: string;
  expiryDate: string;
}

const initialForm: AnnouncementFormState = {
  title: "",
  content: "",
  type: "news",
  imageUrl: "",
  linkUrl: "",
  linkText: "",
  isActive: true,
  isPinned: false,
  publishDate: "",
  expiryDate: "",
};

function isoToInputDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 16);
}

function inputDateToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function prettyDate(value?: string | null) {
  if (!value) return "-";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString("en-IN");
}

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AnnouncementFormState>(initialForm);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  async function fetchAnnouncements() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/announcements?all=true");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch announcements");
      }
      setAnnouncements((payload.announcements || []) as AnnouncementRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  function resetForm() {
    setForm(initialForm);
  }

  function editAnnouncement(item: AnnouncementRecord) {
    setForm({
      id: item.id,
      title: item.title || "",
      content: item.content || "",
      type: item.type || "news",
      imageUrl: item.imageUrl || "",
      linkUrl: item.linkUrl || "",
      linkText: item.linkText || "",
      isActive: Boolean(item.isActive),
      isPinned: Boolean(item.isPinned),
      publishDate: isoToInputDate(item.publishDate),
      expiryDate: isoToInputDate(item.expiryDate),
    });
    setNotice(null);
    setError(null);
  }

  async function submitForm() {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setNotice(null);
    setError(null);

    try {
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch("/api/admin/announcements", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          title: form.title.trim(),
          content: form.content.trim() || null,
          type: form.type,
          imageUrl: form.imageUrl.trim() || null,
          linkUrl: form.linkUrl.trim() || null,
          linkText: form.linkText.trim() || null,
          isPinned: form.isPinned,
          isActive: form.isActive,
          publishDate: inputDateToIso(form.publishDate) || new Date().toISOString(),
          expiryDate: inputDateToIso(form.expiryDate),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save announcement");
      }

      setNotice(isEditing ? "Announcement updated." : "Announcement created.");
      resetForm();
      await fetchAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAnnouncement(id: number) {
    if (!confirm("Delete this announcement?")) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete announcement");
      }
      setNotice("Announcement deleted.");
      await fetchAnnouncements();
      if (form.id === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete announcement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-santaan-teal" />
          Announcements Management
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage awards, campaigns, events, and key updates shown across Santaan digital assets.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          <select
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as AnnouncementType }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="news">News</option>
            <option value="award">Award</option>
            <option value="campaign">Campaign</option>
            <option value="event">Event</option>
          </select>
          <Input
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
          />
          <Input
            placeholder="Link URL (optional)"
            value={form.linkUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, linkUrl: event.target.value }))}
          />
          <Input
            placeholder="Link text (optional)"
            value={form.linkText}
            onChange={(event) => setForm((prev) => ({ ...prev, linkText: event.target.value }))}
          />
          <Input
            type="datetime-local"
            value={form.publishDate}
            onChange={(event) => setForm((prev) => ({ ...prev, publishDate: event.target.value }))}
          />
          <Input
            type="datetime-local"
            value={form.expiryDate}
            onChange={(event) => setForm((prev) => ({ ...prev, expiryDate: event.target.value }))}
          />
        </div>

        <div className="mt-3">
          <textarea
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            placeholder="Announcement content"
            className="w-full min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(event) => setForm((prev) => ({ ...prev, isPinned: event.target.checked }))}
            />
            Pin announcement
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            Active
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={submitForm} disabled={saving}>
            {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isEditing ? "Update Announcement" : "Create Announcement"}
          </Button>
          {isEditing ? (
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Cancel Edit
            </Button>
          ) : null}
        </div>

        {notice ? <p className="text-sm text-emerald-700 mt-3">{notice}</p> : null}
        {error ? <p className="text-sm text-rose-700 mt-3">{error}</p> : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Publish</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Loading announcements...
                </TableCell>
              </TableRow>
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No announcements found.
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-900">
                    <div className="font-medium">{item.title}</div>
                    {item.content ? <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content}</div> : null}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700 capitalize">
                      {item.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700">{prettyDate(item.publishDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs w-fit ${
                          item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                      {item.isPinned ? (
                        <span className="px-2 py-1 rounded-full text-xs w-fit bg-amber-100 text-amber-700">
                          Pinned
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => editAnnouncement(item)} disabled={saving}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => deleteAnnouncement(item.id)}
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
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
