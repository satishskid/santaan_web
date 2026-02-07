
import { signIn } from "@/auth"
import { FaGoogle, FaLinkedin } from "react-icons/fa"
import { Button } from "@/components/ui/Button"

export function LoginButton() {
    return (
        <div className="flex flex-col gap-4 w-full max-w-sm">
            <form
                action={async () => {
                    "use server"
                    await signIn("google", { redirectTo: "/profile" })
                }}
                className="w-full"
            >
                <Button
                    className="w-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 relative py-6"
                    type="submit"
                >
                    <FaGoogle className="w-5 h-5 text-red-500 absolute left-6" />
                    <span className="font-semibold">Continue with Google</span>
                </Button>
            </form>

            <form
                action={async () => {
                    "use server"
                    await signIn("linkedin", { redirectTo: "/profile" })
                }}
                className="w-full"
            >
                <Button
                    className="w-full bg-[#0077B5] text-white hover:bg-[#006097] flex items-center justify-center gap-3 relative py-6"
                    type="submit"
                >
                    <FaLinkedin className="w-5 h-5 text-white absolute left-6" />
                    <span className="font-semibold">Continue with LinkedIn</span>
                </Button>
            </form>
        </div>
    )
}
