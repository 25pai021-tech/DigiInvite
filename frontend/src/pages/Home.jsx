import Hero         from '../components/Hero/Hero';
import Stats        from '../components/Stats/Stats';
import Features     from '../components/Features/Features';
import HowItWorks   from '../components/HowItWorks/HowItWorks';
import Templates    from '../components/Templates/Templates';
import Testimonials from '../components/Testimonials/Testimonials';
import FAQ          from '../components/FAQ/FAQ';
import BadgeStrip   from '../components/BadgeStrip/BadgeStrip';
import CTASection   from '../components/CTASection/CTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Templates />
      <Testimonials />
      <FAQ />
      <BadgeStrip />
      <CTASection />
    </>
  );
}