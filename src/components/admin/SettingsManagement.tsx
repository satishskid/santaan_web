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

type HealthState = "idle" | "checking" | "ok" | "error";

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchConsoleHealth, setSearchConsoleHealth] = useState<{
    state: HealthState;
    message?: string;
    siteUrl?: string;
    generatedAt?: string;
  }>({ state: "idle" });
  const [integrationHealth, setIntegrationHealth] = useState<{
    state: HealthState;
    services?: Record<string, any>;
    generatedAt?: string;
    message?: string;
  }>({ state: "idle" });

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

  function upsertSetting(key: string, value: string) {
    setSettings((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (!existing) {
        return [...prev, { key, value, dirty: true }].sort((a, b) => a.key.localeCompare(b.key));
      }
      return prev.map((item) => (item.key === key ? { ...item, value, dirty: true } : item));
    });
  }

  const searchConsoleUrl =
    settings.find((item) => item.key === "SEARCH_CONSOLE_SITE_URL")?.value ||
    settings.find((item) => item.key === "GOOGLE_SEARCH_CONSOLE_SITE_URL")?.value ||
    "";

  async function checkSearchConsoleHealth() {
    setSearchConsoleHealth({ state: "checking" });
    try {
      const response = await fetch("/api/admin/analytics/search-console?days=7", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || payload?.error) {
        setSearchConsoleHealth({
          state: "error",
          message: payload?.message || payload?.error || "Search Console health check failed.",
        });
        return;
      }
      if (!payload?.configured) {
        setSearchConsoleHealth({
          state: "error",
          message: payload?.message || "Search Console credentials are missing.",
        });
        return;
      }
      setSearchConsoleHealth({
        state: "ok",
        message: "Search Console is connected and returning data.",
        siteUrl: payload?.siteUrl,
        generatedAt: payload?.generatedAt,
      });
    } catch (err) {
      setSearchConsoleHealth({
        state: "error",
        message: err instanceof Error ? err.message : "Search Console health check failed.",
      });
    }
  }

  async function checkIntegrationHealth() {
    setIntegrationHealth({ state: "checking" });
    try {
      const response = await fetch("/api/admin/analytics/integrations", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || payload?.error) {
        setIntegrationHealth({
          state: "error",
          message: payload?.error || "Integration health check failed.",
        });
        return;
      }
      setIntegrationHealth({
        state: "ok",
        services: payload?.services || {},
        generatedAt: payload?.generatedAt,
      });
    } catch (err) {
      setIntegrationHealth({
        state: "error",
        message: err instanceof Error ? err.message : "Integration health check failed.",
      });
    }
  }

  useEffect(() => {
    if (settings.length > 0) {
      checkSearchConsoleHealth();
      checkIntegrationHealth();
    }
  }, [settings.length]);

  const integrationSummary = useMemo(() => {
    const services = integrationHealth.services || {};
    const entries = Object.values(services);
    if (integrationHealth.state !== "ok" || entries.length === 0) {
      return { label: "Not Checked", tone: "neutral" };
    }
    const hasMissing = entries.some((item: any) => !item?.configured || item?.status === "missing");
    const hasWarning = entries.some((item: any) => item?.status === "warning");
    if (hasMissing) return { label: "Needs Attention", tone: "error" };
    if (hasWarning) return { label: "Attention", tone: "warning" };
    return { label: "All Green", tone: "ok" };
  }, [integrationHealth]);

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
      await fetchSettings();
      setNotice(`Saved ${dirtySettings.length} setting(s).`);
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
      await fetchSettings();
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

        <div className="mt-4 rounded-lg border border-santaan-teal/20 bg-santaan-teal/5 p-4">
          <p className="text-sm font-semibold text-gray-900">Search Console setup</p>
          <p className="text-xs text-gray-600 mt-1">
            Paste the verified property URL here so data flows into the CRM. Use the exact property you verified.
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
            <Input
              value={searchConsoleUrl}
              onChange={(event) => upsertSetting("SEARCH_CONSOLE_SITE_URL", event.target.value)}
              placeholder="https://www.santaan.in/"
            />
            <Button
              variant="outline"
              onClick={() => upsertSetting("SEARCH_CONSOLE_SITE_URL", "https://www.santaan.in/")}
            >
              Use www
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => upsertSetting("SEARCH_CONSOLE_SITE_URL", "https://santaan.in/")}
            >
              Use non-www
            </Button>
            <Button
              variant="ghost"
              onClick={() => upsertSetting("SEARCH_CONSOLE_SITE_URL", "sc-domain:santaan.in")}
            >
              Use sc-domain
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Verification file already present: `googledb99843631bff895.html` at `/googledb99843631bff895.html`.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            After adding this setting, click “Save Changes” below.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                searchConsoleHealth.state === "ok"
                  ? "bg-emerald-100 text-emerald-700"
                  : searchConsoleHealth.state === "checking"
                  ? "bg-amber-100 text-amber-700"
                  : searchConsoleHealth.state === "error"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {searchConsoleHealth.state === "ok"
                ? "Verified"
                : searchConsoleHealth.state === "checking"
                ? "Checking"
                : searchConsoleHealth.state === "error"
                ? "Needs Attention"
                : "Not Checked"}
            </span>
            <Button variant="outline" onClick={checkSearchConsoleHealth}>
              Test Now
            </Button>
          </div>
          {searchConsoleHealth.message ? (
            <p className="text-xs text-gray-600 mt-2">{searchConsoleHealth.message}</p>
          ) : null}
          {searchConsoleHealth.siteUrl ? (
            <p className="text-xs text-gray-600 mt-1">Property: {searchConsoleHealth.siteUrl}</p>
          ) : null}
          {searchConsoleHealth.generatedAt ? (
            <p className="text-xs text-gray-500 mt-1">
              Last check: {new Date(searchConsoleHealth.generatedAt).toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">Integration health</p>
              <p className="text-xs text-gray-600 mt-1">
                Quick check that all keys, tokens, and webhooks are responding.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  integrationSummary.tone === "ok"
                    ? "bg-emerald-100 text-emerald-700"
                    : integrationSummary.tone === "warning"
                    ? "bg-amber-100 text-amber-700"
                    : integrationSummary.tone === "error"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {integrationHealth.state === "checking" ? "Checking" : integrationSummary.label}
              </span>
              <Button variant="outline" onClick={checkIntegrationHealth}>
                Test Now
              </Button>
            </div>
          </div>

          {integrationHealth.message ? (
            <p className="text-xs text-gray-600 mt-2">{integrationHealth.message}</p>
          ) : null}

          {integrationHealth.services ? (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(integrationHealth.services).map(([key, service]: [string, any]) => {
                const status = service?.status || (service?.configured ? "ready" : "missing");
                const tone =
                  status === "ready" ? "emerald" : status === "warning" ? "amber" : "rose";
                const toneClasses =
                  tone === "emerald"
                    ? "bg-emerald-100 text-emerald-700"
                    : tone === "amber"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700";
                return (
                  <div key={key} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-900">{key}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${toneClasses}`}>
                        {status === "ready" ? "OK" : status === "warning" ? "Check" : "Missing"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{service?.message || "Status updated."}</p>
                    {service?.lastSpendAt ? (
                      <p className="text-[11px] text-gray-500 mt-1">Last spend: {service.lastSpendAt}</p>
                    ) : null}
                    {service?.lastConversionAt ? (
                      <p className="text-[11px] text-gray-500 mt-1">Last conversion: {service.lastConversionAt}</p>
                    ) : null}
                    {service?.lastEventAt ? (
                      <p className="text-[11px] text-gray-500 mt-1">Last event: {service.lastEventAt}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

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
