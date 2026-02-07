import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import LinkedIn from "next-auth/providers/linkedin"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { z } from "zod"

async function getUser(email: string) {
    try {
        return await db.select().from(users).where(eq(users.email, email)).get();
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google,
        LinkedIn,
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login", // We will create a custom login page or just redirect to home
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore - user.role might not be in the default type, but we fetched it from DB
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnProfile = nextUrl.pathname.startsWith('/profile');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const userEmail = auth?.user?.email;
            const adminEmails = ['satish@skids.health', 'satish.rath@gmail.com', 'demo@santaan.com', 'raghab.panda@santaan.in', 'satish.rath@santaan.in']; // Add new admins

            if (isOnAdmin) {
                if (isLoggedIn && userEmail && adminEmails.includes(userEmail)) return true;
                // Also check role from session if possible, but middleware auth object is limited.
                // For now, email list + DB verification is safest until we robustly Type the session.
                return false;
            }

            if (isOnProfile) {
                if (isLoggedIn) return true;
                return false;
            }
            return true;
        },
    },
})
