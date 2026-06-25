import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, Radio, ArrowRight } from 'lucide-react';
import { gsap } from '../../lib/gsap';

const points = [
  { icon: Globe, title: 'Une portée sans frontières', desc: "Au-delà de Yaoundé et Douala, Grâce TV rejoint les nations via le web, YouTube et le satellite — partout, partout." },
  { icon: Share2, title: 'Des voix partenaires', desc: "La chaîne diffuse aussi les enseignements de pasteurs et ministères partenaires, pour une Bonne Nouvelle partagée." },
  { icon: Radio, title: 'Une diffusion 24h/24', desc: "Cultes, prières, enseignements et musique chrétienne se succèdent jour et nuit, sans interruption." },
];

export function PartnersBand() {
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from('.partner-point', {
        y: 40, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: '.partner-grid', start: 'top 82%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">Partenaires & diffusion</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-soft-black leading-tight">
            Une Bonne Nouvelle partagée, <span className="text-grace-orange italic">partout.</span>
          </h2>
        </div>

        <div className="partner-grid grid sm:grid-cols-3 gap-6">
          {points.map((p) => (
            <div key={p.title} className="partner-point rounded-2xl border border-grace-blue/10 bg-gray-soft p-7">
              <div className="w-12 h-12 rounded-xl bg-grace-blue/10 flex items-center justify-center mb-5">
                <p.icon className="w-6 h-6 text-grace-blue" />
              </div>
              <h3 className="font-serif text-xl font-extrabold text-soft-black mb-2">{p.title}</h3>
              <p className="font-sans text-sm text-soft-black/65 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/partenaires"
            className="inline-flex items-center gap-2 bg-grace-blue hover:bg-grace-blue-deep text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors"
          >
            Découvrir nos partenaires <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
