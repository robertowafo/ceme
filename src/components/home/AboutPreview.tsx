import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function AboutPreview() {
  return (
    <section className="bg-gray-soft py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <span className="font-body text-xs uppercase tracking-[0.2em] text-grace-orange font-semibold">
          · Notre mission
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-grace-dark mt-3 mb-7 leading-tight">
          Une voix chrétienne qui<br />rejoint les <span className="italic text-grace-blue">nations</span>
        </h2>
        <div className="font-body text-grace-dark/75 leading-relaxed space-y-4 text-base sm:text-lg">
          <p>
            Créée le 14 mars 2011 à Yaoundé par le Rev. Dr Alphonse ESSOMBA BOUNOUGOU,
            <strong> Grâce TV</strong> est une chaîne de télévision chrétienne dédiée à la
            diffusion fidèle de l'Évangile.
          </p>
          <p>
            Jour et nuit, nous portons des cultes, des prières, des enseignements bibliques,
            de la musique chrétienne et des programmes d'évangélisation.
          </p>
        </div>
        <Link
          to="/a-propos"
          className="inline-flex items-center gap-2 mt-9 bg-grace-blue hover:bg-grace-blue-deep text-white px-8 py-4 rounded-full font-body font-semibold text-sm uppercase tracking-wider transition-all hover:scale-105"
        >
          En savoir plus <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  );
}
