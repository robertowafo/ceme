import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

const steps = [
  {
    num: 'I', title: 'Vous rencontrer', img: '/uploads/mama marie.jpeg',
    desc: "Comprendre qui vous êtes, votre parcours, vos questions. Pas de jugement — juste une oreille attentive et un cœur ouvert.",
  },
  {
    num: 'II', title: 'Vous enraciner', img: '/uploads/fonde en.jpeg',
    desc: "Des enseignements bibliques profonds, un accompagnement pastoral et une communauté qui vous soutient au quotidien.",
  },
  {
    num: 'III', title: 'Vous envoyer', img: '/uploads/impact jeunesse.png',
    desc: "Découvrir votre appel, exercer vos dons et impacter votre environnement avec l'amour inconditionnel de Jésus-Christ.",
  },
];

export function ProcessSection() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to('.process-line-fill', {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.process-track', start: 'top 70%', end: 'bottom 70%', scrub: 0.8 },
      });
      gsap.from('.process-step', {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.process-track', start: 'top 75%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="block text-burgundy text-xs font-semibold uppercase tracking-[0.2em] mb-4">Notre démarche</span>
        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-soft-black max-w-2xl leading-tight mb-16">
          Un chemin <span className="text-gold italic">transparent</span>, pensé pour vous accueillir.
        </h2>

        <div className="process-track relative pl-8 sm:pl-0">
          {/* Ligne verticale */}
          <div className="absolute left-2 sm:left-1/2 top-0 bottom-0 w-px bg-soft-black/10 sm:-translate-x-1/2">
            <div className="process-line-fill absolute inset-0 bg-gold origin-top" style={{ transform: 'scaleY(0)' }} />
          </div>

          <div className="space-y-16">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`process-step relative grid sm:grid-cols-2 gap-8 items-center ${i % 2 ? 'sm:[direction:rtl]' : ''}`}
              >
                <div className="[direction:ltr] sm:px-10">
                  <span className="font-serif text-gold text-5xl font-extrabold">{step.num}</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-soft-black mt-3 mb-3">{step.title}</h3>
                  <p className="font-sans text-soft-black/65 leading-relaxed max-w-md">{step.desc}</p>
                </div>
                <div className="[direction:ltr] relative rounded-3xl overflow-hidden aspect-[4/3] shadow-lg sm:mx-10">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
