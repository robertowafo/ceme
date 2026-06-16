import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Target, Shield, Flame, BookOpen, Heart, Users, Compass, ChevronRight, CheckCircle, Star, Book, Quote, Camera, ZoomIn, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TestimonialCross } from '../components/TestimonialCross';
import { getGalleryPhotos, getStudyDocuments } from '../lib/dbService';


const timeline = [
  { year: "A", title: "Le Programme AGIR ENSEMBLE",    desc: "S'investir activement dans des projets d'action sociale pour soutenir les plus démunis, veuves, orphelins, sinistrés, et la construction d'écoles." },
  { year: "B", title: "L'Élévation par l'Exemple",     desc: "Prendre Christ comme Modèle Parfait d'enseignement pour vivre de façon à inspirer et influencer positivement notre communauté." },
  { year: "C", title: "STAR UNIVERSITY & WMF",         desc: "Création d'alliances stratégiques de formation à l'éducation chrétienne et au leadership serviteur dans le monde entier." },
  { year: "D", title: "IMPACT-JEUNES",                 desc: "Rassemblements annuels majeurs réunissant des milliers de jeunes pour débattre et grandir face aux défis de l'actualité moderne." },
  { year: "E", title: "HÉROÏNES & HOMMES FORTS",       desc: "Émancipation et épanouissement des hommes et des femmes de l'église, propulsés par l'onction spirituelle du Chœur de l'Éternel." },
  { year: "F", title: "La Puissante GRACE TV",         desc: "Ddiffusion internationale de la Bonne Nouvelle de la grâce de Dieu sur les ondes et à travers nos plateformes connectées." },
  { year: "G", title: "Le Sommet d'Élévation",         desc: "Des enseignements d'impact mensuels associés à l'École des Affaires du Royaume chaque mercredi pour équiper nos professionnels." },
];

const beliefs = [
  { icon: BookOpen, title: "Les Saintes Écritures",    text: "La Bible est la Parole inspirée et infaillible de Dieu. Elle est la seule règle absolue de notre foi et de notre vie chrétienne." },
  { icon: Flame,    title: "La Sainte Trinité",         text: "Nous croyons en un seul Dieu éternellement existant en trois personnes : le Père, le Fils (Jésus-Christ) et le Saint-Esprit." },
  { icon: Heart,    title: "Le Salut par la Grâce",     text: "Le salut est un don gratuit de Dieu, obtenu non par nos œuvres, mais par la foi en l'œuvre rédemptrice de Jésus à la croix." },
  { icon: Star,     title: "Le Saint-Esprit",           text: "Nous croyons au ministère actif du Saint-Esprit qui baptise, régénère, sanctifie et équipe les croyants de ses dons spirituels." },
  { icon: Users,    title: "L'Église, Corps de Christ", text: "L'Église n'est pas un bâtiment mais le corps vivant de Christ, appelé à se rassembler, à grandir et à impacter le monde." },
  { icon: Shield,   title: "Le Retour de Christ",       text: "Nous croyons au retour glorieux et imminent de Jésus-Christ pour rapporter son Église dans la gloire éternelle du Père." },
];

const galleryImages = [
  {
    id: 1,
    category: "Cultes & Louange",
    title: "Symphonie d'Adoration Souveraine",
    location: "Grand Chœur de la Chapelle",
    url: "https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&q=80&w=800",
    desc: "Un temps de louange intensément fervente élevée vers les cieux par les chantres de l'Alliance."
  },
  {
    id: 2,
    category: "Jeunesse & Enfants",
    title: "Atelier Créatif Éco-Dimanche",
    location: "Salle des Étoiles",
    url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800",
    desc: "Nos moniteurs attentionnés transmettent la parole de l'Éternel sous des formats interactifs, ludiques et profonds."
  },
  {
    id: 3,
    category: "Actions Sociales",
    title: "Mission de Foi & Soupe Populaire",
    location: "Quartier Hospice d'Amour",
    url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800",
    desc: "Parce que l'Évangile se vit en actes, notre communauté s'engage à nourrir et soutenir les plus démunis."
  },
  {
    id: 4,
    category: "Cultes & Louange",
    title: "Veillée Splendeur des Saintes Eaux",
    location: "Piscine Baptismale",
    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
    desc: "Le témoignage radieux et l'engagement d'une résurrection spirituelle sainte."
  },
  {
    id: 5,
    category: "Vie Fraternelle",
    title: "Partage Thématique en Cellule",
    location: "Quartier Oasis CEME",
    url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800",
    desc: "Rassemblements fraternels intimes chaque jeudi pour s'encourager mutuellement à conserver la foi."
  },
  {
    id: 6,
    category: "Vie Fraternelle",
    title: "Le Pain du Cœur Fraternel",
    location: "Grande Tablée Familiale",
    url: "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&q=80&w=800",
    desc: "Moments précieux d'échanges simples et de sourires sincères pour resserrer l'unité de l'Esprit."
  }
];

function ScrollAnimateGalleryCard({ 
  img, 
  index, 
  scrollYProgress, 
  onSelect 
}: { 
  key?: any;
  img: any; 
  index: number; 
  scrollYProgress: any; 
  onSelect: (img: any) => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const colIndex = index % 3;
  const rowIndex = Math.floor(index / 3);

  // Offset calculation for start and end
  // Items start clustered in the center of the grid container
  const baseStartX = isMobile ? 0 : colIndex === 0 ? 320 : colIndex === 2 ? -320 : 0;
  const baseStartY = isMobile ? 80 : rowIndex === 0 ? 180 : rowIndex === 1 ? -180 : 0;

  // Transform coordinates relative to scrollYProgress
  const x = useTransform(scrollYProgress, [0, 0.85], [baseStartX, 0]);
  const y = useTransform(scrollYProgress, [0, 0.85], [baseStartY, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.85], [0.65, 1]);
  const rotate = useTransform(scrollYProgress, [0, 0.85], [colIndex === 0 ? -12 : colIndex === 2 ? 12 : 0, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [0, 1]);

  return (
    <motion.div
      layout
      style={{ x, y, scale, rotate, opacity }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
      className="bg-white rounded-[24px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
      onClick={() => onSelect(img)}
    >
      <div className="relative aspect-[4/3] bg-soft-black overflow-hidden pointer-events-none">
        <img
          src={img.url}
          alt={img.title}
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gold/90 backdrop-blur-xs flex items-center justify-center text-soft-black shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <ZoomIn className="w-5 h-5 pointer-events-none" />
          </div>
        </div>
        <div className="absolute top-3 left-3 bg-soft-black/85 backdrop-blur-xs px-3 py-1 rounded-md text-[9px] font-extrabold tracking-wider text-gold uppercase border border-gold/25">
          {img.category}
        </div>
      </div>

      <div className="p-5">
        <p className="text-[10px] text-burgundy font-bold uppercase tracking-widest">{img.location}</p>
        <h3 className="font-serif text-lg font-bold text-soft-black mt-1 leading-snug group-hover:text-burgundy transition-colors">{img.title}</h3>
        <p className="text-gray-600 font-light text-xs mt-2 line-clamp-2 leading-relaxed">{img.desc}</p>
      </div>
    </motion.div>
  );
}

export function About() {
  const [reservedBook, setReservedBook] = useState<string | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<string>('Tous');
  const [photosList, setPhotosList] = useState<any[]>(galleryImages);
  const [studyDocs, setStudyDocs] = useState<any[]>([]);
  const [lightboxItem, setLightboxItem] = useState<any | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"]
  });

  useEffect(() => {
    async function loadPhotos() {
      try {
        const fbPhotos = await getGalleryPhotos();
        if (fbPhotos && fbPhotos.length > 0) {
          setPhotosList(fbPhotos);
        }
      } catch (e) {
        console.error("Error fetching gallery photos from Firestore: ", e);
      }
    }
    loadPhotos();
  }, []);

  useEffect(() => {
    getStudyDocuments().then(setStudyDocs).catch(() => setStudyDocs([]));
  }, []);


  return (
    <>
    <div className="bg-white min-h-screen">

      {/* ======================================================
          HERO
      ====================================================== */}
      <div className="relative bg-soft-black text-white py-36 px-4 overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-30" />
        <img
          src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=2000"
          alt="Église"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-soft-black/60 via-transparent to-soft-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10 mt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold font-bold uppercase tracking-widest text-xs mb-6 border border-gold/40">
              Histoire & Identité
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
              Une Église Fondée sur <br />
              <span className="text-gold italic">Jésus-Christ</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/65 font-light leading-relaxed max-w-3xl mx-auto">
              Depuis 2001, la Chapelle de l'Eternel Mon Étendard poursuit une seule passion : voir les vies transformées par la puissance de l'Évangile.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ======================================================
          HISTORY
      ====================================================== */}
      <div className="bg-[#f5f2ed] py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2 relative"
            >
              <div className="absolute -inset-4 border-2 border-burgundy/30 rounded-[3rem] -rotate-2" />
              <img
                src="/uploads/reverand_essomba.png"
                alt="Rev. Dr. Alphonse ESSOMBA BOUNOUNGOU"
                className="relative rounded-[3rem] shadow-2xl w-full h-[480px] object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2 space-y-6"
            >
              <p className="text-gold font-bold uppercase tracking-widest text-sm">Notre Histoire & Appréciation</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
                Une Naissance Divine Sous <span className="text-burgundy italic">L'Onction de l'Élévation</span>
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                En l’an 2001, le <strong>Rev. Dr. Alphonse Essomba Bounoungou</strong> et son épouse Maman Marie Charlotte EssOMBA se préparaient à donner naissance à une église à domicile, suivant les recommandations spirituelles de l'Évêque John Stephen. Face à l’ampleur de la mission, dans une profonde fragilité d'esprit, le dispensateur de foi a été dirigé par le Saint-Esprit vers une méditation sur les versets percutants d'<strong>Exode 17:11-15</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">
                Une vision forte s'est imposée : un puissant rapport de force où, dans notre faiblesse partagée, le Seigneur devient notre Étendard et notre source énergisante de force perpétuelle de triomphe. S'en est suivie la vision d'un grand boulevard s'étendant à perte de vue, démontrant que malgré les assauts de l'ennemi, rien ne pourrait nous arrêter dans le ministère d'<strong>ÉLÉVATION SPIRITUELLE</strong> par la folie de la Prédication, la Prière intense et l’adoration sainte.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm font-medium">
                Sise à Emombo à <strong>Yaoundé, Cameroun</strong>, la Chapelle de l'Éternel Mon Étendard (CEME) continue de prêcher et propager ce souffle qui conduit de nombreux croyants du statut de pionniers du néant à celui de héros de la foi.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { n: '2001', l: 'Fondation' },
                  { n: 'CEME', l: 'Yaoundé' },
                  { n: 'Exode 17', l: 'Notre Ancre' }
                ].map((s, i) => (
                  <div key={i} className="text-center bg-white rounded-2xl py-3 px-2 shadow-sm border border-gray-150">
                    <p className="font-serif text-lg md:text-xl font-bold text-burgundy">{s.n}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ======================================================
          TIMELINE
      ====================================================== */}
      <div className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Notre Parcours</p>
            <h2 className="font-serif text-4xl font-bold">La Vision de l'Élévation en Action</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">Notre mouvement spirituel et communautaire se manifeste à travers d'audacieuses initiatives.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-burgundy/20 to-transparent hidden md:block" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col md:flex-row items-center gap-6 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={`md:w-5/12 ${i % 2 === 1 ? 'md:text-right' : ''}`}>
                    <div className="bg-[#f5f2ed] rounded-3xl p-7 border border-gray-200 hover:border-gold transition-colors group cursor-default">
                      <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-burgundy transition-colors">{item.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex md:w-2/12 justify-center">
                    <div className="w-14 h-14 rounded-full bg-soft-black border-4 border-gold text-gold flex items-center justify-center font-serif text-xl font-bold text-center shadow-lg animate-divine-glow shrink-0">
                      {item.year}
                    </div>
                  </div>
                  <div className="hidden md:block md:w-5/12" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          VISION / MISSION / VALUES
      ====================================================== */}
      <div className="py-24 bg-[#f5f2ed] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl font-bold mb-4">Notre ADN Spirituel</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Les piliers sur lesquels notre foi et notre ministère reposent.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-10 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow group"
            >
              <div className="w-20 h-20 bg-[#f5f2ed] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-gold transition-colors">
                <Compass className="w-10 h-10 text-burgundy group-hover:text-soft-black transition-colors" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Notre Vision</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                L'Élévation spirituelle n'est pas simplement un concept, c'est une boussole qui oriente nos âmes vers des altitudes inexplorées de foi, de communion intime avec Dieu. Notre vision tire sa force de l'amour infini manifesté à la Croix.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-10 bg-burgundy border border-red-900 rounded-[2rem] shadow-2xl md:-translate-y-8 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="w-20 h-20 bg-black/20 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
                <Target className="w-10 h-10 text-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4 text-gold relative z-10">Notre Mission</h3>
              <p className="text-white/90 leading-relaxed text-sm relative z-10">
                Propager l'« ÉLÉVATION par la prédication, la prière et la louange » pour amener chacun à s'élever au-dessus des limites du quotidien terrestre, incarnant l'amour de notre Seigneur Jésus-Christ dans notre génération.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-10 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow group"
            >
              <div className="w-20 h-20 bg-[#f5f2ed] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-gold transition-colors">
                <Shield className="w-10 h-10 text-burgundy group-hover:text-soft-black transition-colors" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Nos Valeurs</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Aimer inconditionnellement sans limites ni bornes, pardonner, partager la vérité salvatrice avec une audace constante, et servir le prochain avec abandon au travers de projets concrets de foi.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ======================================================
          TWO MANDATES — for the lost & the faithful
      ====================================================== */}
      <div className="py-24 bg-soft-black text-white relative overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-30" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold/4 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-burgundy/10 rounded-full blur-[80px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Notre Double Appel</p>
            <h2 className="font-serif text-4xl font-bold">Un Cœur pour <span className="text-gold italic">Tous</span></h2>
            <p className="text-white/50 max-w-2xl mx-auto mt-4 font-light">
              Nous n'avons pas choisi entre évangélisation et discipolat. Nous croyons aux deux, avec la même ardeur.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Heart,
                color: 'text-gold',
                borderHover: 'hover:border-gold/40',
                iconBg: 'bg-gold/10 border-gold/20',
                title: 'Pour les Non-Croyants',
                titleColor: 'text-gold',
                text: 'Nous croyons que chaque personne mérite d\'entendre l\'Évangile avec clarté et amour. Nos cultes sont conçus pour être accessibles et accueillants, sans jargon religieux incompréhensible.',
                items: [
                  'Des messages clairs et accessibles pour les nouveaux visiteurs',
                  'Une équipe d\'accueil formée et chaleureuse',
                  'Des groupes Alpha pour les questions existentielles',
                  'Un suivi pastoral personnalisé après une décision de foi',
                ],
                checkColor: 'text-gold',
              },
              {
                icon: Flame,
                color: 'text-red-300',
                borderHover: 'hover:border-burgundy/40',
                iconBg: 'bg-burgundy/10 border-burgundy/20',
                title: 'Pour les Croyants',
                titleColor: 'text-red-300',
                text: 'Donner sa vie à Christ n\'est pas la fin du voyage mais le début. Notre passion est de former des disciples matures, enracinés dans la Parole et brûlant du feu du Saint-Esprit.',
                items: [
                  'Enseignements bibliques profonds chaque semaine',
                  'École de formation et de théologie pratique',
                  'Groupes de cellules pour la croissance intime',
                  'Implication dans un ministère selon vos dons',
                ],
                checkColor: 'text-red-400',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`bg-white/5 border border-white/10 ${card.borderHover} rounded-3xl p-10 transition-colors`}
              >
                <div className={`w-16 h-16 rounded-full ${card.iconBg} border flex items-center justify-center mb-8`}>
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
                <h3 className={`font-serif text-3xl font-bold mb-4 ${card.titleColor}`}>{card.title}</h3>
                <p className="text-white/65 leading-relaxed mb-7">{card.text}</p>
                <ul className="space-y-3">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 ${card.checkColor} shrink-0 mt-0.5`} />
                      <span className="text-white/65 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          BELIEFS
      ====================================================== */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl font-bold mb-4">Ce Que Nous Croyons</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Les vérités fondamentales de notre foi chrétienne évangélique.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {beliefs.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
                className="flex gap-5 p-7 bg-[#f5f2ed] rounded-2xl hover:shadow-md transition-all border border-transparent hover:border-gold/20 group"
              >
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold transition-colors">
                  <b.icon className="w-6 h-6 text-gold group-hover:text-soft-black transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-soft-black">{b.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{b.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          BIBLIOTHÈQUE (La Bibliothèque de l'Église)
      ====================================================== */}
      <div className="py-24 bg-[#f5f2ed] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Ressources & Littérature</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-soft-black">La Bibliothèque de l'Éternel</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mt-4 leading-relaxed font-light">
              Découvrez une sélection de livres spirituels et de ressources doctrinales inspirées, disponibles en prêt gratuit pour tous nos membres et visiteurs.
            </p>
          </motion.div>

          {/* Book Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "La Puissance de la Prière Fervente",
                author: "Rev. Dr. Alphonse ESSOMBA BOUNOUNGOU",
                category: "Prière & Intercession",
                desc: "Un guide approfondi pour cultiver une vie de prière fervente et expérimenter la manifestation de la gloire divine dans votre quotidien."
              },
              {
                title: "Enracinés dans la Parole",
                author: "Maman Marie Charlotte ESSOMBA & Enseignants CEME",
                category: "Théologie & Croissance",
                desc: "Série d'enseignements et d'études théologiques appliquées sur les fondamentaux de la vie chrétienne pour consolider vos bases de foi."
              },
              {
                title: "Marcher sous le Direction du Saint-Esprit",
                author: "Ministères de l'Éternel",
                category: "Vie Chrétienne",
                desc: "Comprendre et vivre la plénitude spirituelle, s'ouvrir à l'écoute de Dieu et marcher fidèlement en accord avec Ses dons spirituels."
              }
            ].map((book, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold transition-colors">
                    <Book className="w-6 h-6 text-gold group-hover:text-soft-black" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-burgundy bg-burgundy/10 px-3 py-1 rounded-full">{book.category}</span>
                  <h3 className="font-serif text-2xl font-bold mt-4 mb-2 text-soft-black leading-tight">{book.title}</h3>
                  <p className="text-gray-400 text-xs mb-4 font-medium">De {book.author}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{book.desc}</p>
                </div>
                
                <button
                  onClick={() => setReservedBook(book.title)}
                  className="w-full bg-soft-black hover:bg-gold text-white hover:text-soft-black text-xs font-bold uppercase tracking-widest py-3.5 rounded-full transition-colors cursor-pointer text-center"
                >
                  Emprunter l'ouvrage
                </button>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
            Notre espace de lecture physique comprend plus de 150 autres ouvrages de théologie, d'histoire chrétienne et de récits édifiants. N'hésitez pas à nous visiter avant ou après chaque culte !
          </p>
        </div>
      </div>

      {/* ======================================================
          PASTORAL TEAM
      ====================================================== */}
      <div className="bg-soft-black text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-burgundy to-gold" />
        <div className="absolute inset-0 cross-pattern opacity-15" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Les Bergers</p>
            <h2 className="font-serif text-4xl font-bold">L'Équipe Pastorale</h2>
            <p className="text-white/50 max-w-2xl mx-auto mt-4">
              Dieu a établi des bergers pour paître Son troupeau avec amour, intégrité et sagesse.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-16 items-center justify-center">
            {[
              {
                name: 'Rev. Dr. Alphonse ESSOMBA BOUNOUNGOU',
                role: 'Pasteur Fondateur & Visionnaire',
                bio: 'Docteur de la foi et porteur de la vision de la CEME. Il œuvre sous l’onction du Saint-Esprit pour former des pionniers et susciter une élévation par la prédication, la louange, et la prière fervente.',
                img: '/uploads/reverand_essomba.png',
                featured: true,
              },
              {
                name: 'Maman Marie Charlotte ESSOMBA',
                role: 'Dirigeante & Psalmiste',
                bio: 'Co-fondatrice du ministère et directrice inspirée du Puissant Chœur de l’Éternel. Elle supervise également les projets HÉROÏNES pour l’émancipation spirituelle et l’épanouissement des femmes chrétiennes.',
                img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
                featured: false,
              },
            ].map((pastor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center group max-w-xs"
              >
                <div className={`w-56 h-56 rounded-full overflow-hidden mx-auto mb-6 border-4 transition-all duration-500 ${pastor.featured ? 'border-gold/40 group-hover:border-gold animate-divine-glow' : 'border-white/10 group-hover:border-gold shadow-xl'}`}>
                  <img src={pastor.img} alt={pastor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                </div>
                <h4 className="font-bold text-3xl font-serif mb-2">{pastor.name}</h4>
                <p className={`font-bold text-sm uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4 ${pastor.featured ? 'text-gold bg-gold/10' : 'text-gray-400 bg-white/5 border border-white/10'}`}>
                  {pastor.role}
                </p>
                <p className="text-white/55 text-sm leading-relaxed">{pastor.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          TÉMOIGNAGES (Témoignages de Gloire)
      ====================================================== */}
      <div className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-[20%] right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">La Grâce en Action</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-soft-black">Témoignages de Vies Transformées</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mt-4 font-light leading-relaxed">
              Pour la gloire de Dieu, découvrez comment la présence de l'Éternel et l'amour de notre communauté ont guidé et restauré de précieuses vies.
            </p>
          </motion.div>

          {/* Majestic Christian Cross shaped scrolling layout representing vertical and horizontal paths */}
          <TestimonialCross />
        </div>
      </div>

      {/* ======================================================
          GALERIE DE VIE (Media and Assemblies Gallery)
      ====================================================== */}
      <div id="church-life-gallery" ref={sectionRef} className="py-24 bg-[#f5f2ed] border-y border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-burgundy/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gold/15 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/25 mb-4 shadow-sm">
              <Camera className="w-3.5 h-3.5 animate-pulse animate-duration-1000" />
              Souvenirs Merveilleux
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-soft-black">Galerie de Vie de l'Église</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mt-4 font-light leading-relaxed">
              Découvrez en images la gloire de nos cultes, nos actions sociales au cœur de la cité, la fraîcheur de notre jeunesse et la sincérité de notre communion.
            </p>
          </motion.div>

          {/* Filtering buttons */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-12">
            {['Tous', 'Cultes & Louange', 'Actions Sociales', 'Jeunesse & Enfants', 'Vie Fraternelle'].map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  galleryFilter === cat
                    ? 'bg-burgundy text-white border-burgundy shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery grid of photos with scroll grouping animations */}
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {photosList
                .filter((img) => galleryFilter === 'Tous' || img.category === galleryFilter)
                .map((img, index) => (
                  <ScrollAnimateGalleryCard
                    key={img.id}
                    img={img}
                    index={index}
                    scrollYProgress={scrollYProgress}
                    onSelect={setLightboxItem}
                  />
                ))}
            </AnimatePresence>
          </motion.div>


        </div>
      </div>

      {/* ======================================================
          LIGHTBOX MODAL FOR GALLERY PREVIEW
      ====================================================== */}
      <AnimatePresence>
        {lightboxItem && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setLightboxItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] rounded-3xl border border-gold/25 overflow-hidden max-w-3xl w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button top corner */}
              <button 
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-gold text-white hover:text-soft-black rounded-full p-2 hover:scale-105 transition-all cursor-pointer z-50 border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[16/10] w-full bg-black">
                <img 
                  src={lightboxItem.url} 
                  alt={lightboxItem.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 md:p-8 bg-[#181614] text-white">
                <span className="text-[10px] text-gold font-extrabold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full border border-gold/25">
                  {lightboxItem.category}
                </span>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest ml-4">
                  {lightboxItem.location}
                </span>
                <h3 className="font-serif text-2xl font-bold mt-4 text-white leading-tight">
                  {lightboxItem.title}
                </h3>
                <p className="text-white/60 text-sm font-light mt-2.5 leading-relaxed">
                  {lightboxItem.desc}
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================
          RESERVATION FEEDBACK MODAL
      ====================================================== */}
      <AnimatePresence>
        {reservedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-gold/30 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold via-burgundy to-gold" />
              <div className="w-16 h-16 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-soft-black mb-3">Ouvrage réservé !</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Vous avez réservé <strong className="text-burgundy">"{reservedBook}"</strong>. Veuillez vous rapprocher de l'accueil de notre bibliothèque lors du prochain culte de dimanche pour récupérer votre livre.
              </p>
              <button
                onClick={() => setReservedBook(null)}
                className="w-full bg-soft-black hover:bg-gold text-white hover:text-soft-black font-bold uppercase tracking-widest py-3 rounded-full transition-colors cursor-pointer text-xs"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================
          RESSOURCES ACADÉMIQUES
      ====================================================== */}
      {studyDocs.length > 0 && (
        <div className="py-24 bg-white border-t border-gray-200">
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
                  className="bg-[#fcfbf9] border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between"
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
        </div>
      )}

      {/* ======================================================
          JOIN CTA
      ====================================================== */}
      <div className="py-24 bg-[#f5f2ed] text-center border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-20 h-20 rounded-full bg-burgundy flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif text-4xl font-bold mb-6">Rejoignez la Famille</h2>
            <p className="text-gray-500 font-light text-xl mb-10 leading-relaxed">
              Vous avez été créé pour appartenir à une communauté. Venez découvrir la chaleur de notre famille ce dimanche à 10h00.
            </p>
            <Link
              to="/join"
              className="bg-soft-black hover:bg-gold hover:text-soft-black text-white px-10 py-5 rounded-full font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-lg"
            >
              Voir comment venir <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>

    </div>
    </>
  );
}
