import { useEffect, useRef } from 'react';
import { Church, Sunrise, Sparkles, Briefcase, HandHeart, Quote } from 'lucide-react';
import { gsap } from '../../lib/gsap';

const programs = [
  { icon: Church, title: 'Culte du Dimanche', sub: 'Célébration · Adoration · Parole' },
  { icon: Sunrise, title: 'Manne Matinale', sub: 'Édification quotidienne dans la Parole' },
  { icon: Sparkles, title: "Sommet d'Élévation", sub: "Grand rassemblement d'élévation spirituelle" },
  { icon: Briefcase, title: 'École des Affaires du Royaume', sub: 'Leadership · Entreprise · Principes bibliques' },
  { icon: HandHeart, title: 'Prières Intercession', sub: 'Intercession et combat spirituel' },
  { icon: Quote, title: 'Témoignage pour la Gloire de Dieu', sub: 'Des vies transformées qui rendent gloire' },
];

export function ServicesSection() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from('.program-card', {
        y: 50, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.programs-grid', start: 'top 82%' },
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

        <div className="programs-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((p) => (
            <div
              key={p.title}
              className="program-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7 min-h-[200px] flex flex-col justify-between hover:-translate-y-1.5 transition-transform duration-300"
            >
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-grace-orange scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
              <div className="w-12 h-12 rounded-xl bg-grace-orange/15 flex items-center justify-center">
                <p.icon className="w-6 h-6 text-grace-orange" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-extrabold text-white leading-tight">{p.title}</h3>
                <p className="font-sans text-sm text-white/55 mt-2">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
