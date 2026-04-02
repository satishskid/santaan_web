const NEO_DOVE_BASE_URL = "https://connect.neodove.com/integration/custom";

export interface NeoDoveUtm {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface NeoDoveLeadPayload {
  name: string;
  mobile: string;
  email: string;
  source?: string;
  campaign?: string;
  center?: string;
  status?: string;
  pipeline?: string;
  assignedTo?: string;
  landingPath?: string;
  notes?: string;
  tags?: string[];
  utm?: NeoDoveUtm;
  customFields?: Record<string, string | number | boolean | null | undefined>;
}

export interface NeoDovePushResult {
  enabled: boolean;
  ok: boolean;
  endpoint?: string;
  status?: number;
  skippedReason?: string;
}

export interface NeoDoveWebhookLead {
  event: string;
  leadId?: string;
  name?: string;
  mobile?: string;
  email?: string;
  campaignId?: string;
  campaign?: string;
  stageName?: string;
  statusCode?: string;
  status?: string;
  disposition?: string;
  disposeReason?: string;
  pipeline?: string;
  center?: string;
  assignedToId?: string;
  assignedTo?: string;
  callConnected?: boolean;
  callDurationSec?: number;
  followUpAt?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

const CLEAN_PHONE = /[^0-9]/g;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
  }
  return undefined;
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function readBoolean(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "y", "connected"].includes(normalized)) return true;
      if (["false", "0", "no", "n", "not_connected", "disconnected"].includes(normalized)) return false;
    }
  }
  return undefined;
}

function parseEmbeddedJson(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function collectNodes(value: unknown, nodes: Record<string, unknown>[]) {
  if (isRecord(value)) {
    nodes.push(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectNodes(entry, nodes));
    return;
  }

  const parsed = parseEmbeddedJson(value);
  if (parsed) collectNodes(parsed, nodes);
}

function candidateNodes(body: Record<string, unknown>) {
  const nodes: Record<string, unknown>[] = [];
  const nestedKeys = [
    "lead",
    "data",
    "payload",
    "body",
    "result",
    "response",
    "request",
    "contact",
    "contact_custom_properties",
    "custom_properties",
  ];

  collectNodes(body, nodes);
  for (const key of nestedKeys) {
    collectNodes(body[key], nodes);
  }

  return nodes.length ? nodes : [body];
}

function resolveNeoDoveEndpoint() {
  const explicitUrl = process.env.NEODOVE_CUSTOM_INTEGRATION_URL?.trim();
  if (explicitUrl) return explicitUrl;

  const integrationId = process.env.NEODOVE_INTEGRATION_ID?.trim();
  if (!integrationId) return null;

  return `${NEO_DOVE_BASE_URL}/${integrationId}/leads`;
}

export function normalizeIndianMobile(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(CLEAN_PHONE, "");
  if (!digits) return null;

  if (digits.length >= 12 && digits.startsWith("91")) {
    return digits.slice(-10);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return null;
}

export async function pushLeadToNeoDove(payload: NeoDoveLeadPayload): Promise<NeoDovePushResult> {
  const endpoint = resolveNeoDoveEndpoint();
  if (!endpoint) {
    return { enabled: false, ok: false, skippedReason: "missing_endpoint" };
  }

  const mobile = normalizeIndianMobile(payload.mobile);
  const email = payload.email?.trim().toLowerCase();
  const name = payload.name?.trim();

  if (!mobile || !email || !name) {
    return { enabled: true, ok: false, endpoint, skippedReason: "missing_required_fields" };
  }

  const requestBody: Record<string, unknown> = {
    name,
    mobile,
    email,
    source: payload.source || "santaan_web",
    campaign: payload.campaign || "DIRECT CALLS",
    center: payload.center || "Network",
    status: payload.status || "OPEN",
    pipeline: payload.pipeline || "Reminder",
    assigned_to: payload.assignedTo || "",
    landing_path: payload.landingPath || "/",
    notes: payload.notes || "",
    tags: (payload.tags || []).join(","),
    utm_source: payload.utm?.utm_source || "",
    utm_medium: payload.utm?.utm_medium || "",
    utm_campaign: payload.utm?.utm_campaign || "",
    utm_term: payload.utm?.utm_term || "",
    utm_content: payload.utm?.utm_content || "",
    integration_source: "santaan_growth_os",
    timestamp: new Date().toISOString(),
  };

  for (const [key, value] of Object.entries(payload.customFields || {})) {
    if (value === undefined || value === null) continue;
    requestBody[key] = typeof value === "string" ? value : String(value);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(8000),
    });

    return {
      enabled: true,
      ok: response.ok,
      endpoint,
      status: response.status,
      skippedReason: response.ok ? undefined : "provider_rejected",
    };
  } catch (error) {
    console.error("NeoDove push error:", error);
    return {
      enabled: true,
      ok: false,
      endpoint,
      skippedReason: "network_error",
    };
  }
}

export function parseNeoDoveWebhookLead(body: unknown): NeoDoveWebhookLead | null {
  if (!isRecord(body)) return null;

  const nodes = candidateNodes(body);
  const event =
    readString(body, ["event_name", "event", "trigger", "type", "action"]) ||
    nodes.map((node) => readString(node, ["event_name", "event", "trigger", "type", "action"])).find(Boolean) ||
    "lead_update";

  const name = nodes.map((node) => readString(node, ["name", "lead_name", "full_name", "customer_name"])).find(Boolean);
  const mobile = nodes
    .map((node) =>
      readString(node, [
        "mobile",
        "mobile_number",
        "mobile_no",
        "phone",
        "phone_number",
        "phoneNumber",
        "customer_mobile",
        "contact_number",
        "whatsapp_number",
        "whatsapp",
        "tel",
      ])
    )
    .map((value) => normalizeIndianMobile(value))
    .find((value): value is string => Boolean(value));
  const email = nodes
    .map((node) => readString(node, ["email", "lead_email", "customer_email", "mail", "email_id", "mail_id"]))
    .find((value): value is string => Boolean(value));

  if (!mobile && !email) return null;

  const leadId = nodes.map((node) => readString(node, ["lead_id", "leadId", "leadID", "id", "leadid"])).find(Boolean);
  const campaignId = nodes
    .map((node) => readString(node, ["campaign_id", "campaignid", "campaignId", "campaignID"]))
    .find(Boolean);
  const campaign = nodes
    .map((node) => readString(node, ["campaign", "campaign_name", "campaign_id", "campaignid"]))
    .find(Boolean);
  const stageName = nodes
    .map((node) => readString(node, ["lead_stage_name", "lead_status_name", "stage_name", "lead_stage", "status_name"]))
    .find(Boolean);
  const statusCode = nodes
    .map((node) => readString(node, ["lead_status", "status_code", "lead_state_code", "lead_status_code"]))
    .find(Boolean);
  const disposition = nodes
    .map((node) => readString(node, ["disposition", "dispose_status", "lead_disposition", "call_disposition"]))
    .find(Boolean);
  const disposeReason = nodes
    .map((node) => readString(node, ["dispose_reason", "dispose_remark", "lost_reason", "reason", "remarks", "comment"]))
    .find(Boolean);
  const leadStatus = nodes
    .map((node) => readString(node, ["status", "disposition", "stage", "lead_status", "lead_state", "lead_status_name"]))
    .find(Boolean);
  const status = stageName || leadStatus;
  const pipeline = nodes.map((node) => readString(node, ["pipeline", "pipeline_name", "pipeline_id"])).find(Boolean);
  const center = nodes.map((node) => readString(node, ["center", "center_name", "branch", "branch_name", "location", "clinic"])).find(Boolean);
  const assignedToId = nodes.map((node) => readString(node, ["assigned_to_id", "agent_id", "owner_id"])).find(Boolean);
  const assignedTo = nodes.map((node) => readString(node, ["assigned_to", "agent_name", "owner", "owner_name"])).find(Boolean);
  const callConnected = nodes.map((node) => readBoolean(node, ["call_connected", "connected"])).find((value) => value !== undefined);
  const callDurationSec = nodes
    .map((node) => readNumber(node, ["call_duration", "call_duration_sec", "duration", "talk_time", "call_time"]))
    .find((value) => value !== undefined);
  const followUpAt = nodes
    .map((node) =>
      readString(node, [
        "follow_up_date",
        "follow_up_time",
        "next_follow_up",
        "next_followup",
        "next_follow_up_date",
        "followup_date",
        "followup_at",
      ])
    )
    .find(Boolean);
  const createdAt = nodes
    .map((node) => readString(node, ["created_at", "lead_created_at", "creation_time", "lead_creation_date"]))
    .find(Boolean);
  const updatedAt = nodes.map((node) => readString(node, ["updated_at", "lead_updated_at", "time", "timestamp"])).find(Boolean);
  const notes = nodes
    .map((node) => readString(node, ["notes", "comment", "remarks", "lead_notes", "dispose_reason", "dispose_remark"]))
    .find(Boolean);

  return {
    event: event.toLowerCase(),
    leadId,
    name,
    mobile,
    email,
    campaignId,
    campaign,
    stageName,
    statusCode,
    status,
    disposition,
    disposeReason,
    pipeline,
    center,
    assignedToId,
    assignedTo,
    callConnected,
    callDurationSec,
    followUpAt,
    createdAt,
    updatedAt,
    notes,
  };
}

export function toNeoDoveCampaignTag(value?: string) {
  if (!value) return "neodove_campaign_unknown";
  return `neodove_campaign_${toSlug(value) || "unknown"}`;
}

export function mapNeoDoveStatus(value?: string) {
  const status = (value || "").trim().toLowerCase();
  if (!status) return "New";

  if (status.includes("dispose")) return "Lost";
  if (status.includes("convert") || status.includes("won")) return "Converted";
  if (status.includes("lost") || status.includes("drop") || status.includes("closed") || status.includes("dispose")) return "Lost";
  if (status.includes("open") || status.includes("new")) return "New";
  if (status.includes("progress") || status.includes("contact")) return "Contacted";
  if (status.includes("qualif")) return "Qualified";
  if (/^\d+$/.test(status)) {
    if (status === "6") return "New";
    return "Contacted";
  }
  return "New";
}
