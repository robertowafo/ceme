import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center bg-grace-blue-deep px-6 py-24 text-center">
      {/* Hissé dans <head> par React 19 : on ne veut pas indexer les URL inconnues. */}
      <title>Page introuvable — Grâce TV</title>
      <meta name="robots" content="noindex" />
      <div className="max-w-md">
        <p className="font-serif font-black text-7xl text-grace-orange mb-4" aria-hidden="true">404</p>
        <h1 className="font-serif font-extrabold text-3xl text-white mb-3">Page introuvable</h1>
        <p className="text-white/70 mb-8">
          Le lien que vous avez suivi n'existe plus ou a été déplacé.
        </p>
        <Link
          to="/"
          className="inline-block bg-grace-orange hover:bg-grace-orange-dark text-white font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </section>
  );
}
