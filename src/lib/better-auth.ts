import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins/magic-link";
import { dash } from "@better-auth/infra";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { admins, users } from "@/db/schema";
import { sendMagicLinkEmail } from "@/lib/email";

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "https://www.santaan.in";
const basePath = "/api/bauth";

const trustedOrigins = [
  "https://www.santaan.in",
  "https://santaan.in",
  "http://localhost:3000",
];

const magicLinkTtlMinutes = 10;

const dashApiKey = process.env.BETTER_AUTH_API_KEY || "";

async function ensureMagicLinkAllowed(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  if (!email) {
    throw new Error("Please enter your email address.");
  }

  const dbUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (dbUser) {
    const role = (dbUser.role ?? "").trim().toLowerCase();
    if (role === "disabled") {
      throw new Error("Your CRM access is disabled. Please contact an admin.");
    }
    return;
  }

  const dbAdmin = await db.select().from(admins).where(eq(admins.email, email)).get();
  if (dbAdmin) return;

  throw new Error("This email is not on the Santaan CRM allowlist. Ask an admin to add you.");
}

const plugins: Array<ReturnType<typeof magicLink> | ReturnType<typeof dash>> = [
  magicLink({
    expiresIn: magicLinkTtlMinutes * 60,
    disableSignUp: true,
    async sendMagicLink({ email, url }) {
      await ensureMagicLinkAllowed(email);
      await sendMagicLinkEmail({
        to: email,
        url,
        ttlMinutes: magicLinkTtlMinutes,
      });
    },
  }),
];

if (dashApiKey) {
  plugins.unshift(
    dash({
      apiKey: dashApiKey,
    }),
  );
}

export const betterAuthInstance = betterAuth({
  appName: "Santaan CRM",
  baseURL,
  basePath,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
    usePlural: true,
  }),
  user: {
    modelName: "users",
    fields: {
      name: "name",
      email: "email",
      emailVerified: "email_verified",
      image: "image",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    modelName: "authSessions",
    fields: {
      expiresAt: "expires_at",
      token: "token",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
    },
  },
  account: {
    modelName: "authAccounts",
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      scope: "scope",
      password: "password",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "authVerifications",
    fields: {
      identifier: "identifier",
      value: "value",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  plugins,
});
