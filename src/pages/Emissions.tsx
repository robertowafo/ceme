import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Church, Sunrise, Sparkles, Briefcase, HandHeart, Quote,
  ExternalLink, Globe, Youtube, ChevronRight, X, Users,
  Loader2, AlertCircle, Share2, ChevronDown, ListVideo,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
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

interface PartnerData {
  id         : string;
  firstName  : string;
  lastName   : string;
  title     ?: string;
  church    ?: string;
  location  ?: string;
  bio       ?: string;
  youtubeUrl : string;
  website   ?: string;
  avatarUrl ?: string;
}

function partnerDisplayName(p: PartnerData) {
  return [p.title, p.firstName, p.lastName].filter(Boolean).join(' ');
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
    img: '/uploads/culte-du-dimanche-16x9.jpg',
    desc: "Le rassemblement principal de la semaine : adoration, louange et prédication de la Parole, retransmis en direct.",
    keywords: ['culte', 'dimanche'],
  },
  {
    icon: Sunrise,
    title: 'Manne Matinale',
    cat: 'Quotidien',
    img: '/uploads/manne-matinale-16x9.jpg',
    desc: "Le rendez-vous quotidien pour commencer la journée nourri de la Parole de Dieu, où que vous soyez.",
    keywords: ['manne', 'matinale'],
  },
  {
    icon: Sparkles,
    title: "Sommet d'Élévation",
    cat: 'Rassemblement',
    img: '/uploads/sommet-delevation-16x9.jpg',
    desc: "Un grand rassemblement d'élévation spirituelle, de délivrance et d'enseignement de haut niveau.",
    keywords: ['sommet', 'élévation', 'elevation'],
  },
  {
    icon: Briefcase,
    title: 'École des Affaires du Royaume',
    cat: 'Enseignement',
    img: '/uploads/ecole-des-affaires-du-royaume-16x9.jpg',
    desc: "Sagesse entrepreneuriale et leadership selon les principes bibliques, pour impacter le monde des affaires.",
    keywords: ['affaires', 'royaume', 'école', 'ecole'],
  },
  {
    icon: HandHeart,
    title: 'Prières Intercession',
    cat: 'Intercession',
    img: '/uploads/prieres-intercession-16x9.jpg',
    desc: "Des temps d'intercession et de combat spirituel où l'Éternel intervient dans les situations impossibles.",
    keywords: ['prière', 'priere', 'intercession'],
  },
  {
    icon: Quote,
    title: 'Témoignage pour la Gloire de Dieu',
    cat: 'Inspiration',
    img: '/uploads/temoignage-pour-la-gloire-de-dieu-16x9.jpg',
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

  /* Partner tab */
  const [apiPartners,               setApiPartners]               = useState<PartnerData[]>([]);
  const [isLoadingPartners,         setIsLoadingPartners]         = useState(false);
  const [partnersLoaded,            setPartnersLoaded]            = useState(false);
  const [activePartner,             setActivePartner]             = useState<PartnerData | null>(null);
  const [partnerPlaylists,          setPartnerPlaylists]          = useState<YTPlaylist[]>([]);
  const [isLoadingPartnerPlaylists, setIsLoadingPartnerPlaylists] = useState(false);
  const [activePartnerPlaylist,     setActivePartnerPlaylist]     = useState<YTPlaylist | null>(null);
  const [partnerVideos,             setPartnerVideos]             = useState<VideoItem[]>([]);
  const [isLoadingPartnerVideos,    setIsLoadingPartnerVideos]    = useState(false);
  const [activePartnerVideoId,      setActivePartnerVideoId]      = useState<string | null>(null);

  const partnerPlayerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  /* ── Fetch partenaires depuis l'API ── */
  useEffect(() => {
    if (activeTab !== 'partenaires' || partnersLoaded) return;
    setIsLoadingPartners(true);
    fetch('/api/partners')
      .then(r => r.json())
      .then((data: PartnerData[]) => { setApiPartners(data); setPartnersLoaded(true); })
      .catch(console.error)
      .finally(() => setIsLoadingPartners(false));
  }, [activeTab, partnersLoaded]);

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

  const closePartnerPlayer = () => {
    setActivePartner(null);
    setPartnerPlaylists([]);
    setActivePartnerPlaylist(null);
    setPartnerVideos([]);
    setActivePartnerVideoId(null);
  };

  /* ── Clic sur un partenaire ── */
  const handleSelectPartner = async (p: PartnerData) => {
    if (activePartner?.id === p.id) { closePartnerPlayer(); return; }
    closePartnerPlayer();
    setActivePartner(p);
    setIsLoadingPartnerPlaylists(true);
    try {
      const r = await fetch(`/api/youtube/channel-playlists?channelUrl=${encodeURIComponent(p.youtubeUrl)}`);
      const data: YTPlaylist[] = await r.json();
      setPartnerPlaylists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Partner playlists fetch error:', err);
    } finally {
      setIsLoadingPartnerPlaylists(false);
      setTimeout(() => partnerPlayerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };

  /* ── Clic sur une playlist partenaire ── */
  const handleSelectPartnerPlaylist = async (pl: YTPlaylist) => {
    if (activePartnerPlaylist?.id === pl.id) {
      setActivePartnerPlaylist(null);
      setPartnerVideos([]);
      setActivePartnerVideoId(null);
      return;
    }
    setActivePartnerPlaylist(pl);
    setIsLoadingPartnerVideos(true);
    setPartnerVideos([]);
    setActivePartnerVideoId(null);
    try {
      const r = await fetch(`/api/playlist-items?playlistId=${encodeURIComponent(pl.id)}`);
      const items: VideoItem[] = await r.json();
      setPartnerVideos(items);
      if (items.length > 0) setActivePartnerVideoId(items[0].videoId);
    } catch (err) {
      console.error('Partner playlist items fetch error:', err);
    } finally {
      setIsLoadingPartnerVideos(false);
    }
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
                onClick={() => { setActiveTab(t.id); closePlayer(); closePartnerPlayer(); }}
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
                  className="relative bg-[#070b18] overflow-hidden scroll-mt-20"
                >
                  {/* Fond décoratif */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-grace-blue/20 blur-[120px]" />
                    <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-grace-orange/10 blur-[100px]" />
                  </div>

                  {/* En-tête compact */}
                  <div className="relative z-10 flex flex-col xs:flex-row xs:items-center justify-between gap-3 px-4 sm:px-8 lg:px-10 pt-5 sm:pt-7 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-grace-orange/20 flex items-center justify-center shrink-0">
                        <activeProgram.icon className="w-4 h-4 sm:w-5 sm:h-5 text-grace-orange" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-grace-orange text-[10px] font-bold uppercase tracking-[0.2em] truncate">
                          {activeProgram.cat} · Grâce TV
                        </p>
                        <h3 className="font-serif text-base sm:text-lg lg:text-xl font-extrabold text-white leading-tight truncate">
                          {activeProgram.title}
                        </h3>
                        <p className="text-white/35 text-xs mt-0.5 truncate">
                          {isLoadingVideos
                            ? 'Chargement…'
                            : `${playlistVideos.length} vidéo${playlistVideos.length !== 1 ? 's' : ''} · ${activePlaylist.title}`}
                        </p>
                      </div>
                    </div>
                    {/* Actions — icônes seules sur xs, icône+texte sur sm+ */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => sharePlaylist(activePlaylist)}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3.5 py-2 rounded-xl transition-all"
                        title="Partager"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Partager</span>
                      </button>
                      <a
                        href={`https://www.youtube.com/playlist?list=${activePlaylist.id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3.5 py-2 rounded-xl transition-all"
                        title="Voir sur YouTube"
                      >
                        <Youtube className="w-4 h-4" />
                        <span className="hidden sm:inline">YouTube</span>
                      </a>
                      <button
                        onClick={closePlayer}
                        className="flex items-center gap-1.5 bg-grace-orange/10 hover:bg-grace-orange/20 border border-grace-orange/30 text-grace-orange text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3.5 py-2 rounded-xl transition-all"
                        title="Fermer"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Fermer</span>
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
                    /*
                     * Mobile  (<lg) : colonne — player au-dessus, liste en dessous (max-h limitée)
                     * Desktop (lg+) : ligne — player flex-1, liste sidebar fixe 340-380px
                     * lg:items-stretch : la sidebar prend automatiquement la hauteur du player
                     */
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch gap-0">

                      {/* ── Player ── */}
                      <div className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8">
                        <div
                          className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/60"
                          style={{ paddingBottom: '56.25%' }}
                        >
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

                        {/* Vidéo en cours */}
                        {activeVideoId && (() => {
                          const cur = playlistVideos.find(v => v.videoId === activeVideoId);
                          return cur ? (
                            <div className="mt-3 sm:mt-4 flex items-start gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-grace-orange/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-grace-orange text-grace-orange ml-0.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-grace-orange mb-0.5">
                                  En lecture · vidéo {cur.position + 1}/{playlistVideos.length}
                                </p>
                                <p className="text-white text-sm sm:text-base font-semibold leading-snug line-clamp-2">
                                  {cur.title}
                                </p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      {/* ── Sidebar liste ── */}
                      <div className={`
                        shrink-0
                        w-full lg:w-[320px] xl:w-[360px]
                        border-t lg:border-t-0 lg:border-l border-white/5
                        flex flex-col overflow-hidden
                        max-h-[300px] sm:max-h-[380px] lg:max-h-none
                      `}>
                        {/* Header liste */}
                        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-white/[0.02] shrink-0">
                          <ListVideo className="w-4 h-4 text-grace-orange" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                            {playlistVideos.length} vidéos dans la playlist
                          </span>
                        </div>

                        {/* Liste scrollable — flex-1 remplit la hauteur restante sur desktop */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                          {playlistVideos.map((v, idx) => {
                            const isCurrent = v.videoId === activeVideoId;
                            return (
                              <button
                                key={v.videoId}
                                onClick={() => handleSelectVideo(v.videoId)}
                                className={`w-full flex items-start gap-3 px-3 sm:px-4 py-3 sm:py-3.5 text-left transition-all group border-l-[3px] ${
                                  isCurrent
                                    ? 'bg-grace-orange/15 border-grace-orange'
                                    : 'hover:bg-white/[0.04] border-transparent hover:border-white/20'
                                }`}
                              >
                                {/* Miniature — plus petite sur mobile */}
                                <div className="relative flex-shrink-0 w-20 sm:w-24 lg:w-28 rounded-lg sm:rounded-xl overflow-hidden bg-black">
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
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-grace-orange shadow-lg flex items-center justify-center">
                                        <Play className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white text-white ml-0.5" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <Play className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white text-white ml-0.5" />
                                      </div>
                                    </div>
                                  )}
                                  <span className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 text-[8px] sm:text-[9px] font-bold text-white bg-black/70 px-1 sm:px-1.5 py-0.5 rounded">
                                    {idx + 1}
                                  </span>
                                </div>

                                {/* Titre */}
                                <div className="flex-1 min-w-0">
                                  {isCurrent && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-grace-orange mb-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-grace-orange animate-pulse" />
                                      En lecture
                                    </span>
                                  )}
                                  <p className={`text-[12px] sm:text-[13px] leading-snug line-clamp-2 sm:line-clamp-3 transition-colors ${
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
            {/* Notice */}
            <div className="bg-grace-blue-deep/5 border-b border-grace-blue/10 py-3">
              <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-grace-blue/70 flex items-center gap-2">
                <Youtube className="w-4 h-4 flex-shrink-0 text-grace-orange" />
                Cliquez sur un partenaire pour explorer ses émissions organisées en playlists.
              </p>
            </div>

            <section className="py-14 sm:py-20 bg-gray-50">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-grace-blue/8 text-grace-blue px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
                    <Users className="w-3.5 h-3.5" /> Ministères partenaires
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-soft-black mb-4">
                    La Bonne Nouvelle partagée,{' '}
                    <span className="text-grace-orange italic">partout.</span>
                  </h2>
                  <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
                    Grâce TV s'associe à des ministères qui portent le même cœur pour l'Évangile.
                    Cliquez sur un partenaire pour regarder ses émissions directement ici.
                  </p>
                </div>

                {/* Loading state */}
                {isLoadingPartners && (
                  <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-grace-orange" />
                    <p className="text-sm">Chargement des partenaires…</p>
                  </div>
                )}

                {/* Partners grid */}
                {!isLoadingPartners && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {apiPartners.length === 0 && (
                      <div className="col-span-2 text-center py-16 text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun partenaire pour le moment.</p>
                        <p className="text-xs mt-1 opacity-60">Ils peuvent être ajoutés depuis le tableau de bord administrateur.</p>
                      </div>
                    )}
                    {apiPartners.map((partner, i) => {
                      const name = partnerDisplayName(partner);
                      const isActive = activePartner?.id === partner.id;
                      return (
                        <motion.button
                          key={partner.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
                          onClick={() => handleSelectPartner(partner)}
                          className={`text-left bg-white rounded-3xl overflow-hidden border-2 shadow-sm transition-all duration-300 group w-full ${
                            isActive
                              ? 'border-grace-orange shadow-xl shadow-grace-orange/15 -translate-y-1'
                              : 'border-transparent hover:border-grace-blue/20 hover:shadow-lg hover:-translate-y-1'
                          }`}
                        >
                          <div className="h-1.5 bg-gradient-to-r from-grace-blue to-grace-orange" />
                          <div className="p-6 sm:p-7">
                            <div className="flex items-center gap-4 mb-4">
                              {partner.avatarUrl ? (
                                <img src={partner.avatarUrl} alt={name}
                                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 shrink-0" />
                              ) : (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-grace-blue to-grace-blue-deep flex items-center justify-center shrink-0">
                                  <span className="text-white font-black text-2xl">
                                    {partner.lastName.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="min-w-0">
                                <h3 className="font-serif text-lg font-extrabold text-soft-black leading-tight truncate">{name}</h3>
                                {partner.church && <p className="text-grace-orange font-bold text-sm truncate">{partner.church}</p>}
                                {partner.location && (
                                  <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {partner.location}
                                  </p>
                                )}
                              </div>
                            </div>
                            {partner.bio && (
                              <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-2">{partner.bio}</p>
                            )}
                            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                              isActive ? 'text-grace-orange' : 'text-grace-blue/60 group-hover:text-grace-orange'
                            }`}>
                              <ListVideo className="w-3.5 h-3.5" />
                              {isActive ? 'Masquer les émissions' : 'Voir les émissions'}
                              {isActive ? <X className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* ── Playlists du partenaire sélectionné ── */}
            <AnimatePresence>
              {activePartner && (
                <motion.div
                  ref={partnerPlayerRef}
                  key={activePartner.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="relative bg-[#070b18] overflow-hidden scroll-mt-20"
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-grace-blue/20 blur-[120px]" />
                    <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-grace-orange/10 blur-[100px]" />
                  </div>

                  {/* Header partenaire */}
                  <div className="relative z-10 flex flex-col xs:flex-row xs:items-center justify-between gap-3 px-4 sm:px-8 lg:px-10 pt-5 sm:pt-7 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      {activePartner.avatarUrl ? (
                        <img src={activePartner.avatarUrl} alt={partnerDisplayName(activePartner)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-grace-orange/20 flex items-center justify-center shrink-0">
                          <span className="text-grace-orange font-black text-base">{activePartner.lastName.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-grace-orange text-[10px] font-bold uppercase tracking-[0.2em] truncate">
                          Partenaire · Grâce TV
                        </p>
                        <h3 className="font-serif text-base sm:text-lg lg:text-xl font-extrabold text-white leading-tight truncate">
                          {partnerDisplayName(activePartner)}
                        </h3>
                        <p className="text-white/35 text-xs mt-0.5 truncate">
                          {isLoadingPartnerPlaylists
                            ? 'Chargement des playlists…'
                            : activePartnerPlaylist
                              ? `${partnerVideos.length} vidéo${partnerVideos.length !== 1 ? 's' : ''} · ${activePartnerPlaylist.title}`
                              : `${partnerPlaylists.length} playlist${partnerPlaylists.length !== 1 ? 's' : ''} disponible${partnerPlaylists.length !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {activePartnerPlaylist && (
                        <button
                          onClick={() => { setActivePartnerPlaylist(null); setPartnerVideos([]); setActivePartnerVideoId(null); }}
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3.5 py-2 rounded-xl transition-all"
                        >
                          <ChevronDown className="w-4 h-4" />
                          <span className="hidden sm:inline">Playlists</span>
                        </button>
                      )}
                      <a
                        href={activePartner.youtubeUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3.5 py-2 rounded-xl transition-all"
                      >
                        <Youtube className="w-4 h-4" />
                        <span className="hidden sm:inline">YouTube</span>
                      </a>
                      <button
                        onClick={closePartnerPlayer}
                        className="flex items-center gap-1.5 bg-grace-orange/10 hover:bg-grace-orange/20 border border-grace-orange/30 text-grace-orange text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3.5 py-2 rounded-xl transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Fermer</span>
                      </button>
                    </div>
                  </div>

                  {/* Spinner playlists */}
                  {isLoadingPartnerPlaylists && (
                    <div className="relative z-10 flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="w-9 h-9 animate-spin text-grace-orange" />
                      <p className="text-white/40 text-sm">Chargement des playlists…</p>
                    </div>
                  )}

                  {/* Grille des playlists */}
                  {!isLoadingPartnerPlaylists && !activePartnerPlaylist && partnerPlaylists.length > 0 && (
                    <div className="relative z-10 px-4 sm:px-8 lg:px-10 py-6 sm:py-8">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {partnerPlaylists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={() => handleSelectPartnerPlaylist(pl)}
                            className="group text-left rounded-xl sm:rounded-2xl overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-grace-orange/40 transition-all duration-200"
                          >
                            <div className="relative aspect-video overflow-hidden bg-black/40">
                              {pl.thumbnail ? (
                                <img src={pl.thumbnail} alt={pl.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 opacity-80 group-hover:opacity-100" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ListVideo className="w-8 h-8 text-white/20" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {pl.videoCount} vidéos
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-grace-orange shadow-lg flex items-center justify-center">
                                  <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                            <div className="p-2.5 sm:p-3">
                              <p className="text-white text-[11px] sm:text-xs font-semibold leading-snug line-clamp-2">{pl.title}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aucune playlist */}
                  {!isLoadingPartnerPlaylists && !activePartnerPlaylist && partnerPlaylists.length === 0 && (
                    <div className="relative z-10 text-center py-16 px-4">
                      <Youtube className="w-12 h-12 text-white/15 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">Aucune playlist trouvée sur cette chaîne.</p>
                      <a href={activePartner.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-grace-orange text-sm font-bold hover:underline">
                        Voir la chaîne YouTube <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Lecteur vidéo de la playlist sélectionnée */}
                  {activePartnerPlaylist && (
                    <>
                      {isLoadingPartnerVideos && (
                        <div className="relative z-10 flex flex-col items-center justify-center py-20 gap-4">
                          <Loader2 className="w-9 h-9 animate-spin text-grace-orange" />
                          <p className="text-white/40 text-sm">Chargement des vidéos…</p>
                        </div>
                      )}
                      {!isLoadingPartnerVideos && partnerVideos.length > 0 && (
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch gap-0">
                          {/* Player */}
                          <div className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8">
                            <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/60"
                              style={{ paddingBottom: '56.25%' }}>
                              {activePartnerVideoId && (
                                <iframe
                                  key={activePartnerVideoId}
                                  className="absolute inset-0 w-full h-full border-0"
                                  src={`https://www.youtube.com/embed/${activePartnerVideoId}?autoplay=1&rel=0`}
                                  title={partnerVideos.find(v => v.videoId === activePartnerVideoId)?.title ?? ''}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              )}
                            </div>
                            {activePartnerVideoId && (() => {
                              const cur = partnerVideos.find(v => v.videoId === activePartnerVideoId);
                              return cur ? (
                                <div className="mt-3 sm:mt-4 flex items-start gap-2 sm:gap-3">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-grace-orange/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-grace-orange text-grace-orange ml-0.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-grace-orange mb-0.5">
                                      En lecture · {cur.position + 1}/{partnerVideos.length}
                                    </p>
                                    <p className="text-white text-sm sm:text-base font-semibold leading-snug line-clamp-2">{cur.title}</p>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                          {/* Sidebar */}
                          <div className="shrink-0 w-full lg:w-[320px] xl:w-[360px] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col overflow-hidden max-h-[300px] sm:max-h-[380px] lg:max-h-none">
                            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-white/[0.02] shrink-0">
                              <ListVideo className="w-4 h-4 text-grace-orange" />
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                                {partnerVideos.length} vidéos · {activePartnerPlaylist.title}
                              </span>
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                              {partnerVideos.map((v, idx) => {
                                const isCurrent = v.videoId === activePartnerVideoId;
                                return (
                                  <button
                                    key={v.videoId}
                                    onClick={() => setActivePartnerVideoId(v.videoId)}
                                    className={`w-full flex items-start gap-3 px-3 sm:px-4 py-3 sm:py-3.5 text-left transition-all group border-l-[3px] ${
                                      isCurrent
                                        ? 'bg-grace-orange/15 border-grace-orange'
                                        : 'hover:bg-white/[0.04] border-transparent hover:border-white/20'
                                    }`}
                                  >
                                    <div className="relative flex-shrink-0 w-20 sm:w-24 lg:w-28 rounded-lg sm:rounded-xl overflow-hidden bg-black">
                                      <div className="aspect-video">
                                        <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                                      </div>
                                      {isCurrent ? (
                                        <div className="absolute inset-0 bg-grace-orange/50 flex items-center justify-center">
                                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-grace-orange shadow-lg flex items-center justify-center">
                                            <Play className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white text-white ml-0.5" />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                                            <Play className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white text-white ml-0.5" />
                                          </div>
                                        </div>
                                      )}
                                      <span className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 text-[8px] sm:text-[9px] font-bold text-white bg-black/70 px-1 sm:px-1.5 py-0.5 rounded">
                                        {idx + 1}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {isCurrent && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-grace-orange mb-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-grace-orange animate-pulse" />
                                          En lecture
                                        </span>
                                      )}
                                      <p className={`text-[12px] sm:text-[13px] leading-snug line-clamp-2 sm:line-clamp-3 transition-colors ${
                                        isCurrent ? 'text-white font-semibold' : 'text-white/55 group-hover:text-white/90'
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
                      {!isLoadingPartnerVideos && partnerVideos.length === 0 && (
                        <div className="relative z-10 text-center py-14">
                          <Youtube className="w-10 h-10 text-white/15 mx-auto mb-3" />
                          <p className="text-white/40 text-sm">Aucune vidéo dans cette playlist.</p>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
