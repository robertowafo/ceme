import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grace-blue text-white">
      {/* Dégradé royal + halos */}
      <div className="absolute inset-0 bg-gradient-to-br from-grace-blue via-grace-blue to-grace-blue-deep" />
      <div className="absolute -top-1/4 -right-1/4 w-[60%] h-[60%] rounded-full bg-grace-sky/20 blur-[120px]" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[55%] h-[55%] rounded-full bg-grace-orange/20 blur-[130px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 sm:pt-44 sm:pb-32 text-center">
        <motion.img
          src="/logo-gracetv-white.png"
          alt="Logo Grâce TV"
          className="h-20 sm:h-28 mx-auto mb-10 drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          loading="eager"
        />
        <motion.h1
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          La Bonne Nouvelle<br />
          <span className="text-grace-orange">Partout Partout</span>
        </motion.h1>
        <motion.p
          className="font-body text-base sm:text-lg text-white/80 max-w-2xl mx-auto mt-6 leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Une voix chrétienne qui rejoint les nations — diffusion 24/7 d'enseignements,
          cultes et programmes inspirés des Saintes Écritures.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/live"
            className="inline-flex items-center gap-2.5 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-display font-semibold text-sm uppercase tracking-wider transition-all shadow-lg shadow-grace-orange/30 hover:shadow-grace-orange/50"
          >
            <Play className="w-5 h-5 fill-white" /> Regarder en direct
          </Link>
          <Link
            to="/emissions"
            className="inline-flex items-center gap-2.5 border-2 border-white/40 hover:border-white hover:bg-white/10 text-white px-8 py-4 rounded-full font-display font-semibold text-sm uppercase tracking-wider transition-all"
          >
            Découvrir nos émissions <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
