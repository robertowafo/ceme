import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useCountUp } from './useCountUp';

function Stat({ target, suffix = '', label, sub }: { target: number; suffix?: string; label: string; sub: string }) {
  const [value, ref] = useCountUp(target);
  return (
    <div ref={ref} className="text-center sm:text-left">
      <div className="font-serif text-5xl sm:text-6xl font-extrabold text-soft-black leading-none">
        {value}{suffix}
      </div>
      <p className="font-sans font-semibold text-soft-black mt-3">{label}</p>
      <p className="font-sans text-sm text-soft-black/55">{sub}</p>
    </div>
  );
}

const tickerItems = [
  'GRÂCE TV', 'CEME CHURCH', "L'ÉTERNEL MON ÉTENDARD", 'PAROLE DE GRÂCE',
  'IMPACT JEUNESSE', 'ÉCOLE DES AFFAIRES', 'VIGILE PROPHÉTIQUE',
];

export function AboutSection() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from('.about-reveal', {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 75%' },
      });
      gsap.from('.statement-line', {
        yPercent: 100, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.statement-text', start: 'top 80%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="about-reveal block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
          À propos
        </span>
        <h2 className="about-reveal font-serif text-3xl sm:text-5xl font-extrabold text-soft-black max-w-3xl leading-tight">
          L'excellence n'est pas un acte, <span className="text-grace-orange italic">c'est une habitude.</span>
        </h2>

        {/* Stats réelles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
          <Stat target={2001} label="Fondation de la CEME" sub="Décret du 5 janvier 2001" />
          <Stat target={2011} label="Lancement de Grâce TV" sub="Le 14 mars 2011, Yaoundé" />
          <Stat target={24} suffix="/7" label="Diffusion en continu" sub="Jour et nuit, sans interruption" />
          <Stat target={2} label="Villes câblées" sub="Yaoundé & Douala" />
        </div>

        {/* Grande déclaration */}
        <div className="statement-text mt-20 sm:mt-28 overflow-hidden">
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-soft-black leading-[1.1]">
            <span className="statement-line block">Nous croyons que les personnes</span>
            <span className="statement-line block">les plus <span className="text-grace-orange italic">transformées</span> sont celles</span>
            <span className="statement-line block">qui ont rencontré Jésus-Christ.</span>
          </h2>
        </div>
      </div>

      {/* Ticker marques internes */}
      <div className="marquee-pause overflow-hidden mt-20 border-y border-soft-black/10 py-6">
        <div className="animate-marquee flex w-max items-center gap-12">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="font-serif text-xl font-extrabold text-soft-black/30 whitespace-nowrap shrink-0">
              {t} <span className="text-grace-orange">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
