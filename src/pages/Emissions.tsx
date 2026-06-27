import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Church, Sunrise, Sparkles, Briefcase, HandHeart, Quote,
  ExternalLink, Globe, Youtube, ChevronRight, X, Users,
  Loader2, AlertCircle, Share2, ChevronDown, ListVideo,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { PARTNERS } from '../lib/partners';
import { PagePlaceholder } from '../components/PagePlaceholder';

/* ── Types ───────────────────────────────────────────────────── */
interface YTPlaylist {
  id         : string;
  title      : string;
  description: string;
  thumbnail  : string;
  videoCount : number;
}

interface VideoItem {
  videoId  : string;
  title    : string;
  thumbnail: string;
  position : number;
}

/* ── Programmes CEME ─────────────────────────────────────────── */
interface Program {
  icon    : React.ElementType;
  title   : string;
  cat     : string;
  img     : string;
  desc    : string;
  keywords: string[];
}

const programs: Program[] = [
  {
    icon: Church,
    title: 'Culte du Dimanche',
    cat: 'Célébration',
    img: '/uploads/sermons.jpeg',
    desc: "Le rassemblement principal de la semaine : adoration, louange et prédication de la Parole, retransmis en direct.",
    keywords: ['culte', 'dimanche'],
  },
  {
    icon: Sunrise,
    title: 'Manne Matinale',
    cat: 'Quotidien',
    img: '/uploads/fonde en.jpeg',
    desc: "Le rendez-vous quotidien pour commencer la journée nourri de la Parole de Dieu, où que vous soyez.",
    keywords: ['manne', 'matinale'],
  },
  {
    icon: Sparkles,
    title: "Sommet d'Élévation",
    cat: 'Rassemblement',
    img: '/uploads/impact jeunesse.png',
    desc: "Un grand rassemblement d'élévation spirituelle, de délivrance et d'enseignement de haut niveau.",
    keywords: ['sommet', 'élévation', 'elevation'],
  },
  {
    icon: Briefcase,
    title: 'École des Affaires du Royaume',
    cat: 'Enseignement',
    img: '/uploads/louange et adoration.png',
    desc: "Sagesse entrepreneuriale et leadership selon les principes bibliques, pour impacter le monde des affaires.",
    keywords: ['affaires', 'royaume', 'école', 'ecole'],
  },
  {
    icon: HandHeart,
    title: 'Prières Intercession',
    cat: 'Intercession',
    img: '/uploads/priere.jpeg',
    desc: "Des temps d'intercession et de combat spirituel où l'Éternel intervient dans les situations impossibles.",
    keywords: ['prière', 'priere', 'intercession'],
  },
  {
    icon: Quote,
    title: 'Témoignage pour la Gloire de Dieu',
    cat: 'Inspiration',
    img: '/uploads/mama marie.jpeg',
    desc: "Des vies transformées qui rendent gloire à Dieu et fortifient la foi de toute la communauté.",
    keywords: ['témoignage', 'temoignage', 'gloire'],
  },
];

/* ── Tabs ────────────────────────────────────────────────────── */
type Tab = 'ceme' | 'partenaires';
const TABS: { id: Tab; label: string }[] = [
  { id: 'ceme',        label: 'Émissions Grâce TV / Église CEME' },
  { id: 'partenaires', label: 'Nos Partenaires' },
];

/* ── Helpers ─────────────────────────────────────────────────── */
function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function findPlaylist(p: Program, playlists: YTPlaylist[]): YTPlaylist | undefined {
  return playlists.find((pl) => {
    const t = normalize(pl.title);
    return p.keywords.some((k) => t.includes(normalize(k)));
  });
}
function buildSearchUrl(keywords: string[]) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(keywords.join(' ') + ' grace tv')}`;
}

/* ═══════════════════════════════════════════════════════════════ */
export function Emissions() {
  const [activeTab, setActiveTab]             = useState<Tab>('ceme');
  const [playlists, setPlaylists]             = useState<YTPlaylist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
  const [apiError, setApiError]               = useState<string | null>(null);

  /* Playlist ouverte */
  const [activePlaylist, setActivePlaylist]   = useState<YTPlaylist | null>(null);
  const [activeProgram,  setActiveProgram]    = useState<Program   | null>(null);

  /* Vidéos de la playlist */
  const [playlistVideos,  setPlaylistVideos]  = useState<VideoItem[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [activeVideoId,   setActiveVideoId]   = useState<string | null>(null);

  const playerRef = useRef<HTMLDivElement>(null);

  /* ── Fetch toutes les playlists de la chaîne ── */
  useEffect(() => {
    fetch('/api/youtube/playlists')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: YTPlaylist[]) => setPlaylists(data))
      .catch((err) => {
        console.error('Playlists fetch error:', err);
        setApiError('Impossible de charger les playlists YouTube pour le moment.');
      })
      .finally(() => setIsLoadingPlaylists(false));
  }, []);

  /* ── Fetch les vidéos d'une playlist spécifique ── */
  async function fetchPlaylistVideos(playlistId: string) {
    setIsLoadingVideos(true);
    setPlaylistVideos([]);
    setActiveVideoId(null);
    try {
      const r = await fetch(`/api/playlist-items?playlistId=${encodeURIComponent(playlistId)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const items: VideoItem[] = await r.json();
      setPlaylistVideos(items);
      if (items.length > 0) setActiveVideoId(items[0].videoId);
    } catch (err) {
      console.error('Playlist items fetch error:', err);
    } finally {
      setIsLoadingVideos(false);
    }
  }

  /* ── Clic sur un programme ── */
  const handleSelectProgram = (p: Program) => {
    if (activeProgram?.title === p.title) { closePlayer(); return; }
    const matched = findPlaylist(p, playlists);
    setActiveProgram(p);
    setActivePlaylist(matched ?? null);
    if (!matched) {
      window.open(buildSearchUrl(p.keywords), '_blank', 'noopener,noreferrer');
      return;
    }
    fetchPlaylistVideos(matched.id);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSelectVideo = (videoId: string) => {
    setActiveVideoId(videoId);
  };

  const closePlayer = () => {
    setActivePlaylist(null);
    setActiveProgram(null);
    setPlaylistVideos([]);
    setActiveVideoId(null);
  };

  const sharePlaylist = (pl: YTPlaylist) => {
    const url = `https://www.youtube.com/playlist?list=${pl.id}`;
    if (navigator.share) {
      navigator.share({ title: pl.title, url }).catch(() => navigator.clipboard.writeText(url));
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="bg-white">
      <SEO
        title="Émissions — Grâce TV"
        description="Retrouvez toutes les émissions de Grâce TV : cultes, enseignements, prières et programmes de nos partenaires — en direct ou en replay sur YouTube."
        path="/emissions"
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-grace-blue-deep text-white pt-36 pb-24 sm:pt-44 sm:pb-28">
        <div className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/uploads/fonds-bleu.jpg')" }} />
        <div className="absolute inset-0 bg-grace-blue-deep/55" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.22em] mb-5">
            Nos programmes
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold leading-tight text-white">
            Nos <span className="text-grace-orange italic">émissions</span>
          </h1>
          <p className="font-sans text-white/75 text-lg mt-6 max-w-2xl mx-auto">
            Enseignements, cultes, prières et témoignages — diffusés 24h/24 sur Grâce TV,
            et en replay sur YouTube.
          </p>
        </div>
      </section>

      {/* ── TABS ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); closePlayer(); }}
                className={`relative flex-shrink-0 px-6 py-4 text-sm font-bold transition-colors duration-200 ${
                  activeTab === t.id ? 'text-grace-blue' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {t.label}
                {activeTab === t.id && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-grace-orange rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════ ONGLET CEME ══════════ */}
        {activeTab === 'ceme' && (
          <motion.div
            key="ceme"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Notice */}
            <div className="bg-grace-blue-deep/5 border-b border-grace-blue/10 py-3">
              <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-grace-blue/70 flex items-center gap-2">
                <Youtube className="w-4 h-4 flex-shrink-0 text-grace-orange" />
                Cliquez sur une émission pour charger toutes les vidéos de la playlist.
              </p>
            </div>

            {/* Loading / Error playlists */}
            {isLoadingPlaylists && (
              <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-grace-orange" />
                <p className="text-sm">Chargement des playlists depuis la chaîne Grâce TV…</p>
              </div>
            )}
            {apiError && !isLoadingPlaylists && (
              <div className="max-w-xl mx-auto my-12 bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-700 font-semibold text-sm">{apiError}</p>
              </div>
            )}

            {/* ── Grille des programmes ── */}
            {!isLoadingPlaylists && (
              <section className="py-16 sm:py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map((p, i) => {
                      const matched  = findPlaylist(p, playlists);
                      const isActive = activeProgram?.title === p.title;
                      return (
                        <motion.button
                          key={p.title}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.15 }}
                          transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                          onClick={() => handleSelectProgram(p)}
                          className={`group text-left rounded-3xl overflow-hidden border-2 transition-all duration-300 shadow-sm ${
                            isActive
                              ? 'border-grace-orange shadow-xl shadow-grace-orange/20 -translate-y-1'
                              : 'border-transparent hover:border-grace-blue/20 hover:shadow-lg hover:-translate-y-1'
                          }`}
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img src={p.img} alt={p.title}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-grace-blue-deep/70 to-transparent" />
                            <span className="absolute top-3 left-3 bg-grace-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                              {p.cat}
                            </span>
                            <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 ${
                              matched
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-white/20 text-white/70'
                            }`}>
                              {matched
                                ? <><ListVideo className="w-3 h-3" />{matched.videoCount} vidéos</>
                                : 'YouTube ↗'}
                            </span>
                            <div className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isActive ? 'bg-grace-orange' : 'bg-white/90 group-hover:bg-grace-orange'
                            }`}>
                              {isActive
                                ? <X className="w-4 h-4 text-white" />
                                : <Play className="w-4 h-4 fill-current text-grace-blue group-hover:text-white transition-colors" />
                              }
                            </div>
                            <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center">
                              <p.icon className="w-4 h-4 text-grace-blue" />
                            </div>
                          </div>

                          <div className={`p-6 transition-colors duration-300 ${isActive ? 'bg-grace-blue-deep/3' : 'bg-white'}`}>
                            <h2 className="font-serif text-lg font-extrabold text-soft-black mb-2 leading-tight">{p.title}</h2>
                            <p className="font-sans text-sm text-soft-black/60 leading-relaxed line-clamp-2">{p.desc}</p>
                            <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                              isActive ? 'text-grace-orange' : 'text-grace-blue/60 group-hover:text-grace-orange'
                            }`}>
                              <Youtube className="w-3.5 h-3.5" />
                              {isActive
                                ? 'Masquer la playlist'
                                : matched
                                  ? `Voir les ${matched.videoCount} vidéos`
                                  : 'Voir sur YouTube ↗'}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* ── Lecteur de playlist interne ── */}
            <AnimatePresence>
              {activePlaylist && activeProgram && (
                <motion.div
                  ref={playerRef}
                  key={activePlaylist.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="relative bg-[#070b18] overflow-hidden"
                >
                  {/* Fond décoratif */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-grace-blue/20 blur-[120px]" />
                    <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-grace-orange/10 blur-[100px]" />
                  </div>

                  {/* En-tête compact */}
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 sm:px-10 pt-7 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-grace-orange/20 flex items-center justify-center shrink-0">
                        <activeProgram.icon className="w-5 h-5 text-grace-orange" />
                      </div>
                      <div>
                        <p className="text-grace-orange text-[10px] font-bold uppercase tracking-[0.2em]">
                          {activeProgram.cat} · Grâce TV
                        </p>
                        <h3 className="font-serif text-lg sm:text-xl font-extrabold text-white leading-tight">
                          {activeProgram.title}
                        </h3>
                        <p className="text-white/35 text-xs mt-0.5">
                          {isLoadingVideos
                            ? 'Chargement…'
                            : `${playlistVideos.length} vidéo${playlistVideos.length !== 1 ? 's' : ''} · ${activePlaylist.title}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => sharePlaylist(activePlaylist)}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Partager
                      </button>
                      <a
                        href={`https://www.youtube.com/playlist?list=${activePlaylist.id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all"
                      >
                        <Youtube className="w-3.5 h-3.5" /> YouTube
                      </a>
                      <button
                        onClick={closePlayer}
                        className="flex items-center gap-1.5 bg-grace-orange/10 hover:bg-grace-orange/20 border border-grace-orange/30 text-grace-orange text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Fermer
                      </button>
                    </div>
                  </div>

                  {/* Spinner */}
                  {isLoadingVideos && (
                    <div className="relative z-10 flex flex-col items-center justify-center py-28 gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-grace-orange" />
                      <p className="text-white/40 text-sm tracking-wide">Chargement de la playlist…</p>
                    </div>
                  )}

                  {/* Contenu principal : iframe + liste */}
                  {!isLoadingVideos && playlistVideos.length > 0 && (
                    <div className="relative z-10 flex flex-col lg:flex-row gap-0">

                      {/* ── Colonne gauche : player ── */}
                      <div className="flex-1 min-w-0 p-5 sm:p-8">
                        {/* Iframe 16:9 */}
                        <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/60"
                          style={{ paddingBottom: '56.25%' }}>
                          {activeVideoId && (
                            <iframe
                              key={activeVideoId}
                              className="absolute inset-0 w-full h-full border-0"
                              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                              title={playlistVideos.find(v => v.videoId === activeVideoId)?.title ?? ''}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          )}
                        </div>

                        {/* Infos vidéo en cours */}
                        {activeVideoId && (() => {
                          const cur = playlistVideos.find(v => v.videoId === activeVideoId);
                          return cur ? (
                            <div className="mt-4 flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-grace-orange/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Play className="w-3.5 h-3.5 fill-grace-orange text-grace-orange ml-0.5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-grace-orange mb-0.5">
                                  En lecture · vidéo {cur.position + 1}/{playlistVideos.length}
                                </p>
                                <p className="text-white text-sm sm:text-base font-semibold leading-snug">{cur.title}</p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      {/* ── Colonne droite : liste des vidéos ── */}
                      <div className="lg:w-[340px] xl:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col">
                        {/* Entête liste */}
                        <div className="px-4 py-3.5 border-b border-white/5 flex items-center gap-2 bg-white/2">
                          <ListVideo className="w-4 h-4 text-grace-orange" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                            {playlistVideos.length} vidéos dans la playlist
                          </span>
                        </div>

                        {/* Vidéos scrollables */}
                        <div className="overflow-y-auto lg:max-h-[calc(56.25vw*0.6+80px)] xl:max-h-[480px] scrollbar-hide">
                          {playlistVideos.map((v, idx) => {
                            const isCurrent = v.videoId === activeVideoId;
                            return (
                              <button
                                key={v.videoId}
                                onClick={() => handleSelectVideo(v.videoId)}
                                className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all group border-l-[3px] ${
                                  isCurrent
                                    ? 'bg-grace-orange/15 border-grace-orange'
                                    : 'hover:bg-white/4 border-transparent hover:border-white/20'
                                }`}
                              >
                                {/* Miniature avec overlay play */}
                                <div className="relative flex-shrink-0 w-28 rounded-xl overflow-hidden bg-black">
                                  <div className="aspect-video">
                                    <img
                                      src={v.thumbnail}
                                      alt={v.title}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                  {isCurrent ? (
                                    <div className="absolute inset-0 bg-grace-orange/50 flex items-center justify-center">
                                      <div className="w-8 h-8 rounded-full bg-grace-orange shadow-lg flex items-center justify-center">
                                        <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                                      </div>
                                    </div>
                                  )}
                                  {/* Numéro */}
                                  <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                                    {idx + 1}
                                  </span>
                                </div>

                                {/* Titre + indicator */}
                                <div className="flex-1 min-w-0">
                                  {isCurrent && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-grace-orange mb-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-grace-orange animate-pulse" />
                                      En lecture
                                    </span>
                                  )}
                                  <p className={`text-[13px] leading-snug line-clamp-2 transition-colors ${
                                    isCurrent
                                      ? 'text-white font-semibold'
                                      : 'text-white/55 group-hover:text-white/90'
                                  }`}>
                                    {v.title}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Playlist vide */}
                  {!isLoadingVideos && playlistVideos.length === 0 && (
                    <div className="relative z-10 text-center py-16">
                      <Youtube className="w-12 h-12 text-white/15 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">Aucune vidéo trouvée dans cette playlist.</p>
                      <a
                        href={`https://www.youtube.com/playlist?list=${activePlaylist.id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-5 text-grace-orange text-sm font-bold hover:underline"
                      >
                        Voir sur YouTube <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ══════════ ONGLET PARTENAIRES ══════════ */}
        {activeTab === 'partenaires' && (
          <motion.div
            key="partenaires"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <section className="py-16 sm:py-24 bg-gray-50">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                  <div className="inline-flex items-center gap-2 bg-grace-blue/8 text-grace-blue px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
                    <Users className="w-3.5 h-3.5" /> Ministères partenaires
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-soft-black mb-4">
                    La Bonne Nouvelle partagée,{' '}
                    <span className="text-grace-orange italic">partout.</span>
                  </h2>
                  <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
                    Grâce TV s'associe à des ministères qui portent le même cœur pour l'Évangile.
                    Leurs contenus sont diffusés sur notre chaîne pour bénir chaque foyer francophone.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  {PARTNERS.map((partner, i) => (
                    <motion.div
                      key={partner.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: i * 0.1 }}
                      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="h-2 bg-gradient-to-r from-grace-blue to-grace-orange" />
                      <div className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                          {partner.avatar ? (
                            <img src={partner.avatar} alt={partner.name}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100" />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-grace-blue to-grace-blue-deep flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-black text-2xl">
                                {partner.name.split(' ').pop()?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-serif text-xl font-extrabold text-soft-black leading-tight">{partner.name}</h3>
                            <p className="text-grace-orange font-bold text-sm">{partner.ministry}</p>
                            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> {partner.location}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">{partner.bio}</p>
                        <div className="flex flex-wrap gap-3">
                          <a href={partner.youtube} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-grace-blue-deep text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-grace-blue transition-colors">
                            <Youtube className="w-4 h-4" /> Chaîne YouTube
                          </a>
                          {partner.website && (
                            <a href={partner.website} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:border-grace-blue hover:text-grace-blue transition-colors">
                              <Globe className="w-4 h-4" /> Site web
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <p className="text-center text-gray-400 text-xs mt-10">
                  D'autres partenaires peuvent être ajoutés via le tableau de bord administrateur.
                </p>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-grace-blue text-white py-16">
        <div className="absolute -top-1/2 right-0 w-[40%] h-[200%] rounded-full bg-grace-orange/15 blur-[100px]" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold mb-4 text-white">Ne manquez aucune émission</h2>
          <p className="font-sans text-white/75 mb-8">Suivez Grâce TV en direct, 24h/24, où que vous soyez.</p>
          <Link to="/live"
            className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-colors">
            <Play className="w-4 h-4 fill-white" /> Regarder en direct
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export function EmissionDetail() {
  return (
    <PagePlaceholder
      title="Émission"
      subtitle="Le détail de cette émission sera disponible prochainement. En attendant, retrouvez tous nos programmes en direct."
    />
  );
}
