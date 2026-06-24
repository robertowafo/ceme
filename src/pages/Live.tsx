import { useState, useEffect } from 'react';
import { Heart, Share2, CalendarClock, Radio, Play, WifiOff, Settings, Link2, Check, X, MonitorPlay } from 'lucide-react';
import { Link } from 'react-router-dom';

function parsePreacher(title: string): string {
  const t = title.toUpperCase();
  if (t.includes("MARIE CHARLOTTE") || t.includes("MAMAN MARIE") || t.includes("MAMAN CHARLOTTE") || t.includes("M.C. ESSOMBA")) {
    return "Maman Marie Charlotte ESSOMBA";
  }
  if (t.includes("ALPHONSE") || t.includes("BOUNOUNGOU") || t.includes("ALPHONSE ESSOMBA") || t.includes("REV") || t.includes("REVEREND")) {
    return "Rev. Dr. Alphonse ESSOMBA";
  }
  return "Rev. Dr. Alphonse ESSOMBA";
}

function getEmbedUrl(url: string, defaultUrl: string): string {
  if (!url) return defaultUrl;
  
  // If it's an iframe tag, extract the src attribute
  if (url.includes('<iframe')) {
    const srcMatch = url.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }

  // If it's already an embed link, return it
  if (url.includes('/embed/') || url.includes('player.') || url.includes('.html') || url.includes('twitch.tv')) {
    return url;
  }
  
  // Handle youtube watch link
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&"'>]+)/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  
  return url;
}

const FR_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function getNextWeekday(targetDay: number): Date {
  const today = new Date();
  let daysUntil = (targetDay - today.getDay() + 7) % 7;
  if (daysUntil === 0) daysUntil = 7;
  const next = new Date(today);
  next.setDate(today.getDate() + daysUntil);
  return next;
}

export function Live() {
  const [liveData, setLiveData] = useState<any>({
    isLive: false,
    videoId: null,
    title: "",
    description: "",
    publishedAt: "",
    channelId: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // H24 Stream configuration & view states
  const [streamMode, setStreamMode] = useState<'live' | 'h24'>('live');
  const [h24Url, setH24Url] = useState<string>(() => {
    return localStorage.getItem('ceme_h24_vmix_url') || '';
  });
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(h24Url);

  const handleSaveH24Url = () => {
    localStorage.setItem('ceme_h24_vmix_url', tempUrl.trim());
    setH24Url(tempUrl.trim());
    setIsEditingUrl(false);
  };

  useEffect(() => {
    async function checkLiveStatus() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/youtube/live');
        if (res.ok) {
          const data = await res.json();
          setLiveData(data);
        }
      } catch (err) {
        console.error("Error loaded live stream status:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkLiveStatus();
  }, []);

  const defaultH24EmbedUrl = liveData.channelId 
    ? `https://www.youtube.com/embed/live_stream?channel=${liveData.channelId}&autoplay=1&mute=0&rel=0`
    : `https://www.youtube.com/embed/live_stream?channel=UCXb68G4-tZgMre9SMyHlZPg&autoplay=1&mute=0&rel=0`; // Fallback default to the resolved channel or channel streaming template


  return (
    <div className="min-h-screen bg-soft-black text-white pt-24 pb-20">
      
      {/* Grâce TV Live Banner Header */}
      <div className="border-b border-gold/15 bg-[#12100f] py-12 relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/40 via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute -top-[20%] left-1/4 w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-red-600/10 border border-red-500/25 rounded-xl mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${liveData.isLive ? 'bg-red-400' : 'bg-gray-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveData.isLive ? 'bg-red-500' : 'bg-gray-500'}`}></span>
              </span>
              <span className="font-sans font-black tracking-widest text-red-500 text-[10px] uppercase">
                {liveData.isLive ? 'EN DIRECT • GRÂCE TV' : 'DIFFUSION REPLAY • GRÂCE TV'}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-black leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
              <span className="text-white">La Bonne Nouvelle</span> <span className="text-gold font-serif block sm:inline mt-1 sm:mt-0">partout-partout</span>
            </h1>
            <p className="text-white max-w-xl text-xs md:text-sm font-normal mt-3 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              Votre canal céleste en temps réel. Rejoignez notre communauté mondiale pour des cultes d'adoration, des ministères de délivrance profonde et des enseignements doctrinaux d'excellence.
            </p>
          </div>
          <div className="flex items-center gap-4 py-3.5 px-5 rounded-2xl bg-[#1c1917]/95 border border-white/10 backdrop-blur-md shrink-0 shadow-2xl relative z-20">
            <div className="text-right">
              <p className="text-[10px] text-white/60 uppercase font-black tracking-widest">COMMUNION SACRÉE</p>
              <p className="text-sm font-bold text-gold">Chaque Dimanche à 10H00</p>
            </div>
            <div className="p-2.5 bg-gold/10 rounded-xl border border-gold/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-gold animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 border-t border-white/5 pt-4">

        <div className="flex flex-col gap-8">
          {/* Main Video Area */}
          <div className="w-full flex flex-col">
            
            {/* Stream Selector Subnav / Tabs — H24 VMix masqué tant qu'il n'est pas opérationnel */}
            {false && (
              <div className="flex border-b border-white/10 mb-8 max-w-md bg-stone-900 border border-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setStreamMode('live')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition-all ${
                    streamMode === 'live'
                      ? 'bg-gold text-soft-black font-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  🔴 Culte en Direct
                </button>
                <button
                  onClick={() => setStreamMode('h24')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition-all ${
                    streamMode === 'h24'
                      ? 'bg-gold text-soft-black font-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  📺 Web TV Grâce H24 (VMix)
                </button>
              </div>
            )}

            {streamMode === 'live' ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-3 h-3 rounded-full ${liveData.isLive ? 'bg-red-600 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-gray-500'}`} />
                    <h2 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-white/90">
                      {liveData.isLive ? 'Signal Direct Actif' : 'Dernières Diffusions Directes'}
                    </h2>
                  </div>
                  <span className={`text-soft-black text-center text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg inline-block w-max ${liveData.isLive ? 'bg-red-600 text-white animate-pulse' : 'bg-gold'}`}>
                    {liveData.isLive ? 'Direct en Cours' : 'Diffusé Récemment'}
                  </span>
                </div>
                
                <div className="relative w-full aspect-video min-h-[320px] sm:min-h-[460px] lg:min-h-[580px] bg-black rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                  {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950">
                      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-sm text-gray-400">Recherche du flux de diffusion en direct...</p>
                    </div>
                  ) : liveData.videoId ? (
                    <iframe 
                      className="w-full h-full border-0 absolute inset-0"
                      src={`https://www.youtube.com/embed/${liveData.videoId}?autoplay=1&rel=0`}
                      title="Grâce TV Direct Live Stream"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1549488344-c1899121a973?auto=format&fit=crop&q=80&w=1200" alt="Stream Preview" className="w-full h-full object-cover opacity-65 group-hover:scale-102 transition-transform duration-700"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="text-center z-10 px-4 flex flex-col items-center">
                        <WifiOff className="w-10 h-10 text-gold mb-3 animate-bounce" />
                        <p className="text-2xl font-serif mb-3 font-bold">La diffusion est actuellement hors ligne</p>
                        <p className="text-white/60 text-sm max-w-md">Aucun direct n'a été détecté pour le moment. Suivez-nous sur YouTube pour ne manquer aucune notification !</p>
                      </div>
                    </div>
                  )}

                  {/* Live Badge Overlay */}
                  {liveData.isLive && (
                    <div className="absolute top-4 left-4 bg-red-650 backdrop-blur-md px-3 py-1.5 rounded-lg border border-red-500 flex items-center space-x-2 text-xs z-20 animate-pulse">
                      <Heart className="w-4 h-4 text-white fill-white" />
                      <span className="font-bold uppercase tracking-wider text-white">RETRANSMISSION EN DIRECT</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    <h2 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-white/90">
                      Signal Continu Grâce TV H24 (VMix)
                    </h2>
                  </div>
                  <span className="text-soft-black text-center text-xs font-bold uppercase tracking-widest px-4 py-1.5 bg-emerald-500 text-white rounded-full shadow-lg inline-block w-max">
                    En Ligne H24
                  </span>
                </div>
                
                <div className="relative w-full aspect-video min-h-[320px] sm:min-h-[460px] lg:min-h-[580px] bg-black rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                  <iframe 
                    className="w-full h-full border-0 absolute inset-0"
                    src={getEmbedUrl(h24Url, defaultH24EmbedUrl)}
                    title="Grâce TV H24 VMix Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />

                  {/* Live Badge Overlay */}
                  <div className="absolute top-4 left-4 bg-emerald-600 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500 flex items-center space-x-2 text-xs z-20">
                    <MonitorPlay className="w-4 h-4 text-white animate-pulse" />
                    <span className="font-bold uppercase tracking-wider text-white">WEB-TV CONTINUE VMIX</span>
                  </div>
                </div>
              </>
            )}
            
            <div className="mt-8 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm animate-fade-in relative">
              {streamMode === 'h24' && (
                <button
                  onClick={() => {
                    setIsEditingUrl(!isEditingUrl);
                    setTempUrl(h24Url);
                  }}
                  className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/15 transition-all text-xs flex items-center gap-1.5"
                  title="Configurer le flux H24 VMix"
                >
                  <Settings className="w-4 h-4 text-gold" />
                  <span className="hidden sm:inline text-gold font-bold uppercase tracking-wider text-[10px]">⚙ Configurer le flux</span>
                </button>
              )}

              {isEditingUrl && streamMode === 'h24' && (
                <div className="mb-6 p-5 rounded-2xl bg-[#12100f] border border-gold/20 animate-fade-in">
                  <div className="flex items-center gap-2 text-gold mb-2">
                    <Link2 className="w-4.5 h-4.5" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider">Configurer le lien de retransmission H24 VMix</h4>
                  </div>
                  <p className="text-xs text-white/60 mb-4 font-normal leading-relaxed">
                    Séquencez ou configurez le lien de votre chaîne continue. Collez le lien direct (ex: chaîne YouTube Live, intégration VMix ou lecteur vidéo HLS). Si laissé vide, la Web-TV utilisera le signal live principal de Grâce TV.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                      placeholder="Ex: https://www.youtube.com/watch?v=... ou widget d'intégration"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveH24Url}
                        className="bg-gold hover:bg-gold/90 text-soft-black px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Enregistrer
                      </button>
                      <button
                        onClick={() => setIsEditingUrl(false)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold mb-3 leading-tight text-white">
                    {streamMode === 'live'
                      ? (liveData.title || 'Service de Célébration Prophétique')
                      : 'Grâce TV H24 - La Présence Divine en Continu'
                    }
                  </h2>
                  <p className="text-white/80 text-base mb-4">
                    {streamMode === 'live'
                      ? `Par ${liveData.title ? parsePreacher(liveData.title) : 'Rev. Dr. Alphonse ESSOMBA'}`
                      : 'Diffusion continue depuis les régies CEME • Réseau de Grâce'
                    }
                  </p>
                  <span className="inline-block bg-white/10 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md">
                    {streamMode === 'live' ? 'Grâce TV • Canal Divin' : 'Retransmission VMix Active'}
                  </span>

                  <p className="text-white/60 text-xs font-light mt-4 leading-relaxed max-w-2xl line-clamp-3">
                    {streamMode === 'live'
                      ? (liveData.description || "Découvrez la prédication inspirante diffusée sur notre plateforme en ligne et laissez l'onction d'élévation toucher votre vie.")
                      : "Connectez-vous à l'atmosphère prophétique 24 heures sur 24, 7 jours sur 7. Retrouvez des flux d'enseignements, des prières de délivrances, des cantiques inspirés et des cultes historiques diffusés sans interruption."
                    }
                  </p>
                </div>
                <div className="flex flex-col space-y-3 shrink-0 w-full md:w-auto">
                  <Link to="/faire-un-don" className="bg-burgundy hover:bg-red-800 text-white px-6 py-3 md:py-2.5 rounded-xl text-center text-sm font-bold uppercase tracking-wider transition-colors shadow-lg">
                    Faire une offrande
                  </Link>
                  <Link to="/eglise/priere" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 md:py-2.5 rounded-xl text-center text-sm font-bold uppercase tracking-wider transition-colors">
                    Demander la prière
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 pt-6 mt-6 border-t border-white/10 text-sm font-semibold uppercase tracking-wider text-white/80">
                <button className="flex items-center space-x-2 hover:text-gold transition-colors">
                  <Heart className="w-5 h-5" /> <span>J'aime ({streamMode === 'live' ? (liveData.isLive ? 'Direct' : 'Replay') : 'H24'})</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-gold transition-colors">
                  <Share2 className="w-5 h-5" /> <span>Partager le lien</span>
                </button>
                <Link to="/eglise/sermons" className="flex items-center space-x-2 hover:text-gold transition-colors text-white/80">
                  <Play className="w-4 h-4 text-gold" /> <span>Voir tous les replays</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Streams — dates calculées dynamiquement */}
            <div className="mt-12">
              <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                <CalendarClock className="w-6 h-6 text-gold" />
                Prochains Directs
              </h3>
              {(() => {
                const nextFriday = getNextWeekday(5); // 5 = vendredi
                const nextSunday = getNextWeekday(0); // 0 = dimanche
                const events = [
                  {
                    date: nextFriday,
                    label: 'Soirée de Prière',
                    time: '19:00',
                    desc: 'Intercession et délivrance prophétique',
                    accent: 'bg-burgundy text-white',
                  },
                  {
                    date: nextSunday,
                    label: 'Culte Dominical',
                    time: '10:00',
                    desc: 'Célébration, louange et enseignement',
                    accent: 'bg-soft-black border border-white/20 text-white',
                  },
                ];
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((ev) => (
                      <div key={ev.label} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                        <div className={`${ev.accent} p-3 rounded-xl text-center min-w-[70px]`}>
                          <span className="block text-sm font-bold uppercase">{FR_DAYS[ev.date.getDay()]}</span>
                          <span className="block text-2xl font-serif">{ev.date.getDate()}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-1 text-white">{ev.label}</h4>
                          <p className="text-white/60 text-sm leading-relaxed">{ev.time} - {ev.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
