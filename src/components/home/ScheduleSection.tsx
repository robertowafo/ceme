import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { gsap } from '../../lib/gsap';

const cards = [
  {
    title: 'Culte du Dimanche', subtitle: 'Le rassemblement principal de la semaine.',
    day: 'Dimanche', time: '10h00', badge: 'Emombo Auberge, Yaoundé', highlight: false,
    features: ['Adoration et louange', 'Prédication de la Parole', 'Ministère de prière', 'Communion fraternelle', 'Accueil des nouveaux'],
    cta: 'Venir ce dimanche', to: '/eglise/cultes',
  },
  {
    title: 'Soirée de Prière', subtitle: "Une nuit d'intercession et de délivrance.",
    day: 'Vendredi', time: '19h00', badge: 'En direct · Grâce TV', highlight: true,
    features: ['Intercession prophétique', 'Prières de délivrance', 'Adoration profonde', 'Enseignement biblique', 'Diffusée sur Grâce TV'],
    cta: "Voir l'agenda complet", to: '/eglise/cultes',
  },
];

export function ScheduleSection() {
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from('.schedule-card', {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.schedule-grid', start: 'top 80%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-gray-soft py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">Rejoignez-nous</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-soft-black leading-tight">
            Des rendez-vous réguliers, <span className="text-grace-orange italic">ouverts à tous.</span>
          </h2>
        </div>

        <div className="schedule-grid grid md:grid-cols-2 gap-6">
          {cards.map((c) => (
            <div
              key={c.title}
              className={`schedule-card rounded-3xl p-8 sm:p-10 border ${
                c.highlight ? 'bg-grace-blue-deep text-white border-grace-orange/40' : 'bg-white text-soft-black border-soft-black/10'
              }`}
            >
              <h3 className={`font-serif text-2xl font-extrabold ${c.highlight ? 'text-white' : 'text-soft-black'}`}>{c.title}</h3>
              <p className={`font-sans text-sm mt-1 ${c.highlight ? 'text-white/60' : 'text-soft-black/55'}`}>{c.subtitle}</p>

              <div className="flex items-baseline gap-3 mt-6 mb-2">
                <span className="font-serif text-5xl font-extrabold text-grace-orange">{c.day}</span>
              </div>
              <p className={`font-sans text-sm uppercase tracking-widest ${c.highlight ? 'text-white/60' : 'text-soft-black/55'}`}>{c.time}</p>

              <ul className="space-y-3 mt-7">
                {c.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 font-sans text-sm">
                    <Check className="w-4 h-4 text-grace-orange shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <Link
                to={c.to}
                className="mt-8 inline-flex w-full items-center justify-center bg-grace-orange hover:bg-grace-orange-dark text-white px-6 py-3.5 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors"
              >
                {c.cta}
              </Link>
              <p className={`text-center text-[10px] uppercase tracking-widest mt-4 ${c.highlight ? 'text-white/40' : 'text-soft-black/40'}`}>
                {c.badge}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
