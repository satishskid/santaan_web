import { createHash, createHmac } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, metaAudiences, metaAudienceSyncs } from "@/db/schema";

type ContactRow = typeof contacts.$inferSelect;
type MetaAudienceRow = typeof metaAudiences.$inferSelect;

type AudienceKey = "qualified" | "converted";

type MetaAudienceConfig = {
  accessToken: string;
  accountIds: string[];
  apiVersion: string;
};

type MetaAudienceSyncResult = {
  accountId: string;
  audienceKey: AudienceKey;
  audienceId: string | null;
  audienceName: string;
  contactCount: number;
  batchCount: number;
  status: "processed" | "error";
  errorMessage?: string | null;
};

type MetaCustomAudience = {
  id?: string;
  name?: string;
  subtype?: string;
};

type MetaApiResponse = {
  data?: MetaCustomAudience[];
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
  };
};

const DEFAULT_QUALIFIED_NAME = "Santaan CRM Qualified Leads";
const DEFAULT_CONVERTED_NAME = "Santaan CRM Converted Patients";

function ensureActPrefix(accountId: string): string {
  const trimmed = accountId.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("act_") ? trimmed : `act_${trimmed}`;
}

function parseAccountIds(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => ensureActPrefix(value))
    .filter(Boolean);
}

export function readMetaAudiencesConfig(): MetaAudienceConfig | null {
  const accessToken = String(process.env.META_ACCESS_TOKEN || "").trim();
  if (!accessToken) return null;
  const accountIds = parseAccountIds(process.env.META_AD_ACCOUNT_IDS || process.env.META_AD_ACCOUNT_ID || "");
  if (!accountIds.length) return null;
  return {
    accessToken,
    accountIds,
    apiVersion: String(process.env.META_GRAPH_API_VERSION || "v25.0").trim() || "v25.0",
  };
}

function createAppSecretProof(accessToken: string) {
  const appSecret = String(process.env.META_APP_SECRET || "").trim();
  if (!appSecret) return null;
  return createHmac("sha256", appSecret).update(accessToken).digest("hex");
}

function normalizeEmail(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized || normalized.endsWith("@pending.santaan.in")) return "";
  return normalized;
}

function normalizePhone(value?: string | null) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildAudienceName(key: AudienceKey) {
  if (key === "qualified") return String(process.env.META_AUDIENCE_QUALIFIED_NAME || DEFAULT_QUALIFIED_NAME).trim();
  return String(process.env.META_AUDIENCE_CONVERTED_NAME || DEFAULT_CONVERTED_NAME).trim();
}

async function fetchCustomAudiences(config: MetaAudienceConfig, accountId: string) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${accountId}/customaudiences`);
  url.searchParams.set("access_token", config.accessToken);
  url.searchParams.set("fields", "id,name,subtype");
  url.searchParams.set("limit", "200");
  const proof = createAppSecretProof(config.accessToken);
  if (proof) url.searchParams.set("appsecret_proof", proof);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  const payload = (await response.json()) as MetaApiResponse;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || "Meta Custom Audiences fetch failed");
  }
  return payload.data || [];
}

async function createCustomAudience(config: MetaAudienceConfig, accountId: string, name: string) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${accountId}/customaudiences`);
  url.searchParams.set("access_token", config.accessToken);
  url.searchParams.set("name", name);
  url.searchParams.set("subtype", "CUSTOM");
  url.searchParams.set("customer_file_source", "USER_PROVIDED_ONLY");
  url.searchParams.set("description", "Synced from Santaan CRM");
  const proof = createAppSecretProof(config.accessToken);
  if (proof) url.searchParams.set("appsecret_proof", proof);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  const payload = (await response.json()) as { id?: string; error?: { message?: string } };
  if (!response.ok || payload?.error || !payload?.id) {
    throw new Error(payload?.error?.message || "Meta Custom Audience creation failed");
  }
  return payload.id;
}

async function ensureAudience(config: MetaAudienceConfig, accountId: string, key: AudienceKey) {
  const name = buildAudienceName(key);
  const stored = await db
    .select()
    .from(metaAudiences)
    .where(and(eq(metaAudiences.accountId, accountId), eq(metaAudiences.audienceKey, key)))
    .get();
  if (stored?.audienceId) return stored;

  const list = await fetchCustomAudiences(config, accountId);
  const match = list.find((item) => item.name === name);
  const audienceId = match?.id || (await createCustomAudience(config, accountId, name));

  const inserted = await db
    .insert(metaAudiences)
    .values({
      accountId,
      audienceKey: key,
      audienceId,
      name,
      lastSyncedAt: null,
    })
    .returning();

  return inserted[0];
}

function buildAudiencePayloadRows(list: ContactRow[]) {
  return list
    .map((contact) => {
      const email = normalizeEmail(contact.email);
      const phone = normalizePhone(contact.phone || contact.whatsappNumber);
      const externalId = contact.id ? hashValue(`crm_contact:${contact.id}`) : "";
      if (!email && !phone && !externalId) return null;
      return [
        email ? hashValue(email) : "",
        phone ? hashValue(phone) : "",
        externalId || "",
      ];
    })
    .filter(Boolean) as string[][];
}

function chunkArray<T>(values: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < values.length; i += size) {
    result.push(values.slice(i, i + size));
  }
  return result;
}

async function sendAudienceBatch(
  config: MetaAudienceConfig,
  audienceId: string,
  rows: string[][]
) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${audienceId}/users`);
  url.searchParams.set("access_token", config.accessToken);
  const proof = createAppSecretProof(config.accessToken);
  if (proof) url.searchParams.set("appsecret_proof", proof);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      payload: {
        schema: ["EMAIL", "PHONE", "EXTERNAL_ID"],
        data: rows,
        data_source: "USER_PROVIDED_ONLY",
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as { error?: { message?: string } };
  if (!response.ok || payload?.error) {
    throw new Error(payload?.error?.message || "Meta audience sync failed");
  }
  return payload;
}

async function selectContactsForAudience(key: AudienceKey) {
  const rows = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  const wanted = rows.filter((contact) => {
    const status = String(contact.status || "").toLowerCase();
    if (key === "converted") return status === "converted";
    return status === "qualified" || status === "converted";
  });
  return wanted;
}

async function recordSync(
  result: MetaAudienceSyncResult,
  responsePayload?: unknown
) {
  await db.insert(metaAudienceSyncs).values({
    accountId: result.accountId,
    audienceKey: result.audienceKey,
    audienceId: result.audienceId || null,
    audienceName: result.audienceName,
    contactCount: result.contactCount,
    batchCount: result.batchCount,
    processStatus: result.status,
    responsePayload: responsePayload ? JSON.stringify(responsePayload) : null,
    errorMessage: result.errorMessage || null,
    processedAt: new Date().toISOString(),
  });
}

export async function syncMetaAudiences(mode: "all" | "qualified" | "converted" = "all") {
  const config = readMetaAudiencesConfig();
  if (!config) throw new Error("Meta audiences are not configured.");

  const keys: AudienceKey[] =
    mode === "all" ? ["qualified", "converted"] : [mode];

  const results: MetaAudienceSyncResult[] = [];

  for (const accountId of config.accountIds) {
    for (const key of keys) {
      const audience = await ensureAudience(config, accountId, key);
      const contactsForKey = await selectContactsForAudience(key);
      const rows = buildAudiencePayloadRows(contactsForKey);
      const chunks = chunkArray(rows, 5000);

      let finalStatus: MetaAudienceSyncResult = {
        accountId,
        audienceKey: key,
        audienceId: audience.audienceId,
        audienceName: audience.name,
        contactCount: rows.length,
        batchCount: chunks.length,
        status: "processed",
      };

      try {
        for (const chunk of chunks) {
          if (chunk.length === 0) continue;
          await sendAudienceBatch(config, audience.audienceId, chunk);
        }
        await db
          .update(metaAudiences)
          .set({ lastSyncedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
          .where(eq(metaAudiences.id, audience.id));
        await recordSync(finalStatus);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Meta audience sync failed";
        finalStatus = {
          ...finalStatus,
          status: "error",
          errorMessage: message,
        };
        await recordSync(finalStatus);
      }

      results.push(finalStatus);
    }
  }

  return results;
}

export async function listMetaAudienceStatus() {
  const [audiences, latestSync] = await Promise.all([
    db.select().from(metaAudiences).orderBy(desc(metaAudiences.updatedAt), desc(metaAudiences.id)),
    db.select().from(metaAudienceSyncs).orderBy(desc(metaAudienceSyncs.createdAt), desc(metaAudienceSyncs.id)).limit(6),
  ]);

  return { audiences, latestSync };
}
