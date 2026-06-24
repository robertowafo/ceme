import { motion } from 'motion/react';
import { Smartphone, Globe, BookOpenCheck, HeartHandshake } from 'lucide-react';

export function ValuesBento() {
  return (
    <section className="bg-gray-soft py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-grace-orange font-semibold">· Nos valeurs</span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-grace-dark mt-3 leading-tight">
            Là où la Foi rencontre<br />la <span className="italic text-grace-blue">Technologie</span> moderne
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Carte gauche — innovation (cobalt) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-grace-blue text-white p-8 sm:p-10 min-h-[300px] flex flex-col justify-between"
          >
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-grace-sky/20 blur-2xl" />
            <Smartphone className="w-10 h-10 text-grace-gold relative" />
            <div className="relative">
              <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3">Innovation au service de l'Évangile</h3>
              <p className="font-body text-white/80 leading-relaxed">
                Web, câble, mobile : Grâce TV met la technologie au service d'un seul objectif —
                porter la Parole de Dieu jusque dans chaque foyer, partout, partout.
              </p>
            </div>
          </motion.div>

          {/* Carte droite — présence (blanche) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-white border border-grace-sky/20 p-8 sm:p-10 min-h-[300px] flex flex-col justify-between"
          >
            <Globe className="w-10 h-10 text-grace-blue" />
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-grace-dark mb-3">Une présence qui rejoint les nations</h3>
              <p className="font-body text-grace-dark/70 leading-relaxed mb-5">
                Ancrés à Yaoundé, diffusés sur le câble à Yaoundé et Douala et accessibles
                partout via le web — une voix chrétienne sans frontières.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-body font-semibold text-grace-blue bg-grace-sky/10 px-3 py-1.5 rounded-full">
                  <BookOpenCheck className="w-3.5 h-3.5" /> Intégrité biblique
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-body font-semibold text-grace-blue bg-grace-sky/10 px-3 py-1.5 rounded-full">
                  <HeartHandshake className="w-3.5 h-3.5" /> Édification du Corps de Christ
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
