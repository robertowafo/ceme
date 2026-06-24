import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, HandHeart } from 'lucide-react';

export function DonateBanner() {
  return (
    <section className="relative overflow-hidden gracetv-sky text-white">
      <div className="absolute inset-x-0 top-0 h-full animate-divine-rays opacity-50 pointer-events-none" />
      <div className="gracetv-cloud absolute top-10 left-10 w-72 h-20 opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center"
      >
        <Heart className="w-10 h-10 text-grace-gold mx-auto mb-5 fill-grace-gold/30" />
        <h2 className="font-display text-3xl sm:text-5xl font-bold mb-4 leading-tight">
          Soutenez la diffusion de la<br /><span className="italic text-grace-gold">Bonne Nouvelle</span>
        </h2>
        <p className="font-body text-white/90 max-w-xl mx-auto mb-9 text-base sm:text-lg">
          Confiez-nous votre demande de prière ou soutenez la mission de Grâce TV — votre don
          permet à la chaîne d'émettre 24h/24 et de toucher toujours plus de foyers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/faire-un-don"
            className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-body font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 shadow-lg"
          >
            <HandHeart className="w-4 h-4" /> Faire un don
          </Link>
          <Link
            to="/eglise/priere"
            className="inline-flex items-center gap-2 bg-white text-grace-blue px-8 py-4 rounded-full font-body font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 shadow-lg"
          >
            <Heart className="w-4 h-4" /> Demander la prière
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
