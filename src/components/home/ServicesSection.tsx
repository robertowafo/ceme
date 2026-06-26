import { useEffect, useRef, useState } from 'react';
import { Church, Sunrise, Sparkles, Briefcase, HandHeart, Quote } from 'lucide-react';
import { gsap } from '../../lib/gsap';

const programs = [
  { icon: Church,    title: 'Culte du Dimanche',                 sub: 'Célébration · Adoration · Parole',             color: '#1763B0' },
  { icon: Sunrise,   title: 'Manne Matinale',                    sub: 'Édification quotidienne dans la Parole',        color: '#F26522' },
  { icon: Sparkles,  title: "Sommet d'Élévation",                sub: "Grand rassemblement d'élévation spirituelle",   color: '#1763B0' },
  { icon: Briefcase, title: 'École des Affaires du Royaume',     sub: 'Leadership · Entreprise · Principes bibliques', color: '#F26522' },
  { icon: HandHeart, title: 'Prières Intercession',              sub: 'Intercession et combat spirituel',              color: '#1763B0' },
  { icon: Quote,     title: 'Témoignage pour la Gloire de Dieu', sub: 'Des vies transformées qui rendent gloire',      color: '#F26522' },
];

/* Arc geometry — 6 cards in a fan, angles from the vertical axis */
const ANGLES_DEG  = [-52, -31, -11, 11, 31, 52];
const R           = 290;  // arc radius in px
const CARD_W      = 158;
const CARD_H      = 205;

function toRad(d: number) { return (d * Math.PI) / 180; }

/* Pre-compute rest positions (transform strings applied to each card) */
const restPositions = ANGLES_DEG.map((a) => {
  const rad = toRad(a);
  const x   = Math.sin(rad) * R;         // horizontal offset from arc centre
  const y   = -Math.cos(rad) * R;        // vertical offset (negative = up)
  const rot = a * 0.45;                  // subtle tilt matching arc position
  return { x, y, rot };
});

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Entry animation */
  useEffect(() => {
    if (isMobile) return;
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(cardRefs.current.filter(Boolean), {
        scale: 0.7, opacity: 0, y: 60,
        duration: 0.75, stagger: 0.09, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: el, start: 'top 78%' },
      });
    }, el);
    return () => ctx.revert();
  }, [isMobile]);

  /* Hover: lift active, dim siblings */
  const handleEnter = (i: number) => {
    if (isMobile) return;
    cardRefs.current.forEach((c, j) => {
      if (!c) return;
      if (j === i) {
        gsap.to(c, {
          y: -22, scale: 1.1,
          boxShadow: `0 28px 56px rgba(242,101,34,0.40), 0 0 0 2.5px rgba(242,101,34,0.75)`,
          duration: 0.42, ease: 'back.out(1.5)',
        });
        gsap.to(c.querySelector('.icon-wrap'), {
          scale: 1.15, backgroundColor: programs[i].color,
          duration: 0.3, ease: 'power2.out',
        });
        gsap.to(c.querySelector('.icon-svg'), {
          color: '#fff', duration: 0.3,
        });
      } else {
        gsap.to(c, {
          scale: 0.93, opacity: 0.40,
          duration: 0.35, ease: 'power2.out',
        });
      }
    });
  };

  const handleLeave = () => {
    if (isMobile) return;
    cardRefs.current.forEach((c, i) => {
      if (!c) return;
      gsap.to(c, {
        y: 0, scale: 1, opacity: 1,
        boxShadow: '0 6px 28px rgba(0,0,0,0.09)',
        duration: 0.52, ease: 'power3.inOut',
      });
      gsap.to(c.querySelector('.icon-wrap'), {
        scale: 1, backgroundColor: `${programs[i].color}18`,
        duration: 0.35, ease: 'power2.inOut',
      });
      gsap.to(c.querySelector('.icon-svg'), {
        color: programs[i].color, duration: 0.3,
      });
    });
  };

  /* ─── MOBILE: simple 2-col grid ─── */
  if (isMobile) {
    return (
      <section ref={sectionRef} className="bg-gray-50 py-20 px-4">
        <div className="text-center mb-10">
          <span className="text-grace-orange text-xs font-bold uppercase tracking-widest mb-2 block">Programmes</span>
          <h2 className="font-serif text-3xl font-extrabold text-gray-900">
            Nos émissions <span className="text-grace-orange italic">emblématiques.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          {programs.map((p) => (
            <div key={p.title} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${p.color}18` }}>
                <p.icon className="w-5 h-5" style={{ color: p.color }} />
              </div>
              <h3 className="font-serif text-sm font-bold text-gray-900 leading-snug mb-1">{p.title}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">{p.sub}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ─── DESKTOP: fan arc layout ─── */
  // Pivot is at bottom of container. Highest card (angle≈0) sits at arcH - R from top.
  // arcH must be ≥ R + CARD_H/2 so cards don't overflow above.
  const arcH = R + Math.round(CARD_H / 2) + 30;

  return (
    <section ref={sectionRef} className="bg-gray-50 overflow-hidden py-16">
      <div className="max-w-6xl mx-auto px-4">

        {/* Arc container — cards positioned absolutely inside */}
        <div className="relative mx-auto" style={{ height: arcH, maxWidth: 920 }}>
          {programs.map((p, i) => {
            const { x, y, rot } = restPositions[i];
            return (
              <div
                key={p.title}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="absolute bg-white rounded-2xl p-6 cursor-pointer select-none"
                style={{
                  width:  CARD_W,
                  height: CARD_H,
                  /* Pivot at bottom of container → top = arcH + y - CARD_H/2 */
                  left: `calc(50% + ${x}px - ${CARD_W / 2}px)`,
                  top:  `${arcH + y - CARD_H / 2}px`,
                  transform: `rotate(${rot}deg)`,
                  boxShadow: '0 6px 28px rgba(0,0,0,0.09)',
                  willChange: 'transform, box-shadow, opacity',
                  zIndex: 10 - Math.round(Math.abs(i - 2.5) * 2),
                  transformOrigin: 'center center',
                }}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={handleLeave}
              >
                <div
                  className="icon-wrap w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${p.color}18` }}
                >
                  <p.icon
                    className="icon-svg w-5 h-5"
                    style={{ color: p.color }}
                    strokeWidth={1.7}
                  />
                </div>
                <h3 className="font-serif text-sm font-bold text-gray-900 leading-snug mb-2">
                  {p.title}
                </h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">{p.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Title + subtitle centred below the arc */}
        <div className="text-center mt-2 max-w-2xl mx-auto">
          <span className="text-grace-orange text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
            Programmes
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            Découvrez nos émissions{' '}
            <span className="text-grace-orange italic">emblématiques.</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Grâce TV diffuse partout, en continu — pour nourrir, élever et transformer chaque vie.
          </p>
        </div>

      </div>
    </section>
  );
}
