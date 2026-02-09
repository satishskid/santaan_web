import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

const providers = [] as any[];

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
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.role = token.role;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnProfile = nextUrl.pathname.startsWith('/profile');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const userEmail = auth?.user?.email;
            const adminEmails = ['satish@skids.health', 'satish.rath@gmail.com', 'demo@santaan.com', 'raghab.panda@santaan.in', 'satish.rath@santaan.in'];

            if (isOnAdmin) {
                if (isLoggedIn && userEmail && adminEmails.includes(userEmail)) return true;
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
