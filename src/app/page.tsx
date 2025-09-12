import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { WhoThisIsForSection } from "@/components/sections/who-this-is-for-section";
import { WhatYouGetSection } from "@/components/sections/what-you-get-section";
import { TrustIndicatorsSection } from "@/components/sections/trust-indicators-section";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <WhoThisIsForSection />
      <WhatYouGetSection />
      <TrustIndicatorsSection />
      <Footer />
    </div>
  );
}
