"use client";

import { usePatientId } from "@/hooks/usePatientId";
import { LogOut, HeartPulse } from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";

interface ProfileHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    const patientId = usePatientId();

    return (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="relative">
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.name || "User"}
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
                    Namaste, {user.name?.split(' ')[0] || "Friend"}!
                </h1>
                <p className="text-gray-500 mb-4">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="bg-santaan-sage/10 text-santaan-teal px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Patient ID: {patientId}
                    </span>
                    <span className="bg-santaan-amber/10 text-santaan-amber px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Member since 2026
                    </span>
                </div>
            </div>
            <div>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 text-rose-500 border border-rose-200 hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    );
}