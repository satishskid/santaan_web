import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { MythBusting } from "@/components/sections/MythBusting";
import { WonderOfLife } from "@/components/sections/WonderOfLife";
import { Insights } from "@/components/sections/Insights";
import { SantaanSignal } from "@/components/sections/SantaanSignal";
import { AssessmentCallback } from "@/components/sections/AssessmentCallback";
import { Awards } from "@/components/sections/Awards";
import { SantaanLab } from "@/components/sections/SantaanLab";
import { CareGap } from "@/components/sections/CareGap";
import { SuccessStories } from "@/components/sections/SuccessStories";
import { Doctors } from "@/components/sections/Doctors";
import { Locations } from "@/components/sections/Locations";
import { FAQ } from "@/components/sections/FAQ";

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-santaan-cream">
      <Header />
      <Hero />
      
      {/* 1. Build Trust First - Social Proof */}
      <SuccessStories />
      <Awards />
      
      {/* 2. Address Confusion - Problem Awareness */}
      <MythBusting />
      
      {/* 3. Engage & Assess - Interactive Call-to-Action */}
      <SantaanSignal />
      <AssessmentCallback />
      
      {/* 4. Educate - Knowledge Building */}
      <Insights />
      <WonderOfLife />
      
      {/* 5. Establish Credibility - Expertise & Infrastructure */}
      <CareGap />
      <SantaanLab />
      <Doctors />
      <Locations />
      
      {/* 6. Answer Concerns - Final Objection Handling */}
      <FAQ />
      
      <Footer />
    </main>
  );
}
