import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Play, Search, X, Loader2, ListVideo, FileText, BookOpen,
  Music, Film, GraduationCap, Church, Tv, Newspaper, LayoutGrid,
  ArrowRight, Radio,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { tvStationSchema, webSiteSchema } from '../lib/structuredData';
import { LiveSection } from '../components/home/LiveSection';
import {
  getBlogPosts, getRecommendedLinks, getStudyDocuments,
  type BlogPost, type RecommendedLink, type StudyDocument,
} from '../lib/dbService';

/* ── Types ───────────────────────────────────────────────────── */
interface YTPlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
}

type ContentType = 'emission' | 'sermon' | 'enseignement' | 'louange' | 'film' | 'article' | 'document';

interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  image?: string;
  meta?: string;
  date?: string;
  /* Action : soit une vidéo à lire sur place, soit un lien interne */
  embedUrl?: string;
  linkTo?: string;
}

/* ── Config des types de contenus ────────────────────────────── */
const TYPE_CONFIG: Record<ContentType, { label: string; icon: React.ElementType; badge: string }> = {
  emission:     { label: 'Émissions',     icon: Tv,            badge: 'bg-grace-blue text-white' },
  sermon:       { label: 'Sermons',       icon: Church,        badge: 'bg-grace-orange text-white' },
  enseignement: { label: 'Enseignements', icon: GraduationCap, badge: 'bg-purple-600 text-white' },
  louange:      { label: 'Louange & Chansons', icon: Music,    badge: 'bg-amber-500 text-white' },
  film:         { label: 'Films',         icon: Film,          badge: 'bg-red-600 text-white' },
  article:      { label: 'Articles',      icon: Newspaper,     badge: 'bg-emerald-600 text-white' },
  document:     { label: 'Documents',     icon: FileText,      badge: 'bg-slate-600 text-white' },
};

const FILTERS: { id: ContentType | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tout', icon: LayoutGrid },
  ...( Object.entries(TYPE_CONFIG) as [ContentType, typeof TYPE_CONFIG[ContentType]][] )
    .map(([id, c]) => ({ id, label: c.label, icon: c.icon })),
];

/* ── Classification ──────────────────────────────────────────── */
function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function classifyPlaylist(title: string): ContentType {
  const t = normalize(title);
  if (/(louange|adoration|chant|chanson|musique|worship|concert|cantique)/.test(t)) return 'louange';
  if (/\bfilm/.test(t)) return 'film';
  if (/(enseignement|ecole|etude|formation|affaires|seminaire)/.test(t)) return 'enseignement';
  if (/(culte|sermon|predication|message|parole)/.test(t)) return 'sermon';
  return 'emission';
}

function classifyCategory(cat: string): ContentType {
  const c = normalize(cat || '');
  if (c.includes('sermon') || c.includes('predication') || c.includes('culte')) return 'sermon';
  if (c.includes('enseignement') || c.includes('etude') || c.includes('formation')) return 'enseignement';
  if (c.includes('louange') || c.includes('chant') || c.includes('musique')) return 'louange';
  if (c.includes('film')) return 'film';
  return 'emission';
}

/* ═══════════════════════════════════════════════════════════════ */
export function Home() {
  const [items, setItems]         = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter]       = useState<ContentType | 'all'>('all');
  const [search, setSearch]       = useState('');
  const [playing, setPlaying]     = useState<ContentItem | null>(null);
  const playerRef                 = useRef<HTMLDivElement>(null);

  /* ── Agrégation de toutes les sources de contenus ── */
  useEffect(() => {
    async function loadAll() {
      const [playlistsR, blogR, linksR, docsR] = await Promise.allSettled([
        fetch('/api/youtube/playlists').then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<YTPlaylist[]>; }),
        getBlogPosts(),
        getRecommendedLinks(),
        getStudyDocuments(),
      ]);

      const all: ContentItem[] = [];

      if (playlistsR.status === 'fulfilled') {
        for (const pl of playlistsR.value) {
          all.push({
            id: `pl-${pl.id}`,
            type: classifyPlaylist(pl.title),
            title: pl.title,
            description: pl.description,
            image: pl.thumbnail,
            meta: `${pl.videoCount} vidéo${pl.videoCount > 1 ? 's' : ''}`,
            embedUrl: `https://www.youtube.com/embed/videoseries?list=${pl.id}&autoplay=1`,
          });
        }
      }

      if (linksR.status === 'fulfilled') {
        for (const l of linksR.value as RecommendedLink[]) {
          all.push({
            id: `rl-${l.id}`,
            type: classifyCategory(l.category),
            title: l.title,
            description: l.description,
            image: `https://i.ytimg.com/vi/${l.youtubeId}/hqdefault.jpg`,
            meta: 'Vidéo',
            embedUrl: `https://www.youtube.com/embed/${l.youtubeId}?autoplay=1`,
          });
        }
      }

      if (blogR.status === 'fulfilled') {
        for (const p of blogR.value as BlogPost[]) {
          all.push({
            id: `bp-${p.id}`,
            type: 'article',
            title: p.title,
            description: p.excerpt,
            image: p.coverImage,
            meta: p.author,
            date: p.publishedAt,
            linkTo: `/eglise/blog/${p.id}`,
          });
        }
      }

      if (docsR.status === 'fulfilled') {
        for (const d of docsR.value as StudyDocument[]) {
          all.push({
            id: `doc-${d.id}`,
            type: 'document',
            title: d.title,
            description: d.description,
            meta: d.fileType?.toUpperCase() || 'DOCUMENT',
            linkTo: `/document/${d.id}`,
          });
        }
      }

      setItems(all);
      setIsLoading(false);
    }
    loadAll();
  }, []);

  /* ── Filtrage + recherche ── */
  const filtered = useMemo(() => {
    let list = items;
    if (filter !== 'all') list = list.filter(i => i.type === filter);
    const q = normalize(search.trim());
    if (q) list = list.filter(i => normalize(i.title + ' ' + (i.description || '')).includes(q));
    return list;
  }, [items, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const i of items) c[i.type] = (c[i.type] || 0) + 1;
    return c;
  }, [items]);

  function openPlayer(item: ContentItem) {
    setPlaying(item);
    setTimeout(() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  return (
    <div className="bg-[#f5f2ed] min-h-screen">
      <SEO
        title="Grâce TV — La Bonne Nouvelle Partout Partout"
        description="Chaîne de télévision chrétienne basée à Yaoundé. Sermons, enseignements, louange, films, articles et documents — accédez directement à tous nos contenus."
        path="/"
        structuredData={[tvStationSchema, webSiteSchema]}
      />

      {/* ── Hero compact ── */}
      <section className="relative bg-soft-black text-white pt-32 pb-12 sm:pt-36 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-grace-blue/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/5 w-80 h-80 rounded-full bg-grace-orange/15 blur-[100px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-grace-orange/15 border border-grace-orange/30 text-grace-orange px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6">
            <Radio className="w-3.5 h-3.5" /> Grâce TV · La Bonne Nouvelle Partout Partout
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold leading-tight mb-5 text-white">
            Tous nos contenus, <span className="text-grace-orange italic">directement.</span>
          </h1>
          <p className="font-sans text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Sermons, enseignements, louange, films, articles et documents — choisissez ce qui vous édifie aujourd'hui.
          </p>

          {/* Recherche */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un contenu…"
              className="w-full bg-white/10 border border-white/15 rounded-full pl-13 pr-5 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-grace-orange focus:bg-white/15 transition-all"
              style={{ paddingLeft: '3.25rem' }}
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <Link to="/live" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-xs transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Regarder le direct
            </Link>
            <Link to="/a-propos" className="inline-flex items-center gap-1.5 text-white/60 hover:text-grace-orange font-bold uppercase tracking-wider text-xs transition-colors">
              Qui sommes-nous ? <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Barre de filtres (sticky) ── */}
      <div className="sticky top-16 z-30 bg-[#f5f2ed]/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map(f => {
            const count = counts[f.id] || 0;
            if (f.id !== 'all' && count === 0 && !isLoading) return null;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-soft-black text-white border-soft-black shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gold hover:text-soft-black'
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
                {!isLoading && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Lecteur vidéo inline ── */}
      <AnimatePresence>
        {playing && (
          <motion.div
            ref={playerRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-32 overflow-hidden"
          >
            <div className="mt-8 bg-soft-black rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <ListVideo className="w-4 h-4 text-grace-orange shrink-0" />
                  <p className="text-white text-sm font-bold truncate">{playing.title}</p>
                </div>
                <button
                  onClick={() => setPlaying(null)}
                  className="shrink-0 ml-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Fermer le lecteur"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={playing.embedUrl}
                  title={playing.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grille de contenus ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-grace-orange" />
            <p className="text-sm">Chargement des contenus…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
            <BookOpen className="w-14 h-14 text-gray-300 mb-4" />
            <p className="font-bold text-gray-500">Aucun contenu trouvé</p>
            <p className="text-sm mt-1">Essayez un autre filtre ou une autre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item, idx) => {
              const cfg = TYPE_CONFIG[item.type];
              const isVideo = !!item.embedUrl;
              const CardInner = (
                <>
                  {/* Visuel */}
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <cfg.icon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-xl">
                          <Play className="w-6 h-6 text-soft-black ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${cfg.badge}`}>
                      <cfg.icon className="w-3 h-3" /> {cfg.label}
                    </span>
                  </div>
                  {/* Texte */}
                  <div className="p-5">
                    <h3 className="font-serif font-extrabold text-soft-black leading-snug line-clamp-2 group-hover:text-grace-blue transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      <span>{item.meta}</span>
                      {item.date && (
                        <span>{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                </>
              );

              const cardClass = 'group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: (idx % 4) * 0.05 }}
                >
                  {isVideo ? (
                    <button onClick={() => openPlayer(item)} className={`${cardClass} w-full cursor-pointer`}>
                      {CardInner}
                    </button>
                  ) : (
                    <Link to={item.linkTo!} className={`${cardClass} block`}>
                      {CardInner}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Direct / dernier contenu ── */}
      <LiveSection />
    </div>
  );
}
