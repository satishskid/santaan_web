"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { betterAuthClient } from "@/lib/better-auth-client";

const ROLE_PRESETS = [
    { label: "Admin (Raghab)", value: "raghab.panda@santaan.in" },
    { label: "Content Manager + Paid Ads", value: "content.manager@santaan.in" },
    { label: "Agency Ops", value: "santaandigital.ops@santaan.in" },
    { label: "Field Exec - Bhubaneswar", value: "field.bbsr@santaan.in" },
    { label: "Field Exec - Berhampur", value: "field.bam@santaan.in" },
    { label: "Field Exec - Bangalore", value: "field.blr@santaan.in" },
    { label: "IVR / Telecalling Lead", value: "ivr.lead@santaan.in" },
    { label: "Telecaller 1 (Bhubaneswar)", value: "tele.bbsr@santaan.in" },
    { label: "Telecaller 2 (Berhampur)", value: "tele.bam@santaan.in" },
    { label: "Telecaller 3 (Bangalore)", value: "tele.blr@santaan.in" },
    { label: "Counselor - Bhubaneswar", value: "counselor.bbsr@santaan.in" },
    { label: "Counselor - Berhampur", value: "counselor.bam@santaan.in" },
    { label: "Counselor - Bangalore", value: "counselor.blr@santaan.in" },
];

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [magicLinkStatus, setMagicLinkStatus] = useState("");
    const [magicLinkError, setMagicLinkError] = useState("");
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
    const [rolePreset, setRolePreset] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid username or PIN");
            } else {
                router.push("/admin/dashboard");
                router.refresh();
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMagicLink = async () => {
        setMagicLinkStatus("");
        setMagicLinkError("");

        if (!email || !email.includes("@")) {
            setMagicLinkError("Please enter your full email address for a magic link.");
            return;
        }

        setIsMagicLinkLoading(true);
        try {
            await betterAuthClient.signIn.magicLink({
                email,
                callbackURL: "/admin/dashboard",
                errorCallbackURL: "/login",
            });
            setMagicLinkStatus("Magic link sent to your email. It expires in 10 minutes.");
        } catch (err) {
            console.error("Magic link error:", err);
            const message = err instanceof Error ? err.message : "";
            setMagicLinkError(message || "Unable to send magic link. Please try again.");
        } finally {
            setIsMagicLinkLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-santaan-sage/20 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Home */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-santaan-teal mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <span className="flex items-center gap-2">
                                <Image src="/favicon.ico" alt="" width={24} height={24} className="h-6 w-6" />
                                <span className="font-playfair font-bold text-santaan-teal text-3xl tracking-tight leading-none">
                                    Santaan
                                </span>
                            </span>
                        </div>
                        <h1 className="text-2xl font-playfair font-bold text-gray-900">Santaan CRM Portal</h1>
                        <p className="text-gray-500 text-sm mt-1">Sign in with your assigned username or email and 6-digit PIN</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="rolePreset" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Select your role (optional)
                            </label>
                            <select
                                id="rolePreset"
                                value={rolePreset}
                                onChange={(e) => {
                                    const selected = e.target.value;
                                    setRolePreset(selected);
                                    if (selected) {
                                        setEmail(selected);
                                    }
                                }}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-santaan-teal focus:outline-none focus:ring-2 focus:ring-santaan-teal/30"
                            >
                                <option value="">Choose a role</option>
                                {ROLE_PRESETS.map((preset) => (
                                    <option key={preset.value} value={preset.value}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Username or Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="telecaller1.bbsr or satish.rath@santaan.in"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                PIN / Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="6 digit PIN"
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isLoading}
                            className="bg-santaan-teal hover:bg-santaan-teal/90"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-6 border-t border-gray-100 pt-5">
                        <p className="text-xs text-gray-500 text-center mb-1">
                            Backup login (if PIN fails)
                        </p>
                        <p className="text-xs text-gray-400 text-center mb-3">
                            Sends a one-time magic link to your whitelisted email address.
                        </p>

                        {magicLinkStatus && (
                            <div className="bg-green-50 text-green-700 text-xs p-2 rounded-md mb-3 text-center">
                                {magicLinkStatus}
                            </div>
                        )}

                        {magicLinkError && (
                            <div className="bg-red-50 text-red-600 text-xs p-2 rounded-md mb-3 text-center">
                                {magicLinkError}
                            </div>
                        )}

                        <Button
                            type="button"
                            fullWidth
                            variant="outline"
                            disabled={isMagicLinkLoading}
                            onClick={handleMagicLink}
                        >
                            {isMagicLinkLoading ? "Sending magic link..." : "Send Magic Link"}
                        </Button>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        Authorized personnel only. All access is logged.
                    </p>
                    <p className="text-center text-[10px] text-gray-300 mt-2">
                        Santaan CRM is powered by Greybrain.ai
                    </p>
                </div>

                {/* Copyright */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2026 Santaan Fertility. All rights reserved.
                </p>
            </div>
        </div>
    );
}
