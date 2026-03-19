"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Download, MapPin, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FieldActivityRow {
  id: number;
  activityDate: string;
  center: "bhubaneswar" | "berhampur" | "bangalore";
  activityType: "doctor_visit" | "hoarding" | "camp" | "event";
  assetCode: string;
  location: string;
  ownerName: string;
  spend: number;
  estimatedReach: number;
  actualFootfall: number;
  leadsCollected: number;
  qualifiedLeads: number;
  registrations: number;
  utmCampaign: string;
  qrCodeId?: string | null;
  callNumber?: string | null;
  whatsappNumber?: string | null;
  proofUrl?: string | null;
  notes?: string | null;
}

interface FieldForm {
  activityDate: string;
  center: "bhubaneswar" | "berhampur" | "bangalore";
  activityType: "doctor_visit" | "hoarding" | "camp" | "event";
  assetCode: string;
  location: string;
  ownerName: string;
  spend: string;
  estimatedReach: string;
  actualFootfall: string;
  leadsCollected: string;
  qualifiedLeads: string;
  registrations: string;
  utmCampaign: string;
  qrCodeId: string;
  callNumber: string;
  whatsappNumber: string;
  proofUrl: string;
  notes: string;
}

const initialForm: FieldForm = {
  activityDate: new Date().toISOString().slice(0, 10),
  center: "bhubaneswar",
  activityType: "doctor_visit",
  assetCode: "",
  location: "",
  ownerName: "",
  spend: "0",
  estimatedReach: "0",
  actualFootfall: "0",
  leadsCollected: "0",
  qualifiedLeads: "0",
  registrations: "0",
  utmCampaign: "",
  qrCodeId: "",
  callNumber: "",
  whatsappNumber: "",
  proofUrl: "",
  notes: "",
};

function downloadFieldTemplate() {
  const template = [
    "activity_date,center,activity_type,asset_code,location,owner_name,spend,estimated_reach,actual_footfall,leads_collected,qualified_leads,registrations,utm_campaign,qr_code_id,call_number,whatsapp_number,proof_url,notes",
    "2026-02-22,bhubaneswar,doctor_visit,dr_bbsr_01,Saheed Nagar,field_exec_1,1500,80,20,7,3,1,fy26q1_bbsr_doctor_referral,qr_bbsr_dr_01,7008990586,9668904011,https://example.com/proof.jpg,doctor round completed",
    "2026-02-22,berhampur,hoarding,hoard_brp_12,Gosaninuagaon,field_exec_2,6200,15000,35,12,4,1,fy26q1_brp_hoarding_main,qr_brp_h_12,9692081966,9668904011,https://example.com/hoarding.jpg,near bus stand",
  ].join("\n");

  const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "santaan_field_activity_template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function FieldActivityManagement() {
  const [rows, setRows] = useState<FieldActivityRow[]>([]);
  const [form, setForm] = useState<FieldForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/field-activities");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to fetch field activity rows");
      setRows(payload.rows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch field activity rows");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  const totals = useMemo(() => {
    const leads = rows.reduce((sum, row) => sum + Number(row.leadsCollected || 0), 0);
    const qualified = rows.reduce((sum, row) => sum + Number(row.qualifiedLeads || 0), 0);
    const registrations = rows.reduce((sum, row) => sum + Number(row.registrations || 0), 0);
    return { leads, qualified, registrations };
  }, [rows]);

  async function saveRow() {
    if (!form.assetCode.trim() || !form.location.trim() || !form.ownerName.trim() || !form.utmCampaign.trim()) {
      setError("assetCode, location, ownerName, and utmCampaign are required.");
      return;
    }

    if (!form.qrCodeId.trim() && !form.callNumber.trim() && !form.whatsappNumber.trim()) {
      setError("At least one tracking handle is required: QR Code ID, Call Number, or WhatsApp Number.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/field-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityDate: form.activityDate,
          center: form.center,
          activityType: form.activityType,
          assetCode: form.assetCode,
          location: form.location,
          ownerName: form.ownerName,
          spend: Number(form.spend || 0),
          estimatedReach: Number(form.estimatedReach || 0),
          actualFootfall: Number(form.actualFootfall || 0),
          leadsCollected: Number(form.leadsCollected || 0),
          qualifiedLeads: Number(form.qualifiedLeads || 0),
          registrations: Number(form.registrations || 0),
          utmCampaign: form.utmCampaign,
          qrCodeId: form.qrCodeId || null,
          callNumber: form.callNumber || null,
          whatsappNumber: form.whatsappNumber || null,
          proofUrl: form.proofUrl || null,
          notes: form.notes || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to save field activity row");

      setNotice("Field activity row added.");
      setForm({
        ...initialForm,
        activityDate: form.activityDate,
        center: form.center,
        activityType: form.activityType,
        ownerName: form.ownerName,
      });
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save field activity row");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id: number) {
    if (!confirm("Delete this field activity row?")) return;
    try {
      const response = await fetch(`/api/admin/field-activities?id=${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to delete row");
      setNotice("Field activity row deleted.");
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete row");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-santaan-teal" />
          Field Activity Input
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Mandatory same-day logging for doctor visits, hoardings, camps, and field events.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input type="date" value={form.activityDate} onChange={(e) => setForm((p) => ({ ...p, activityDate: e.target.value }))} />
          <select
            value={form.center}
            onChange={(e) => setForm((p) => ({ ...p, center: e.target.value as FieldForm["center"] }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="bhubaneswar">bhubaneswar</option>
            <option value="berhampur">berhampur</option>
            <option value="bangalore">bangalore</option>
          </select>
          <select
            value={form.activityType}
            onChange={(e) => setForm((p) => ({ ...p, activityType: e.target.value as FieldForm["activityType"] }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="doctor_visit">doctor_visit</option>
            <option value="hoarding">hoarding</option>
            <option value="camp">camp</option>
            <option value="event">event</option>
          </select>
          <Input placeholder="asset_code" value={form.assetCode} onChange={(e) => setForm((p) => ({ ...p, assetCode: e.target.value }))} />
          <Input placeholder="location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
          <Input placeholder="owner_name" value={form.ownerName} onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))} />
          <Input placeholder="utm_campaign" value={form.utmCampaign} onChange={(e) => setForm((p) => ({ ...p, utmCampaign: e.target.value }))} />
          <Input type="number" min="0" placeholder="spend" value={form.spend} onChange={(e) => setForm((p) => ({ ...p, spend: e.target.value }))} />
          <Input
            type="number"
            min="0"
            placeholder="estimated_reach"
            value={form.estimatedReach}
            onChange={(e) => setForm((p) => ({ ...p, estimatedReach: e.target.value }))}
          />
          <Input
            type="number"
            min="0"
            placeholder="actual_footfall"
            value={form.actualFootfall}
            onChange={(e) => setForm((p) => ({ ...p, actualFootfall: e.target.value }))}
          />
          <Input
            type="number"
            min="0"
            placeholder="leads_collected"
            value={form.leadsCollected}
            onChange={(e) => setForm((p) => ({ ...p, leadsCollected: e.target.value }))}
          />
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
          <Input placeholder="qr_code_id (recommended)" value={form.qrCodeId} onChange={(e) => setForm((p) => ({ ...p, qrCodeId: e.target.value }))} />
          <Input placeholder="call_number" value={form.callNumber} onChange={(e) => setForm((p) => ({ ...p, callNumber: e.target.value }))} />
          <Input
            placeholder="whatsapp_number"
            value={form.whatsappNumber}
            onChange={(e) => setForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
          />
          <Input placeholder="proof_url (optional)" value={form.proofUrl} onChange={(e) => setForm((p) => ({ ...p, proofUrl: e.target.value }))} />
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
            <Plus className="w-4 h-4 mr-2" /> Add Field Row
          </Button>
          <Button type="button" variant="outline" onClick={downloadFieldTemplate}>
            <Download className="w-4 h-4 mr-2" /> CSV Template
          </Button>
          <div className="ml-auto text-sm text-gray-700 flex items-center gap-5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> Leads: <strong>{totals.leads}</strong>
            </span>
            <span>Qualified: <strong>{totals.qualified}</strong></span>
            <span>Regs: <strong>{totals.registrations}</strong></span>
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
              <TableHead>Type</TableHead>
              <TableHead>Asset/Location</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Regs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Loading field activity rows...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No field activity rows logged yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.activityDate}</TableCell>
                  <TableCell>{row.center}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-gray-500" />
                      {row.activityType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.assetCode}</div>
                    <div className="text-xs text-gray-500">{row.location}</div>
                  </TableCell>
                  <TableCell className="text-right">{row.leadsCollected}</TableCell>
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
