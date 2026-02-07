import { auth, signOut } from "@/auth"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/Button"
import Image from "next/image"
import { Sprout, LogOut, HeartPulse } from "lucide-react"
import { ProfileContent } from "@/components/profile/ProfileContent"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) return null // Should be handled by middleware, but safe check

    return (
        <div className="min-h-screen bg-santaan-cream">
            <Header />
            <div className="pt-32 pb-20 container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-8 mb-12">
                        <div className="relative">
                            {session.user.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    width={120}
                                    height={120}
                                    className="rounded-full border-4 border-santaan-sage p-1"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-santaan-sage/20 flex items-center justify-center text-4xl">
                                    🌿
                                </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-playfair font-bold text-santaan-teal mb-2">
                                Namaste, {session.user.name?.split(' ')[0] || "Friend"}!
                            </h1>
                            <p className="text-gray-500 mb-4">{session.user.email}</p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="bg-santaan-sage/10 text-santaan-teal px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Patient ID: #SAN-{Math.floor(Math.random() * 10000)}
                                </span>
                                <span className="bg-santaan-amber/10 text-santaan-amber px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Member since 2026
                                </span>
                            </div>
                        </div>
                        <div>
                            <form
                                action={async () => {
                                    "use server"
                                    await signOut({ redirectTo: "/" })
                                }}
                            >
                                <Button variant="outline" className="flex items-center gap-2 text-rose-500 border-rose-200 hover:bg-rose-50">
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Signals Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
                            <ProfileContent />
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-santaan-amber/10 p-2 rounded-full">
                                    <HeartPulse className="w-5 h-5 text-santaan-amber" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Recommended for You</h3>
                            </div>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                                        <Image src="/assets/hero-origin.png" fill className="object-cover" alt="Article" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 leading-tight mb-1">Understanding IVF Success Rates</h4>
                                        <p className="text-xs text-gray-500">5 min read • Dr. Satish</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
