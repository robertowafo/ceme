import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Tv, Radio, ExternalLink, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LiveData {
  isLive      : boolean;
  videoId     : string | null;
  title       ?: string;
  description ?: string;
  publishedAt ?: string;
}

function formatRelativeDate(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600)   return `Il y a ${Math.round(diff / 60)} min`;
  if (diff < 86400)  return `Il y a ${Math.round(diff / 3600)} h`;
  if (diff < 604800) return `Il y a ${Math.round(diff / 86400)} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function LiveSection() {
  const [data,      setData]      = useState<LiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch('/api/youtube/live')
      .then((r) => r.json())
      .then((d: LiveData) => setData(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const hasVideo = !isLoading && data?.videoId;

  return (
    <section className="relative bg-[#070b18] overflow-hidden py-14 sm:py-20">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-grace-blue/15 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-grace-orange/10 blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Badge statut + titre section ── */}
        <div className="text-center mb-8 sm:mb-10">
          {data?.isLive ? (
            <div className="inline-flex items-center gap-2.5 bg-red-600/20 border border-red-500/40 text-red-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              En Direct · Grâce TV
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-grace-orange/15 border border-grace-orange/30 text-grace-orange px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-4">
              <Tv className="w-3.5 h-3.5" />
              Dernier contenu
            </div>
          )}

          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {data?.isLive
              ? <>Grâce TV est <span className="text-red-400">en direct</span> maintenant</>
              : <>Regardez Grâce TV <span className="text-grace-orange italic">maintenant</span></>
            }
          </h2>
          {data?.publishedAt && !data.isLive && (
            <p className="text-white/35 text-sm mt-2 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeDate(data.publishedAt)}
            </p>
          )}
        </div>

        {/* ── Player ── */}
        {isLoading && (
          <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/5"
            style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-grace-orange border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {hasVideo && (
          <div className="relative">
            <AnimatePresence mode="wait">
              {!isPlaying ? (
                /* Thumbnail click-to-play */
                <motion.div
                  key="thumbnail"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-black/70"
                  style={{ paddingBottom: '56.25%' }}
                  onClick={() => setIsPlaying(true)}
                  role="button"
                  aria-label={`Lire : ${data!.title}`}
                >
                  {/* Thumbnail YouTube */}
                  <img
                    src={`https://img.youtube.com/vi/${data!.videoId}/maxresdefault.jpg`}
                    alt={data!.title ?? 'Grâce TV'}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://img.youtube.com/vi/${data!.videoId}/hqdefault.jpg`;
                    }}
                  />

                  {/* Overlay sombre */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:via-black/10 transition-all duration-300" />

                  {/* Badge live sur la vidéo */}
                  {data!.isLive && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      <Radio className="w-3.5 h-3.5" />
                      LIVE
                    </div>
                  )}

                  {/* Bouton Play central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-grace-orange shadow-2xl shadow-grace-orange/40 flex items-center justify-center group-hover:scale-110 group-hover:shadow-grace-orange/60 transition-all duration-300">
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 fill-white text-white ml-1 sm:ml-1.5" />
                    </div>
                  </div>

                  {/* Titre en bas */}
                  {data!.title && (
                    <div className="absolute bottom-0 left-0 right-0 px-5 py-4 sm:px-8 sm:py-5">
                      <p className="text-white font-semibold text-sm sm:text-base leading-snug line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {data!.title}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Iframe lecteur */
                <motion.div
                  key="player"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/70"
                  style={{ paddingBottom: '56.25%' }}
                >
                  <iframe
                    className="absolute inset-0 w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${data!.videoId}?autoplay=1&rel=0`}
                    title={data!.title ?? 'Grâce TV'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint "cliquez pour lire" — masqué dès que ça joue */}
            {!isPlaying && (
              <p className="text-center text-white/35 text-xs mt-3 tracking-wide">
                Cliquez sur la vidéo pour lancer la lecture
              </p>
            )}
          </div>
        )}

        {/* Pas de vidéo disponible */}
        {!isLoading && !hasVideo && (
          <div className="relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 text-center py-16 px-6">
            <Tv className="w-12 h-12 text-white/15 mx-auto mb-3" />
            <p className="text-white/40 text-sm">La chaîne Grâce TV sera disponible ici très bientôt.</p>
          </div>
        )}

        {/* ── CTAs ── */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/live"
            className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-7 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-grace-orange/30 hover:shadow-grace-orange/50 hover:-translate-y-0.5"
          >
            <Radio className="w-4 h-4" />
            Suivre en direct
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/emissions"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-7 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all"
          >
            <Tv className="w-4 h-4" />
            Toutes les émissions
          </Link>
          <a
            href="https://www.youtube.com/@gracetelevision-hc4tv"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Chaîne YouTube
          </a>
        </div>

      </div>
    </section>
  );
}
