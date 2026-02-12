import { auth } from "@/auth"
import { Header } from "@/components/layout/Header"
import { ProfileContent } from "@/components/profile/ProfileContent"
import { ProfileHeader } from "@/components/profile/ProfileHeader"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) return null // Should be handled by middleware, but safe check

    return (
        <div className="min-h-screen bg-santaan-cream">
            <Header />
            <div className="pt-32 pb-20 container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <ProfileHeader user={session.user} />

                    {/* Signals Section */}
                    <ProfileContent />
                </div>
            </div>
        </div>
    )
}