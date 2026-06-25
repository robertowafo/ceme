import { SEO } from '../components/SEO';
import { tvStationSchema, webSiteSchema } from '../lib/structuredData';
import { Preloader } from '../components/home/Preloader';
import { Hero } from '../components/home/Hero';
import { AboutSection } from '../components/home/AboutSection';
import { ServicesSection } from '../components/home/ServicesSection';
import { PartnersBand } from '../components/home/PartnersBand';
import { ProcessSection } from '../components/home/ProcessSection';
import { ProjectsStack } from '../components/home/ProjectsStack';
import { ScheduleSection } from '../components/home/ScheduleSection';
import { TimelineSection } from '../components/home/TimelineSection';
import { Testimonials } from '../components/home/Testimonials';
import { FaqSection } from '../components/home/FaqSection';
import { CtaShowcase } from '../components/home/CtaShowcase';

export function Home() {
  return (
    <>
      <SEO
        title="Grâce TV — La Bonne Nouvelle Partout Partout"
        description="Chaîne de télévision chrétienne basée à Yaoundé. Diffusion 24/7 de cultes, sermons, études bibliques, musique chrétienne et programmes d'évangélisation."
        path="/"
        structuredData={[tvStationSchema, webSiteSchema]}
      />
      <Preloader />
      <Hero />
      <AboutSection />
      <ServicesSection />
      <PartnersBand />
      <ProcessSection />
      <ProjectsStack />
      <ScheduleSection />
      <TimelineSection />
      <Testimonials />
      <FaqSection />
      <CtaShowcase />
    </>
  );
}
