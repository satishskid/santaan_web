import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import LinkedIn from "next-auth/providers/linkedin"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google,
        LinkedIn
    ],
    pages: {
        signIn: "/login", // We will create a custom login page or just redirect to home
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnProfile = nextUrl.pathname.startsWith('/profile');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const userEmail = auth?.user?.email;
            const adminEmails = ['satish@skids.health', 'satish.rath@gmail.com', 'demo@santaan.com']; // Add demo for testing if needed

            if (isOnAdmin) {
                if (isLoggedIn && userEmail && adminEmails.includes(userEmail)) return true;
                return false; // Redirect unauthenticated or unauthorized users
            }

            if (isOnProfile) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
    },
})
