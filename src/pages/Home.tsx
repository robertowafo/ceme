import { Hero } from '../components/home/Hero';
import { PartnersMarquee } from '../components/home/PartnersMarquee';
import { StatsBento } from '../components/home/StatsBento';
import { AboutPreview } from '../components/home/AboutPreview';
import { ShowsGrid } from '../components/home/ShowsGrid';
import { LiveSection } from '../components/home/LiveSection';
import { ValuesBento } from '../components/home/ValuesBento';
import { WatchOptions } from '../components/home/WatchOptions';
import { Testimonials } from '../components/home/Testimonials';
import { ChurchBridge } from '../components/home/ChurchBridge';
import { DonateBanner } from '../components/home/DonateBanner';

export function Home() {
  return (
    <>
      <Hero />
      <PartnersMarquee />
      <StatsBento />
      <AboutPreview />
      <ShowsGrid />
      <LiveSection />
      <ValuesBento />
      <WatchOptions />
      <Testimonials />
      <ChurchBridge />
      <DonateBanner />
    </>
  );
}
