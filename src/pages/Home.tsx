import { Preloader } from '../components/home/Preloader';
import { Hero } from '../components/home/Hero';
import { AboutSection } from '../components/home/AboutSection';
import { ServicesSection } from '../components/home/ServicesSection';
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
      <Preloader />
      <Hero />
      <AboutSection />
      <ServicesSection />
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
