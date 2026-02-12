import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { MythBusting } from "@/components/sections/MythBusting";
import { WonderOfLife } from "@/components/sections/WonderOfLife";
import { Insights } from "@/components/sections/Insights";
import { FertilityReadinessAssessment } from "@/components/sections/FertilityReadinessAssessment";
import { FertilityJourneyMap } from "@/components/sections/FertilityJourneyMap";
import { Awards } from "@/components/sections/Awards";
import { SantaanLab } from "@/components/sections/SantaanLab";
import { CareGap } from "@/components/sections/CareGap";
import AtHomeTesting from "@/components/sections/AtHomeTesting";
import { SuccessStories } from "@/components/sections/SuccessStories";
import { Doctors } from "@/components/sections/Doctors";
import { Locations } from "@/components/sections/Locations";
import { FAQ } from "@/components/sections/FAQ";
import { NewsAnnouncements } from "@/components/sections/NewsAnnouncements";
import Script from "next/script";
import { faqs } from "@/data/faqs";

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const clinicSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: "Santaan Fertility",
    url: "https://www.santaan.in",
    telephone: "+91 9337326896",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressRegion: "Odisha",
      addressLocality: "Bhubaneswar",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Santaan Fertility",
    url: "https://www.santaan.in",
  };

  return (
    <main id="main-content" className="min-h-screen bg-santaan-cream">
      <Script
        id="santaan-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="santaan-clinic-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
      />
      <Script
        id="santaan-website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <Header />
      <Hero />
      
      {/* 1. Build Trust First - Social Proof */}
      <SuccessStories />
      <Awards />
      <NewsAnnouncements />
      
      {/* 2. Address Confusion - Problem Awareness */}
      <MythBusting />
      
      {/* 3. Engage & Assess - Interactive Call-to-Action */}
      <FertilityReadinessAssessment />
      <FertilityJourneyMap />
      
      {/* 4. Educate - Knowledge Building */}
      <Insights />
      <WonderOfLife />
      
      {/* 5. Establish Credibility - Expertise & Infrastructure */}
      <CareGap />
      <AtHomeTesting />
      <SantaanLab />
      <Doctors />
      <Locations />
      
      {/* 6. Answer Concerns - Final Objection Handling */}
      <FAQ />
      
      <Footer />
    </main>
  );
}
