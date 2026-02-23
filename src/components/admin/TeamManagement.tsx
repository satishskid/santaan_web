"use client";

import { useEffect, useState } from "react";
import { Mail, Shield, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminUser {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

function prettyDate(value?: string) {
  if (!value) return "-";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString("en-IN");
}

export default function TeamManagement() {
  const [team, setTeam] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
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
      setTeam(payload.admins || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeam();
  }, []);

  async function handleAddAdmin() {
    if (!newAdminEmail.trim()) {
      setError("Please enter an admin email.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail.trim().toLowerCase() }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to add admin");
      }
      setNotice("Admin added successfully.");
      setNewAdminEmail("");
      await fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveAdmin(email: string) {
    if (!confirm(`Remove admin access for ${email}?`)) return;

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/team?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to remove admin");
      }
      setNotice("Admin removed successfully.");
      await fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove admin");
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
          Add or remove admins who can manage CRM, content modules, and growth operations.
        </p>

        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="email"
              value={newAdminEmail}
              onChange={(event) => setNewAdminEmail(event.target.value)}
              placeholder="admin@example.com"
              className="pl-10"
            />
          </div>
          <Button onClick={handleAddAdmin} disabled={submitting}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {notice ? <p className="text-sm text-emerald-700 mt-3">{notice}</p> : null}
        {error ? <p className="text-sm text-rose-700 mt-3">{error}</p> : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Loading team...
                </TableCell>
              </TableRow>
            ) : team.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No admins found.
                </TableCell>
              </TableRow>
            ) : (
              team.map((member) => (
                <TableRow key={`${member.email}-${member.id}`}>
                  <TableCell className="font-medium text-gray-900">{member.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                      {member.role || "admin"}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{prettyDate(member.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => handleRemoveAdmin(member.email)}
                      disabled={submitting}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
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
