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

/*
 * Arc geometry: pivot is placed BELOW the visible container (like the bottom of a Ferris wheel).
 * Only the upper arc is visible — cards fan around the center text.
 *
 * Pivot at y = CONTAINER_H + PIVOT_BELOW (i.e. below the visible area).
 * Card center = (pivot_x + R·sin θ, pivot_y - R·cos θ).
 */
const ANGLES_DEG : number[] = [-55, -33, -11, 11, 33, 55];
const R           = 460;
const CARD_W      = 155;
const CARD_H      = 195;
const CONTAINER_H = 540;   // visible arc container height
const PIVOT_BELOW = 50;    // how far below the container the pivot sits
const PIVOT_Y     = CONTAINER_H + PIVOT_BELOW;  // 590 from top of container

/* Pre-compute card positions */
const cardPositions = ANGLES_DEG.map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    left: Math.sin(rad) * R,                     // offset from horizontal center
    top : PIVOT_Y - Math.cos(rad) * R - CARD_H / 2, // distance from container top
    rot : deg * 0.48,                            // gentle tilt following arc tangent
  };
});

/* Center text block sits at this y position inside the container */
const TEXT_TOP = 310;

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

  /* ── Entry ScrollTrigger ── */
  useEffect(() => {
    if (isMobile) return;
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(cardRefs.current.filter(Boolean), {
        scale: 0.75, opacity: 0, y: 50,
        duration: 0.8, stagger: 0.09, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: el, start: 'top 78%' },
      });
    }, el);
    return () => ctx.revert();
  }, [isMobile]);

  /* ── Hover ── */
  const handleEnter = (i: number) => {
    if (isMobile) return;
    cardRefs.current.forEach((c, j) => {
      if (!c) return;
      if (j === i) {
        gsap.to(c, {
          y: -20, scale: 1.09,
          boxShadow: `0 28px 56px rgba(242,101,34,0.42), 0 0 0 2.5px rgba(242,101,34,0.75)`,
          duration: 0.42, ease: 'back.out(1.6)',
        });
        gsap.to(c.querySelector('.icon-wrap'), {
          scale: 1.12, backgroundColor: programs[i].color,
          duration: 0.28, ease: 'power2.out',
        });
        gsap.to(c.querySelector('.icon-svg'), { color: '#fff', duration: 0.25 });
      } else {
        gsap.to(c, { scale: 0.93, opacity: 0.38, duration: 0.32, ease: 'power2.out' });
      }
    });
  };

  const handleLeave = () => {
    if (isMobile) return;
    cardRefs.current.forEach((c, i) => {
      if (!c) return;
      gsap.to(c, {
        y: 0, scale: 1, opacity: 1,
        boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
        duration: 0.5, ease: 'power3.inOut',
      });
      gsap.to(c.querySelector('.icon-wrap'), {
        scale: 1, backgroundColor: `${programs[i].color}18`,
        duration: 0.32, ease: 'power2.inOut',
      });
      gsap.to(c.querySelector('.icon-svg'), { color: programs[i].color, duration: 0.28 });
    });
  };

  /* ─── MOBILE fallback ─── */
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

  /* ─── DESKTOP: Ferris-wheel arc ─── */
  return (
    <section ref={sectionRef} className="bg-gray-50 overflow-hidden">
      {/* Arc container — fixed height, overflow hidden to clip bottom of arc */}
      <div
        className="relative mx-auto overflow-hidden"
        style={{ maxWidth: 1000, height: CONTAINER_H }}
      >
        {/* 6 cards along the arc */}
        {programs.map((p, i) => {
          const { left, top, rot } = cardPositions[i];
          return (
            <div
              key={p.title}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute bg-white rounded-2xl p-6 cursor-pointer"
              style={{
                width : CARD_W,
                height: CARD_H,
                left  : `calc(50% + ${left}px - ${CARD_W / 2}px)`,
                top   : `${top}px`,
                transform     : `rotate(${rot}deg)`,
                boxShadow     : '0 4px 24px rgba(0,0,0,0.09)',
                willChange    : 'transform, box-shadow, opacity',
                transformOrigin: 'center center',
                zIndex: 10 - Math.round(Math.abs(i - 2.5) * 2),
              }}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
            >
              <div
                className="icon-wrap w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${p.color}18` }}
              >
                <p.icon className="icon-svg w-5 h-5" style={{ color: p.color }} strokeWidth={1.7} />
              </div>
              <h3 className="font-serif text-sm font-bold text-gray-900 leading-snug mb-2">{p.title}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">{p.sub}</p>
            </div>
          );
        })}

        {/* Centre text — sits inside the arc bowl */}
        <div
          className="absolute left-0 right-0 text-center pointer-events-none"
          style={{ top: TEXT_TOP }}
        >
          <span className="text-grace-orange text-[10px] font-bold uppercase tracking-[0.22em] mb-3 block">
            Programmes
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Découvrez nos émissions<br />
            <span className="text-grace-orange italic">emblématiques.</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            Grâce TV diffuse partout, en continu — pour nourrir,<br />élever et transformer chaque vie.
          </p>
        </div>
      </div>
    </section>
  );
}
