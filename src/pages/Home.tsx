import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  PlayCircle, Calendar, Heart, MapPin, Users, Music, HandHeart,
  BookOpen, ChevronRight, Star, Clock, Flame, Play, ArrowRight, Quote
} from 'lucide-react';
import { getTestimonials, getStudyDocuments } from '../lib/dbService';


const stats = [
  { value: '500+', label: 'Membres & Familles',    sub: 'Une communauté en croissance' },
  { value: '25',   label: 'Ans de Ministère',       sub: 'Depuis 2001, fidèle à l\'appel' },
  { value: '3+',   label: 'Rassemblements',         sub: 'Dimanche, Mercredi & Jeudi à Samedi' },
  { value: '50+',  label: 'Nations Représentées',   sub: 'Un avant-goût du Ciel' },
];

const testimonials = [
  {
    name: 'Jean-Pierre K.',
    role: 'Membre depuis 2019',
    text: 'J\'avais tout : une belle carrière, une famille, l\'argent... mais un vide immense en moi. Le soir où j\'ai franchi les portes de cette église, un inconnu s\'est approché avec un sourire sincère. Ce soir-là, j\'ai rencontré Jésus-Christ. Ma vie n\'a plus jamais été la même.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Esther M.',
    role: 'Membre depuis 2021',
    text: 'Après mon divorce, je pensais que Dieu m\'avait abandonnée. La dépression m\'avait clouée au sol deux ans. Un message du pasteur sur la restauration a tout changé. Aujourd\'hui je dirige le ministère de louange et je témoigne de Sa grâce infinie.',
    img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Samuel & Priscilla D.',
    role: 'Membres depuis 2017',
    text: 'Notre mariage était au bord du gouffre. Nous avons suivi le programme de restauration conjugale avec une foi timide. Dieu a fait un miracle. Aujourd\'hui nous aidons d\'autres couples à traverser les mêmes épreuves. L\'Éternel est notre étendard.',
    img: 'https://images.unsplash.com/photo-1604514628550-37477afdf4e3?auto=format&fit=crop&q=80&w=200',
  },
];

const ministries = [
  { icon: Users,     title: "L'École du Dimanche",     desc: 'Pour les enfants de 3 à 12 ans, un enseignement ludique et profond de la Parole.',                            img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600', tag: '3-12 ans'  },
  { icon: Music,     title: 'Louange & Adoration',      desc: 'Un ministère dédié à élever le nom de l\'Éternel par la musique et le chant prophétique.',                  img: '/uploads/louange%20et%20adoration.png', tag: 'Musique'   },
  { icon: HandHeart, title: 'Action Sociale',            desc: 'Soutenir les démunis, distribuer des repas et manifester l\'amour de Christ en actes concrets.',            img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600', tag: 'Service'   },
  { icon: Flame,     title: "Ministère d'Intercession", desc: 'Des guerriers de prière qui se battent sur leurs genoux pour l\'église, la ville et les nations.',           img: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=600', tag: 'Prière'    },
  { icon: BookOpen,  title: 'École Biblique',            desc: 'Formation doctrinale approfondie pour tout croyant désirant maîtriser les Écritures.',                      img: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=600', tag: 'Formation' },
  { icon: Star,      title: 'Impact Jeunesse',           desc: 'Pour les 15-25 ans : rencontres dynamiques, retraites et mission pour une génération en feu.',              img: '/uploads/impact%20jeunesse.png', tag: '15-25 ans' },
];

const program = [
  { day: 'Dimanche', time: '09h00 – 12h30', title: 'Culte Célébration',  desc: 'Culte d\'adoration souverain et prédication avec impact maximum et libération totale.',  icon: Star,     bg: 'bg-gold text-soft-black',      badge: 'Principal' },
  { day: 'Mercredi', time: '18h00 – 20h00', title: 'École des Affaires',  desc: 'Libérer la sagesse entrepreneuriale divine, acquérir de puissantes stratégies de réussite.', icon: Flame,    bg: 'bg-soft-black text-white',     badge: 'Affaires' },
  { day: 'Jeudi & Vendredi', time: 'Dès 17h00 / 18h00', title: 'Star University', desc: 'Académie d\'excellence, de leadership universitaire et d\'approfondissement doctrinal.',   icon: BookOpen, bg: 'bg-burgundy text-white',        badge: 'Formation' },
  { day: 'Samedi',   time: '10h00 – 14h00', title: 'Star University',    desc: 'Sessions d\'application doctrinale actives suivies d\'ateliers avancés de spécialisation.', icon: Users,    bg: 'bg-[#2d5a4a] text-white',       badge: 'Ateliers'  },
];

export function Home() {
  const [dynamicTestimonials, setDynamicTestimonials] = useState<any[]>(testimonials);
  const [latestSermons, setLatestSermons] = useState<any[]>([]);
  const [sermonsLoading, setSermonsLoading] = useState(true);
  const [studyDocs, setStudyDocs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/youtube/sermons')
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: any[]) => setLatestSermons(data.slice(0, 3)))
      .catch(() => setLatestSermons([]))
      .finally(() => setSermonsLoading(false));
  }, []);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const fbList = await getTestimonials();
        const homeList = fbList.filter(t => t.category === 'home');
        if (homeList && homeList.length > 0) {
          const mapped = homeList.map(item => ({
            name: item.author,
            role: item.since,
            text: item.text,
            img: item.img || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
          }));
          setDynamicTestimonials(mapped);
        }
      } catch (e) {
        console.error("Failure fetching home testimonials from Firestore: ", e);
      }
    }
    loadTestimonials();
  }, []);

  useEffect(() => {
    getStudyDocuments().then(setStudyDocs).catch(() => setStudyDocs([]));
  }, []);

  return (
    <>
    <div>

      {/* ======================================================
          HERO
      ====================================================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-soft-black">
        <div className="absolute inset-0">
          <img
            src="/uploads/fonde%20en.jpeg"
            alt="Culte"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-soft-black via-soft-black/60 to-transparent" />
        </div>

        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-burgundy/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gold/3 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center animate-divine-glow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-gold">
                  <path d="M11 2v8H3v4h8v8h2v-8h8v-4h-8V2z"/>
                </svg>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="text-gold tracking-[0.3em] uppercase text-sm mb-6 font-semibold"
            >
              L'Éternel est ma bannière — Exode 17:15
            </motion.p>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-[0.92] mb-8">
              Partir de zero<br />
              <span className="text-burgundy/90 italic drop-shadow-lg">et devenir un héro.</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 font-light leading-relaxed"
            >
              Bienvenue à la Chapelle de l'Eternel Mon Étendard — une famille spirituelle où l'amour de Christ transforme les vies, guérit les cœurs brisés et restaure l'espérance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/join"
                className="bg-gold hover:bg-yellow-400 text-soft-black px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-all w-full sm:w-auto text-center shadow-[0_0_30px_rgba(201,168,76,0.35)] hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]"
              >
                Nous Rejoindre ce Dimanche
              </Link>
              <Link
                to="/live"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Culte en Direct
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-[10px] uppercase tracking-widest">Découvrir</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ======================================================
          QUICK ACCESS CARDS
      ====================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:-mt-14 -mt-6 relative z-20">
            {/* CARD 1: SERMONS */}
            <Link to="/sermons" className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative rounded-3xl h-full min-h-[380px] flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl cursor-pointer border border-white/10"
              >
                {/* Background Image - Open Bible on Pulpit */}
                <div className="absolute inset-0">
                  <img
                    src="/uploads/sermons.jpeg"
                    alt="Sermons"
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-110"
                  />
                  {/* Rich Gradient Overlay for ultimate contrast and readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-soft-black via-soft-black/80 to-soft-black/35" />
                  <div className="absolute inset-0 bg-burgundy/10 group-hover:bg-burgundy/5 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                  <div>
                    {/* Glowing Accent Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-burgundy/80 border border-burgundy/90 text-[10px] font-bold uppercase tracking-wider text-white rounded-lg mb-6 shadow-md shadow-black/40">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                      Médiathèque
                    </div>
                    <PlayCircle className="w-10 h-10 text-gold mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                    <h3 className="font-serif text-2xl font-bold mb-3 text-white drop-shadow-md">Sermons</h3>
                    <p className="text-white/85 text-xs md:text-sm leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                      Nourrissez votre foi avec nos derniers messages et enseignements de la Parole de Grâce.
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6 text-gold/80 group-hover:text-gold text-xs font-bold uppercase tracking-widest transition-colors">
                    <span>Écouter les enseignements</span>
                    <ChevronRight className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* CARD 2: AGENDA */}
            <Link to="/schedule" className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative rounded-3xl h-full min-h-[380px] flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl cursor-pointer border border-white/10"
              >
                {/* Background Image - Open Journal and Bible with Hot Coffee */}
                <div className="absolute inset-0">
                  <img
                    src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800"
                    alt="Agenda"
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-soft-black via-soft-black/85 to-soft-black/40" />
                  <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/0 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                  <div>
                    {/* Glowing Accent Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 border border-white/20 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm rounded-lg mb-6 shadow-md shadow-black/40">
                      Calendrier Réel
                    </div>
                    <Calendar className="w-10 h-10 text-gold mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                    <h3 className="font-serif text-2xl font-bold mb-3 text-white drop-shadow-md">Agenda</h3>
                    <p className="text-white/85 text-xs md:text-sm leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                      Tous nos cultes, nuit de prières, sessions d'étude et rassemblements communautaires en temps réel.
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6 text-gold/80 group-hover:text-gold text-xs font-bold uppercase tracking-widest transition-colors">
                    <span>Voir les cultes</span>
                    <ChevronRight className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* CARD 3: PRIÈRE */}
            <Link to="/prayer" className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative rounded-3xl h-full min-h-[380px] flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl cursor-pointer border border-white/10"
              >
                {/* Background Image - Church congregation with hands raised in deep pray */}
                <div className="absolute inset-0">
                  <img
                    src="/uploads/priere.jpeg"
                    alt="Prière"
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-soft-black via-soft-black/85 to-soft-black/45" />
                  <div className="absolute inset-0 bg-[#2d5a4a]/10 group-hover:bg-[#2d5a4a]/5 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                  <div>
                    {/* Glowing Accent Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/90 border border-gold text-[10px] font-bold uppercase tracking-wider text-soft-black rounded-lg mb-6 shadow-md shadow-black/40">
                      Combat Spirituel
                    </div>
                    <Heart className="w-10 h-10 text-gold mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                    <h3 className="font-serif text-2xl font-bold mb-3 text-white drop-shadow-md">Prière</h3>
                    <p className="text-white/85 text-xs md:text-sm leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                      Confiez-nous vos fardeaux d'intercession, notre armée de prière combat spirituellement pour vous.
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6 text-gold/80 group-hover:text-gold text-xs font-bold uppercase tracking-widest transition-colors">
                    <span>Faire une requête</span>
                    <ChevronRight className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* CARD 4: VENIR - EXQUISITE HAND DRAWN PARCHMENT MAP STYLE */}
            <Link to="/join" className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative rounded-3xl h-full min-h-[380px] flex flex-col justify-between bg-[#FDFBF7] text-[#2C2115] border border-[#E9DFCB] shadow-xl hover:shadow-2xl hover:border-gold/40 transition-all cursor-pointer overflow-hidden p-6 md:p-7"
              >
                {/* Parchment background overlay pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[radial-gradient(#2C2115_20%,transparent_120%)]" />
                
                {/* Torn paper header accent effect */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Handcrafted Parchment Header */}
                    <div className="text-center mb-3">
                      <h4 className="font-serif text-[#1C3A5E] text-sm md:text-base font-black uppercase tracking-wider leading-none">
                        BIENVENUE À TOUS
                      </h4>
                      <p className="font-serif text-[#811B1B] text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none mt-1">
                        VENIR NOUS REJOINDRE
                      </p>
                    </div>

                    {/* Interactive Handsketched Vector Mini-Map */}
                    <div className="bg-[#FAF6F0] rounded-2xl border border-[#EBE1CD] p-2 relative h-[142px] flex flex-col justify-between overflow-hidden shadow-inner">
                      {/* Roads mapping as custom background SVG path lines */}
                      <svg className="absolute inset-0 w-full h-full text-slate-300 opacity-60 pointer-events-none" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 0,35 h 200" stroke="#E5DEC9" strokeWidth="11" />
                        <path d="M 65,0 v 120" stroke="#E5DEC9" strokeWidth="11" />
                        <path d="M 145,35 v 85" stroke="#E5DEC9" strokeWidth="11" />
                        <text x="5" y="30" fill="#9C8E76" fontSize="5.5" fontWeight="bold" letterSpacing="0.05em">Axe Principal</text>
                        <text x="69" y="80" fill="#9C8E76" fontSize="5.5" fontWeight="bold" letterSpacing="0.05em" transform="rotate(90 69 80)">Axe Principal</text>
                        <text x="149" y="90" fill="#9C8E76" fontSize="5.5" fontWeight="bold" letterSpacing="0.05em" transform="rotate(90 149 90)">Avenue Emombo</text>
                        {/* Inline Compass illustration inside SVG */}
                        <g transform="translate(182, 18)">
                          <circle cx="0" cy="0" r="9" stroke="#9C8E76" strokeWidth="1" fill="#FAF6F0" />
                          <line x1="0" y1="-8" x2="0" y2="8" stroke="#9C8E76" strokeWidth="0.5" />
                          <line x1="-8" y1="0" x2="8" y2="0" stroke="#9C8E76" strokeWidth="0.5" />
                          <path d="M0,0 L0,-7 L2,-3 Z" fill="#811B1B" />
                          <path d="M0,0 L0,7 L-2,3 Z" fill="#1C3A5E" />
                          <text x="-2" y="-10" fill="#9C8E76" fontSize="5" fontWeight="black">N</text>
                        </g>
                      </svg>
                      
                      {/* Interactive Church Location Highlight with Pulsing Heart Pin */}
                      <div className="absolute top-[40px] left-[15px] flex flex-col items-center">
                        <div className="px-1 py-0.5 bg-white/95 border border-[#CCBEA3] rounded text-[4.5px] font-bold text-[#8D7F66] text-center shadow-sm pointer-events-none">
                          Notre Église
                        </div>
                        <motion.div 
                          className="w-11 h-11 bg-white border-2 border-[#1C3A5E] rounded-md shadow flex flex-col items-center justify-center rotate-[-3deg] mt-1 relative"
                          animate={{ y: [0, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                          <span className="text-[4px] text-[#1C3A5E] font-black uppercase tracking-tighter text-center leading-none">ÉGLISE</span>
                          <Heart className="w-2 h-2 text-[#811B1B] fill-[#811B1B] my-0.5 animate-pulse" />
                          <span className="text-[3px] font-bold text-gray-500 uppercase leading-none">CEME YAOUNDÉ</span>
                        </motion.div>
                      </div>

                      {/* Map Landmark Items */}
                      <div className="absolute top-4 right-10 w-9 h-fit border border-[#CCBEA3] bg-white/70 rounded px-1 py-0.5 text-[4px] text-[#8D7F66] text-center font-bold rotate-2 shadow-sm pointer-events-none">
                        Auberge Emombo
                      </div>
                      <div className="absolute bottom-5 right-3 w-10 h-fit border border-[#CCBEA3] bg-white/70 rounded px-1 py-0.5 text-[4px] text-[#8D7F66] text-center font-bold -rotate-3 shadow-sm pointer-events-none">
                        BP 6065 Yaoundé
                      </div>

                      {/* Beautiful paper scale elements */}
                      <div className="absolute bottom-1 left-2 bg-white/90 border border-[#E9DFCB] rounded px-1 py-0.5 text-[5px] text-[#8D7F66] font-bold shadow-xs pointer-events-none">
                        ★ Accueil Chaleureux
                      </div>
                    </div>

                    {/* Traditional Address Card Text blocks */}
                    <div className="text-center mt-2.5 border-t border-[#EAE0CB] pt-2 text-[9px] text-[#4A3B32] space-y-0.5 font-serif leading-tight">
                      <p className="font-extrabold text-[#1C3A5E]">
                        ADRESSE : <span className="font-normal text-gray-700">EMOMBO AUBERGE, BP 6065 Yaoundé</span>
                      </p>
                      <p className="font-extrabold text-[#811B1B]">
                        CULTES : <span className="font-normal text-gray-700">Dimanche 09h00, Mercredi 18h00, Jeudi/Vendredi 18h00</span>
                      </p>
                      <p className="font-extrabold text-[#9A622A]">
                        ACCÈS : <span className="font-normal text-gray-700">Taxis & Motos (arrêt Emombo Auberge)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[#1C3A5E] text-xs font-bold uppercase tracking-wider mt-4">
                    <span>Rejoindre la Chapelle</span>
                    <ChevronRight className="w-4 h-4 text-[#1C3A5E] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          STATS
      ====================================================== */}
      <section className="py-20 bg-soft-black relative overflow-hidden">
        <div className="absolute inset-0 cross-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-soft-black/80 via-transparent to-soft-black/80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="shimmer-text font-serif text-5xl md:text-6xl font-bold mb-2">{s.value}</div>
                <p className="text-white font-bold text-base mb-1">{s.label}</p>
                <p className="text-white/40 text-sm">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          WHO WE ARE
      ====================================================== */}
      <section className="py-28 bg-[#f5f2ed] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="absolute -inset-4 border-2 border-gold rounded-[2rem] rotate-2 hover:rotate-4 transition-transform duration-500" />
            <img
              src="/uploads/reverand_essomba.png"
              alt="Communauté en Adoration"
              className="relative rounded-[2rem] w-full h-[500px] object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-gold text-soft-black rounded-2xl p-5 shadow-xl text-center">
              <p className="font-serif text-3xl font-bold leading-none">2001</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-1">Fondée en</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-7"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm">Qui Nous Sommes</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-soft-black leading-tight">
              Une église pour <span className="text-burgundy italic">toutes les générations</span>.
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed font-light">
              Nous croyons que l'église n'est pas qu'un simple bâtiment où l'on se réunit le dimanche, mais une famille dynamique et vivante où chacun a sa place. Peu importe d'où vous venez, votre passé ou vos blessures — vous trouverez ici une communauté chaleureuse, des enseignements bibliques profonds et un espace pour grandir dans votre foi.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed font-light">
              Notre désir est de voir chaque personne découvrir son identité en Christ, être équipée pour accomplir l'appel de Dieu sur sa vie, et impacter son environnement avec l'amour inconditionnel de Jésus.
            </p>
            <div className="grid grid-cols-2 gap-5 pt-2">
              {[
                { icon: BookOpen, label: 'Enseignement Biblique', sub: 'La Parole au cœur de tout' },
                { icon: Heart,    label: 'Pastorale Authentique', sub: 'Un suivi personnalisé'    },
                { icon: Users,    label: 'Famille Chaleureuse',   sub: 'Pas un programme'         },
                { icon: Flame,    label: 'Feu du Saint-Esprit',   sub: 'Un culte vivant et ardent'},
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-soft-black">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 text-burgundy font-bold uppercase tracking-wider hover:text-gold transition-colors">
              Découvrir notre vision <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          EVANGELISTIC SECTION — FOR THE LOST
      ====================================================== */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-60" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Un message pour vous</p>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-soft-black leading-tight mb-6">
              Et si Dieu vous <span className="text-burgundy italic">attendait</span> ?
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
              Peut-être avez-vous tout essayé — le succès, les relations, les voyages — mais un vide inexplicable persiste. Ce vide a un nom : il a la forme de Dieu. Et Jésus-Christ est venu pour le combler.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            {[
              {
                step: '01', title: 'Admettre',
                text: 'Reconnaître que l\'on est loin de Dieu et que l\'on a besoin de Lui. Ce n\'est pas une faiblesse — c\'est la première porte de la liberté.',
                verse: '"Car tous ont péché et sont privés de la gloire de Dieu." — Romains 3:23',
              },
              {
                step: '02', title: 'Croire',
                text: 'Croire que Jésus-Christ est mort à la croix pour nos péchés et est ressuscité le troisième jour. C\'est le cœur de l\'Évangile.',
                verse: '"Car Dieu a tant aimé le monde qu\'il a donné son Fils unique." — Jean 3:16',
              },
              {
                step: '03', title: 'Choisir',
                text: 'Décider de donner sa vie à Christ. Ce n\'est pas une religion — c\'est une relation vivante et transformante avec le Dieu vivant.',
                verse: '"Voici, je me tiens à la porte et je frappe." — Apocalypse 3:20',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-[#f5f2ed] rounded-3xl p-8 text-center border border-gray-200 hover:border-gold transition-all group hover:shadow-xl"
              >
                <div className="w-16 h-16 rounded-full bg-gold text-soft-black font-serif text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-md group-hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-shadow">
                  {item.step}
                </div>
                <h3 className="font-serif text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{item.text}</p>
                <p className="text-xs text-gray-400 italic border-t border-gray-200 pt-4">{item.verse}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-500 mb-8 font-light text-lg max-w-2xl mx-auto">
              Si vous souhaitez faire cette décision, venez nous voir lors de notre prochain culte. Notre équipe vous accueillera avec amour.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/join"
                className="bg-burgundy hover:bg-red-800 text-white px-10 py-5 rounded-full font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_30px_rgba(123,29,29,0.4)] text-center"
              >
                Je veux donner ma vie à Christ
              </Link>
              <Link
                to="/prayer"
                className="bg-white border-2 border-gray-200 hover:border-gold text-soft-black px-10 py-5 rounded-full font-bold uppercase tracking-wider transition-all text-center"
              >
                Parler à quelqu'un en prière
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          TESTIMONIALS
      ====================================================== */}
      <section className="py-28 bg-soft-black relative overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-30" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gold/4 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-burgundy/10 rounded-full blur-[80px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Ce que Dieu a fait</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
              Des vies <span className="text-gold italic">transformées</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto mt-6 font-light text-lg">
              Ils sont venus avec leurs fardeaux. Ils sont repartis avec une vie nouvelle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dynamicTestimonials.map((t, i) => (
              <motion.div

                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-gold/30 transition-all group"
              >
                <Quote className="w-8 h-8 text-gold/30 mb-6" />
                <p className="text-white/75 leading-relaxed mb-8 text-sm font-light italic">"{t.text}"</p>
                <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gold/20 group-hover:border-gold transition-colors"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-gold text-xs font-bold uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-14"
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-gold text-white/70 hover:text-gold px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-all text-sm"
            >
              Lire plus de témoignages <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          MINISTRIES
      ====================================================== */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">S'Impliquer</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-soft-black">Nos Ministères</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mt-4 font-light">
              Dieu a placé en vous des dons uniques. Venez les exercer au service de Sa maison.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {ministries.map((min, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 3) * 0.1 }}
                className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 group-hover:from-black/95 group-hover:via-black/70 group-hover:to-black/35 transition-all duration-300 z-10" />
                <img
                  src={min.img}
                  alt={min.title}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 z-20 p-7 flex flex-col justify-end text-white">
                  <div className="absolute top-4 right-4 bg-gold text-soft-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {min.tag}
                  </div>
                  <div className="w-12 h-12 bg-gold text-soft-black rounded-full flex items-center justify-center mb-4 transform group-hover:-translate-y-2 transition-transform shadow-lg">
                    <min.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-2 !text-white text-white drop-shadow-md" style={{ color: '#ffffff' }}>{min.title}</h3>
                  <p className="!text-white/90 text-white/90 text-sm leading-relaxed drop-shadow-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{min.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          WEEKLY PROGRAM
      ====================================================== */}
      <section className="py-24 bg-[#f5f2ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Rejoignez-nous</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-soft-black">Programme de la Semaine</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {program.map((prog, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${prog.bg} rounded-3xl p-8 relative overflow-hidden`}
              >
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest opacity-50 border border-current/20 px-2 py-1 rounded-full">
                  {prog.badge}
                </span>
                <prog.icon className="w-9 h-9 mb-6 opacity-80" />
                <p className="font-bold text-base mb-1 opacity-60">{prog.day}</p>
                <h3 className="font-serif text-xl font-bold mb-2">{prog.title}</h3>
                <div className="flex items-center gap-2 mb-4 opacity-75">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-bold">{prog.time}</span>
                </div>
                <p className="text-sm opacity-65 leading-relaxed">{prog.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/join"
              className="inline-flex items-center gap-3 bg-soft-black text-white hover:bg-gold hover:text-soft-black px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <MapPin className="w-5 h-5" /> Comment Venir
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          SCRIPTURE VERSE
      ====================================================== */}
      <section className="py-28 bg-burgundy text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <BookOpen className="w-12 h-12 text-gold mx-auto mb-8" />
            <h2 className="font-serif text-3xl md:text-5xl font-light italic leading-tight mb-8" style={{ color: '#fffefe' }}>
              « Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance. »
            </h2>
            <p className="text-gold font-bold uppercase tracking-widest text-lg">— Jérémie 29:11</p>
            <div className="mt-12">
              <Link
                to="/sermons"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-gold hover:text-gold text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-all"
              >
                Écouter les derniers messages <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          LATEST SERMONS
      ====================================================== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-gold font-bold uppercase tracking-widest text-sm mb-2">Nourrir votre foi</p>
              <h2 className="font-serif text-4xl font-bold text-soft-black">Derniers Messages</h2>
            </motion.div>
            <Link to="/sermons" className="text-burgundy font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:text-gold transition-colors mt-4 md:mt-0">
              Tous les sermons <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {sermonsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestSermons.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Play className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun sermon disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestSermons.map((s, i) => (
                <motion.a
                  key={s.id ?? i}
                  href={`https://www.youtube.com/watch?v=${s.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100 cursor-pointer"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
                        <Play className="w-7 h-7 text-soft-black ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">{s.duration}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-gold transition-colors leading-tight line-clamp-2">{s.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-bold">{s.preacher}</span>
                      <span>{s.date}</span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          RESSOURCES ACADÉMIQUES
      ====================================================== */}
      {studyDocs.length > 0 && (
        <section className="py-24 bg-[#f5f2ed] border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-xs font-sans font-black uppercase tracking-widest text-gold bg-gold/10 px-3.5 py-1.5 rounded-lg border border-gold/10">
                📚 Ressources Académiques
              </span>
              <h2 className="font-serif text-4xl font-bold text-soft-black mt-4">Bibles, Guides d'Étude & Documents PDF</h2>
              <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">
                Consultez et téléchargez les notes d'exhortations, brochures programmatiques et bibles numériques mises à votre disposition par l'Administration Pastorale.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyDocs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
                  className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-red-50 text-red-600 font-extrabold px-2.5 py-1 rounded text-[9px] tracking-wide uppercase border border-red-200/40">{doc.fileType}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{doc.category || 'Général'}</span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-soft-black leading-snug">{doc.title}</h4>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2 font-light">{doc.description || 'Matériel de formation spirituelle.'}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Bibliothèque CEME</span>
                    <Link
                      to={`/document/${doc.id}`}
                      state={{ doc }}
                      className="bg-gold hover:bg-gold/90 text-soft-black text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Lire
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          FINAL CTA
      ====================================================== */}
      <section className="py-24 bg-soft-black relative overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center mx-auto mb-8 animate-divine-glow">
              <Heart className="w-10 h-10 text-gold" />
            </div>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">
              Votre place vous <span className="text-gold italic">attend</span>.
            </h2>
            <p className="text-white/60 text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Que vous soyez en quête de sens ou que vous cherchiez à approfondir votre marche avec Dieu — nous avons hâte de vous rencontrer ce dimanche.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/join"
                className="bg-gold hover:bg-yellow-400 text-soft-black px-10 py-5 rounded-full font-bold uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_50px_rgba(201,168,76,0.5)] text-center"
              >
                Nous rejoindre ce dimanche
              </Link>
              <Link
                to="/live"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-5 rounded-full font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Regarder en direct
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
    </>
  );
}
