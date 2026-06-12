import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Search,
  Filter,
  Share2,
  Calendar,
  Youtube,
  Plus,
  X,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Video,
  Tv,
  Radio
} from 'lucide-react';
import { getRecommendedLinks, saveRecommendedLink, RecommendedLink } from '../lib/dbService';
import { useAuth } from '../lib/AuthContext';


interface RecommendedVideo {
  id: string;
  title: string;
  youtubeId: string;
  preacher: string;
  duration: string;
  category: string;
  date: string;
  description: string;
}


function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function Sermons() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'church' | 'recommended'>('church');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('Tous');
  const [selectedPreacher, setSelectedPreacher] = useState('Tous');
  
  // Dynamic API state
  const [sermons, setSermons] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // YouTube recommendations list
  const [recommendedList, setRecommendedList] = useState<RecommendedVideo[]>([]);

  
  // Inline player state
  const [activePlayId, setActivePlayId] = useState<string | null>(null);
  const [activePlayInfo, setActivePlayInfo] = useState<{ title: string; preacher: string; date: string; description?: string } | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form elements for adding a YouTube video recommendation
  const [fTitle, setFTitle] = useState('');
  const [fYoutubeUrl, setFYoutubeUrl] = useState('');
  const [fPreacher, setFPreacher] = useState('');
  const [fCategory, setFCategory] = useState('Enseignement de Foi');
  const [fDuration, setFDuration] = useState('10 min');
  const [fDescription, setFDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);

  useEffect(() => {
    const parsedId = extractYoutubeId(fYoutubeUrl);
    if (!parsedId) return;

    let isCancelled = false;

    const triggerDetailFetch = async () => {
      setIsFetchingInfo(true);
      try {
        const res = await fetch(`/api/youtube/video-info?urlOrId=${encodeURIComponent(parsedId)}`);
        if (!isCancelled && res.ok) {
          const info = await res.json();
          setFTitle((prev) => prev ? prev : (info.title || ''));
          setFPreacher((prev) => prev ? prev : (info.preacher || 'Chaîne Recommandée'));
          setFDuration((prev) => prev ? prev : (info.duration || '15 min'));
          setFDescription((prev) => prev ? prev : (info.description || ''));
        }
      } catch (err) {
        console.error("Auto fetch error in Sermons: ", err);
      } finally {
        if (!isCancelled) {
          setIsFetchingInfo(false);
        }
      }
    };

    triggerDetailFetch();

    return () => {
      isCancelled = true;
    };
  }, [fYoutubeUrl]);

  // Load backend content
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      setErrorStatus(null);
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/youtube/sermons'),
          fetch('/api/youtube/playlists')
        ]);
        if (!sRes.ok || !pRes.ok) {
          throw new Error('Erreur de réponse serveur.');
        }
        const sData = await sRes.json();
        const pData = await pRes.json();
        setSermons(sData);
        setPlaylists(pData);
      } catch (err: any) {
        console.error('YouTube Fetch Error:', err);
        setErrorStatus('Erreur de chargement des contenus YouTube. Veuillez vous assurer que la clé API configurée est valide.');
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Load from local storage or pre-seed, with Firestore synchronization
  useEffect(() => {
    async function loadFBConsolidated() {
      try {
        const firestoreLinks = await getRecommendedLinks();
        if (firestoreLinks && firestoreLinks.length > 0) {
          const mapped: RecommendedVideo[] = firestoreLinks.map(lnk => ({
            id: lnk.id,
            title: lnk.title,
            youtubeId: lnk.youtubeId,
            preacher: "Chaîne Recommandée",
            duration: "15 min",
            category: lnk.category,
            date: "Recommandé par l'Administration",
            description: lnk.description || "Un précieux message recommandé par l'Administration pour s'édifier."
          }));
          setRecommendedList(mapped);
        } else {
          setRecommendedList([]);
        }
      } catch (err) {
        console.error("Error fetching Firestore recommended items: ", err);
      }
    }
    loadFBConsolidated();
  }, [activeTab]);


  // Search and filter handling for church sermons
  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sermon.preacher.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sermon.series.toLowerCase().includes(searchQuery.toLowerCase());
    
    const cleanSeriesOption = selectedSeries === 'Tous' ? '' : selectedSeries;
    const matchesSeries = !cleanSeriesOption ? true : sermon.series.includes(cleanSeriesOption);

    const cleanPreacherOption = selectedPreacher === 'Tous' ? '' : selectedPreacher;
    const matchesPreacher = !cleanPreacherOption ? true : sermon.preacher === cleanPreacherOption;

    return matchesSearch && matchesSeries && matchesPreacher;
  });

  // Extract unique researchers/preachers list dynamically from loaded videos
  const uniquePreachers = Array.from(new Set(sermons.map(s => s.preacher)));


  // Search and filter handling for recommended videos
  const filteredRecommended = recommendedList.filter(vid => {
    const matchesSearch = vid.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vid.preacher.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vid.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vid.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Handle addition of a recommended video
  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!fTitle.trim()) {
      setFormError("Veuillez saisir un titre pour le message.");
      return;
    }
    if (!fPreacher.trim()) {
      setFormError("Veuillez indiquer l'orateur ou la chaîne YouTube originelle.");
      return;
    }
    
    const parsedId = extractYoutubeId(fYoutubeUrl);
    if (!parsedId) {
      setFormError("Le lien YouTube saisi est invalide. Veuillez copier un lien valide du type : https://www.youtube.com/watch?v=... ou https://youtu.be/...");
      return;
    }

    const newVideo: RecommendedVideo = {
      id: `rec-${Date.now()}`,
      title: fTitle.trim(),
      youtubeId: parsedId,
      preacher: fPreacher.trim(),
      duration: fDuration,
      category: fCategory,
      date: "Ajouté aujourd'hui",
      description: fDescription.trim() || "Un précieux message recommandé par un membre de l'assemblée pour motiver et édifier l'église."
    };

    // Save also into Firestore if they use this form
    try {
      saveRecommendedLink({
        id: newVideo.id,
        title: newVideo.title,
        youtubeId: newVideo.youtubeId,
        description: newVideo.description,
        category: newVideo.category
      });
    } catch (fsErr) {
      console.error("Non-blocking Firestore sync failure: ", fsErr);
    }


    const updatedList = [newVideo, ...recommendedList];
    setRecommendedList(updatedList);
    localStorage.setItem('ceme_recommended_youtube', JSON.stringify(updatedList));

    // Reset fields
    setFTitle('');
    setFYoutubeUrl('');
    setFPreacher('');
    setFDescription('');
    setFormSuccess(true);
    
    setTimeout(() => {
      setFormSuccess(false);
      setIsAddModalOpen(false);
    }, 1800);
  };

  const playVideo = (youtubeId: string, info: { title: string; preacher: string; date: string; description?: string }) => {
    setActivePlayId(youtubeId);
    setActivePlayInfo(info);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const closePlayer = () => {
    setActivePlayId(null);
    setActivePlayInfo(null);
  };

  // Live parsed YouTube preview id
  const tempParsedId = extractYoutubeId(fYoutubeUrl);

  return (
    <div className="pt-24 pb-20 bg-[#f5f2ed] min-h-screen">
      {/* Grâce TV Hero Header */}
      <div className="bg-[#12100f] text-white py-24 mb-12 relative overflow-hidden border-b border-gold/15">
        {/* Subtle, deep background lighting and glows far behind high-contrast text */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/40 via-[#12100f] to-[#12100f] opacity-80 pointer-events-none" />
        <div className="absolute -top-[20%] left-1/4 w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Grâce TV Identity Badge */}
          <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md mb-8 shadow-2xl">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-gold" />
              <span className="font-sans font-black tracking-[0.25em] text-white text-xs uppercase">GRÂCE TV</span>
            </div>
            <span className="text-[10px] text-white/60 border-l border-white/20 pl-2.5 font-mono uppercase tracking-widest">CANAL DIVIN</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
            <span className="text-white">La Bonne Nouvelle</span> <br className="hidden sm:block" />
            <span className="text-gold font-serif mt-2 block">
              partout-partout
            </span>
          </h1>

          <p className="text-white max-w-3xl mx-auto text-base md:text-xl font-normal leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] px-4">
            Grâce TV est la voix multimédia universelle de l'Église de l'Alliance. Nous diffusons la parole révélée, l'onction d'élévation et l'adoration prophétique vivante pour conquérir les cœurs et libérer les captifs, partout-partout.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-bold text-gold/95 tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <span className="flex items-center gap-2 bg-[#1c1917]/90 px-3.5 py-1.5 rounded-lg border border-white/10"><Radio className="w-4 h-4 text-red-500 animate-bounce" /> DIFFUSION 24/7</span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="flex items-center gap-2 bg-[#1c1917]/90 px-3.5 py-1.5 rounded-lg border border-white/10"><Play className="w-4 h-4 text-gold" /> REPLAY ILLIMITÉ</span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="flex items-center gap-2 bg-[#1c1917]/90 px-3.5 py-1.5 rounded-lg border border-white/10"><Video className="w-4 h-4 text-gold" /> QUALITÉ ULTRA HD</span>
          </div>

          {/* Majestic Tab Switcher */}
          <div className="flex justify-center mt-12">
            <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex max-w-md w-full gap-2 backdrop-blur-sm shadow-2xl">
              <button
                onClick={() => {
                  setActiveTab('church');
                  setSearchQuery('');
                }}
                className={`flex-1 py-3.5 text-xs md:text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${
                  activeTab === 'church'
                    ? 'bg-gold text-soft-black shadow-lg scale-105'
                    : 'text-white hover:bg-white/5'
                }`}
              >
                Sermons & Cultes
              </button>
              <button
                onClick={() => {
                  setActiveTab('recommended');
                  setSearchQuery('');
                }}
                className={`flex-1 py-3.5 text-xs md:text-sm font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'recommended'
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Youtube className="w-4 h-4" />
                Vidéos Recommandées
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dynamic description of the toggled tab */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          {activeTab === 'church' ? (
            <p className="text-gray-500 font-light text-sm italic">
              « Sa parole court avec vitesse. » Retrouvez ici les enregistrements audios de nos cultes hebdomadaires à la chapelle de l'Éternel.
            </p>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-gold/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-left sm:max-w-md">
                <span className="text-xs font-bold uppercase tracking-widest text-[#B59437] block mb-1">Cœur à Coeur Virtuel</span>
                <h3 className="font-serif text-xl font-bold text-soft-black">Vidéos Spirituelles Sélectionnées</h3>
                <p className="text-gray-500 font-light text-xs mt-1">
                  Une curation vivante des meilleures conférences et moments de louange sur YouTube, partagés pour fortifier votre culte personnel.
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Recommander un lien YouTube
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading and Error states */}
        {isLoading && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="font-serif text-2xl font-bold text-soft-black mb-2">Chargement de la chaîne</h3>
            <p className="text-gray-500 font-light text-sm">
              Récupération des derniers sermons directs et différés de Grâce TV...
            </p>
          </div>
        )}

        {errorStatus && !isLoading && (
          <div className="text-center py-16 bg-white rounded-3xl border border-red-150 max-w-xl mx-auto my-12 p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
            <h3 className="font-serif text-2xl font-bold text-soft-black mb-2">Impossible de charger</h3>
            <p className="text-gray-500 font-light text-sm mb-4">{errorStatus}</p>
          </div>
        )}

        {/* Featured Church Sermon - Only displayed on Church tab when search is clear and data is loaded */}
        {activeTab === 'church' && !isLoading && !errorStatus && searchQuery === '' && selectedSeries === 'Tous' && selectedPreacher === 'Tous' && sermons[0] && (
          <div
            onClick={() => playVideo(sermons[0].youtubeId, { title: sermons[0].title, preacher: sermons[0].preacher, date: sermons[0].date, description: sermons[0].description })}
            className="bg-white rounded-3xl overflow-hidden shadow-xl mb-16 flex flex-col md:flex-row group border border-gray-100 cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <div className="md:w-1/2 relative overflow-hidden h-64 md:h-96">
              <img src={sermons[0].image} alt={sermons[0].title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <div className="w-20 h-20 bg-gold/95 backdrop-blur-sm rounded-full flex items-center justify-center text-soft-black shadow-2xl transform group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 ml-2" fill="currentColor"/>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-block bg-burgundy/10 text-burgundy text-xs font-bold uppercase tracking-widest px-3 py-1 rounded w-max mb-4">À LA UNE DE GRÂCE TV</span>
              <h2 className="font-serif text-3xl font-bold mb-4 leading-tight group-hover:text-gold transition-colors">{sermons[0].title}</h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm font-light">
                {sermons[0].description ? (sermons[0].description.slice(0, 240) + '...') : "Découvrez la prédication inspirante diffusée sur notre plateforme en ligne et laissez l'onction d'élévation toucher votre vie."}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400">
                <span className="font-bold text-soft-black text-sm">{sermons[0].preacher}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {sermons[0].date}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {!isLoading && !errorStatus && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder={activeTab === 'church' ? "Rechercher un sermon chrétien..." : "Rechercher une vidéo YouTube..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-shadow text-sm"
              />
            </div>

            {activeTab === 'church' ? (
              <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <button 
                  onClick={() => { setSelectedSeries('Tous'); setSelectedPreacher('Tous'); setSearchQuery(''); }}
                  className="flex items-center space-x-2 bg-soft-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-md cursor-pointer"
                >
                  <Filter className="w-4 h-4" /> <span>Tous</span>
                </button>
                
                <select 
                  value={selectedSeries}
                  onChange={(e) => setSelectedSeries(e.target.value)}
                  className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider outline-none focus:border-gold"
                >
                  <option value="Tous">Playlists YouTube (Toutes)</option>
                  {playlists.map((pl: any) => (
                    <option key={pl.id} value={pl.title}>{pl.title}</option>
                  ))}
                </select>

                <select 
                  value={selectedPreacher}
                  onChange={(e) => setSelectedPreacher(e.target.value)}
                  className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider outline-none focus:border-gold"
                >
                  <option value="Tous">Prédicateur (Tous)</option>
                  {uniquePreachers.map((preacherName: any) => (
                    <option key={preacherName} value={preacherName}>{preacherName}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-xs text-gray-400 font-medium">
                {filteredRecommended.length} vidéo(s) enregistrée(s)
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            INLINE PLAYER
        ====================================================== */}
        <AnimatePresence>
          {activePlayId && (
            <motion.div
              ref={playerRef}
              key="inline-player"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-12 bg-[#12100f] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              {/* Player */}
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  className="w-full h-full border-0 absolute inset-0"
                  src={`https://www.youtube.com/embed/${activePlayId}?autoplay=1&rel=0`}
                  title="Lecteur Grâce TV"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Infos + actions */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">En lecture • Grâce TV</p>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight mb-2 line-clamp-2">
                    {activePlayInfo?.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 font-medium">
                    <span className="font-bold text-white/70">{activePlayInfo?.preacher}</span>
                    {activePlayInfo?.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {activePlayInfo.date}
                      </span>
                    )}
                  </div>
                  {activePlayInfo?.description && (
                    <p className="text-white/40 text-xs font-light mt-3 leading-relaxed line-clamp-2">
                      {activePlayInfo.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      navigator.share?.({ title: activePlayInfo?.title ?? '', url: `https://www.youtube.com/watch?v=${activePlayId}` })
                        .catch(() => navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${activePlayId}`));
                    }}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Partager
                  </button>
                  <button
                    onClick={closePlayer}
                    className="flex items-center gap-2 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" /> Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================
            TAB 1: CHURCH AUDIO SERMONS
        ====================================================== */}
        {activeTab === 'church' && !isLoading && !errorStatus && (
          <>
            {filteredSermons.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-150 max-w-xl mx-auto my-12">
                <AlertCircle className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-soft-black mb-2">Aucun message trouvé</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed">
                  Nous n'avons pas trouvé de sermon correspondant à votre recherche. Veuillez réinitialiser vos filtres ou élargir vos critères.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                {filteredSermons.map((sermon) => (
                  <motion.div
                    key={sermon.id}
                    onClick={() => playVideo(sermon.youtubeId, { title: sermon.title, preacher: sermon.preacher, date: sermon.date, description: sermon.description })}
                    whileHover={{ y: -8 }}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col cursor-pointer border ${activePlayId === sermon.youtubeId ? 'border-gold ring-2 ring-gold/40' : 'border-gray-100'}`}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img src={sermon.image} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center text-soft-black shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-5 h-5 ml-1" fill="currentColor"/>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {sermon.duration}
                      </div>
                      {activePlayId === sermon.youtubeId && (
                        <div className="absolute top-2 left-2 bg-gold text-soft-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-soft-black animate-pulse" /> En lecture
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-burgundy uppercase tracking-widest mb-2 pb-1.5 border-b border-gray-100 w-max">{sermon.series}</p>
                        <h3 className="font-serif text-base font-bold leading-tight group-hover:text-gold transition-colors mb-3 text-soft-black line-clamp-2">{sermon.title}</h3>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium pt-3 mt-4 border-t border-gray-100">
                        <span>{sermon.preacher}</span>
                        <span>{sermon.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ======================================================
            TAB 2: RECOMMENDED YOUTUBE VIDEO GRID
        ====================================================== */}
        {activeTab === 'recommended' && (
          <>
            {filteredRecommended.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-150 max-w-xl mx-auto my-12">
                <Youtube className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-soft-black mb-2">Aucune recommandation YouTube</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed mb-6">
                  Aucune vidéo ne correspond à votre recherche. Proposez-en une nouvelle pour enrichir le catalogue spirituel de l'église !
                </p>
                {isAdmin ? (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-soft-black hover:bg-gold text-white hover:text-soft-black text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-colors"
                  >
                    Ajouter la première vidéo
                  </button>
                ) : (
                  <span className="text-gray-400 text-xs italic">Les suggestions de vidéos sont réservées aux membres du bureau pastoral et aux administrateurs.</span>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {filteredRecommended.map((vid) => (
                  <motion.div
                    key={vid.id}
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200 flex flex-col justify-between group cursor-pointer"
                    onClick={() => playVideo(vid.youtubeId, { title: vid.title, preacher: vid.preacher, date: vid.date, description: vid.description })}
                  >
                    <div>
                      {/* Youtube Video Thumbnail Overlay */}
                      <div className="relative aspect-video w-full bg-soft-black overflow-hidden group">
                        <img 
                          src={`https://img.youtube.com/vi/${vid.youtubeId}/0.jpg`} 
                          alt={vid.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-6 h-6 ml-1 fill-current" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-[#ff0000]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Youtube className="w-3 h-3" />
                          <span>{vid.duration}</span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-6">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#B59437] bg-[#f5f2ed] px-2.5 py-1 rounded-full">
                          {vid.category}
                        </span>
                        
                        <h3 className="font-serif text-xl font-bold text-soft-black mt-3 leading-snug group-hover:text-red-600 transition-colors">
                          {vid.title}
                        </h3>
                        
                        <p className="text-gray-400 text-xs font-medium mt-1">Recommandé de : {vid.preacher}</p>
                        <p className="text-gray-600 text-xs font-light mt-4 leading-relaxed line-clamp-3">
                          {vid.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-gray-150 mt-4 flex justify-between items-center text-[11px] text-gray-400 font-medium">
                      <span>{vid.date}</span>
                      <span className="text-red-600 group-hover:underline flex items-center gap-1">
                        Regarder <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </>
        )}

        {/* Dummy pagination for alignment */}
        <div className="flex justify-center items-center space-x-2">
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold transition-colors text-sm font-bold">&larr;</button>
          <button className="w-10 h-10 rounded-full bg-gold text-soft-black shadow-md flex items-center justify-center text-sm font-bold">1</button>
          <span className="text-gray-400">...</span>
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold transition-colors text-sm font-bold">&rarr;</button>
        </div>

      </div>

      {/* ======================================================
          MODAL: ADD NEW YOUTUBE RECOMMENDATION FORM
      ====================================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-red-600/20 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold styling line top boundary */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-gold to-red-600" />
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Youtube className="w-6 h-6 text-red-600" />
                  <h3 className="font-serif text-2xl font-bold text-soft-black">Recommander une Vidéo</h3>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-soft-black p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formSuccess ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-soft-black">Ajouté avec succès !</h4>
                  <p className="text-xs text-gray-500 mt-2">
                    Le sermon YouTube a été ajouté à la catégorie Messages Recommandés.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAddVideoSubmit} className="space-y-4">
                  
                  {formError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-start gap-2 border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Titre de la vidéo</label>
                    <input 
                      type="text"
                      placeholder="Ex: Le secret de la guérison invisible"
                      value={fTitle}
                      onChange={(e) => setFTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Lien de la vidéo YouTube</label>
                    <input 
                      type="text"
                      placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      value={fYoutubeUrl}
                      onChange={(e) => {
                        setFYoutubeUrl(e.target.value);
                        setFormError('');
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                    />
                    {isFetchingInfo && (
                      <p className="text-[10px] text-red-600 font-medium mt-1 animate-pulse flex items-center gap-1.5">
                        <span className="w-2 h-2 border border-red-600 border-t-transparent rounded-full animate-spin shrink-0"></span>
                        Récupération des informations depuis YouTube...
                      </p>
                    )}
                  </div>

                  {/* YouTube Live Parsed Preview */}
                  {tempParsedId && (
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-gold/10 flex items-center gap-3">
                      <div className="relative w-20 h-12 bg-black rounded overflow-hidden shadow-inner shrink-0">
                        <img 
                          src={`https://img.youtube.com/vi/${tempParsedId}/0.jpg`} 
                          alt="Live Thumb Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-green-600 font-bold uppercase">Vidéo YouTube Extraite !</p>
                        <p className="text-[9px] text-gray-400 font-mono">ID de la vidéo : {tempParsedId}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Prédicateur / Chaîne</label>
                      <input 
                        type="text"
                        placeholder="Ex: Evangéliste Paul C."
                        value={fPreacher}
                        onChange={(e) => setFPreacher(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Durée approximative</label>
                      <input 
                        type="text"
                        placeholder="Ex: 22 min"
                        value={fDuration}
                        onChange={(e) => setFDuration(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Thème principal</label>
                      <select 
                        value={fCategory}
                        onChange={(e) => setFCategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none font-medium"
                      >
                        <option value="Louange & Adoration">Louange & Adoration</option>
                        <option value="Enseignement de Foi">Enseignement de Foi</option>
                        <option value="Témoignage & Miracles">Témoignage & Miracles</option>
                        <option value="Prière & Délivrance">Prière & Délivrance</option>
                        <option value="Conférence & Séminaire">Conférence & Séminaire</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description courte (facultative)</label>
                    <textarea 
                      rows={2}
                      placeholder="Pourquoi recommandez-vous cette vidéo ?"
                      value={fDescription}
                      onChange={(e) => setFDescription(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-soft-black hover:bg-gold text-white hover:text-soft-black text-xs font-bold uppercase tracking-widest py-3 rounded-full transition-colors cursor-pointer mt-4"
                  >
                    Enregistrer la recommandation
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
