import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

const projects = [
  { tag: 'Enseignement', sub: 'Parole de Grâce', title: 'École des Affaires du Royaume', img: '/uploads/fonde en.jpeg',
    desc: "Libérer la sagesse entrepreneuriale divine et former des croyants qui impactent le monde des affaires avec intégrité." },
  { tag: 'Jeunesse', sub: 'Impact Jeunesse', title: 'Star University', img: '/uploads/impact jeunesse.png',
    desc: "Académie d'excellence, de leadership et d'approfondissement doctrinal pour les 15-25 ans." },
  { tag: 'Famille', sub: 'Restauration', title: 'Foyer Béni', img: '/uploads/mama marie.jpeg',
    desc: "Un accompagnement des couples et des familles, transformés par la grâce de Dieu." },
  { tag: 'Intercession', sub: 'Nuit de Prières', title: 'Vigile Prophétique', img: '/uploads/priere.jpeg',
    desc: "Des nuits de prières intenses où l'Éternel intervient dans les situations impossibles." },
];

export function ProjectsStack() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.projects-sticky');
      const finalScale = [0.93, 0.96, 0.98, 1];
      gsap.timeline({
        scrollTrigger: { trigger: '.project-list-wrapper', start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      }).to(cards, { scale: (i) => finalScale[i] ?? 1, duration: 0.5 }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-soft-black text-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <span className="block text-gold text-xs font-semibold uppercase tracking-[0.2em] mb-4">Archives</span>
        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold max-w-3xl leading-tight">
          Nos grandes émissions et <span className="text-gold italic">moments de transformation.</span>
        </h2>
      </div>

      <div className="project-list-wrapper max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {projects.map((p, i) => (
          <div key={p.title} className="projects-sticky sticky" style={{ top: `${90 + i * 18}px`, transformOrigin: 'center top' }}>
            <div className="relative grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/10 bg-[#222] mb-8 shadow-2xl">
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px]">
                <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#222] via-transparent to-transparent" />
              </div>
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <span className="text-gold text-[11px] font-semibold uppercase tracking-[0.2em]">{p.tag}</span>
                <span className="font-sans text-white/50 text-sm mt-3">{p.sub}</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold mt-1 mb-4">{p.title}</h3>
                <p className="font-sans text-white/65 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
