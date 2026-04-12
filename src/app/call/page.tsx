import Script from "next/script";
import { PhoneCall, ShieldCheck, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CallLandingForm } from "@/components/features/CallLandingForm";
import { PRIMARY_CALL_NUMBER } from "@/data/centers";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Request a Call",
  description:
    "Request a call from Santaan IVF and let our voice assistant connect you to the right fertility guidance quickly.",
  path: "/call",
  keywords: ["request a call", "fertility callback", "santaan call", "ivf callback"],
});

export default function CallPage() {
  return (
    <main className="min-h-screen bg-santaan-cream">
      <Script
        src="https://voice.santaan.in/qr_campaign_snippet.js"
        strategy="beforeInteractive"
      />
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-santaan-teal via-santaan-dark-teal to-[#102626] px-4 pb-20 pt-32 text-white md:px-6">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-santaan-amber/20 blur-3xl" />

        <div className="container relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-santaan-amber">
              Santaan Voice Assistant
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-playfair font-bold leading-tight md:text-6xl">
              Request a Call From Santaan
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              This page is built for one action only: get a callback fast. Share your name and number, and our
              voice assistant will route your request into the new Santaan calling engine.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <Zap className="h-5 w-5 text-santaan-amber" />
                <p className="mt-3 font-semibold">Fast Trigger</p>
                <p className="mt-1 text-sm text-white/75">The form submits directly through the new voice engine flow.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5 text-santaan-amber" />
                <p className="mt-3 font-semibold">UTM Aware</p>
                <p className="mt-1 text-sm text-white/75">The linked snippet handles QR and URL attribution automatically.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <PhoneCall className="h-5 w-5 text-santaan-amber" />
                <p className="mt-3 font-semibold">Direct Backup</p>
                <p className="mt-1 text-sm text-white/75">Prefer not to wait? Call us directly at {PRIMARY_CALL_NUMBER}.</p>
              </div>
            </div>
          </div>

          <CallLandingForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
