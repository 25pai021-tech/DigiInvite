import React from 'react';
import Hero from '../components/Hero/Hero';
import Stats from '../components/Stats/Stats';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import AICreationExperience from '../components/AICreationExperience/AICreationExperience';
import Templates from '../components/Templates/Templates';
import InvitationPreviewExperience from '../components/InvitationPreviewExperience/InvitationPreviewExperience';
import LanguagesSection from '../components/LanguagesSection/LanguagesSection';
import PricingSection from '../components/PricingSection/PricingSection';
import FAQ from '../components/FAQ/FAQ';
import CTASection from '../components/CTASection/CTASection';

export default function Home() {
  return (
    <div className="landing-page-flow">
      {/* 1. Hero with Interactive 3D Invitation & Opening Preview */}
      <Hero />

      {/* 2. Platform Trust Highlights */}
      <Stats />

      {/* 3. Interactive How It Works (5-Step Visual Transformation) */}
      <HowItWorks />

      {/* 4. AI Creation Experience (Interactive Prompt Playground) */}
      <AICreationExperience />

      {/* 5. Database-Driven Template Showcase (Live Supabase Carousel) */}
      <Templates />

      {/* 6. Interactive Invitation Experience (3D Envelope Unfolding & Guest RSVP Demo) */}
      <InvitationPreviewExperience />

      {/* 7. Multilingual & Cultural Heritage Showcase */}
      <LanguagesSection />

      {/* 8. Transparent Pricing & Feature Comparison */}
      <PricingSection />

      {/* 9. Interactive FAQ Accordion */}
      <FAQ />

      {/* 10. Final Luxury Call-To-Action Banner */}
      <CTASection />
    </div>
  );
}