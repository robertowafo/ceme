import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowDown } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText } from '../../lib/gsap';

export function Hero() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      // Parallax image
      gsap.to('.banner-image', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: el, scrub: 2, start: 'top top', end: 'bottom top' },
      });

      // Reveal titre ligne par ligne (SplitText)
      const split = new SplitText('.hero-heading', { type: 'lines' });
      gsap.set('.hero-heading', { opacity: 1 });
      gsap.from(split.lines, {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.2,
      });

      // Fade-up des éléments secondaires
      gsap.from('.hero-fade', {
        y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out', delay: 0.7,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative h-screen min-h-[640px] overflow-hidden bg-grace-blue-deep text-white">
      {/* Image plein écran + parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/uploads/externe.JPG"
          alt="Rassemblement à la Chapelle de l'Éternel Mon Étendard, Yaoundé"
          className="banner-image absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scale(1.15)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-grace-blue-deep via-grace-blue-deep/75 to-grace-blue-deep/40" />
        <div className="absolute inset-0 cross-pattern-dark opacity-30" />
      </div>

      {/* Contenu */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <span className="hero-fade text-grace-orange text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-6">
          L'Éternel est ma bannière — Exode 17:15
        </span>

        <h1 className="hero-heading font-serif font-extrabold leading-[0.98] text-5xl sm:text-7xl lg:text-8xl max-w-4xl text-white" style={{ opacity: 0 }}>
          La Bonne Nouvelle,<br />
          <span className="text-grace-orange italic">partout, partout…</span>
        </h1>

        <p className="hero-fade font-sans text-white/75 text-base sm:text-lg max-w-xl mt-7 leading-relaxed">
          Grâce TV — votre chaîne de foi, d'espoir et d'amour, diffusant 24h/24 la Parole qui
          transforme les vies, portée par la Chapelle de l'Éternel Mon Étendard.
        </p>

        <div className="hero-fade flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            to="/live"
            className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 bg-grace-orange text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider"
          >
            <Play className="w-4 h-4 fill-white relative z-10" />
            <span className="relative z-10">Regarder en direct</span>
            <span className="absolute inset-0 bg-grace-orange-dark scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          </Link>
          <Link
            to="/eglise/cultes"
            className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-grace-orange hover:text-grace-orange text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors"
          >
            Nous rejoindre ce dimanche
          </Link>
        </div>
      </div>

      {/* Badge */}
      <div className="hero-fade absolute bottom-8 right-4 sm:right-8 text-right">
        <p className="font-serif text-grace-orange text-2xl font-extrabold leading-none">2011</p>
        <p className="text-white/50 text-[10px] uppercase tracking-widest mt-1">Grâce TV · Yaoundé</p>
      </div>

      {/* Scroll indicator */}
      <div className="hero-fade absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-[10px] uppercase tracking-[0.2em]">Découvrir</span>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}
