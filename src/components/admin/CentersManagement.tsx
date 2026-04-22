"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CenterRecord {
  id: number;
  city: string;
  title: string;
  address: string;
  description: string | null;
  email: string;
  phones: string[];
  mapUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface CenterFormState {
  id?: number;
  city: string;
  title: string;
  address: string;
  description: string;
  email: string;
  phonesInput: string;
  mapUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const initialForm: CenterFormState = {
  city: "",
  title: "",
  address: "",
  description: "",
  email: "",
  phonesInput: "",
  mapUrl: "",
  sortOrder: 0,
  isActive: true,
};

function parsePhones(phonesInput: string): string[] {
  return phonesInput
    .split(",")
    .map((phone) => phone.trim())
    .filter(Boolean);
}

export default function CentersManagement() {
  const [centers, setCenters] = useState<CenterRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CenterFormState>(initialForm);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  async function fetchCenters() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/centers?all=true");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch centers");
      }
      setCenters((payload.centers || []) as CenterRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch centers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCenters();
  }, []);

  function startEdit(center: CenterRecord) {
    setForm({
      id: center.id,
      city: center.city || "",
      title: center.title || "",
      address: center.address || "",
      description: center.description || "",
      email: center.email || "",
      phonesInput: (center.phones || []).join(", "),
      mapUrl: center.mapUrl || "",
      sortOrder: Number(center.sortOrder || 0),
      isActive: Boolean(center.isActive),
    });
    setNotice(null);
    setError(null);
  }

  function resetForm() {
    setForm(initialForm);
  }

  async function submitForm() {
    const phones = parsePhones(form.phonesInput);
    if (!form.city.trim() || !form.title.trim() || !form.address.trim() || !form.email.trim() || phones.length === 0) {
      setError("City, title, address, email, and at least one phone number are required.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const endpoint = "/api/admin/centers";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          city: form.city.trim(),
          title: form.title.trim(),
          address: form.address.trim(),
          description: form.description.trim() || null,
          email: form.email.trim().toLowerCase(),
          phones,
          mapUrl: form.mapUrl.trim() || null,
          sortOrder: Number(form.sortOrder || 0),
          isActive: form.isActive,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save center");
      }

      setNotice(isEditing ? "Center updated." : "Center created.");
      resetForm();
      await fetchCenters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save center");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCenter(id: number) {
    if (!confirm("Delete this center?")) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/centers?id=${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete center");
      }
      setNotice("Center deleted.");
      await fetchCenters();
      if (form.id === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete center");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-santaan-teal" />
          Center Management
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure branch information, contact details, sort order, and active status used on the website.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="City" value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
          <Input placeholder="Center title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          <Input placeholder="Center email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          <Input
            placeholder="Phones (comma separated)"
            value={form.phonesInput}
            onChange={(event) => setForm((prev) => ({ ...prev, phonesInput: event.target.value }))}
          />
          <Input
            placeholder="Sort order"
            type="number"
            value={form.sortOrder}
            onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value || 0) }))}
          />
          <Input
            placeholder="Google Maps URL (optional)"
            value={form.mapUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, mapUrl: event.target.value }))}
          />
        </div>

        <div className="mt-3">
          <Input placeholder="Address" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
        </div>
        <div className="mt-3">
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description (optional)"
            className="w-full min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
          />
          Active center
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={submitForm} disabled={saving}>
            {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isEditing ? "Update Center" : "Create Center"}
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
              <TableHead>City</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phones</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Loading centers...
                </TableCell>
              </TableRow>
            ) : centers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No centers configured.
                </TableCell>
              </TableRow>
            ) : (
              centers.map((center) => (
                <TableRow key={center.id}>
                  <TableCell className="font-medium text-gray-900">{center.city}</TableCell>
                  <TableCell className="text-gray-700">
                    <div className="font-medium">{center.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{center.email}</div>
                  </TableCell>
                  <TableCell className="text-gray-700 max-w-[280px]">
                    <div className="text-sm leading-relaxed">{center.address || "-"}</div>
                    {center.mapUrl ? (
                      <a
                        href={center.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-santaan-teal hover:underline mt-1 inline-block"
                      >
                        Open map
                      </a>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-gray-700">{(center.phones || []).join(", ") || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        center.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {center.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700">{center.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(center)} disabled={saving}>
                        <Building2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => deleteCenter(center.id)}
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
