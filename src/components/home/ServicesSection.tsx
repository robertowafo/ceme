import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

const services = [
  {
    num: 'I.', title: 'Parole de Grâce', sub: 'Enseignements · Sermons',
    // croix
    icon: <path d="M28 6 V50 M14 22 H42" />,
  },
  {
    num: 'II.', title: 'École des Affaires', sub: 'Business · Leadership · Finance',
    // étoile
    icon: <path d="M28 6 L34 22 L51 22 L37 33 L42 50 L28 39 L14 50 L19 33 L5 22 L22 22 Z" />,
  },
  {
    num: 'III.', title: 'Impact Jeunesse', sub: '15-25 ans · Formation · Mission',
    // flamme
    icon: <path d="M28 6 C32 18 44 22 38 38 C36 46 30 50 28 50 C26 50 18 46 18 36 C18 28 26 24 28 6 Z" />,
  },
];

export function ServicesSection() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from('.service-card', {
        y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.services-grid', start: 'top 80%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative text-white py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/uploads/fonds-bleu.jpg')" }} />
      <div className="absolute inset-0 bg-grace-blue-deep/55" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">Programmes</span>
        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold max-w-2xl leading-tight mb-14 text-white">
          Découvrez nos émissions <span className="text-grace-orange italic">emblématiques.</span>
        </h2>

        <div className="services-grid grid md:grid-cols-3 gap-px bg-white/10 rounded-3xl overflow-hidden">
          {services.map((s) => (
            <div
              key={s.title}
              className="service-card group relative bg-grace-blue p-8 sm:p-10 min-h-[300px] flex flex-col justify-between overflow-hidden transition-colors"
            >
              {/* Fond or qui glisse au hover */}
              <span className="absolute inset-0 bg-grace-orange scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
              <div className="relative z-10 flex items-start justify-between">
                <span className="font-serif text-grace-orange group-hover:text-soft-black text-2xl font-extrabold transition-colors">{s.num}</span>
                <svg className="draw-icon w-12 h-12" viewBox="0 0 56 56" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <g className="text-grace-orange group-hover:text-soft-black transition-colors">{s.icon}</g>
                </svg>
              </div>
              <div className="relative z-10">
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white group-hover:text-soft-black transition-colors">{s.title}</h3>
                <p className="font-sans text-sm text-white/55 group-hover:text-soft-black/70 transition-colors mt-2">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
