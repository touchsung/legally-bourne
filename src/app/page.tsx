import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { WhatYouGetSection } from "@/components/sections/what-you-get-section";
import { WhoThisIsForSection } from "@/components/sections/who-this-is-for-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FeaturesDeepDiveSection } from "@/components/sections/features-deep-dive-section";
import { PricingPlanSection } from "@/components/sections/pricing-plan-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <WhatYouGetSection />
      <WhoThisIsForSection />
      <TestimonialsSection />
      <FeaturesDeepDiveSection />
      <PricingPlanSection />
      <FinalCtaSection />
      <Footer />
    </div>
  );
}
