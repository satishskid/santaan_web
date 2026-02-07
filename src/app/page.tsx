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
      <Awards />
      <CareGap />
      <SantaanLab />
      <SuccessStories />
      <Doctors />
      <Locations />
      <WonderOfLife />
      <MythBusting />
      <Insights />
      <SantaanSignal />
      <AssessmentCallback />
      <FAQ />
      <Footer />
    </main>
  );
}
