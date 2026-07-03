import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Play, X, ArrowRight, ArrowDown, ChevronLeft, ChevronRight,
  Church, GraduationCap, Music, Film, Newspaper, FileText, Tv,
  Radio, Sparkles, BookOpen, Volume2,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { tvStationSchema, webSiteSchema } from '../lib/structuredData';
import { gsap, SplitText } from '../lib/gsap';
import { CtaShowcase } from '../components/home/CtaShowcase';
import {
  getBlogPosts, getRecommendedLinks, getStudyDocuments,
  type BlogPost, type RecommendedLink, type StudyDocument,
} from '../lib/dbService';

/* ══ Types ═════════════════════════════════════════════════════ */
interface YTPlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
}

interface LiveData {
  isLive: boolean;
  videoId: string | null;
  title?: string;
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

/* ══ Classification des playlists ══════════════════════════════ */
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

/* ══ Petits composants réutilisables ═══════════════════════════ */
const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function SectionHeader({ label, title, accent, desc, dark = false, icon: Icon }: {
  label: string; title: string; accent: string; desc: string; dark?: boolean; icon: React.ElementType;
}) {
  return (
    <div className="max-w-3xl">
      <motion.span
        {...reveal}
        className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] mb-5 ${dark ? 'text-grace-orange' : 'text-grace-orange'}`}
      >
        <Icon className={`w-4 h-4 ${dark ? 'text-grace-sky' : 'text-grace-blue'}`} /> {label}
      </motion.span>
      <motion.h2
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.08 }}
        className={`font-serif text-3xl sm:text-5xl font-extrabold leading-[1.08] ${dark ? 'text-white' : 'text-soft-black'}`}
      >
        {title} <span className="text-grace-orange italic">{accent}</span>
      </motion.h2>
      <motion.p
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.16 }}
        className={`font-sans text-base sm:text-lg leading-relaxed mt-5 ${dark ? 'text-white/70' : 'text-soft-black/65'}`}
      >
        {desc}
      </motion.p>
    </div>
  );
}

/* Carte vidéo — utilisée dans les rails et grilles */
function VideoCard({ item, onPlay, dark = false, big = false }: {
  item: VideoContent; onPlay: (v: VideoContent) => void; dark?: boolean; big?: boolean;
}) {
  return (
    <button
      onClick={() => onPlay(item)}
      className={`group relative text-left shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1.5 ${
        big ? 'w-full' : 'w-[280px] sm:w-[320px]'
      } ${dark ? 'bg-white/5 border border-white/10 hover:border-grace-orange/50' : 'bg-white border border-soft-black/8 shadow-sm hover:shadow-2xl'}`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        {/* Bouton play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-grace-orange text-white flex items-center justify-center scale-0 group-hover:scale-100 rotate-45 group-hover:rotate-0 transition-all duration-300 shadow-2xl shadow-grace-orange/40">
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          </span>
        </div>
        {item.meta && (
          <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            {item.meta}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className={`font-serif font-extrabold leading-snug line-clamp-2 transition-colors ${
          big ? 'text-xl sm:text-2xl' : 'text-base'
        } ${dark ? 'text-white group-hover:text-grace-orange' : 'text-soft-black group-hover:text-grace-blue'}`}>
          {item.title}
        </h3>
        {big && item.description && (
          <p className={`text-sm mt-2 line-clamp-2 ${dark ? 'text-white/60' : 'text-soft-black/55'}`}>{item.description}</p>
        )}
      </div>
    </button>
  );
}

/* Rail horizontal avec flèches */
function Rail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 360, behavior: 'smooth' });
  return (
    <div className="relative">
      <div ref={ref} className="flex gap-5 overflow-x-auto snap-x scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {children}
      </div>
      <div className="hidden sm:flex gap-2 absolute -top-16 right-0">
        <button onClick={() => scroll(-1)} aria-label="Précédent"
          className="w-10 h-10 rounded-full border border-soft-black/15 hover:bg-soft-black hover:text-white flex items-center justify-center transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => scroll(1)} aria-label="Suivant"
          className="w-10 h-10 rounded-full border border-soft-black/15 hover:bg-soft-black hover:text-white flex items-center justify-center transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* Bande marquee séparatrice */
function MarqueeBand({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <div className={`marquee-pause overflow-hidden py-5 border-y ${dark ? 'border-white/10 bg-grace-indigo' : 'border-soft-black/10 bg-white'}`}>
      <div className="animate-marquee flex w-max items-center gap-10">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className={`font-serif text-lg font-extrabold whitespace-nowrap shrink-0 uppercase tracking-wide ${dark ? 'text-white/25' : 'text-soft-black/25'}`}>
            {t} <span className="text-grace-orange">✦</span>
          </span>
        ))}
      </div>
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

  /* ── Chargement parallèle de toutes les sources ── */
  useEffect(() => {
    fetch('/api/youtube/live').then(r => r.json()).then(setLive).catch(() => {});
    fetch('/api/youtube/playlists').then(r => { if (!r.ok) throw 0; return r.json(); }).then(setPlaylists).catch(() => {});
    getRecommendedLinks().then(setLinks).catch(() => {});
    getBlogPosts().then(setPosts).catch(() => {});
    getStudyDocuments().then(setDocs).catch(() => {});
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
        y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out', delay: 0.6,
      });
      gsap.from('.hero-player', {
        y: 60, opacity: 0, scale: 0.94, duration: 1.1, ease: 'power3.out', delay: 0.45,
      });
      gsap.to('.hero-bg', {
        yPercent: 12, ease: 'none',
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
      buckets[classifyCategory(l.category)].push({
        id: `rl-${l.id}`,
        title: l.title,
        description: l.description,
        image: `https://i.ytimg.com/vi/${l.youtubeId}/hqdefault.jpg`,
        meta: 'Vidéo',
        embedUrl: `https://www.youtube.com/embed/${l.youtubeId}?autoplay=1&rel=0`,
      });
    }
    return buckets;
  }, [playlists, links]);

  const featuredPost = posts[0];
  const otherPosts   = posts.slice(1, 7);

  /* URL du lecteur hero : live prioritaire, sinon dernier contenu */
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

      {/* ════════════ HERO CINÉMATIQUE + LECTEUR AUTO ════════════ */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-grace-blue-deep text-white flex items-center">
        {/* Fond parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/uploads/externe.JPG"
            alt=""
            aria-hidden
            className="hero-bg absolute inset-0 w-full h-full object-cover opacity-40"
            style={{ transform: 'scale(1.15)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-grace-blue-deep via-grace-blue-deep/90 to-grace-indigo" />
          <div className="absolute inset-0 cross-pattern-dark opacity-25" />
          {/* Halos animés */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-grace-orange/15 blur-[130px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-grace-sky/15 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-10 items-center">
          {/* Colonne texte */}
          <div>
            <span className="hero-fade inline-flex items-center gap-2 text-grace-orange text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-6">
              <Sparkles className="w-4 h-4" /> L'Éternel est ma bannière — Exode 17:15
            </span>
            <h1 className="hero-title font-serif font-extrabold leading-[1.02] text-4xl sm:text-6xl xl:text-7xl text-white" style={{ opacity: 0 }}>
              La Bonne Nouvelle,<br />
              <span className="text-grace-orange italic">en direct</span> chez vous.
            </h1>
            <p className="hero-fade font-sans text-white/75 text-base sm:text-lg max-w-md mt-7 leading-relaxed">
              Sermons, enseignements, louange, films et écrits — Grâce TV diffuse 24h/24
              la Parole qui transforme les vies, depuis Yaoundé vers les nations.
            </p>
            <div className="hero-fade flex flex-col sm:flex-row gap-4 mt-9">
              <Link
                to="/live"
                className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 bg-grace-orange text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-white relative z-10" />
                <span className="relative z-10">Regarder en direct</span>
                <span className="absolute inset-0 bg-grace-orange-dark scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </Link>
              <a
                href="#contenus"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-grace-orange hover:text-grace-orange text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors"
              >
                Explorer les contenus <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Colonne lecteur — le cœur du hero */}
          <div className="hero-player relative">
            {/* Glow ambiant derrière l'écran */}
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-grace-orange/30 via-transparent to-grace-sky/30 blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl shadow-black/50 bg-black">
              {/* Barre de statut du lecteur */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-black/80 backdrop-blur border-b border-white/10">
                <div className="flex items-center gap-2.5">
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
                  <span className="text-white/40 text-[10px] uppercase tracking-widest hidden sm:block truncate max-w-[220px]">
                    {live?.title || 'Grâce TV'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-white/40 text-[10px] uppercase tracking-widest">
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
                    <Radio className="w-10 h-10 animate-pulse" />
                    <p className="text-xs uppercase tracking-[0.2em]">Connexion à la chaîne…</p>
                  </div>
                )}
              </div>
            </div>
            {/* Signature */}
            <div className="hero-fade absolute -bottom-9 right-1 text-right">
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Grâce TV · depuis 2011 · Yaoundé</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-fade absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-white/40">
          <span className="text-[10px] uppercase tracking-[0.25em]">Défiler</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* Bande marquee */}
      <MarqueeBand items={['Sermons & Cultes', 'Enseignements', 'Louange & Chansons', 'Films', 'Articles', 'Documents', 'En direct 24/7']} />

      {/* ════════════ DÉCLARATION D'INTENTION ════════════ */}
      <section id="contenus" className="bg-cream py-20 sm:py-28 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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

      {/* ════════════ SERMONS & CULTES ════════════ */}
      {videoSections.sermon.length > 0 && (
        <section className="bg-white py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14 sm:mb-20">
              <SectionHeader
                icon={Church}
                label="Sermons & Cultes"
                title="La Parole prêchée"
                accent="avec puissance."
                desc="Revivez les cultes du dimanche et les prédications qui édifient toute la communauté — chaque message est une rencontre avec Dieu."
              />
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Carte vedette */}
              <motion.div {...reveal}>
                <VideoCard item={videoSections.sermon[0]} onPlay={setLightbox} big />
              </motion.div>
              {/* Rail des autres */}
              <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.12 }} className="lg:pt-2">
                <div className="grid sm:grid-cols-2 gap-5">
                  {videoSections.sermon.slice(1, 5).map(v => (
                    <VideoCard key={v.id} item={v} onPlay={setLightbox} />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════ ENSEIGNEMENTS ════════════ */}
      {videoSections.enseignement.length > 0 && (
        <section className="bg-gray-soft py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14 sm:mb-24">
              <SectionHeader
                icon={GraduationCap}
                label="Enseignements"
                title="Grandir dans"
                accent="la connaissance."
                desc="Études bibliques, École des Affaires du Royaume, formations — des enseignements profonds pour enraciner votre foi et transformer votre quotidien."
              />
            </div>
            <Rail>
              {videoSections.enseignement.map(v => (
                <VideoCard key={v.id} item={v} onPlay={setLightbox} />
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* ════════════ LOUANGE & CHANSONS (section sombre) ════════════ */}
      {videoSections.louange.length > 0 && (
        <section className="relative overflow-hidden bg-grace-indigo py-20 sm:py-28 text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-grace-orange/10 blur-[130px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-grace-sky/15 blur-[110px]" />
            <div className="absolute inset-0 cross-pattern-dark opacity-20" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14 sm:mb-20">
              <SectionHeader
                dark
                icon={Music}
                label="Louange & Chansons"
                title="Élevez une voix"
                accent="d'adoration."
                desc="Concerts, cantiques et moments de worship — laissez la musique porter votre cœur dans la présence de Dieu."
              />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoSections.louange.slice(0, 6).map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <VideoCard item={v} onPlay={setLightbox} dark />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════ FILMS ════════════ */}
      {videoSections.film.length > 0 && (
        <section className="bg-soft-black py-20 sm:py-28 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14 sm:mb-24">
              <SectionHeader
                dark
                icon={Film}
                label="Films"
                title="Des histoires qui"
                accent="inspirent la foi."
                desc="Des films chrétiens qui touchent, questionnent et rappellent que Dieu écrit encore de grandes histoires aujourd'hui."
              />
            </div>
            <Rail>
              {videoSections.film.map(v => (
                <VideoCard key={v.id} item={v} onPlay={setLightbox} dark />
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* ════════════ ÉMISSIONS ════════════ */}
      {videoSections.emission.length > 0 && (
        <section className="bg-white py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14 sm:mb-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <SectionHeader
                icon={Tv}
                label="Émissions"
                title="Nos programmes"
                accent="phares."
                desc="Manne Matinale, Sommet d'Élévation, témoignages… retrouvez les rendez-vous réguliers qui rythment la vie de la chaîne."
              />
              <motion.div {...reveal}>
                <Link to="/emissions" className="inline-flex items-center gap-2 text-grace-blue hover:text-grace-orange font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap">
                  Toutes les émissions <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
            <Rail>
              {videoSections.emission.map(v => (
                <VideoCard key={v.id} item={v} onPlay={setLightbox} />
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* Bande marquee inversée */}
      <MarqueeBand dark items={['Lire', 'Méditer', 'Étudier', 'Partager', 'La Parole vivante']} />

      {/* ════════════ ARTICLES (éditorial) ════════════ */}
      {posts.length > 0 && (
        <section className="bg-cream py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14 sm:mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <SectionHeader
                icon={Newspaper}
                label="Articles & Méditations"
                title="Des mots qui"
                accent="nourrissent l'âme."
                desc="Dévotions, réflexions et méditations écrites par nos pasteurs et rédacteurs — prenez le temps de lire, souligner, méditer."
              />
              <motion.div {...reveal}>
                <Link to="/eglise/blog" className="inline-flex items-center gap-2 text-grace-blue hover:text-grace-orange font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap">
                  Tous les articles <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Article vedette */}
            {featuredPost && (
              <motion.div {...reveal}>
                <Link
                  to={`/eglise/blog/${featuredPost.id}`}
                  className="group grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden border border-soft-black/8 shadow-sm hover:shadow-2xl transition-all duration-500 mb-10"
                >
                  <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[340px] overflow-hidden">
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
                  </div>
                  <div className="p-8 sm:p-12 flex flex-col justify-center">
                    <span className="text-grace-orange text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                      {featuredPost.category} · À la une
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-soft-black leading-tight group-hover:text-grace-blue transition-colors">
                      {featuredPost.title}
                    </h3>
                    {featuredPost.excerpt && (
                      <p className="text-soft-black/60 mt-4 leading-relaxed line-clamp-3">{featuredPost.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-6 text-xs font-bold uppercase tracking-wider text-soft-black/45">
                      <span>{featuredPost.author}</span>
                      <span className="w-1 h-1 rounded-full bg-grace-orange" />
                      <span>{new Date(featuredPost.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-grace-orange font-bold text-sm uppercase tracking-wider mt-7 group-hover:gap-3.5 transition-all">
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
                    transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={`/eglise/blog/${p.id}`}
                      className="group block bg-white rounded-2xl overflow-hidden border border-soft-black/8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full"
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
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════ DOCUMENTS D'ÉTUDE ════════════ */}
      {docs.length > 0 && (
        <section className="bg-white py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 sm:mb-16 text-center">
              <motion.span {...reveal} className="inline-flex items-center gap-2 text-grace-orange text-xs font-semibold uppercase tracking-[0.25em] mb-5">
                <FileText className="w-4 h-4 text-grace-blue" /> Documents d'étude
              </motion.span>
              <motion.h2 {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="font-serif text-3xl sm:text-5xl font-extrabold text-soft-black leading-tight">
                Pour aller <span className="text-grace-orange italic">plus loin.</span>
              </motion.h2>
              <motion.p {...reveal} transition={{ ...reveal.transition, delay: 0.16 }} className="font-sans text-soft-black/65 max-w-xl mx-auto mt-5 leading-relaxed">
                Supports d'étude, notes de prédication et ressources à lire et relire.
              </motion.p>
            </div>
            <div className="space-y-3">
              {docs.slice(0, 6).map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <Link
                    to={`/document/${d.id}`}
                    className="group flex items-center gap-5 bg-gray-soft hover:bg-white border border-transparent hover:border-grace-blue/15 rounded-2xl px-5 sm:px-7 py-5 transition-all duration-300 hover:shadow-lg"
                  >
                    <span className="shrink-0 w-12 h-12 rounded-xl bg-grace-blue/10 group-hover:bg-grace-orange group-hover:text-white text-grace-blue flex items-center justify-center transition-colors">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-extrabold text-soft-black truncate group-hover:text-grace-blue transition-colors">{d.title}</h3>
                      {d.description && <p className="text-sm text-soft-black/55 truncate mt-0.5">{d.description}</p>}
                    </div>
                    <span className="shrink-0 hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-soft-black/40 group-hover:text-grace-orange transition-colors">
                      {d.fileType?.toUpperCase() || 'DOC'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
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
