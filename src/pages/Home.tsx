import { Hero } from '../components/home/Hero';
import { LiveSection } from '../components/home/LiveSection';
import { ShowsGrid } from '../components/home/ShowsGrid';
import { WatchOptions } from '../components/home/WatchOptions';
import { AboutPreview } from '../components/home/AboutPreview';
import { ChurchBridge } from '../components/home/ChurchBridge';
import { PartnersSection } from '../components/home/PartnersSection';
import { DonateBanner } from '../components/home/DonateBanner';

export function Home() {
  return (
    <>
      <Hero />
      <LiveSection />
      <ShowsGrid />
      <WatchOptions />
      <AboutPreview />
      <ChurchBridge />
      <PartnersSection />
      <DonateBanner />
    </>
  );
}
