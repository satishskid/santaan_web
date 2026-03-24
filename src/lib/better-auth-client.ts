import { createAuthClient } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";

export const betterAuthClient = createAuthClient({
  basePath: "/api/bauth",
  plugins: [magicLinkClient()],
});
