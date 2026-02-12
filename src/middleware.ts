import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// @ts-expect-error - NextAuth middleware type issue
export default NextAuth(authConfig).auth;

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
