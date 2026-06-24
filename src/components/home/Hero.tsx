import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, ArrowRight } from 'lucide-react';

// Cartes d'émissions flottantes (arc 3D au bas du hero)
const floatCards = [
  { title: 'Culte du Dimanche', time: '10:00', img: '/uploads/sermons.jpeg', ry: '18deg', delay: '0s', extra: 'sm:-translate-y-4' },
  { title: 'Louange & Adoration', time: '20:00', img: '/uploads/louange et adoration.png', ry: '8deg', delay: '0.4s', extra: 'sm:translate-y-3' },
  { title: 'Impact Jeunesse', time: '18:00', img: '/uploads/impact jeunesse.png', ry: '-8deg', delay: '0.8s', extra: 'sm:translate-y-3' },
  { title: 'Heure de Prière', time: '06:00', img: '/uploads/priere.jpeg', ry: '-18deg', delay: '1.2s', extra: 'sm:-translate-y-4' },
];

export function Hero() {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/youtube/live')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active && d) setIsLive(!!d.isLive); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <section className="relative overflow-hidden gracetv-sky text-white">
      {/* Rayons de lumière divine */}
      <div className="absolute inset-x-0 top-0 h-[70%] animate-divine-rays pointer-events-none" />
      {/* Nuages flous */}
      <div className="gracetv-cloud absolute top-24 -left-10 w-72 h-24 opacity-70 pointer-events-none" />
      <div className="gracetv-cloud absolute top-40 right-0 w-96 h-28 opacity-60 pointer-events-none" />
      <div className="gracetv-cloud absolute bottom-40 left-1/4 w-80 h-24 opacity-50 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12 sm:pt-44 text-center">
        {/* Badge EN DIRECT */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-grace-orange text-white px-4 py-1.5 rounded-full text-xs font-body font-bold uppercase tracking-widest mb-7 animate-live-pulse"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {isLive ? 'En direct maintenant' : 'Diffusion 24h/24'}
        </motion.div>

        <motion.h1
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.02] tracking-tight"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          La Bonne Nouvelle<br />
          <span className="italic text-grace-gold">Partout, Partout…</span>
        </motion.h1>

        <motion.p
          className="font-body text-base sm:text-lg text-white/90 max-w-2xl mx-auto mt-7 leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Grâce TV, votre chaîne de foi, d'espoir et d'amour — diffusant 24h/24 des cultes,
          enseignements et programmes inspirés des Saintes Écritures.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/live"
            className="inline-flex items-center gap-2.5 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-body font-semibold text-sm uppercase tracking-wider transition-all shadow-xl shadow-grace-blue-deep/30 hover:scale-105"
          >
            <Play className="w-5 h-5 fill-white" /> Regarder en direct
          </Link>
          <Link
            to="/emissions"
            className="inline-flex items-center gap-2.5 border-2 border-white/70 hover:bg-white hover:text-grace-blue text-white px-8 py-4 rounded-full font-body font-semibold text-sm uppercase tracking-wider transition-all"
          >
            Nos émissions <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Cartes d'émissions flottantes en arc 3D */}
      <div
        className="relative max-w-5xl mx-auto px-4 pb-20 sm:pb-28 flex justify-center items-end gap-3 sm:gap-5"
        style={{ perspective: '1200px' }}
      >
        {floatCards.map((card) => (
          <div
            key={card.title}
            className={`animate-card-float ${card.extra} w-32 sm:w-44 lg:w-52 shrink-0`}
            style={{ ['--ry' as string]: card.ry, animationDelay: card.delay }}
          >
            <div className="rounded-2xl overflow-hidden bg-white shadow-2xl ring-1 ring-white/40">
              <div className="relative aspect-[4/3]">
                <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
                <span className="absolute top-2 right-2 bg-grace-orange text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {card.time}
                </span>
              </div>
              <div className="px-3 py-2.5">
                <p className="font-body text-[11px] sm:text-xs font-semibold text-grace-dark leading-tight truncate">
                  {card.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transition douce vers le blanc */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
