import { auth } from "@/auth"

export default auth((req) => {
    // restricted routes are handled in auth.ts callbacks
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
