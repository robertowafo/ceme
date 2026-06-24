import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

/**
 * Placeholder temporaire pour les pages Grâce TV en cours de construction
 * (Émissions, Comment nous regarder, Partenaires, À propos).
 * Remplacé par le contenu réel dans les phases suivantes.
 */
export function PagePlaceholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-grace-blue text-white flex items-center justify-center px-4 pt-32 pb-20">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-grace-orange/20 border border-grace-orange/30 flex items-center justify-center mx-auto mb-6">
          <Construction className="w-8 h-8 text-grace-orange" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">{title}</h1>
        {subtitle && <p className="text-white/70 leading-relaxed mb-8">{subtitle}</p>}
        <p className="text-grace-sky text-sm font-semibold uppercase tracking-widest mb-8">
          Page en cours de préparation
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white text-grace-blue px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-grace-orange hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
