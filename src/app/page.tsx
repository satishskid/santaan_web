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
import { SantaanXplainer } from "@/components/sections/SantaanXplainer";
import { CareGap } from "@/components/sections/CareGap";
import AtHomeTesting from "@/components/sections/AtHomeTesting";
import { SuccessStories } from "@/components/sections/SuccessStories";
import { VideoTestimonials } from "@/components/sections/VideoTestimonials";
import { SocialCarousel } from "@/components/sections/SocialCarousel";
import { Doctors } from "@/components/sections/Doctors";
import { Locations } from "@/components/sections/Locations";
import { PractoBookingSection } from "@/components/sections/PractoBookingSection";
import { FAQ } from "@/components/sections/FAQ";
import { NewsAnnouncements } from "@/components/sections/NewsAnnouncements";
import Script from "next/script";
import { faqs } from "@/data/faqs";
import { SANTAAN_YOUTUBE_VIDEOS } from "@/data/youtubeVideos";
import { SOCIAL_CAMPAIGNS } from "@/data/socialCampaigns";
import { buildMetadata } from "@/lib/seo";
import { buildFaqSchema, buildLocalClinicSchemas, buildOrganizationSchema } from "@/lib/schema";
import { getSiteUrl } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Santaan IVF | IVF & Fertility Centres in Odisha & Bangalore",
  description:
    "Evidence-driven fertility and IVF care in Bhubaneswar, Berhampur and Bangalore with advanced diagnostics, compassionate specialists, and personalized treatment pathways.",
  path: "/",
  keywords: [
    "ivf centre in bhubaneswar",
    "ivf clinic in berhampur",
    "fertility centre in bangalore",
    "male infertility clinic",
    "pcos fertility treatment",
  ],
});

export default function Home() {
  const faqSchema = buildFaqSchema(faqs);
  const organizationSchema = buildOrganizationSchema();
  const localClinicSchemas = buildLocalClinicSchemas();
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Santaan IVF",
    url: getSiteUrl(),
  };

  return (
    <main id="main-content" className="min-h-screen bg-santaan-cream">
      <Script
        id="santaan-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="santaan-organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="santaan-website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="santaan-local-clinics-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localClinicSchemas) }}
      />

      <Header />
      <Hero />
      
      {/* 1. Build Trust First - Social Proof */}
      <SuccessStories />
      <VideoTestimonials items={SANTAAN_YOUTUBE_VIDEOS} />
      <SocialCarousel
        items={SOCIAL_CAMPAIGNS}
        heading="Campaign highlights"
        description="Fertility awareness, IVF guidance and Santaan milestones—built for clarity, not confusion."
      />
      <Awards />
      <NewsAnnouncements />
      
      {/* 2. Address Confusion - Problem Awareness */}
      <MythBusting />
      <SantaanXplainer />
      
      {/* 3. Engage & Assess - Interactive Call-to-Action */}
      <FertilityReadinessAssessment />
      <FertilityJourneyMap />
      <PractoBookingSection />
      
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
