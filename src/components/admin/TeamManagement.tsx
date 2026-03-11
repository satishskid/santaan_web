"use client";

import { useEffect, useState } from "react";
import { KeyRound, Mail, Shield, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FieldWithHelp from "@/components/admin/FieldWithHelp";

interface TeamMember {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  createdAt: string;
  isAdminRegistry?: boolean;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "CEO / CRM Admin" },
  { value: "ceo", label: "CEO" },
  { value: "crm_ops_admin", label: "CRM Ops Admin" },
  { value: "agency_ops", label: "Agency Ops" },
  { value: "marketing_manager", label: "Marketing Manager" },
  { value: "performance_marketer", label: "Performance Marketer" },
  { value: "content_writer", label: "Content Writer" },
  { value: "social_media_exec", label: "Social Media Executive" },
  { value: "field_exec", label: "Field Executive" },
  { value: "ivr_manager", label: "IVR Manager" },
  { value: "telecaller_manager", label: "Telecalling Lead" },
  { value: "telecaller", label: "Telecaller" },
  { value: "counselor", label: "Counselor" },
];

function prettyDate(value?: string) {
  if (!value) return "-";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString("en-IN");
}

function prettyRole(role: string) {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label || role;
}

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftRole, setDraftRole] = useState("content_writer");
  const [draftPassword, setDraftPassword] = useState("");
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchTeam() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/team");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch team");
      }
      setTeam(payload.members || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeam();
  }, []);

  function resetForm() {
    setDraftName("");
    setDraftEmail("");
    setDraftRole("content_writer");
    setDraftPassword("");
    setEditingEmail(null);
  }

  function startEdit(member: TeamMember) {
    setDraftName(member.name || "");
    setDraftEmail(member.email);
    setDraftRole(member.role);
    setDraftPassword("");
    setEditingEmail(member.email);
    setNotice(`Editing ${member.email}. Leave password blank to keep the current password.`);
    setError(null);
  }

  async function handleSaveMember() {
    if (!draftEmail.trim()) {
      setError("Please enter a team email.");
      return;
    }
    if (!draftRole.trim()) {
      setError("Please select a role.");
      return;
    }
    if (!editingEmail && !draftPassword.trim()) {
      setError("Please set an initial password for the new login.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draftName.trim(),
          email: draftEmail.trim().toLowerCase(),
          role: draftRole,
          password: draftPassword.trim() || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save team member");
      }
      setNotice(editingEmail ? "Team member updated successfully." : "Team member created successfully.");
      resetForm();
      await fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save team member");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveMember(email: string) {
    if (!confirm(`Remove operational access for ${email}?`)) return;

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/team?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to remove team member");
      }
      setNotice("Access removed successfully.");
      if (editingEmail === email) {
        resetForm();
      }
      await fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove team member");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-santaan-teal" />
          Team Access Management
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Create, update, or revoke role-based logins for CRM operations, content, telecalling, and leadership.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FieldWithHelp
            label="Team Member Name"
            help="Optional display name shown in the team table and audit trails."
          >
            <Input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Santaan Digital Ops"
            />
          </FieldWithHelp>

          <FieldWithHelp
            label="Team Email"
            required
            help="Use official role emails only. Access is controlled by the selected role."
          >
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={draftEmail}
                onChange={(event) => setDraftEmail(event.target.value)}
                placeholder="content.ops@santaan.in"
                className="pl-10"
              />
            </div>
          </FieldWithHelp>

          <FieldWithHelp
            label="Role"
            required
            help="This determines what modules the user can access in the CRM."
          >
            <select
              value={draftRole}
              onChange={(event) => setDraftRole(event.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldWithHelp>

          <FieldWithHelp
            label={editingEmail ? "Reset Password" : "Initial Password"}
            required={!editingEmail}
            help={editingEmail ? "Leave blank to keep the current password. Enter a new value to reset access." : "Set the starting password for this login."}
          >
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={draftPassword}
                onChange={(event) => setDraftPassword(event.target.value)}
                placeholder={editingEmail ? "Leave blank to keep unchanged" : "Set password"}
                className="pl-10"
              />
            </div>
          </FieldWithHelp>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleSaveMember} disabled={submitting}>
            <UserCog className="w-4 h-4 mr-2" />
            {editingEmail ? "Update User" : "Create User"}
          </Button>
          {editingEmail ? (
            <Button variant="secondary" onClick={resetForm} disabled={submitting}>
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
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Access Type</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading team...
                </TableCell>
              </TableRow>
            ) : team.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No operational users found.
                </TableCell>
              </TableRow>
            ) : (
              team.map((member) => (
                <TableRow key={`${member.email}-${member.id}`}>
                  <TableCell className="font-medium text-gray-900">{member.email}</TableCell>
                  <TableCell className="text-gray-700">{member.name || "-"}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                      {prettyRole(member.role || "admin")}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {member.isAdminRegistry ? "Full Admin" : "Operational User"}
                  </TableCell>
                  <TableCell className="text-gray-600">{prettyDate(member.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-santaan-teal hover:text-santaan-deepTeal"
                      onClick={() => startEdit(member)}
                      disabled={submitting}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => handleRemoveMember(member.email)}
                      disabled={submitting}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Revoke
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
