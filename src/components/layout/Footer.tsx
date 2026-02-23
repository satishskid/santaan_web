"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Facebook, Instagram, Linkedin, Twitter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { readUtmParams } from "@/lib/utm";
import { CENTER_CONTACTS } from "@/data/centers";

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

export function Footer() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubscribe = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!email.trim()) return;

        setStatus("loading");
        setMessage("");

        try {
            const response = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, utm: readUtmParams() }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || "Failed to subscribe");
            }

            setStatus("success");
            setMessage(data?.message || "Subscribed successfully");
            setEmail("");

            const analyticsWindow = window as GtagWindow;
            if (analyticsWindow.gtag) {
                analyticsWindow.gtag('event', 'sign_up', {
                    event_category: 'engagement',
                    event_label: 'newsletter_subscription'
                });
            }
        } catch (error: unknown) {
            setStatus("error");
            const errorMessage = error instanceof Error ? error.message : "Failed to subscribe";
            setMessage(errorMessage);
        }
    };

    return (
        <footer id="footer" className="bg-santaan-teal text-white pt-20 pb-10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-flex items-center">
                            <div className="bg-white rounded-lg p-2">
                                <Image
                                    src="/assets/santaan-logo.png"
                                    alt="Santaan Logo"
                                    width={120}
                                    height={67}
                                    className="h-8 w-auto object-contain"
                                />
                            </div>
                        </Link>
                        <p className="text-gray-300 leading-relaxed">
                            Where Science Meets Hope. <br />
                            We combine advanced reproductive technology with compassionate care to help you build your family.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Facebook, href: "https://www.facebook.com/santaanfertilityclinic", label: "Facebook" },
                                { icon: Instagram, href: "https://www.instagram.com/santaan_fertility/", label: "Instagram" },
                                { icon: Twitter, href: "https://x.com/SantaanIVF", label: "X" },
                                { icon: Linkedin, href: "https://www.linkedin.com/school/santaan-fertility-center-and-research-institute/", label: "LinkedIn" },
                            ].map((item, i) => (
                                <a
                                    key={i}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={item.label}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-santaan-amber transition-colors"
                                >
                                    <item.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-santaan-sage">Quick Links</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/ivf-clinic-bhubaneswar" className="text-gray-300 hover:text-santaan-amber transition-colors">
                                    IVF Bhubaneswar
                                </Link>
                            </li>
                            <li>
                                <Link href="/our-doctors" className="text-gray-300 hover:text-santaan-amber transition-colors">
                                    Doctors
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact-centres" className="text-gray-300 hover:text-santaan-amber transition-colors">
                                    Contact Centres
                                </Link>
                            </li>
                            <li>
                                <Link href="/at-home-fertility-testing" className="text-gray-300 hover:text-santaan-amber transition-colors">
                                    At-Home Testing
                                </Link>
                            </li>
                            <li>
                                <Link href="/fertility-insights" className="text-gray-300 hover:text-santaan-amber transition-colors">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Locations */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-santaan-sage">Our Centers</h4>
                        <ul className="space-y-4">
                            {CENTER_CONTACTS.map((center) => (
                                <li key={center.name} className="flex gap-3 text-gray-300">
                                    <MapPin className="w-5 h-5 text-santaan-amber shrink-0" />
                                    <span>{center.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div id="newsletter">
                        <h4 className="font-bold text-lg mb-6 text-santaan-sage">Stay via Science</h4>
                        <p className="text-gray-300 mb-4 text-sm">
                            A short daily note with one myth, one insight, and one gentle next step.
                        </p>
                        <form className="space-y-2" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-santaan-amber"
                            />
                            <Button
                                fullWidth
                                className="bg-santaan-amber hover:bg-[#E08E45]"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? "Subscribing..." : "Subscribe"}
                            </Button>
                            {message && (
                                <p
                                    className={`text-xs ${status === "success" ? "text-emerald-200" : "text-rose-200"}`}
                                >
                                    {message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        © 2026 Santaan Fertility. All rights reserved.
                        <Link href="/login" className="text-white/30 hover:text-white/60 text-xs ml-2">Admin</Link>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
