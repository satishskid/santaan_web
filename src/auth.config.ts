import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { hasOpsRole, isSuperAdminEmail, normalizeAccessRole } from "@/lib/access-control"

const providers: NonNullable<NextAuthConfig["providers"]> = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(Google);
}

export const authConfig = {
    trustHost: true,
    providers,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                (token as { role?: unknown }).role = (user as { role?: unknown }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as { role?: unknown }).role = (token as { role?: unknown }).role;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnProfile = nextUrl.pathname.startsWith('/profile');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const userEmail = auth?.user?.email?.toLowerCase();
            const userRole = normalizeAccessRole((auth?.user as { role?: string } | undefined)?.role);
            const isAdminRole = userRole === 'admin';
            const hasOperationalRole = hasOpsRole(userRole);

            if (isOnAdmin) {
                if (isLoggedIn && (isSuperAdminEmail(userEmail) || isAdminRole || hasOperationalRole)) return true;
                return false;
            }

            if (isOnProfile) {
                if (isLoggedIn) return true;
                return false;
            }
            return true;
        },
    },
} satisfies NextAuthConfig;
