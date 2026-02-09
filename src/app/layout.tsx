import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import { JourneyProvider } from "@/context/JourneyContext";
import ChatWidget from "@/components/chat/ChatWidget";
import AuthProvider from "@/components/providers/AuthProvider";
import UtmTracker from "@/components/analytics/UtmTracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.santaan.in"),
  title: "Santaan - Where Science Meets Hope",
  description: "Experience the wonder of life with Santaan Fertility. Daily insights, myth-busting science, and compassionate care.",
  openGraph: {
    title: "Santaan - Where Science Meets Hope",
    description: "We demystify fertility through deeper scientific insights to bring you closer to joy.",
    url: 'https://santaan.in',
    siteName: 'Santaan Fertility',
    images: [
      {
        url: '/assets/hero-origin.png', // Fallback to hero image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Santaan Fertility",
    description: "Where Science Meets Hope.",
    images: ['/assets/hero-origin.png'],
  },
};

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

        <AuthProvider>
          <SmoothScrollProvider>
            <JourneyProvider>
              {children}
              <ChatWidget />
            </JourneyProvider>
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

