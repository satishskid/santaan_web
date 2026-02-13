
import { auth } from "@/auth";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
    let session = null;
    try {
        session = await auth();
    } catch {
        session = null;
    }

    return <HeaderClient session={session} />;
}
