import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

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
            const userRole = (auth?.user as { role?: string } | undefined)?.role;
            const adminEmails = ['satish@skids.health', 'satish.rath@gmail.com', 'demo@santaan.com', 'raghab.panda@santaan.in', 'satish.rath@santaan.in'];
            const isAdminRole = userRole === 'admin';
            const operationalRoles = new Set([
                'admin',
                'ceo',
                'crm_ops_admin',
                'marketing_manager',
                'agency_ops',
                'performance_marketer',
                'content_writer',
                'social_media_exec',
                'field_exec',
                'ivr_manager',
                'telecaller_manager',
                'telecaller',
                'counselor',
            ]);
            const hasOperationalRole = !!userRole && operationalRoles.has(userRole);

            if (isOnAdmin) {
                if (isLoggedIn && ((userEmail && adminEmails.includes(userEmail)) || isAdminRole || hasOperationalRole)) return true;
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
