import { normalizeIndianMobile } from "@/lib/neodove";

const CLEAN_PHONE = /[^0-9]/g;

type VoiceEntryPoint = "main" | "tv";
type VoiceIntentBucket = "hot" | "warm" | "cool";

type VoicePayloadNode = Record<string, unknown>;

export type NormalizedBolnaPayload = {
  eventKey: string;
  externalCallId: string | null;
  provider: "bolna";
  agentName: string;
  agentId: string | null;
  batchId: string | null;
  fromNumber: string | null;
  toNumber: string | null;
  entryPoint: VoiceEntryPoint;
  sourceCampaign: string;
  callStatus: string;
  answeredByVoiceMail: boolean;
  startedAt: string;
  endedAt: string | null;
  durationSec: number;
  conversationTimeSec: number;
  language: string;
  callerName: string | null;
  callerType: string | null;
  city: string | null;
  preferredCentre: string;
  tryingDuration: string | null;
  knownCondition: string | null;
  priorTreatment: string | null;
  callbackWindow: string | null;
  whatsappNumber: string | null;
  transcriptUrl: string | null;
  recordingUrl: string | null;
  transcript: string | null;
  summary: string | null;
  transferRequested: boolean;
  transferCompleted: boolean;
  intentScore: number;
  intentBucket: VoiceIntentBucket;
};

function isRecord(value: unknown): value is VoicePayloadNode {
  return typeof value === "object" && value !== null;
}

function parseEmbeddedJson(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || !(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function collectNodes(value: unknown, nodes: VoicePayloadNode[]) {
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

function candidateNodes(body: VoicePayloadNode) {
  const nodes: VoicePayloadNode[] = [];
  const nestedKeys = [
    "data",
    "payload",
    "body",
    "call",
    "call_details",
    "message",
    "result",
    "response",
    "telephony_data",
    "transfer_call_data",
    "batch_run_details",
    "context_details",
    "extracted_data",
    "variables",
    "metadata",
  ];

  collectNodes(body, nodes);
  for (const key of nestedKeys) {
    collectNodes(body[key], nodes);
  }

  return nodes.length ? nodes : [body];
}

function readString(record: VoicePayloadNode, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
  }
  return undefined;
}

function readNumber(record: VoicePayloadNode, keys: string[]) {
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

function readBoolean(record: VoicePayloadNode, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "y", "done", "completed", "success", "connected", "transferred"].includes(normalized)) {
        return true;
      }
      if (["false", "0", "no", "n", "pending", "failed", "not_connected", "disconnected"].includes(normalized)) {
        return false;
      }
    }
  }
  return undefined;
}

function readFromNodes(nodes: VoicePayloadNode[], keys: string[]) {
  for (const node of nodes) {
    const value = readString(node, keys);
    if (value) return value;
  }
  return undefined;
}

function readBooleanFromNodes(nodes: VoicePayloadNode[], keys: string[]) {
  for (const node of nodes) {
    const value = readBoolean(node, keys);
    if (value !== undefined) return value;
  }
  return undefined;
}

function readNumberFromNodes(nodes: VoicePayloadNode[], keys: string[]) {
  for (const node of nodes) {
    const value = readNumber(node, keys);
    if (value !== undefined) return value;
  }
  return undefined;
}

function normalizeStatus(value?: string | null) {
  return String(value || "completed").trim().toLowerCase() || "completed";
}

function phoneMatch(value?: string | null) {
  const digits = String(value || "").replace(CLEAN_PHONE, "");
  if (!digits) return "";
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(-10);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-10);
}

function normalizePriorTreatment(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (["yes", "y", "true", "1", "done", "prior treatment", "treated"].includes(normalized)) return "Yes";
  if (["no", "n", "false", "0", "none", "nil"].includes(normalized)) return "No";
  return value?.trim() || null;
}

function normalizeCondition(value?: string | null) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  if (["none", "na", "n/a", "nil", "no"].includes(normalized.toLowerCase())) return "None";
  return normalized;
}

function parseTryingDurationScore(value?: string | null) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return 5;
  if (/(2\s*\+?\s*(year|yr))|(24\s*\+?\s*month)|(more than 2)/.test(text)) return 40;
  if (/(1\s*(year|yr))|(12\s*month)|(18\s*month)/.test(text)) return 28;
  if (/(6\s*month)|(half\s*a\s*year)/.test(text)) return 15;
  return 5;
}

export function calculateVoiceIntentScore(input: {
  tryingDuration?: string | null;
  knownCondition?: string | null;
  priorTreatment?: string | null;
}) {
  let score = parseTryingDurationScore(input.tryingDuration);

  if (input.knownCondition && normalizeCondition(input.knownCondition) !== "None") {
    score += 35;
  }

  if (normalizePriorTreatment(input.priorTreatment) === "Yes") {
    score += 25;
  }

  return Math.min(score, 100);
}

export function scoreToIntentBucket(score: number): VoiceIntentBucket {
  if (score >= 75) return "hot";
  if (score >= 45) return "warm";
  return "cool";
}

function normalizeConfigList(value?: string | null) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function configListMatches(candidates: Array<string | null | undefined>, configured?: string | null) {
  const configuredList = normalizeConfigList(configured);
  if (!configuredList.length) return false;

  const normalizedCandidates = candidates
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  return normalizedCandidates.some((candidate) => configuredList.includes(candidate));
}

function inferEntryPoint(input: {
  toNumber?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  callSource?: string | null;
  campaignHint?: string | null;
}): VoiceEntryPoint {
  const { toNumber, agentId, agentName, callSource, campaignHint } = input;
  const normalizedTo = phoneMatch(toNumber);
  const mainConfigured = phoneMatch(process.env.BOLNA_MAIN_NUMBER || process.env.VOICE_AI_MAIN_NUMBER || "");
  const tvConfigured = phoneMatch(process.env.BOLNA_TV_NUMBER || process.env.VOICE_AI_TV_NUMBER || "");

  if (normalizedTo && tvConfigured && normalizedTo === tvConfigured) return "tv";
  if (normalizedTo && mainConfigured && normalizedTo === mainConfigured) return "main";

  if (
    configListMatches([agentId], process.env.BOLNA_TV_AGENT_ID || process.env.VOICE_AI_TV_AGENT_ID) ||
    configListMatches([agentName], process.env.BOLNA_TV_AGENT_NAME || process.env.VOICE_AI_TV_AGENT_NAME)
  ) {
    return "tv";
  }

  if (
    configListMatches([agentId], process.env.BOLNA_MAIN_AGENT_ID || process.env.VOICE_AI_MAIN_AGENT_ID) ||
    configListMatches([agentName], process.env.BOLNA_MAIN_AGENT_NAME || process.env.VOICE_AI_MAIN_AGENT_NAME)
  ) {
    return "main";
  }

  const hint = `${agentName || ""} ${callSource || ""} ${campaignHint || ""}`.toLowerCase();
  if (/(tv|billboard|hoarding|advertisement|ad\b)/.test(hint)) return "tv";
  return "main";
}

export function voiceCampaignForEntryPoint(entryPoint: VoiceEntryPoint) {
  if (entryPoint === "tv") {
    return String(process.env.VOICE_AI_TV_CAMPAIGN || "NEW_LEADS_TV").trim() || "NEW_LEADS_TV";
  }
  return String(process.env.VOICE_AI_MAIN_CAMPAIGN || "NEW_LEADS_IVF_MAIN").trim() || "NEW_LEADS_IVF_MAIN";
}

export function resolveVoiceCentre(input: { city?: string | null; preferredCentre?: string | null }) {
  const explicit = String(input.preferredCentre || "").trim();
  if (explicit) {
    const normalized = explicit.toLowerCase();
    if (normalized.includes("bhub")) return "Bhubaneswar";
    if (normalized.includes("berh") || normalized.includes("brah")) return "Berhampur";
    if (normalized.includes("angul")) return "Angul";
    if (normalized.includes("bang") || normalized.includes("beng")) return "Bangalore";
  }

  const city = String(input.city || "").trim().toLowerCase();
  if (city.includes("bhub") || city.includes("bbsr")) return "Bhubaneswar";
  if (city.includes("berh") || city.includes("brah")) return "Berhampur";
  if (city.includes("angul")) return "Angul";
  if (city.includes("bang") || city.includes("beng")) return "Bangalore";
  if (city) return "Teleconsult";
  return "Network";
}

export function voiceEducationLink(condition?: string | null) {
  const normalized = String(condition || "").toLowerCase();
  if (normalized.includes("pcos")) return "https://santaan.in/female-fertility";
  if (normalized.includes("male")) return "https://santaan.in/male-infertility-clinic";
  if (normalized.includes("thyroid")) return "https://santaan.in/female-fertility";
  return "https://santaan.in/treatments";
}

export function normalizeBolnaPayload(body: unknown): NormalizedBolnaPayload | null {
  if (!isRecord(body)) return null;

  const nodes = candidateNodes(body);
  const telephonyData = isRecord(body.telephony_data) ? body.telephony_data : null;
  const transferCallData = isRecord(body.transfer_call_data) ? body.transfer_call_data : null;
  const extractedData = isRecord(body.extracted_data) ? body.extracted_data : null;
  const contextDetails = isRecord(body.context_details) ? body.context_details : null;

  const externalCallId =
    readFromNodes(nodes, ["call_id", "callId", "id", "conversation_id", "session_id", "call_sid"]) || null;
  const agentId = readString(body, ["agent_id"]) || null;
  const batchId = readString(body, ["batch_id"]) || null;
  const fromNumber = normalizeIndianMobile(
    readString(telephonyData || {}, ["from_number"]) ||
      readString(transferCallData || {}, ["from_number"]) ||
      readFromNodes(nodes, ["caller_mobile", "caller_number", "caller_id", "from_number", "from"])
  );
  const toNumber = normalizeIndianMobile(
    readString(telephonyData || {}, ["to_number"]) ||
      readString(transferCallData || {}, ["to_number"]) ||
      readFromNodes(nodes, ["to_number", "call_to_number", "to", "did", "number"])
  );
  const callSource =
    readString(telephonyData || {}, ["call_type"]) ||
    readFromNodes(nodes, ["call_source", "source", "campaign_source", "entry_point"]) ||
    null;
  const agentName =
    readString(contextDetails || {}, ["agent_name", "name"]) ||
    readFromNodes(nodes, ["agent_name", "agent", "assistant_name"]) ||
    String(process.env.VOICE_AI_AGENT_NAME || "Swara").trim() ||
    "Swara";
  const campaignHint = readFromNodes(nodes, ["campaign", "campaign_name", "source_campaign"]) || null;
  const entryPoint = inferEntryPoint({
    toNumber,
    agentId,
    agentName,
    callSource,
    campaignHint,
  });
  const sourceCampaign = voiceCampaignForEntryPoint(entryPoint);
  const startedAt =
    readString(body, ["created_at"]) ||
    readFromNodes(nodes, ["started_at", "start_time", "call_started_at", "created_at"]) ||
    new Date().toISOString();
  const endedAt =
    readString(body, ["updated_at"]) ||
    readFromNodes(nodes, ["ended_at", "end_time", "call_ended_at", "updated_at"]) ||
    null;
  const conversationTimeSec =
    readNumber(body, ["conversation_time"]) || readNumberFromNodes(nodes, ["conversation_time"]) || 0;
  const durationSec =
    readNumber(telephonyData || {}, ["duration"]) ||
    readNumber(transferCallData || {}, ["duration"]) ||
    readNumberFromNodes(nodes, ["duration", "duration_sec", "call_duration", "talk_time"]) ||
    conversationTimeSec ||
    0;
  const answeredByVoiceMail =
    readBoolean(body, ["answered_by_voice_mail"]) ||
    readBooleanFromNodes(nodes, ["answered_by_voice_mail", "answeredByVoiceMail", "voicemail", "voice_mail"]) ||
    false;
  const language = readFromNodes(nodes, ["language", "lang"]) || "Odia";
  const callerName =
    readString(extractedData || {}, ["caller_name", "name", "lead_name"]) ||
    readFromNodes(nodes, ["caller_name", "name", "lead_name"]) ||
    null;
  const callerType =
    readString(extractedData || {}, ["caller_type", "patient_type", "relationship"]) ||
    readFromNodes(nodes, ["caller_type", "patient_type", "relationship"]) ||
    null;
  const city =
    readString(extractedData || {}, ["city", "caller_city"]) ||
    readFromNodes(nodes, ["city", "caller_city"]) ||
    null;
  const preferredCentre = resolveVoiceCentre({
    city,
    preferredCentre:
      readString(extractedData || {}, ["preferred_centre", "preferred_center", "centre", "center"]) ||
      readFromNodes(nodes, ["preferred_centre", "preferred_center", "centre", "center"]) ||
      null,
  });
  const tryingDuration =
    readString(extractedData || {}, ["trying_duration", "trying_for", "duration_trying"]) ||
    readFromNodes(nodes, ["trying_duration", "trying_for", "duration_trying"]) ||
    null;
  const knownCondition = normalizeCondition(
    readString(extractedData || {}, ["known_condition", "condition", "medical_condition", "diagnosis"]) ||
      readFromNodes(nodes, ["known_condition", "condition", "medical_condition", "diagnosis"]) ||
      null
  );
  const priorTreatment = normalizePriorTreatment(
    readString(extractedData || {}, ["prior_treatment", "previous_treatment", "had_treatment_before"]) ||
      readFromNodes(nodes, ["prior_treatment", "previous_treatment", "had_treatment_before"]) ||
      null
  );
  const callbackWindow =
    readString(extractedData || {}, ["callback_window", "preferred_callback_time", "callback_time"]) ||
    readFromNodes(nodes, ["callback_window", "preferred_callback_time", "callback_time"]) ||
    null;
  const recordingUrl =
    readString(telephonyData || {}, ["recording_url"]) ||
    readString(transferCallData || {}, ["recording_url"]) ||
    readFromNodes(nodes, ["recording_url", "recording"]) ||
    null;
  const transcriptUrl = readFromNodes(nodes, ["transcript_url", "transcriptUrl"]) || recordingUrl;
  const transcript = readString(body, ["transcript"]) || readFromNodes(nodes, ["transcript"]) || null;
  const summary =
    readFromNodes(nodes, ["call_summary", "summary", "conversation_summary"]) ||
    (transcript ? transcript.slice(0, 1200) : null);
  const transferRequested =
    Boolean(transferCallData) ||
    readBooleanFromNodes(nodes, ["transfer_requested", "transfer", "handoff_requested"]) ||
    Boolean(readFromNodes(nodes, ["transfer_to", "transfer_target"]));
  const transferCompleted =
    normalizeStatus(readString(transferCallData || {}, ["status"]) || "").includes("completed") ||
    readBooleanFromNodes(nodes, ["transfer_completed", "transfer_success", "handoff_completed"]) ||
    normalizeStatus(readString(body, ["status"]) || readFromNodes(nodes, ["call_status", "status"])).includes("transfer");
  const whatsappConfirmedRaw =
    readString(extractedData || {}, ["whatsapp_number", "alternate_whatsapp_number", "confirmed_whatsapp_number"]) ||
    readFromNodes(nodes, ["whatsapp_number", "alternate_whatsapp_number", "confirmed_whatsapp_number"]) ||
    null;
  const whatsappNumber =
    normalizeIndianMobile(whatsappConfirmedRaw) ||
    (String(
      readString(extractedData || {}, ["whatsapp_confirmed"]) || readFromNodes(nodes, ["whatsapp_confirmed"]) || ""
    ).toLowerCase() === "yes"
      ? fromNumber
      : null);
  const intentScore = calculateVoiceIntentScore({
    tryingDuration,
    knownCondition,
    priorTreatment,
  });

  const eventKey =
    externalCallId
      ? `bolna:${externalCallId}`
      : `bolna:${fromNumber || "unknown"}:${toNumber || "unknown"}:${startedAt}`;

  return {
    eventKey,
    externalCallId,
    provider: "bolna",
    agentName,
    agentId,
    batchId,
    fromNumber,
    toNumber,
    entryPoint,
    sourceCampaign,
    callStatus: normalizeStatus(
      readString(body, ["status"]) || readFromNodes(nodes, ["call_status", "status", "event"]) || "completed"
    ),
    answeredByVoiceMail,
    startedAt,
    endedAt,
    durationSec,
    conversationTimeSec,
    language,
    callerName,
    callerType,
    city,
    preferredCentre,
    tryingDuration,
    knownCondition,
    priorTreatment,
    callbackWindow,
    whatsappNumber,
    transcriptUrl,
    recordingUrl,
    transcript,
    summary,
    transferRequested,
    transferCompleted,
    intentScore,
    intentBucket: scoreToIntentBucket(intentScore),
  };
}
