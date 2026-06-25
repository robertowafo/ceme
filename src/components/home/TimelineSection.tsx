import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

const milestones = [
  { year: '2001', label: 'Fondation de la CEME', detail: 'Chapelle de l’Éternel Mon Étendard — Décret du 5 janvier 2001, Yaoundé.' },
  { year: '2011', label: 'Naissance de Grâce TV', detail: 'Lancement de la chaîne le 14 mars 2011, sous l’impulsion du Rev. Dr Alphonse ESSOMBA BOUNOUGOU.' },
  { year: '2015', label: 'Immatriculation officielle', detail: 'Enregistrement au RCCM RC/YAO/2015/A/320 le 16 janvier 2015.' },
  { year: "Aujourd'hui", label: 'Diffusion sans frontières', detail: 'Émission 24h/24 sur YouTube, le web et le câble à Yaoundé et Douala.' },
];

export function TimelineSection() {
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to('.timeline-fill', {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.timeline-track', start: 'top 70%', end: 'bottom 80%', scrub: 0.8 },
      });
      gsap.utils.toArray<HTMLElement>('.timeline-row').forEach((row) => {
        gsap.from(row, {
          opacity: 0, x: -30, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: row, start: 'top 82%' },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-soft-black text-white py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="block text-gold text-xs font-semibold uppercase tracking-[0.2em] mb-4">Notre parcours</span>
        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold leading-tight mb-16">
          L'excellence, fruit d'une <span className="text-gold italic">obéissance constante.</span>
        </h2>

        <div className="timeline-track relative pl-10">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/15">
            <div className="timeline-fill absolute inset-0 bg-gold origin-top" style={{ transform: 'scaleY(0)' }} />
          </div>
          <div className="space-y-12">
            {milestones.map((m) => (
              <div key={m.year} className="timeline-row relative">
                <span className="absolute -left-10 top-1.5 w-4 h-4 rounded-full bg-gold ring-4 ring-soft-black" />
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-5">
                  <span className="font-serif text-gold text-2xl font-extrabold shrink-0 w-32">{m.year}</span>
                  <div>
                    <h3 className="font-serif text-xl font-extrabold">{m.label}</h3>
                    <p className="font-sans text-white/60 text-sm leading-relaxed mt-1">{m.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
