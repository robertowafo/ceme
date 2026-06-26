import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Church, Sunrise, Sparkles, Briefcase, HandHeart, Quote,
  ExternalLink, Globe, Youtube, ChevronRight, X, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { PARTNERS } from '../lib/partners';
import { PagePlaceholder } from '../components/PagePlaceholder';

/* ── Programme CEME avec lien YouTube ───────────────────────────────── */
interface Program {
  icon     : React.ElementType;
  title    : string;
  cat      : string;
  img      : string;
  desc     : string;
  /*
   * ID de la playlist YouTube correspondante.
   * Format : PLxxxxxxx  (ex: PLbHnAekiZWNDUFt0R2U4D_qeWcDSiPsXK)
   * Laisser vide → lien vers recherche YouTube à la place de l'embed.
   */
  playlistId ?: string;
  /* Lien direct vers la recherche YouTube si pas de playlist */
  youtubeSearch : string;
}

const programs: Program[] = [
  {
    icon: Church,
    title: 'Culte du Dimanche',
    cat: 'Célébration',
    img: '/uploads/sermons.jpeg',
    desc: "Le rassemblement principal de la semaine : adoration, louange et prédication de la Parole, retransmis en direct.",
    youtubeSearch: 'Grâce TV Culte du Dimanche CEME',
    // playlistId: 'PLxxxxxx',  ← à renseigner avec la vraie playlist YouTube
  },
  {
    icon: Sunrise,
    title: 'Manne Matinale',
    cat: 'Quotidien',
    img: '/uploads/fonde en.jpeg',
    desc: "Le rendez-vous quotidien pour commencer la journée nourri de la Parole de Dieu, où que vous soyez.",
    youtubeSearch: 'Grâce TV Manne Matinale CEME',
  },
  {
    icon: Sparkles,
    title: "Sommet d'Élévation",
    cat: 'Rassemblement',
    img: '/uploads/impact jeunesse.png',
    desc: "Un grand rassemblement d'élévation spirituelle, de délivrance et d'enseignement de haut niveau.",
    youtubeSearch: "Grâce TV Sommet d'Élévation CEME",
  },
  {
    icon: Briefcase,
    title: 'École des Affaires du Royaume',
    cat: 'Enseignement',
    img: '/uploads/louange et adoration.png',
    desc: "Sagesse entrepreneuriale et leadership selon les principes bibliques, pour impacter le monde des affaires.",
    youtubeSearch: 'Grâce TV École des Affaires du Royaume CEME',
  },
  {
    icon: HandHeart,
    title: 'Prières Intercession',
    cat: 'Intercession',
    img: '/uploads/priere.jpeg',
    desc: "Des temps d'intercession et de combat spirituel où l'Éternel intervient dans les situations impossibles.",
    youtubeSearch: 'Grâce TV Prières Intercession CEME',
  },
  {
    icon: Quote,
    title: 'Témoignage pour la Gloire de Dieu',
    cat: 'Inspiration',
    img: '/uploads/mama marie.jpeg',
    desc: "Des vies transformées qui rendent gloire à Dieu et fortifient la foi de toute la communauté.",
    youtubeSearch: 'Grâce TV Témoignage Gloire de Dieu CEME',
  },
];

/* ── Tabs ─────────────────────────────────────────────────────────────── */
type Tab = 'ceme' | 'partenaires';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ceme',        label: 'Émissions Grâce TV / Église CEME' },
  { id: 'partenaires', label: 'Nos Partenaires' },
];

/* ── YouTube embed URL ───────────────────────────────────────────────── */
function buildEmbedUrl(playlistId: string) {
  return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&rel=0&modestbranding=1`;
}

function buildSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/* ══════════════════════════════════════════════════════════════════════ */
export function Emissions() {
  const [activeTab, setActiveTab]       = useState<Tab>('ceme');
  const [selectedProgram, setSelected]  = useState<Program | null>(null);

  const handleSelectProgram = (p: Program) => {
    if (selectedProgram?.title === p.title) {
      setSelected(null); // toggle off
    } else {
      setSelected(p);
      // scroll to player after a tick
      setTimeout(() => {
        document.getElementById('yt-player')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  return (
    <div className="bg-white">
      <SEO
        title="Émissions — Grâce TV"
        description="Retrouvez toutes les émissions de Grâce TV : cultes, enseignements, prières et programmes de nos partenaires — en direct ou en replay sur YouTube."
        path="/emissions"
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
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

      {/* ── TABS ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setSelected(null); }}
                className={`relative flex-shrink-0 px-6 py-4 text-sm font-bold transition-colors duration-200 ${
                  activeTab === t.id
                    ? 'text-grace-blue'
                    : 'text-gray-400 hover:text-gray-700'
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

      {/* ── CONTENU ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'ceme' ? (
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
                Cliquez sur une émission pour charger sa playlist YouTube directement ici.
              </p>
            </div>

            {/* Grille programmes */}
            <section className="py-16 sm:py-20 bg-white">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programs.map((p, i) => {
                    const isActive = selectedProgram?.title === p.title;
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
                        {/* Image */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={p.img} alt={p.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-grace-blue-deep/70 to-transparent" />
                          <span className="absolute top-3 left-3 bg-grace-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                            {p.cat}
                          </span>

                          {/* Play badge */}
                          <div className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isActive ? 'bg-grace-orange' : 'bg-white/90 group-hover:bg-grace-orange'
                          }`}>
                            {isActive
                              ? <X className="w-4 h-4 text-white" />
                              : <Play className={`w-4 h-4 fill-current transition-colors ${isActive ? 'text-white' : 'text-grace-blue group-hover:text-white'}`} />
                            }
                          </div>

                          <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center">
                            <p.icon className="w-4 h-4 text-grace-blue" />
                          </div>
                        </div>

                        {/* Text */}
                        <div className={`p-6 transition-colors duration-300 ${isActive ? 'bg-grace-blue-deep/3' : 'bg-white'}`}>
                          <h2 className="font-serif text-lg font-extrabold text-soft-black mb-2 leading-tight">
                            {p.title}
                          </h2>
                          <p className="font-sans text-sm text-soft-black/60 leading-relaxed line-clamp-2">{p.desc}</p>
                          <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                            isActive ? 'text-grace-orange' : 'text-grace-blue/60 group-hover:text-grace-orange'
                          }`}>
                            <Youtube className="w-3.5 h-3.5" />
                            {isActive ? 'Masquer la playlist' : 'Voir la playlist'}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── Lecteur YouTube inline ── */}
            <AnimatePresence>
              {selectedProgram && (
                <motion.div
                  id="yt-player"
                  key={selectedProgram.title}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="overflow-hidden bg-grace-blue-deep"
                >
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-grace-orange text-xs font-bold uppercase tracking-widest block mb-1">
                          Playlist — {selectedProgram.cat}
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                          {selectedProgram.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Embed or fallback */}
                    {selectedProgram.playlistId ? (
                      <div className="relative w-full rounded-2xl overflow-hidden bg-black"
                        style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={buildEmbedUrl(selectedProgram.playlistId)}
                          title={selectedProgram.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      /* Pas encore de playlist ID configuré */
                      <div className="rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-6 p-8">
                        <div className="w-16 h-16 rounded-2xl bg-grace-orange/15 flex items-center justify-center flex-shrink-0">
                          <Youtube className="w-8 h-8 text-grace-orange" />
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-white font-bold text-lg mb-1">Playlist YouTube</p>
                          <p className="text-white/60 text-sm mb-4">
                            La playlist YouTube de cette émission sera bientôt configurée ici.
                            En attendant, retrouvez les vidéos sur la chaîne Grâce TV.
                          </p>
                          <a
                            href={buildSearchUrl(selectedProgram.youtubeSearch)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                          >
                            Rechercher sur YouTube <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        ) : (

          /* ══════════ ONGLET PARTENAIRES ══════════ */
          <motion.div
            key="partenaires"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <section className="py-16 sm:py-24 bg-gray-50">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Intro */}
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

                {/* Partner cards */}
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
                      {/* Header stripe */}
                      <div className="h-2 bg-gradient-to-r from-grace-blue to-grace-orange" />

                      <div className="p-8">
                        {/* Avatar placeholder + name */}
                        <div className="flex items-center gap-4 mb-6">
                          {partner.avatar ? (
                            <img
                              src={partner.avatar}
                              alt={partner.name}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-grace-blue to-grace-blue-deep flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-black text-2xl">
                                {partner.name.split(' ').pop()?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-serif text-xl font-extrabold text-soft-black leading-tight">
                              {partner.name}
                            </h3>
                            <p className="text-grace-orange font-bold text-sm">{partner.ministry}</p>
                            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> {partner.location}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-6">{partner.bio}</p>

                        {/* Links */}
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={partner.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-grace-blue-deep text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-grace-blue transition-colors"
                          >
                            <Youtube className="w-4 h-4" /> Chaîne YouTube
                          </a>
                          {partner.website && (
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:border-grace-blue hover:text-grace-blue transition-colors"
                            >
                              <Globe className="w-4 h-4" /> Site web
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Note admin */}
                <p className="text-center text-gray-400 text-xs mt-10">
                  D'autres partenaires peuvent être ajoutés via le tableau de bord administrateur.
                </p>

              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA bas de page ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-grace-blue text-white py-16">
        <div className="absolute -top-1/2 right-0 w-[40%] h-[200%] rounded-full bg-grace-orange/15 blur-[100px]" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold mb-4 text-white">
            Ne manquez aucune émission
          </h2>
          <p className="font-sans text-white/75 mb-8">
            Suivez Grâce TV en direct, 24h/24, où que vous soyez.
          </p>
          <Link
            to="/live"
            className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-colors"
          >
            <Play className="w-4 h-4 fill-white" /> Regarder en direct
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* Page détail — V2 */
export function EmissionDetail() {
  return (
    <PagePlaceholder
      title="Émission"
      subtitle="Le détail de cette émission sera disponible prochainement. En attendant, retrouvez tous nos programmes en direct."
    />
  );
}
