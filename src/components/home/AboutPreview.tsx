import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function AboutPreview() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-grace-orange">
          Notre mission
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-dark mt-2 mb-6">
          Une voix chrétienne qui rejoint les nations
        </h2>
        <div className="font-body text-text-dark/75 leading-relaxed space-y-4 text-left sm:text-center">
          <p>
            Créée le 14 mars 2011 à Yaoundé par le Rev. Dr Alphonse ESSOMBA BOUNOUGOU,
            <strong> Grâce TV</strong> est une chaîne de télévision chrétienne dédiée à la
            diffusion fidèle de l'Évangile.
          </p>
          <p>
            Jour et nuit, nous portons des cultes, des prières, des enseignements bibliques,
            de la musique chrétienne et des programmes d'évangélisation — afin que la Bonne
            Nouvelle atteigne chaque foyer, partout, partout.
          </p>
        </div>
        <Link
          to="/a-propos"
          className="inline-flex items-center gap-2 mt-8 bg-grace-blue hover:bg-grace-blue-deep text-white px-7 py-3.5 rounded-full font-display font-semibold text-sm uppercase tracking-wider transition-colors"
        >
          En savoir plus <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
