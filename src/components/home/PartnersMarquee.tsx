import { Cable } from 'lucide-react';

const partners = ['CREOLINK', 'Câblo Yaoundé', 'Câblo Douala', 'YouTube', 'Réseau de Grâce', 'Partenaires Médias'];

export function PartnersMarquee() {
  // doublé pour une boucle continue
  const items = [...partners, ...partners];
  return (
    <section className="bg-white py-10 border-b border-gray-100">
      <p className="text-center font-body text-xs uppercase tracking-[0.2em] text-grace-orange font-semibold mb-6">
        Ils nous accompagnent · Ils nous soutiennent
      </p>
      <div className="marquee-pause overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-12">
          {items.map((name, i) => (
            <div key={i} className="flex items-center gap-2.5 text-grace-dark/40 hover:text-grace-blue transition-colors shrink-0">
              <Cable className="w-5 h-5" />
              <span className="font-display text-xl font-bold whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
