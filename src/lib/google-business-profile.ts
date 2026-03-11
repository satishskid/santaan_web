import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reputationReviews, settings } from "@/db/schema";
import { extractThemes, inferSentiment } from "@/lib/reviews";

export interface GoogleBusinessReviewSyncResult {
  synced: number;
  insertedOrUpdated: number;
  locations: number;
  perLocation: Array<{ center: string; locationName: string; title: string; reviews: number }>;
}

export interface GoogleBusinessDebugInfo {
  configured: boolean;
  accountCount: number;
  locationCount: number;
  accounts: Array<{ name: string; accountName: string; type?: string }>;
  locations: Array<{ center: string; name: string; title: string }>;
  message?: string;
}

interface GoogleOAuthTokenPayload {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleBusinessAccount {
  name: string;
  accountName?: string;
  type?: string;
}

interface GoogleBusinessLocation {
  name: string;
  title?: string;
  storefrontAddress?: {
    locality?: string;
    addressLines?: string[];
  };
}

interface GoogleBusinessReviewer {
  displayName?: string;
}

interface GoogleBusinessReviewReply {
  comment?: string;
  updateTime?: string;
}

interface GoogleBusinessReviewApiRow {
  name?: string;
  reviewId?: string;
  reviewer?: GoogleBusinessReviewer;
  starRating?: string | number;
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewReply?: GoogleBusinessReviewReply;
}

type LocationMap = Record<string, string>;

function ensureClientId() {
  return (
    process.env.GOOGLE_BUSINESS_CLIENT_ID?.trim() ||
    process.env.GOOGLE_ADS_CLIENT_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    ""
  );
}

function ensureClientSecret() {
  return (
    process.env.GOOGLE_BUSINESS_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_ADS_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    ""
  );
}

function ensureRefreshToken() {
  return process.env.GOOGLE_BUSINESS_REFRESH_TOKEN?.trim() || "";
}

function normalizeCenter(value?: string | null) {
  const lower = String(value || "").trim().toLowerCase();
  if (!lower) return "network";
  if (lower.includes("bbsr") || lower.includes("bhub")) return "bhubaneswar";
  if (lower.includes("bam") || lower.includes("berh") || lower.includes("brahmapur")) return "berhampur";
  if (lower.includes("blr") || lower.includes("bang") || lower.includes("beng")) return "bangalore";
  if (lower.includes("angul") || lower.includes("anugul")) return "angul";
  return lower;
}

function inferCenterFromLocation(title?: string, locality?: string) {
  return normalizeCenter(`${title || ""} ${locality || ""}`);
}

function parseRating(value?: string | number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.min(5, Math.round(value)));
  }

  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) return 5;

  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };

  return map[normalized] || Math.max(1, Math.min(5, Number(normalized) || 5));
}

function parseDate(value?: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

async function fetchGoogleBusinessAccessToken(): Promise<string> {
  const clientId = ensureClientId();
  const clientSecret = ensureClientSecret();
  const refreshToken = ensureRefreshToken();

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Business Profile OAuth is not configured. Set GOOGLE_BUSINESS_CLIENT_ID, GOOGLE_BUSINESS_CLIENT_SECRET, and GOOGLE_BUSINESS_REFRESH_TOKEN with business.manage scope."
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as GoogleOAuthTokenPayload | null;
  if (!response.ok || !payload?.access_token) {
    const message =
      payload?.error_description || payload?.error || `Google OAuth failed with ${response.status}`;
    throw new Error(message);
  }

  return payload.access_token;
}

async function requestJson<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
    cache: "no-store",
  });

  const payloadText = await response.text();
  let payload: T | null = null;
  try {
    payload = JSON.parse(payloadText) as T;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(`Google Business Profile API failed (${response.status}): ${payloadText.slice(0, 300)}`);
  }

  return payload as T;
}

async function fetchBusinessAccounts(accessToken: string): Promise<GoogleBusinessAccount[]> {
  const payload = await requestJson<{ accounts?: GoogleBusinessAccount[] }>(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    accessToken
  );
  return Array.isArray(payload?.accounts) ? payload.accounts : [];
}

async function fetchLocationsForAccount(accountName: string, accessToken: string): Promise<GoogleBusinessLocation[]> {
  const params = new URLSearchParams({
    readMask: "name,title,storefrontAddress.locality,storefrontAddress.addressLines",
    pageSize: "100",
  });
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?${params.toString()}`;
  const payload = await requestJson<{ locations?: GoogleBusinessLocation[] }>(url, accessToken);
  return Array.isArray(payload?.locations) ? payload.locations : [];
}

async function fetchReviewsForLocation(locationName: string, accessToken: string): Promise<GoogleBusinessReviewApiRow[]> {
  const params = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
  const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews?${params.toString()}`;
  const payload = await requestJson<{ reviews?: GoogleBusinessReviewApiRow[] }>(url, accessToken);
  return Array.isArray(payload?.reviews) ? payload.reviews : [];
}

async function resolveLocationMap(): Promise<LocationMap> {
  const fromEnv = process.env.GOOGLE_BUSINESS_LOCATION_MAP?.trim();
  if (fromEnv) {
    return JSON.parse(fromEnv) as LocationMap;
  }

  const row = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "google_business_location_map_json"))
    .get();

  if (!row?.value) return {};
  return JSON.parse(row.value) as LocationMap;
}

export async function getGoogleBusinessDebugInfo(): Promise<GoogleBusinessDebugInfo> {
  try {
    const accessToken = await fetchGoogleBusinessAccessToken();
    const accounts = await fetchBusinessAccounts(accessToken);
    const locationMap = await resolveLocationMap();
    const locations: Array<{ center: string; name: string; title: string }> = [];

    if (Object.keys(locationMap).length > 0) {
      for (const [center, locationName] of Object.entries(locationMap)) {
        locations.push({ center: normalizeCenter(center), name: locationName, title: locationName });
      }
    } else {
      for (const account of accounts) {
        const rows = await fetchLocationsForAccount(account.name, accessToken);
        rows.forEach((location) => {
          locations.push({
            center: inferCenterFromLocation(location.title, location.storefrontAddress?.locality),
            name: location.name,
            title: location.title || location.name,
          });
        });
      }
    }

    return {
      configured: Object.keys(locationMap).length > 0,
      accountCount: accounts.length,
      locationCount: locations.length,
      accounts: accounts.map((account) => ({
        name: account.name,
        accountName: account.accountName || account.name,
        type: account.type,
      })),
      locations,
      message:
        Object.keys(locationMap).length > 0
          ? "Using configured center-to-location map."
          : "No explicit location map configured. Accounts and locations were discovered from Google Business Profile APIs.",
    };
  } catch (error) {
    return {
      configured: false,
      accountCount: 0,
      locationCount: 0,
      accounts: [],
      locations: [],
      message: error instanceof Error ? error.message : "Failed to inspect Google Business Profile configuration.",
    };
  }
}

export async function runGoogleBusinessReviewSync(): Promise<GoogleBusinessReviewSyncResult> {
  const accessToken = await fetchGoogleBusinessAccessToken();
  const locationMap = await resolveLocationMap();

  if (!Object.keys(locationMap).length) {
    throw new Error(
      "Google Business location map is not configured. Set GOOGLE_BUSINESS_LOCATION_MAP or settings key google_business_location_map_json with center-to-location mapping."
    );
  }

  const perLocation: Array<{ center: string; locationName: string; title: string; reviews: number }> = [];
  let insertedOrUpdated = 0;

  for (const [centerKey, locationName] of Object.entries(locationMap)) {
    const center = normalizeCenter(centerKey);
    const reviews = await fetchReviewsForLocation(locationName, accessToken);
    const title = locationName;

    for (const review of reviews) {
      const externalReviewId = String(review.name || review.reviewId || "").trim();
      if (!externalReviewId) continue;

      const rating = parseRating(review.starRating);
      const reviewText = String(review.comment || "").trim() || "No written comment provided.";
      const reviewDate = parseDate(review.updateTime || review.createTime);
      const responseText = String(review.reviewReply?.comment || "").trim() || null;
      const respondedAt = review.reviewReply?.updateTime || null;

      await db
        .insert(reputationReviews)
        .values({
          source: "google",
          center,
          externalReviewId,
          sourceLocation: locationName,
          reviewerName: String(review.reviewer?.displayName || "").trim() || null,
          rating,
          reviewDate,
          headline: null,
          reviewText,
          publicUrl: null,
          sentiment: inferSentiment(rating, reviewText),
          themes: JSON.stringify(extractThemes(reviewText)),
          responseStatus: responseText ? "responded" : "pending",
          responseText,
          respondedAt,
        })
        .onConflictDoUpdate({
          target: [reputationReviews.source, reputationReviews.externalReviewId],
          set: {
            center,
            sourceLocation: locationName,
            reviewerName: String(review.reviewer?.displayName || "").trim() || null,
            rating,
            reviewDate,
            reviewText,
            sentiment: inferSentiment(rating, reviewText),
            themes: JSON.stringify(extractThemes(reviewText)),
            responseText: responseText ?? sql`coalesce(${reputationReviews.responseText}, null)`,
            respondedAt: respondedAt ?? sql`coalesce(${reputationReviews.respondedAt}, null)`,
            responseStatus: responseText
              ? sql`'responded'`
              : sql`coalesce(${reputationReviews.responseStatus}, 'pending')`,
            updatedAt: new Date().toISOString(),
          },
        });

      insertedOrUpdated += 1;
    }

    perLocation.push({
      center,
      locationName,
      title,
      reviews: reviews.length,
    });
  }

  return {
    synced: insertedOrUpdated,
    insertedOrUpdated,
    locations: perLocation.length,
    perLocation,
  };
}
