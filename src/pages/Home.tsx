import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Play, X, ArrowRight, ArrowDown, ChevronLeft, ChevronRight,
  Church, GraduationCap, Music, Film, Newspaper, FileText, Tv,
  Radio, Sparkles, BookOpen, Volume2, Clock, Heart, ExternalLink,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { tvStationSchema, webSiteSchema } from '../lib/structuredData';
import { gsap, SplitText } from '../lib/gsap';
import { isYtPlaylistId, ytEmbedUrl, ytThumbUrl } from '../lib/youtube';
import { fetchLiveStatus, type LiveData } from '../lib/liveStatus';
import { CtaShowcase } from '../components/home/CtaShowcase';
import {
  getBlogPosts, getRecommendedLinks, getStudyDocuments, getPartners,
  type BlogPost, type RecommendedLink, type StudyDocument, type Partner,
} from '../lib/dbService';

/* ══ Types ═════════════════════════════════════════════════════ */
interface YTPlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
}

interface VideoContent {
  id: string;
  title: string;
  description?: string;
  image?: string;
  meta?: string;
  embedUrl: string;
}

type SectionKey = 'sermon' | 'enseignement' | 'louange' | 'film' | 'emission';

function partnerDisplayName(p: Partner) {
  return [p.title, p.firstName, p.lastName].filter(Boolean).join(' ');
}

/* ══ Classification ════════════════════════════════════════════ */
function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function classify(title: string): SectionKey {
  const t = normalize(title);
  if (/(louange|adoration|chant|chanson|musique|worship|concert|cantique)/.test(t)) return 'louange';
  if (/\bfilm/.test(t)) return 'film';
  if (/(enseignement|ecole|etude|formation|affaires|seminaire)/.test(t)) return 'enseignement';
  if (/(culte|sermon|predication|message|parole)/.test(t)) return 'sermon';
  return 'emission';
}

function classifyCategory(cat: string): SectionKey {
  const c = normalize(cat || '');
  if (c.includes('sermon') || c.includes('predication') || c.includes('culte')) return 'sermon';
  if (c.includes('enseignement') || c.includes('etude') || c.includes('formation')) return 'enseignement';
  if (c.includes('louange') || c.includes('chant') || c.includes('musique')) return 'louange';
  if (c.includes('film')) return 'film';
  return 'emission';
}

/* ══ Animations réutilisables ══════════════════════════════════ */
const EASE = [0.22, 1, 0.36, 1] as const;
const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: EASE },
};

/* ══ En-tête de section avec numéro géant ══════════════════════ */
function SectionHeader({ num, label, title, accent, desc, dark = false, icon: Icon }: {
  num: string; label: string; title: string; accent: string; desc: string; dark?: boolean; icon: React.ElementType;
}) {
  return (
    <div className="relative max-w-3xl">
      {/* Numéro géant en filigrane */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
        className="absolute -top-10 -left-2 sm:-left-6 font-serif font-extrabold leading-none select-none pointer-events-none text-[7rem] sm:text-[10rem]"
        style={{
          WebkitTextStroke: dark ? '1.5px rgba(255,255,255,0.10)' : '1.5px rgba(26,26,26,0.10)',
          color: 'transparent',
        }}
      >
        {num}
      </motion.span>

      <motion.span
        {...reveal}
        className="relative inline-flex items-center gap-2.5 text-grace-orange text-xs font-semibold uppercase tracking-[0.28em] mb-5"
      >
        <span className={`h-px w-10 ${dark ? 'bg-grace-orange/60' : 'bg-grace-orange/60'}`} />
        <Icon className={`w-4 h-4 ${dark ? 'text-grace-sky' : 'text-grace-blue'}`} /> {label}
      </motion.span>
      <motion.h2
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.08 }}
        className={`relative font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] ${dark ? 'text-white' : 'text-soft-black'}`}
      >
        {title} <span className="text-grace-orange italic">{accent}</span>
      </motion.h2>
      <motion.p
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.16 }}
        className={`relative font-sans text-base sm:text-lg leading-relaxed mt-5 ${dark ? 'text-white/70' : 'text-soft-black/65'}`}
      >
        {desc}
      </motion.p>
    </div>
  );
}

/* ══ Carte vidéo ═══════════════════════════════════════════════ */
function VideoCard({ item, onPlay, dark = false, big = false, index }: {
  item: VideoContent; onPlay: (v: VideoContent) => void; dark?: boolean; big?: boolean; index?: number;
}) {
  return (
    <button
      onClick={() => onPlay(item)}
      className={`group relative text-left shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 ${
        big ? 'w-full' : 'w-[280px] sm:w-[330px]'
      } ${dark
        ? 'bg-white/[0.04] border border-white/10 hover:border-grace-orange/60 hover:shadow-[0_20px_60px_-15px_rgba(242,101,34,0.35)]'
        : 'bg-white border border-soft-black/8 shadow-sm hover:shadow-[0_25px_60px_-15px_rgba(12,46,102,0.25)]'}`}
    >
      <div className={`relative overflow-hidden ${big ? 'aspect-[16/9]' : 'aspect-video'}`}>
        {item.image ? (
          <img
            src={item.image} alt={item.title} loading="lazy" referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${dark ? 'bg-white/5' : 'bg-gray-soft'}`}>
            <Tv className={`w-10 h-10 ${dark ? 'text-white/20' : 'text-soft-black/15'}`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Index décoratif */}
        {typeof index === 'number' && (
          <span
            aria-hidden
            className="absolute -bottom-3 -right-1 font-serif font-extrabold text-6xl leading-none select-none"
            style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.45)', color: 'transparent' }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        )}

        {/* Bouton play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-grace-orange text-white flex items-center justify-center scale-0 group-hover:scale-100 rotate-45 group-hover:rotate-0 transition-all duration-300 shadow-2xl shadow-grace-orange/50">
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          </span>
        </div>
        {item.meta && (
          <span className="absolute top-3 left-3 bg-black/55 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            {item.meta}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <h3 className={`font-serif font-extrabold leading-snug line-clamp-2 transition-colors ${
          big ? 'text-xl sm:text-2xl' : 'text-base'
        } ${dark ? 'text-white group-hover:text-grace-orange' : 'text-soft-black group-hover:text-grace-blue'}`}>
          {item.title}
        </h3>
        {big && item.description && (
          <p className={`text-sm mt-2 line-clamp-2 ${dark ? 'text-white/60' : 'text-soft-black/55'}`}>{item.description}</p>
        )}
        {/* Trait animé au survol */}
        <span className={`block h-0.5 mt-4 w-0 group-hover:w-full transition-all duration-500 ${dark ? 'bg-grace-orange' : 'bg-grace-blue'}`} />
      </div>
    </button>
  );
}

/* ══ Rail horizontal ═══════════════════════════════════════════ */
function Rail({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 370, behavior: 'smooth' });
  return (
    <div className="relative">
      <div ref={ref} className="flex gap-5 overflow-x-auto snap-x scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {children}
      </div>
      <div className="hidden sm:flex gap-2 absolute -top-16 right-0">
        <button onClick={() => scroll(-1)} aria-label="Précédent"
          className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${
            dark ? 'border-white/20 text-white hover:bg-grace-orange hover:border-grace-orange' : 'border-soft-black/15 hover:bg-soft-black hover:text-white'}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => scroll(1)} aria-label="Suivant"
          className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${
            dark ? 'border-white/20 text-white hover:bg-grace-orange hover:border-grace-orange' : 'border-soft-black/15 hover:bg-soft-black hover:text-white'}`}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ══ Bande marquee ═════════════════════════════════════════════ */
function MarqueeBand({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <div className={`relative marquee-pause overflow-hidden py-5 border-y ${dark ? 'border-white/10 bg-grace-indigo' : 'border-soft-black/10 bg-white'}`}>
      <span aria-hidden className={`absolute top-0 left-0 h-full w-1.5 ${dark ? 'bg-grace-orange/40' : 'bg-grace-orange/50'}`} />
      <div className="animate-marquee flex w-max items-center gap-10">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className={`font-serif text-lg sm:text-xl font-extrabold whitespace-nowrap shrink-0 uppercase tracking-wide ${dark ? 'text-white/25' : 'text-soft-black/25'}`}>
            {t} <span className="text-grace-orange">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══ Égaliseur animé (section musique) ═════════════════════════ */
function Equalizer() {
  const bars = [0.9, 0.5, 1, 0.4, 0.75, 0.6, 1, 0.5, 0.85];
  return (
    <div className="flex items-end gap-1.5 h-12" aria-hidden>
      {bars.map((peak, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-grace-orange to-grace-sky"
          animate={{ height: [`${peak * 20}%`, `${peak * 100}%`, `${peak * 35}%`, `${peak * 85}%`, `${peak * 20}%`] }}
          transition={{ duration: 1.6 + i * 0.13, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ══ Perforations de pellicule (section films) ═════════════════ */
function FilmStrip() {
  return (
    <div className="flex justify-between px-2" aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className="w-3 h-4 sm:w-4 sm:h-5 rounded-[3px] bg-white/10 shrink-0" />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export function Home() {
  const heroRef = useRef<HTMLElement>(null);

  const [live, setLive]           = useState<LiveData | null>(null);
  const [playlists, setPlaylists] = useState<YTPlaylist[]>([]);
  const [links, setLinks]         = useState<RecommendedLink[]>([]);
  const [posts, setPosts]         = useState<BlogPost[]>([]);
  const [docs, setDocs]           = useState<StudyDocument[]>([]);
  const [lightbox, setLightbox]   = useState<VideoContent | null>(null);
  const [plThumbs, setPlThumbs]   = useState<Record<string, string>>({});
  const [partners, setPartners]   = useState<Partner[]>([]);
  const [partnerVideosMap, setPartnerVideosMap] = useState<Record<string, VideoContent[]>>({});

  /* ── Chargement parallèle de toutes les sources ── */
  useEffect(() => {
    fetchLiveStatus().then(data => { if (data) setLive(data); });
    fetch('/api/youtube/playlists').then(r => { if (!r.ok) throw 0; return r.json(); }).then(setPlaylists).catch(() => {});
    getRecommendedLinks().then(list => {
      setLinks(list);
      list.filter(l => isYtPlaylistId(l.youtubeId)).forEach(l => {
        fetch(`/api/youtube/video-info?urlOrId=${encodeURIComponent(l.youtubeId)}`)
          .then(r => r.ok ? r.json() : null)
          .then(info => { if (info?.image) setPlThumbs(prev => ({ ...prev, [l.youtubeId]: info.image })); })
          .catch(() => {});
      });
    }).catch(() => {});
    getBlogPosts().then(setPosts).catch(() => {});
    getStudyDocuments().then(setDocs).catch(() => {});

    // Chaînes partenaires gérées depuis le dashboard admin (comme dans Emissions).
    // Pour chaque partenaire : on récupère ses playlists YouTube, on prend la plus
    // fournie, puis ses vidéos — au lieu de pointer un channelId en dur qui peut
    // remonter des vidéos dont l'intégration a été désactivée par leur propriétaire.
    getPartners().then(async (list) => {
      setPartners(list);
      for (const p of list) {
        try {
          const plRes = await fetch(`/api/youtube/channel-playlists?channelUrl=${encodeURIComponent(p.youtubeUrl)}`);
          if (!plRes.ok) continue;
          const playlists: YTPlaylist[] = await plRes.json();
          if (!Array.isArray(playlists) || playlists.length === 0) continue;
          const best = playlists.reduce((a, b) => (b.videoCount > a.videoCount ? b : a), playlists[0]);
          const viRes = await fetch(`/api/playlist-items?playlistId=${encodeURIComponent(best.id)}`);
          if (!viRes.ok) continue;
          const items: { videoId: string; title: string; thumbnail: string }[] = await viRes.json();
          const videos: VideoContent[] = items.slice(0, 12).map(v => ({
            id: `pv-${v.videoId}`,
            title: v.title,
            image: v.thumbnail,
            meta: 'Vidéo',
            embedUrl: ytEmbedUrl(v.videoId),
          }));
          setPartnerVideosMap(prev => ({ ...prev, [p.id]: videos }));
        } catch { /* ignore ce partenaire */ }
      }
    }).catch(() => {});
  }, []);

  /* ── Animations d'entrée du hero (GSAP) ── */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const split = new SplitText('.hero-title', { type: 'lines' });
      gsap.set('.hero-title', { opacity: 1 });
      gsap.from(split.lines, {
        yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.15,
      });
      gsap.from('.hero-fade', {
        y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.55,
      });
      gsap.from('.hero-player', {
        y: 90, opacity: 0, scale: 0.92, duration: 1.2, ease: 'power3.out', delay: 0.4,
      });
      gsap.to('.hero-bg', {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: el, scrub: 1.5, start: 'top top', end: 'bottom top' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  /* ── Verrouiller le scroll quand la lightbox est ouverte ── */
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  /* ── Regroupement des contenus vidéo par section ── */
  const videoSections = useMemo(() => {
    const buckets: Record<SectionKey, VideoContent[]> = {
      sermon: [], enseignement: [], louange: [], film: [], emission: [],
    };
    for (const pl of playlists) {
      buckets[classify(pl.title)].push({
        id: `pl-${pl.id}`,
        title: pl.title,
        description: pl.description,
        image: pl.thumbnail,
        meta: `${pl.videoCount} vidéo${pl.videoCount > 1 ? 's' : ''}`,
        embedUrl: `https://www.youtube.com/embed/videoseries?list=${pl.id}&autoplay=1&rel=0`,
      });
    }
    for (const l of links) {
      const isPl = isYtPlaylistId(l.youtubeId);
      buckets[classifyCategory(l.category)].push({
        id: `rl-${l.id}`,
        title: l.title,
        description: l.description,
        image: isPl ? plThumbs[l.youtubeId] : (ytThumbUrl(l.youtubeId) || undefined),
        meta: isPl ? 'Playlist' : 'Vidéo',
        embedUrl: ytEmbedUrl(l.youtubeId),
      });
    }
    return buckets;
  }, [playlists, links, plThumbs]);

  const featuredPost = posts[0];
  const otherPosts   = posts.slice(1, 7);

  const spotlightPartners = partners.filter(p => (partnerVideosMap[p.id]?.length || 0) > 0);

  const heroEmbed = live?.videoId
    ? `https://www.youtube.com/embed/${live.videoId}?autoplay=1&mute=1&rel=0&playsinline=1`
    : null;

  return (
    <div className="bg-cream">
      <SEO
        title="Grâce TV — La Bonne Nouvelle Partout Partout"
        description="Chaîne de télévision chrétienne basée à Yaoundé. Sermons, enseignements, louange, films, articles et documents — vivez la Bonne Nouvelle en direct."
        path="/"
        structuredData={[tvStationSchema, webSiteSchema]}
      />

      {/* ════════════ HERO — GRAND ÉCRAN CINÉMA ════════════ */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-grace-blue-deep text-white flex flex-col justify-center">
        {/* Fond parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/uploads/externe.JPG" alt="" aria-hidden
            className="hero-bg absolute inset-0 w-full h-full object-cover opacity-35"
            style={{ transform: 'scale(1.15)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-grace-blue-deep/95 via-grace-blue-deep/85 to-grace-indigo" />
          <div className="absolute inset-0 cross-pattern-dark opacity-25" />
          <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-grace-orange/15 blur-[140px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-0 right-0 w-[650px] h-[650px] rounded-full bg-grace-sky/15 blur-[160px] animate-pulse" style={{ animationDuration: '8s' }} />
          {/* Filigrane géant */}
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif font-extrabold whitespace-nowrap select-none pointer-events-none text-[22vw] leading-none opacity-60"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.05)', color: 'transparent' }}
          >
            GRÂCE TV
          </span>
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
          {/* Titre compact au-dessus de l'écran */}
          <span className="hero-fade inline-flex items-center gap-2 text-grace-orange text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] mb-5">
            <Sparkles className="w-4 h-4" /> L'Éternel est ma bannière — Exode 17:15
          </span>
          <h1 className="hero-title font-serif font-extrabold leading-[1.02] text-4xl sm:text-6xl lg:text-7xl text-white mb-4" style={{ opacity: 0 }}>
            La Bonne Nouvelle, <span className="text-grace-orange italic">en direct</span> chez vous.
          </h1>
          <p className="hero-fade font-sans text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-10">
            Sermons, enseignements, louange, films et écrits — depuis Yaoundé vers les nations, 24h/24.
          </p>

          {/* ── LE GRAND ÉCRAN ── */}
          <div className="hero-player relative mx-auto w-full max-w-5xl">
            {/* Halo ambiant */}
            <div className="absolute -inset-8 sm:-inset-12 rounded-[3rem] bg-gradient-to-br from-grace-orange/25 via-transparent to-grace-sky/25 blur-3xl" />
            {/* Équerres décoratives */}
            <span aria-hidden className="absolute -top-4 -left-4 w-10 h-10 border-t-2 border-l-2 border-grace-orange/70 rounded-tl-xl" />
            <span aria-hidden className="absolute -top-4 -right-4 w-10 h-10 border-t-2 border-r-2 border-grace-orange/70 rounded-tr-xl" />
            <span aria-hidden className="absolute -bottom-4 -left-4 w-10 h-10 border-b-2 border-l-2 border-grace-orange/70 rounded-bl-xl" />
            <span aria-hidden className="absolute -bottom-4 -right-4 w-10 h-10 border-b-2 border-r-2 border-grace-orange/70 rounded-br-xl" />

            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/25 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] bg-black">
              {/* Barre de statut */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-black/85 backdrop-blur border-b border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  {live?.isLive ? (
                    <span className="inline-flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      En direct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-grace-orange text-[10px] font-bold uppercase tracking-[0.2em]">
                      <Tv className="w-3 h-3" /> Dernier contenu
                    </span>
                  )}
                  <span className="text-white/45 text-[10px] uppercase tracking-widest truncate hidden sm:block max-w-[340px]">
                    {live?.title || 'Grâce TV'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-widest shrink-0">
                  <Volume2 className="w-3 h-3" /> Son coupé
                </span>
              </div>
              <div className="aspect-video">
                {heroEmbed ? (
                  <iframe
                    src={heroEmbed}
                    title={live?.title || 'Grâce TV'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/30">
                    <Radio className="w-12 h-12 animate-pulse" />
                    <p className="text-xs uppercase tracking-[0.25em]">Connexion à la chaîne…</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA sous l'écran */}
          <div className="hero-fade flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Link
              to="/live"
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 bg-grace-orange text-white px-9 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white relative z-10" />
              <span className="relative z-10">Regarder en direct</span>
              <span className="absolute inset-0 bg-grace-orange-dark scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </Link>
            <a
              href="#contenus"
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-grace-orange hover:text-grace-orange text-white px-9 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors"
            >
              Explorer les contenus <ArrowDown className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Bande marquee */}
      <MarqueeBand items={['Sermons & Cultes', 'Enseignements', 'Films', 'Émissions', 'Articles', 'Documents', 'Louange & Chansons', 'En direct 24/7']} />

      {/* ════════════ DÉCLARATION D'INTENTION ════════════ */}
      <section id="contenus" className="relative bg-cream py-24 sm:py-32 scroll-mt-16 overflow-hidden">
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif font-extrabold whitespace-nowrap select-none pointer-events-none text-[18vw] leading-none"
          style={{ WebkitTextStroke: '1px rgba(26,26,26,0.045)', color: 'transparent' }}
        >
          ✦ PAROLE ✦
        </span>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...reveal} className="flex justify-center mb-8">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-grace-orange/40 text-grace-orange">
              <Sparkles className="w-5 h-5" />
            </span>
          </motion.div>
          <motion.h2 {...reveal} className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-soft-black leading-[1.12]">
            Chaque jour, une Parole<br />
            <span className="text-grace-orange italic">pour chaque vie.</span>
          </motion.h2>
          <motion.p {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="font-sans text-soft-black/65 text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Que vous cherchiez un sermon qui relève, un enseignement qui affermit, une louange
            qui élève ou une lecture qui nourrit — tout est là, à portée de main.
          </motion.p>
        </div>
      </section>

      {/* ════════════ 01 · SERMONS & CULTES ════════════ */}
      {videoSections.sermon.length > 0 && (
        <section className="relative bg-white py-24 sm:py-32 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 sm:mb-24">
              <SectionHeader
                num="01"
                icon={Church}
                label="Sermons & Cultes"
                title="La Parole prêchée"
                accent="avec puissance."
                desc="Revivez les cultes du dimanche et les prédications qui édifient toute la communauté — chaque message est une rencontre avec Dieu."
              />
            </div>
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Carte vedette avec cadre décalé */}
              <motion.div {...reveal} className="relative">
                <span aria-hidden className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-grace-blue/15 to-grace-orange/15 rotate-1" />
                <div className="relative">
                  <VideoCard item={videoSections.sermon[0]} onPlay={setLightbox} big />
                </div>
              </motion.div>
              <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.12 }} className="lg:pt-4">
                <div className="grid sm:grid-cols-2 gap-5">
                  {videoSections.sermon.slice(1, 5).map((v, i) => (
                    <VideoCard key={v.id} item={v} onPlay={setLightbox} index={i + 1} />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════ 02 · ENSEIGNEMENTS ════════════ */}
      {videoSections.enseignement.length > 0 && (
        <section className="relative bg-gray-soft py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 cross-pattern opacity-40 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 sm:mb-28">
              <SectionHeader
                num="02"
                icon={GraduationCap}
                label="Enseignements"
                title="Grandir dans"
                accent="la connaissance."
                desc="Études bibliques, École des Affaires du Royaume, formations — des enseignements profonds pour enraciner votre foi et transformer votre quotidien."
              />
            </div>
            <Rail>
              {videoSections.enseignement.map((v, i) => (
                <VideoCard key={v.id} item={v} onPlay={setLightbox} index={i} />
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* ════════════ 03 · FILMS (pellicule cinéma) ════════════ */}
      {videoSections.film.length > 0 && (
        <section className="relative overflow-hidden bg-grace-blue-deep text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-grace-blue-deep via-grace-indigo to-grace-blue-deep" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-grace-orange/10 blur-[140px]" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-grace-sky/10 blur-[110px]" />
            <div className="absolute inset-0 cross-pattern-dark opacity-15" />
          </div>
          <FilmStrip />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="mb-16 sm:mb-28">
              <SectionHeader
                dark
                num="03"
                icon={Film}
                label="Films"
                title="Des histoires qui"
                accent="inspirent la foi."
                desc="Des films chrétiens qui touchent, questionnent et rappellent que Dieu écrit encore de grandes histoires aujourd'hui."
              />
            </div>
            <Rail dark>
              {videoSections.film.map((v, i) => (
                <VideoCard key={v.id} item={v} onPlay={setLightbox} dark index={i} />
              ))}
            </Rail>
          </div>
          <FilmStrip />
        </section>
      )}

      {/* ════════════ 04 · ÉMISSIONS ════════════ */}
      {videoSections.emission.length > 0 && (
        <section className="relative bg-white py-24 sm:py-32 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 sm:mb-28 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <SectionHeader
                num="04"
                icon={Tv}
                label="Émissions"
                title="Nos programmes"
                accent="phares."
                desc="Manne Matinale, Sommet d'Élévation, témoignages… retrouvez les rendez-vous réguliers qui rythment la vie de la chaîne."
              />
              <motion.div {...reveal}>
                <Link to="/emissions" className="group inline-flex items-center gap-2 text-grace-blue hover:text-grace-orange font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap">
                  Toutes les émissions <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>
            </div>
            <Rail>
              {videoSections.emission.map((v, i) => (
                <VideoCard key={v.id} item={v} onPlay={setLightbox} index={i} />
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* Bande marquee sombre */}
      <MarqueeBand dark items={['Lire', 'Méditer', 'Étudier', 'Partager', 'La Parole vivante']} />

      {/* ════════════ 05 · ARTICLES (magazine) ════════════ */}
      {posts.length > 0 && (
        <section className="relative bg-cream py-24 sm:py-32 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 sm:mb-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <SectionHeader
                num="05"
                icon={Newspaper}
                label="Articles & Méditations"
                title="Des mots qui"
                accent="nourrissent l'âme."
                desc="Dévotions, réflexions et méditations écrites par nos pasteurs et rédacteurs — prenez le temps de lire, souligner, méditer."
              />
              <motion.div {...reveal}>
                <Link to="/eglise/blog" className="group inline-flex items-center gap-2 text-grace-blue hover:text-grace-orange font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap">
                  Tous les articles <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Article vedette — style magazine */}
            {featuredPost && (
              <motion.div {...reveal} className="relative">
                {/* Guillemet décoratif */}
                <span aria-hidden className="absolute -top-12 -left-2 sm:-left-8 font-serif text-grace-orange/20 text-[9rem] leading-none select-none">"</span>
                <Link
                  to={`/eglise/blog/${featuredPost.id}`}
                  className="group relative grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden border border-soft-black/8 shadow-sm hover:shadow-[0_30px_80px_-20px_rgba(12,46,102,0.3)] transition-all duration-500 mb-12"
                >
                  <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[380px] overflow-hidden">
                    {featuredPost.coverImage ? (
                      <img
                        src={featuredPost.coverImage} alt={featuredPost.title} loading="lazy" referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-grace-blue-deep flex items-center justify-center">
                        <BookOpen className="w-14 h-14 text-white/20" />
                      </div>
                    )}
                    <span className="absolute top-5 left-5 rotate-[-3deg] bg-grace-orange text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded shadow-lg">
                      À la une
                    </span>
                  </div>
                  <div className="p-8 sm:p-12 flex flex-col justify-center">
                    <span className="text-grace-orange text-[11px] font-bold uppercase tracking-[0.22em] mb-4 flex items-center gap-3">
                      <span className="h-px w-8 bg-grace-orange/50" /> {featuredPost.category}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-4xl font-extrabold text-soft-black leading-tight group-hover:text-grace-blue transition-colors">
                      {featuredPost.title}
                    </h3>
                    {featuredPost.excerpt && (
                      <p className="text-soft-black/60 mt-5 leading-relaxed line-clamp-3 border-l-2 border-grace-orange/30 pl-4 italic">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-7 text-xs font-bold uppercase tracking-wider text-soft-black/45">
                      <span>{featuredPost.author}</span>
                      <span className="w-1 h-1 rounded-full bg-grace-orange" />
                      <span>{new Date(featuredPost.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-grace-orange hidden sm:block" />
                      <span className="hidden sm:inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.max(1, Math.round((featuredPost.content?.length || 800) / 1100))} min</span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-grace-orange font-bold text-sm uppercase tracking-wider mt-8 group-hover:gap-4 transition-all">
                      Lire l'article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Autres articles */}
            {otherPosts.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherPosts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                  >
                    <Link
                      to={`/eglise/blog/${p.id}`}
                      className="group block bg-white rounded-2xl overflow-hidden border border-soft-black/8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt={p.title} loading="lazy" referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full bg-gray-soft flex items-center justify-center">
                            <BookOpen className="w-9 h-9 text-soft-black/15" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-soft-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                          {p.category}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif font-extrabold text-soft-black leading-snug line-clamp-2 group-hover:text-grace-blue transition-colors">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-3 text-[11px] font-bold uppercase tracking-wider text-soft-black/40">
                          <span>{p.author}</span>
                          <span className="w-1 h-1 rounded-full bg-grace-orange" />
                          <span>{new Date(p.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <span className="block h-0.5 mt-4 w-0 group-hover:w-full transition-all duration-500 bg-grace-orange" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════ 06 · DOCUMENTS D'ÉTUDE ════════════ */}
      {docs.length > 0 && (
        <section className="relative bg-white py-24 sm:py-32 overflow-hidden">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14 sm:mb-20">
              <SectionHeader
                num="06"
                icon={FileText}
                label="Documents d'étude"
                title="Pour aller"
                accent="plus loin."
                desc="Supports d'étude, notes de prédication et ressources à lire et relire, où que vous soyez."
              />
            </div>
            <div className="space-y-4">
              {docs.slice(0, 6).map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
                >
                  <Link
                    to={`/document/${d.id}`}
                    className="group relative flex items-center gap-5 sm:gap-7 bg-gray-soft hover:bg-white border border-transparent hover:border-grace-blue/15 rounded-2xl px-5 sm:px-8 py-6 transition-all duration-300 hover:shadow-[0_18px_45px_-15px_rgba(12,46,102,0.25)] hover:-translate-y-0.5"
                  >
                    {/* Index */}
                    <span
                      aria-hidden
                      className="hidden sm:block font-serif font-extrabold text-4xl w-14 shrink-0 text-center"
                      style={{ WebkitTextStroke: '1.2px rgba(23,99,176,0.35)', color: 'transparent' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="shrink-0 w-12 h-12 rounded-xl bg-grace-blue/10 group-hover:bg-grace-orange group-hover:text-white group-hover:rotate-6 text-grace-blue flex items-center justify-center transition-all">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-extrabold text-soft-black truncate group-hover:text-grace-blue transition-colors text-lg">{d.title}</h3>
                      {d.description && <p className="text-sm text-soft-black/55 truncate mt-0.5">{d.description}</p>}
                    </div>
                    <span className="shrink-0 hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-soft-black/40 group-hover:text-grace-orange transition-colors">
                      {d.fileType?.toUpperCase() || 'DOC'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════ 07 · CHAÎNES PARTENAIRES À L'HONNEUR ════════════ */}
      {spotlightPartners.length > 0 && (
        <section className="relative bg-cream py-24 sm:py-32 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
            {spotlightPartners.map((p, pIdx) => {
              const name = partnerDisplayName(p);
              const videos = partnerVideosMap[p.id] || [];
              return (
                <div key={p.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start min-w-0">
                  {/* Colonne présentation */}
                  <div className="relative lg:sticky lg:top-28 min-w-0">
                    <SectionHeader
                      num="07"
                      icon={Heart}
                      label="Chaîne partenaire"
                      title="La voix de"
                      accent={name}
                      desc={p.bio || `Une voix précieuse de notre communauté${p.church ? ` (${p.church})` : ''}, dont Grâce TV est heureuse de relayer les messages et les vidéos.`}
                    />
                    <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.2 }} className="flex items-center gap-4 mt-8">
                      {p.avatarUrl && (
                        <img
                          src={p.avatarUrl} alt={name} referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-grace-orange/30"
                        />
                      )}
                      <a
                        href={p.youtubeUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-grace-blue hover:text-grace-orange font-bold text-sm uppercase tracking-wider transition-colors"
                      >
                        Voir la chaîne <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    </motion.div>
                  </div>
                  {/* Rail vidéos */}
                  <div className="min-w-0">
                    <Rail>
                      {videos.map((v, i) => (
                        <VideoCard key={v.id} item={v} onPlay={setLightbox} index={i} />
                      ))}
                    </Rail>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ════════════ 08 · LOUANGE & CHANSONS — clôture musicale ════════════ */}
      {videoSections.louange.length > 0 && (
        <section className="relative overflow-hidden bg-grace-indigo py-24 sm:py-32 text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[550px] h-[550px] rounded-full bg-grace-orange/10 blur-[140px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-grace-sky/15 blur-[110px]" />
            <div className="absolute inset-0 cross-pattern-dark opacity-20" />
            {/* Notes flottantes */}
            {['10%', '25%', '70%', '85%'].map((left, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute text-grace-orange/20 font-serif text-4xl select-none"
                style={{ left, top: `${20 + i * 18}%` }}
                animate={{ y: [0, -26, 0], rotate: [0, i % 2 ? 12 : -12, 0], opacity: [0.15, 0.4, 0.15] }}
                transition={{ duration: 5 + i * 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {i % 2 ? '♪' : '♫'}
              </motion.span>
            ))}
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 sm:mb-24 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
              <SectionHeader
                dark
                num="08"
                icon={Music}
                label="Louange & Chansons"
                title="Élevez une voix"
                accent="d'adoration."
                desc="Concerts, cantiques et moments de worship — laissez la musique porter votre cœur dans la présence de Dieu."
              />
              <motion.div {...reveal} className="shrink-0 pb-2">
                <Equalizer />
              </motion.div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoSections.louange.slice(0, 6).map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                >
                  <VideoCard item={v} onPlay={setLightbox} dark index={i} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════ CTA FINAL ════════════ */}
      <CtaShowcase />

      {/* ════════════ LIGHTBOX CINÉMA ════════════ */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="relative w-full max-w-5xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-white font-serif font-extrabold text-sm sm:text-lg truncate pr-4">{lightbox.title}</p>
                <button
                  onClick={() => setLightbox(null)}
                  className="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-grace-orange text-white flex items-center justify-center transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl bg-black">
                <iframe
                  src={lightbox.embedUrl}
                  title={lightbox.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
