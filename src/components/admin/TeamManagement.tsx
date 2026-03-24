"use client";

import { useEffect, useState } from "react";
import { Ban, KeyRound, Mail, Save, Shield, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminUser {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

interface AccessUser {
  id: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "content_manager",
  "field_exec",
  "ivr_manager",
  "telecaller_manager",
  "telecaller",
  "counselor",
  "user",
  "disabled",
] as const;

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

  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSaving, setUsersSaving] = useState(false);
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [userNotice, setUserNotice] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [showDisabled, setShowDisabled] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkPin, setBulkPinValue] = useState("");
  const [bulkDefaultRole, setBulkDefaultRole] = useState("telecaller");

  const [userForm, setUserForm] = useState<{
    id?: string;
    username: string;
    name: string;
    role: string;
    pin: string;
  }>({
    username: "",
    name: "",
    role: "telecaller",
    pin: "",
  });

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

  async function fetchUsers() {
    setUsersLoading(true);
    setUserError(null);
    try {
      const response = await fetch("/api/admin/users");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch users");
      }
      setUsers(payload.users || []);
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  }

  useEffect(() => {
    fetchTeam();
    fetchUsers();
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

  function resetUserForm() {
    setUserForm({
      username: "",
      name: "",
      role: "telecaller",
      pin: "",
    });
  }

  const isEditingUser = Boolean(userForm.id);

  function fillUatTemplate() {
    const lines = [
      "telecaller1.bbsr,telecaller",
      "telecaller2.bbsr,telecaller",
      "telecaller3.bbsr,telecaller",
      "telecaller4.bbsr,telecaller",
      "telecaller5.bbsr,telecaller",
      "telecaller6.bbsr,telecaller",
      "telecaller1.bam,telecaller",
      "telecaller2.bam,telecaller",
      "telecaller1.blr,telecaller",
      "telecaller_mgr.hq,telecaller_manager",
      "content1.hq,content_manager",
      "agency1.hq,agency_ops",
      "agency2.hq,agency_ops",
      "ceo1.hq,ceo",
    ];
    setBulkText(lines.join("\n"));
    setUserError(null);
    setUserNotice("UAT template filled. Set a staff PIN and click Bulk Create Users.");
  }

  async function bulkCreateUsers() {
    const pin = bulkPin.trim();
    if (!/^\d{6}$/.test(pin)) {
      setUserError("Bulk PIN must be exactly 6 digits.");
      return;
    }

    const rows = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (rows.length === 0) {
      setUserError("Paste at least one username (one per line).");
      return;
    }

    const usersToCreate = rows.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const username = parts[0] || "";
      const role = parts[1] || bulkDefaultRole;
      const name = parts[2] || "";
      return { username, role, name };
    });

    setUsersSaving(true);
    setUserError(null);
    setUserNotice(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: usersToCreate, defaultRole: bulkDefaultRole, pin }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to bulk create users");
      }
      const createdCount = typeof payload?.createdCount === "number" ? payload.createdCount : 0;
      const skippedCount = typeof payload?.skippedCount === "number" ? payload.skippedCount : 0;
      const errorCount = typeof payload?.errorCount === "number" ? payload.errorCount : 0;
      setUserNotice(`Bulk create done. Created=${createdCount}, Skipped=${skippedCount}, Errors=${errorCount}.`);
      setBulkPinValue("");
      await fetchUsers();
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to bulk create users");
    } finally {
      setUsersSaving(false);
    }
  }

  async function deleteUser(user: AccessUser) {
    if (!confirm(`Delete ${user.username}? This cannot be undone.`)) return;
    setUsersSaving(true);
    setUserError(null);
    setUserNotice(null);
    try {
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete user");
      }
      setUserNotice("User deleted.");
      await fetchUsers();
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setUsersSaving(false);
    }
  }

  async function saveUser() {
    const username = userForm.username.trim().toLowerCase();
    const name = userForm.name.trim();
    const role = userForm.role.trim().toLowerCase();
    const pin = userForm.pin.trim();

    if (!username) {
      setUserError("Username is required.");
      return;
    }
    if (!role) {
      setUserError("Role is required.");
      return;
    }

    if (!isEditingUser && !/^\d{6}$/.test(pin)) {
      setUserError("PIN must be exactly 6 digits.");
      return;
    }

    if (isEditingUser && pin && !/^\d{6}$/.test(pin)) {
      setUserError("PIN must be exactly 6 digits.");
      return;
    }

    setUsersSaving(true);
    setUserError(null);
    setUserNotice(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: isEditingUser ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditingUser
            ? {
                id: userForm.id,
                username,
                name,
                role,
                ...(pin ? { pin } : {}),
              }
            : {
                username,
                name,
                role,
                pin,
              }
        ),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save user");
      }
      setUserNotice(isEditingUser ? "User updated." : "User created.");
      resetUserForm();
      await fetchUsers();
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setUsersSaving(false);
    }
  }

  async function disableUser(user: AccessUser) {
    if (!confirm(`Disable ${user.username}?`)) return;
    setUsersSaving(true);
    setUserError(null);
    setUserNotice(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: "disabled" }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to disable user");
      }
      setUserNotice("User disabled.");
      await fetchUsers();
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to disable user");
    } finally {
      setUsersSaving(false);
    }
  }

  async function resetPin(user: AccessUser) {
    const newPin = prompt(`Set new 6-digit PIN for ${user.username}:`);
    if (!newPin) return;
    const trimmed = newPin.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setUserError("PIN must be exactly 6 digits.");
      return;
    }
    setUsersSaving(true);
    setUserError(null);
    setUserNotice(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, pin: trimmed }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to reset PIN");
      }
      setUserNotice("PIN updated.");
      await fetchUsers();
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to reset PIN");
    } finally {
      setUsersSaving(false);
    }
  }

  async function setBulkPin(scope: "admins" | "staff") {
    const label = scope === "admins" ? "ADMINs" : "STAFF users";
    const newPin = prompt(`Set a 6-digit UAT PIN for ${label} (this will reset PINs for the whole group):`);
    if (!newPin) return;
    const trimmed = newPin.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setUserError("PIN must be exactly 6 digits.");
      return;
    }
    if (!confirm(`Confirm: reset PIN for ${label}?`)) return;

    setUsersSaving(true);
    setUserError(null);
    setUserNotice(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, pin: trimmed }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to set UAT PIN");
      }
      const updatedCount = typeof payload?.updatedCount === "number" ? payload.updatedCount : 0;
      setUserNotice(`UAT PIN updated for ${updatedCount} users.`);
      await fetchUsers();
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to set UAT PIN");
    } finally {
      setUsersSaving(false);
    }
  }

  function startEditUser(user: AccessUser) {
    setUserError(null);
    setUserNotice(null);
    setUserForm({
      id: user.id,
      username: user.username,
      name: user.name || "",
      role: user.role || "user",
      pin: "",
    });
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

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-santaan-teal" />
          User Access (Username + PIN)
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Create and manage role-based usernames like telecaller1.bbsr with 6-digit PINs.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Magic link access uses the same list: enter an email address here to whitelist that staff member for backup login.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Username (e.g., telecaller1.bbsr)"
            value={userForm.username}
            onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))}
          />
          <Input
            placeholder="Name (optional)"
            value={userForm.name}
            onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <select
            value={userForm.role}
            onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {ROLE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Input
            placeholder={isEditingUser ? "New PIN (optional, 6 digits)" : "PIN (6 digits)"}
            value={userForm.pin}
            onChange={(event) => setUserForm((prev) => ({ ...prev, pin: event.target.value }))}
            inputMode="numeric"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={saveUser} disabled={usersSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isEditingUser ? "Update User" : "Create User"}
          </Button>
          <Button variant="outline" onClick={() => setBulkPin("admins")} disabled={usersSaving}>
            Set UAT PIN (Admins)
          </Button>
          <Button variant="outline" onClick={() => setBulkPin("staff")} disabled={usersSaving}>
            Set UAT PIN (Staff)
          </Button>
          {isEditingUser ? (
            <Button variant="outline" onClick={resetUserForm} disabled={usersSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancel Edit
            </Button>
          ) : null}
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 ml-auto">
            <input
              type="checkbox"
              checked={showDisabled}
              onChange={(event) => setShowDisabled(event.target.checked)}
            />
            Show disabled users
          </label>
        </div>

        {userNotice ? <p className="text-sm text-emerald-700 mt-3">{userNotice}</p> : null}
        {userError ? <p className="text-sm text-rose-700 mt-3">{userError}</p> : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Bulk Create Users (UAT)</h3>
        <p className="text-sm text-gray-600 mt-1">
          Paste one per line: <span className="font-mono">username</span> or <span className="font-mono">username,role</span> or <span className="font-mono">username,role,name</span>.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={bulkDefaultRole}
            onChange={(event) => setBulkDefaultRole(event.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {ROLE_OPTIONS.filter((value) => value !== "disabled").map((value) => (
              <option key={value} value={value}>
                Default role: {value}
              </option>
            ))}
          </select>
          <Input
            placeholder="Bulk PIN (6 digits)"
            value={bulkPin}
            onChange={(event) => setBulkPinValue(event.target.value)}
            inputMode="numeric"
          />
        </div>

        <div className="mt-3">
          <textarea
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            placeholder="telecaller1.bbsr,telecaller\ntelecaller2.bbsr,telecaller\ncounselor1.bam,counselor"
            className="w-full min-h-40 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={fillUatTemplate} disabled={usersSaving}>
            Fill UAT Template
          </Button>
          <Button onClick={bulkCreateUsers} disabled={usersSaving}>
            Bulk Create Users
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.filter((user) => showDisabled || user.role !== "disabled").length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users
                .filter((user) => showDisabled || user.role !== "disabled")
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">{user.username}</TableCell>
                    <TableCell className="text-gray-700">{user.name || "-"}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                        {user.role || "user"}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{prettyDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditUser(user)}
                        disabled={usersSaving}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetPin(user)}
                        disabled={usersSaving}
                      >
                        <KeyRound className="w-4 h-4 mr-1" />
                        Reset PIN
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => disableUser(user)}
                        disabled={usersSaving || user.role === "disabled"}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Disable
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => deleteUser(user)}
                        disabled={usersSaving}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
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
