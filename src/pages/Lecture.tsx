import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  BookOpen, FileText, ArrowRight, Clock, Search, X, Library,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import {
  getBlogPosts, getStudyDocuments, getLibraryBooks,
  type BlogPost, type StudyDocument, type LibraryBook,
} from '../lib/dbService';

const EASE = [0.22, 1, 0.36, 1] as const;
const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: EASE },
};

const DOC_CATEGORIES = [
  'Manne Matinale',
  'École des Affaires du Royaume',
  "Sommet d'Élévation",
  "Culte de Libération et d'Impact Maximum",
  'Opération Néhémie',
  'Opération Josué',
] as const;

export function Lecture() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [docs, setDocs] = useState<StudyDocument[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [search, setSearch] = useState('');
  const [activeDocCat, setActiveDocCat] = useState<string | null>(null);

  useEffect(() => {
    getBlogPosts().then(setPosts).catch(() => {});
    getStudyDocuments().then(setDocs).catch(() => {});
    getLibraryBooks().then(setBooks).catch(() => {});
  }, []);

  const filteredPosts = useMemo(() => {
    if (!search) return posts;
    const q = search.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q)
    );
  }, [posts, search]);

  const filteredDocs = useMemo(() => {
    let list = docs;
    if (activeDocCat) list = list.filter(d => d.category === activeDocCat);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q) ||
        (d.category || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [docs, activeDocCat, search]);

  const docCategories = useMemo(() => {
    const cats = new Set(docs.map(d => d.category).filter(Boolean));
    return DOC_CATEGORIES.filter(c => cats.has(c));
  }, [docs]);

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  return (
    <>
      <SEO
        title="Lecture — Articles, Méditations & Documents d'Étude | Grâce TV"
        description="Dévotions, réflexions spirituelles, notes de prédication et supports d'étude — nourrissez votre foi au quotidien."
      />

      {/* ════════════ HERO ════════════ */}
      <section className="relative bg-grace-blue-deep pt-36 sm:pt-44 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(23,99,176,0.25),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            {...reveal}
            className="inline-flex items-center gap-2.5 text-grace-orange text-xs font-semibold uppercase tracking-[0.28em] mb-6"
          >
            <span className="h-px w-10 bg-grace-orange/60" />
            <BookOpen className="w-4 h-4 text-grace-sky" /> Lecture
          </motion.span>
          <motion.h1
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.08 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05]"
          >
            Nourrissez votre foi, <span className="text-grace-orange italic">un mot à la fois.</span>
          </motion.h1>
          <motion.p
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.16 }}
            className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            Articles, méditations et documents d'étude — des ressources écrites pour approfondir la Parole et grandir dans la connaissance.
          </motion.p>

          {/* Barre de recherche */}
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.24 }} className="mt-10 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un article ou document..."
                className="w-full bg-white/10 border border-white/15 rounded-full pl-11 pr-10 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-grace-orange/50 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════ 01 · ARTICLES & MÉDITATIONS ════════════ */}
      {filteredPosts.length > 0 && (
        <section className="relative bg-cream py-24 sm:py-32 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 sm:mb-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <SectionHeader
                num="01"
                icon={BookOpen}
                label="Articles & Méditations"
                title="Des mots qui"
                accent="nourrissent l'âme."
                desc="Dévotions, réflexions et méditations écrites par nos pasteurs et rédacteurs — prenez le temps de lire, souligner, méditer."
              />
            </div>

            {featuredPost && (
              <motion.div {...reveal} className="relative">
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

            {filteredPosts.length === 0 && search && (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-soft-black/15 mx-auto mb-4" />
                <p className="text-soft-black/50 text-sm">Aucun article trouvé pour « {search} »</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════ 02 · BIBLIOTHÈQUE ════════════ */}
      {books.length > 0 && (
        <section className="relative bg-white py-24 sm:py-32 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14 sm:mb-20">
              <SectionHeader
                num="02"
                icon={Library}
                label="Bibliothèque"
                title="Des livres qui"
                accent="transforment."
                desc="Ouvrages recommandés par nos pasteurs — pour bâtir votre foi et approfondir votre marche avec Dieu."
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                  className="group bg-gray-soft rounded-2xl overflow-hidden border border-soft-black/8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-grace-blue-deep/5">
                    {b.coverImage ? (
                      <img src={b.coverImage} alt={b.title} loading="lazy" referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-grace-blue-deep/10 to-grace-orange/10">
                        <BookOpen className="w-14 h-14 text-soft-black/15" />
                      </div>
                    )}
                    {b.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-soft-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        {b.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-extrabold text-soft-black leading-snug line-clamp-2 group-hover:text-grace-blue transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-soft-black/40 mt-2">{b.author}</p>
                    {b.description && (
                      <p className="text-sm text-soft-black/55 mt-2 line-clamp-2">{b.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════ 03 · DOCUMENTS D'ÉTUDE ════════════ */}
      <section className="relative bg-cream py-24 sm:py-32 overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 sm:mb-20">
            <SectionHeader
              num="03"
              icon={FileText}
              label="Documents d'étude"
              title="Pour aller"
              accent="plus loin."
              desc="Supports d'étude, notes de prédication et ressources à lire et relire, où que vous soyez."
            />
          </div>

          {/* Filtres par catégorie */}
          {docCategories.length > 0 && (
            <motion.div {...reveal} className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setActiveDocCat(null)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  !activeDocCat
                    ? 'bg-grace-blue text-white shadow-lg'
                    : 'bg-gray-soft text-soft-black/60 hover:bg-grace-blue/10 hover:text-grace-blue'
                }`}
              >
                Tout
              </button>
              {docCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveDocCat(activeDocCat === cat ? null : cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    activeDocCat === cat
                      ? 'bg-grace-orange text-white shadow-lg'
                      : 'bg-gray-soft text-soft-black/60 hover:bg-grace-orange/10 hover:text-grace-orange'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}

          {filteredDocs.length > 0 ? (
            <div className="space-y-4">
              {filteredDocs.map((d, i) => (
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
                    {d.coverImage ? (
                      <img src={d.coverImage} alt={d.title} loading="lazy" referrerPolicy="no-referrer" className="hidden sm:block w-14 h-18 object-cover rounded-lg shrink-0 shadow-sm" />
                    ) : (
                      <span
                        aria-hidden
                        className="hidden sm:block font-serif font-extrabold text-4xl w-14 shrink-0 text-center"
                        style={{ WebkitTextStroke: '1.2px rgba(23,99,176,0.35)', color: 'transparent' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    )}
                    <span className="shrink-0 w-12 h-12 rounded-xl bg-grace-blue/10 group-hover:bg-grace-orange group-hover:text-white group-hover:rotate-6 text-grace-blue flex items-center justify-center transition-all">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-extrabold text-soft-black truncate group-hover:text-grace-blue transition-colors text-lg">{d.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {d.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-grace-orange">{d.category}</span>
                        )}
                        {d.description && d.category && <span className="text-soft-black/20">·</span>}
                        {d.description && <p className="text-sm text-soft-black/55 truncate">{d.description}</p>}
                      </div>
                    </div>
                    <span className="shrink-0 hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-soft-black/40 group-hover:text-grace-orange transition-colors">
                      {d.fileType?.toUpperCase() || 'DOC'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-soft-black/15 mx-auto mb-4" />
              <p className="text-soft-black/50 text-sm">
                {search ? `Aucun document trouvé pour « ${search} »` : 'Aucun document disponible pour le moment.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function SectionHeader({ num, label, title, accent, desc, icon: Icon }: {
  num: string; label: string; title: string; accent: string; desc: string; icon: React.ElementType;
}) {
  return (
    <div className="relative max-w-3xl">
      <motion.span
        aria-hidden
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
        className="absolute -top-10 -left-2 sm:-left-6 font-serif font-extrabold leading-none select-none pointer-events-none text-[7rem] sm:text-[10rem]"
        style={{ WebkitTextStroke: '1.5px rgba(26,26,26,0.10)', color: 'transparent' }}
      />
      <motion.span
        {...reveal}
        className="relative inline-flex items-center gap-2.5 text-grace-orange text-xs font-semibold uppercase tracking-[0.28em] mb-5"
      >
        <span className="h-px w-10 bg-grace-orange/60" />
        <Icon className="w-4 h-4 text-grace-blue" /> {label}
      </motion.span>
      <motion.h2
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.08 }}
        className="relative font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-soft-black"
      >
        {title} <span className="text-grace-orange italic">{accent}</span>
      </motion.h2>
      <motion.p
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.16 }}
        className="relative font-sans text-base sm:text-lg leading-relaxed mt-5 text-soft-black/65"
      >
        {desc}
      </motion.p>
    </div>
  );
}
