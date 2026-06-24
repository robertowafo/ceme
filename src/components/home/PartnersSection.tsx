import { Link } from 'react-router-dom';
import { ArrowRight, Cable } from 'lucide-react';

// CREOLINK volontairement discret pour un début (cf. brief).
const partners = [
  { name: 'CREOLINK', role: 'Partenaire de diffusion' },
  { name: 'Câblo Yaoundé', role: 'Câblodistribution' },
  { name: 'Câblo Douala', role: 'Câblodistribution' },
];

export function PartnersSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-dark mb-3">
          Ils nous accompagnent
        </h2>
        <p className="font-body text-text-dark/60 mb-10 max-w-xl mx-auto">
          Grâce TV collabore avec des partenaires de diffusion pour porter la Bonne Nouvelle
          au Cameroun et au-delà.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-gray-soft px-6 py-7"
            >
              <Cable className="w-7 h-7 text-grace-sky" />
              <span className="font-display font-bold text-text-dark">{p.name}</span>
              <span className="font-body text-xs text-text-dark/50 uppercase tracking-wider">{p.role}</span>
            </div>
          ))}
        </div>

        <Link
          to="/partenaires"
          className="inline-flex items-center gap-2 mt-10 text-grace-blue font-display font-semibold text-sm uppercase tracking-wider hover:text-grace-orange transition-colors"
        >
          Voir tous nos partenaires <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
