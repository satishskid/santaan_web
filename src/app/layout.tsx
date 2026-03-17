import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import { JourneyProvider } from "@/context/JourneyContext";
import AuthProvider from "@/components/providers/AuthProvider";
import UtmTracker from "@/components/analytics/UtmTracker";
import CtaContactTracker from "@/components/analytics/CtaContactTracker";
import { defaultSeoMetadata } from "@/lib/seo";
import ClientWidgets from "@/components/layout/ClientWidgets";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultSeoMetadata;

import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        <AnalyticsScripts />
        <UtmTracker />
        <CtaContactTracker />

        <AuthProvider>
          <SmoothScrollProvider>
            <JourneyProvider>
              {children}
              <ClientWidgets />
            </JourneyProvider>
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
