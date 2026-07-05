import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gsap } from '../../lib/gsap';

const ALL_IMAGES = [
  '/uploads/externe.JPG', '/uploads/sermons.jpeg', '/uploads/louange et adoration.png',
  '/uploads/impact jeunesse.png', '/uploads/priere.jpeg', '/uploads/fonde en.jpeg',
  '/uploads/mama marie.jpeg', '/uploads/reverand_essomba.png',
  '/uploads/impact jeunesse.JPG', '/uploads/louange et adoration.JPG',
  '/uploads/DSC_0561.JPG', '/uploads/DSC_0586.JPG', '/uploads/DSC_0611.JPG',
  '/uploads/DSC_0954.JPG', '/uploads/DSC_1003.JPG', '/uploads/DSC_1013.JPG',
  '/uploads/DSC_1025.JPG', '/uploads/DSC_1026.JPG', '/uploads/DSC_1052.JPG',
  '/uploads/DSC_9473.JPG', '/uploads/DSC_9474.JPG', '/uploads/DSC_9475.JPG',
  '/uploads/DSC_9488.JPG', '/uploads/DSC_9556.JPG', '/uploads/DSC_9622.JPG',
  '/uploads/DSC_9661.JPG', '/uploads/DSC_9672.JPG', '/uploads/DSC_9804.JPG',
  '/uploads/DSC_9875.JPG', '/uploads/IMG_5918.JPG', '/uploads/IMG_5920.JPG',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.08 (1).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.08 (2).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.08.jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.09 (1).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.09 (2).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.09 (3).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.09 (4).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.09.jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.10 (1).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.10 (2).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.10 (3).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.10 (4).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.10.jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.11 (1).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.11 (2).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.09.11.jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.54 (1).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.54.jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.55 (1).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.55 (2).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.55 (3).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.55.jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.56 (1).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.56 (2).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.56 (3).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.56 (4).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.56 (5).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.56.jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.57 (1).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.57 (2).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.57 (3).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.57 (4).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.57.jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.58 (1).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.58 (2).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.58 (3).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.58 (4).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.58 (5).jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.58.jpeg',
  '/uploads/WhatsApp Image 2026-07-02 at 23.10.59.jpeg',
];

/* Répartit les images en N lots à peu près égaux pour former N rangées distinctes */
function splitInto<T>(arr: T[], n: number): T[][] {
  const rows: T[][] = Array.from({ length: n }, () => []);
  arr.forEach((item, i) => rows[i % n].push(item));
  return rows;
}

const ROWS = splitInto(ALL_IMAGES, 3);

function Row({ list, duration, reverse }: { list: string[]; duration: number; reverse?: boolean }) {
  // Contenu dupliqué exactement x2 pour un bouclage CSS sans coupure (translateX -50%)
  const doubled = [...list, ...list];
  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-5 w-max"
        style={{
          animation: `marquee-x ${duration}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {doubled.map((src, i) => (
          <div key={i} className="w-64 sm:w-80 aspect-[4/3] shrink-0 rounded-2xl overflow-hidden">
            <img src={src} alt="" aria-hidden className="w-full h-full object-cover opacity-90" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CtaShowcase() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from('.cta-center > *', {
        y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: '.cta-center', start: 'top 80%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-grace-blue-deep min-h-[95vh] flex items-center py-24">
      {/* Mosaïque continue, en mouvement permanent */}
      <div className="absolute inset-0 flex flex-col justify-center gap-5" style={{ transform: 'rotate(-14deg) scale(1.5)' }}>
        <Row list={ROWS[0]} duration={110} />
        <Row list={ROWS[1]} duration={90} reverse />
        <Row list={ROWS[2]} duration={130} />
      </div>
      <div className="absolute inset-0 bg-grace-blue-deep/45" />

      {/* CTA central */}
      <div className="cta-center relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center text-white">
        <span className="inline-block text-grace-orange text-2xl mb-4">✦</span>
        <p className="text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-5">CEME Church</p>
        <h2 className="font-serif text-4xl sm:text-6xl font-extrabold leading-tight mb-6 text-white">
          Prêt pour la <span className="text-grace-orange italic">Grâce</span> ?
        </h2>
        <p className="font-sans text-white/70 text-lg mb-9">Laissons-la entrer dans ta vie.</p>
        <Link
          to="/eglise"
          className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors"
        >
          Nous rejoindre <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
