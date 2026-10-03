import React from 'react';
import Hero from '../components/Hero/Hero';
import Stats from '../components/Stats/Stats';
import HowItWorks from '../components/HowItWorks/HowItWorks';
/*import AICreationExperience from '../components/AICreationExperience/AICreationExperience';*/
import Templates from '../components/Templates/Templates';
/*import InvitationPreviewExperience from '../components/InvitationPreviewExperience/InvitationPreviewExperience';*/
import LanguagesSection from '../components/LanguagesSection/LanguagesSection';
/*import PricingSection from '../components/PricingSection/PricingSection';*/
import FAQ from '../components/FAQ/FAQ';
/*import CTASection from '../components/CTASection/CTASection';*/

export default function Home() {
  return (
    <div className="landing-page-flow">
      {/* 1. Hero with Interactive 3D Invitation & Opening Preview */}
      <Hero />

      {/* 2. Platform Trust Highlights */}
      <Stats />

      {/* 3. Interactive How It Works (5-Step Visual Transformation) */}
      <HowItWorks />

      {/* 4. Database-Driven Template Showcase (Live Supabase Carousel) */}
      <Templates />

      {/* 5. Multilingual & Cultural Heritage Showcase */}
      <LanguagesSection />

      {/* 7. Interactive FAQ Accordion */}
      <FAQ />

      
    </div>
  );
}