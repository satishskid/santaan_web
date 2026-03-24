import { toNextJsHandler } from "better-auth/next-js";

import { betterAuthInstance } from "@/lib/better-auth";

export const runtime = "nodejs";

export const { GET, POST, PUT, PATCH, DELETE } = toNextJsHandler(betterAuthInstance);
