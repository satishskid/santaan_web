"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SettingEntry {
  key: string;
  value: string;
  dirty?: boolean;
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchSettings() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch settings");
      }

      const entries = Object.entries(payload as Record<string, string>)
        .map(([key, value]) => ({ key, value: String(value ?? ""), dirty: false }))
        .sort((a, b) => a.key.localeCompare(b.key));
      setSettings(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const dirtyCount = useMemo(() => settings.filter((item) => item.dirty).length, [settings]);

  function updateValue(key: string, value: string) {
    setSettings((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        return { ...item, value, dirty: true };
      })
    );
  }

  async function saveSetting(key: string, value: string) {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || `Failed to save setting: ${key}`);
    }
  }

  async function saveAllDirty() {
    const dirtySettings = settings.filter((item) => item.dirty);
    if (dirtySettings.length === 0) {
      setNotice("No pending setting changes.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      for (const setting of dirtySettings) {
        await saveSetting(setting.key, setting.value);
      }
      setNotice(`Saved ${dirtySettings.length} setting(s).`);
      setSettings((prev) => prev.map((item) => ({ ...item, dirty: false })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function addSetting() {
    const key = newKey.trim();
    if (!key) {
      setError("Setting key is required.");
      return;
    }
    if (settings.some((item) => item.key === key)) {
      setError("Setting key already exists.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await saveSetting(key, newValue);
      setSettings((prev) =>
        [...prev, { key, value: newValue, dirty: false }].sort((a, b) => a.key.localeCompare(b.key))
      );
      setNewKey("");
      setNewValue("");
      setNotice("Setting added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add setting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-santaan-teal" />
          Platform Settings
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure operational keys used by the admin platform and growth workflows.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input value={newKey} onChange={(event) => setNewKey(event.target.value)} placeholder="setting_key" />
          <Input value={newValue} onChange={(event) => setNewValue(event.target.value)} placeholder="Setting value" />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={addSetting} disabled={saving}>
            <Plus className="w-4 h-4 mr-2" />
            Add Setting
          </Button>
          <Button onClick={saveAllDirty} disabled={saving || dirtyCount === 0}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes ({dirtyCount})
          </Button>
        </div>

        {notice ? <p className="text-sm text-emerald-700 mt-3">{notice}</p> : null}
        {error ? <p className="text-sm text-rose-700 mt-3">{error}</p> : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  Loading settings...
                </TableCell>
              </TableRow>
            ) : settings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No settings found.
                </TableCell>
              </TableRow>
            ) : (
              settings.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="font-mono text-xs text-gray-800">{item.key}</TableCell>
                  <TableCell>
                    <Input value={item.value} onChange={(event) => updateValue(item.key, event.target.value)} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.dirty ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.dirty ? "Unsaved" : "Saved"}
                    </span>
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
