import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gsap } from '../../lib/gsap';

const imgs = [
  '/uploads/externe.JPG', '/uploads/sermons.jpeg', '/uploads/louange et adoration.png',
  '/uploads/impact jeunesse.png', '/uploads/priere.jpeg', '/uploads/fonde en.jpeg',
  '/uploads/mama marie.jpeg', '/uploads/reverand_essomba.png',
];

function Row({ list, cls }: { list: string[]; cls: string }) {
  return (
    <div className={`flex gap-4 ${cls}`}>
      {list.map((src, i) => (
        <div key={i} className="w-56 sm:w-72 aspect-[4/3] shrink-0 rounded-2xl overflow-hidden">
          <img src={src} alt="" aria-hidden className="w-full h-full object-cover opacity-70" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

export function CtaShowcase() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-row-a', { x: '-8%' }, {
        x: '4%', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });
      gsap.fromTo('.cta-row-b', { x: '4%' }, {
        x: '-8%', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });
      gsap.from('.cta-center > *', {
        y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: '.cta-center', start: 'top 80%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-grace-blue-deep py-28 sm:py-40">
      {/* Grille inclinée */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 opacity-40" style={{ transform: 'rotate(-16deg) scale(1.4)' }}>
        <Row list={[...imgs, ...imgs]} cls="cta-row-a" />
        <Row list={[...imgs.slice(4), ...imgs, ...imgs.slice(0, 4)]} cls="cta-row-b" />
      </div>
      <div className="absolute inset-0 bg-grace-blue-deep/70" />

      {/* CTA central */}
      <div className="cta-center relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center text-white">
        <span className="inline-block text-grace-orange text-2xl mb-4">✦</span>
        <p className="text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-5">CEME Church</p>
        <h2 className="font-serif text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
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
