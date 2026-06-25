import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

const projects = [
  { tag: 'Rassemblement', sub: 'Événement phare', title: "Sommet d'Élévation", img: '/uploads/impact jeunesse.png',
    desc: "Un grand rassemblement d'élévation spirituelle, de délivrance et d'enseignement pour faire passer chaque vie à un niveau supérieur." },
  { tag: 'Enseignement', sub: 'Business & leadership', title: 'École des Affaires du Royaume', img: '/uploads/fonde en.jpeg',
    desc: "Libérer la sagesse entrepreneuriale divine et former des croyants qui impactent le monde des affaires avec intégrité." },
  { tag: 'Quotidien', sub: 'Édification matinale', title: 'Manne Matinale', img: '/uploads/sermons.jpeg',
    desc: "Le rendez-vous quotidien pour commencer la journée nourri de la Parole de Dieu, où que vous soyez." },
  { tag: 'Intercession', sub: 'Combat spirituel', title: 'Prières Intercession', img: '/uploads/priere.jpeg',
    desc: "Des temps d'intercession intenses où l'Éternel intervient dans les situations impossibles." },
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
    <section ref={root} className="bg-grace-blue-deep text-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">Archives</span>
        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold max-w-3xl leading-tight text-white">
          Nos grandes émissions et <span className="text-grace-orange italic">moments de transformation.</span>
        </h2>
      </div>

      <div className="project-list-wrapper max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {projects.map((p, i) => (
          <div key={p.title} className="projects-sticky sticky" style={{ top: `${90 + i * 18}px`, transformOrigin: 'center top' }}>
            <div className="relative grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/10 bg-grace-blue mb-8 shadow-2xl">
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px]">
                <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-grace-blue via-transparent to-transparent" />
              </div>
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <span className="text-grace-orange text-[11px] font-semibold uppercase tracking-[0.2em]">{p.tag}</span>
                <span className="font-sans text-white/50 text-sm mt-3">{p.sub}</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold mt-1 mb-4 text-white">{p.title}</h3>
                <p className="font-sans text-white/65 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
