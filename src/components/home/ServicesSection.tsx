import { useEffect, useRef } from 'react';
import { Church, Sunrise, Sparkles, Briefcase, HandHeart, Quote } from 'lucide-react';
import { gsap } from '../../lib/gsap';

const programs = [
  { icon: Church,     title: 'Culte du Dimanche',                 sub: 'Célébration · Adoration · Parole',               num: '01' },
  { icon: Sunrise,    title: 'Manne Matinale',                    sub: 'Édification quotidienne dans la Parole',          num: '02' },
  { icon: Sparkles,   title: "Sommet d'Élévation",                sub: "Grand rassemblement d'élévation spirituelle",     num: '03' },
  { icon: Briefcase,  title: 'École des Affaires du Royaume',     sub: 'Leadership · Entreprise · Principes bibliques',   num: '04' },
  { icon: HandHeart,  title: 'Prières Intercession',              sub: 'Intercession et combat spirituel',                num: '05' },
  { icon: Quote,      title: 'Témoignage pour la Gloire de Dieu', sub: 'Des vies transformées qui rendent gloire',        num: '06' },
];

/* Z-offsets so cards feel staggered in depth */
const zOffsets = [0, 8, 4, 12, 6, 2];

export function ServicesSection() {
  const root      = useRef<HTMLElement | null>(null);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Entry animation ── */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from('.program-card', {
        y: 60, opacity: 0, scale: 0.94,
        duration: 0.75, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.programs-grid', start: 'top 80%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  /* ── Hover interactions (GSAP, not CSS) ── */
  const handleEnter = (i: number) => {
    const cards = cardRefs.current;
    cards.forEach((c, j) => {
      if (!c) return;
      if (j === i) {
        /* Active card: lift, scale, glow */
        gsap.to(c, {
          y: -18, scale: 1.06, zIndex: 20,
          boxShadow: '0 32px 64px rgba(242,101,34,0.45), 0 0 0 2px rgba(242,101,34,0.7)',
          duration: 0.45, ease: 'back.out(1.5)',
        });
        /* Orange left bar */
        gsap.to(c.querySelector('.bar'), { scaleY: 1, duration: 0.3, ease: 'power2.out' });
        /* Icon badge */
        gsap.to(c.querySelector('.icon-badge'), {
          backgroundColor: 'rgba(242,101,34,0.35)', scale: 1.1,
          duration: 0.3, ease: 'power2.out',
        });
        /* Number fade out */
        gsap.to(c.querySelector('.card-num'), { opacity: 0, duration: 0.2 });
      } else {
        /* Sibling cards: push down, dim */
        gsap.to(c, {
          y: 10, scale: 0.96, opacity: 0.45, zIndex: 1,
          boxShadow: 'none',
          duration: 0.4, ease: 'power2.out',
        });
      }
    });
  };

  const handleLeave = () => {
    cardRefs.current.forEach((c) => {
      if (!c) return;
      gsap.to(c, {
        y: 0, scale: 1, opacity: 1, zIndex: 1,
        boxShadow: 'none',
        duration: 0.55, ease: 'power3.inOut',
      });
      gsap.to(c.querySelector('.bar'), { scaleY: 0, duration: 0.25, ease: 'power2.in' });
      gsap.to(c.querySelector('.icon-badge'), {
        backgroundColor: 'rgba(242,101,34,0.15)', scale: 1,
        duration: 0.3, ease: 'power2.in',
      });
      gsap.to(c.querySelector('.card-num'), { opacity: 1, duration: 0.3 });
    });
  };

  return (
    <section ref={root} className="relative text-white py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/uploads/fonds-bleu.jpg')" }} />
      <div className="absolute inset-0 bg-grace-blue-deep/60" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
          Programmes
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold max-w-2xl leading-tight mb-16 text-white">
          Découvrez nos émissions{' '}
          <span className="text-grace-orange italic">emblématiques.</span>
        </h2>

        {/* Cards grid */}
        <div className="programs-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p, i) => (
            <div
              key={p.title}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="program-card relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex flex-col justify-between cursor-pointer"
              style={{
                minHeight: 220,
                transformStyle: 'preserve-3d',
                willChange: 'transform, box-shadow, opacity',
                transform: `translateZ(${zOffsets[i]}px)`,
              }}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
              /* Mobile: tap = hover-in, second tap = leave */
              onTouchStart={() => handleEnter(i)}
              onTouchEnd={handleLeave}
            >
              {/* Orange left bar */}
              <span
                className="bar absolute left-0 top-0 bottom-0 w-[3px] bg-grace-orange origin-top"
                style={{ transform: 'scaleY(0)' }}
              />

              {/* Top row: icon + number */}
              <div className="flex items-start justify-between mb-6">
                <div
                  className="icon-badge w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(242,101,34,0.15)' }}
                >
                  <p.icon className="w-7 h-7 text-grace-orange" strokeWidth={1.6} />
                </div>
                <span
                  className="card-num font-mono text-4xl font-black text-white/10 select-none leading-none"
                >
                  {p.num}
                </span>
              </div>

              {/* Text */}
              <div>
                <h3 className="font-serif text-lg font-extrabold text-white leading-snug mb-2">
                  {p.title}
                </h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">{p.sub}</p>
              </div>

              {/* Subtle inner glow on hover (CSS-driven, cheap) */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(242,101,34,0.12) 0%, transparent 70%)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
