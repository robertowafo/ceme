import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Flame, 
  BookOpen, 
  Star, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Megaphone, 
  Bell, 
  Sparkles, 
  Share2, 
  CheckCircle, 
  Copy, 
  MapPin as MapIcon, 
  CalendarDays,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getChurchEvents } from '../../lib/dbService';
import { SEO } from '../../components/SEO';


interface SpecialEvent {
  id: string;
  title: string;
  type: 'special' | 'upcoming' | 'annonce';
  dateStr: string; // Affichage humain: "Vendredi 29 Mai à 19:00"
  isoDate: string; // Format "YYYY-MM-DD" pour l'intégration calendrier
  location: string;
  preacher?: string;
  desc: string;
  badge: string;
  badgeColor: string; // Ex: 'bg-gold/20 text-gold'
  image: string;
  isPopular?: boolean;
}

const WEEKLY_EVENTS = [
  { 
    dayIndex: 0, // Dimanche
    dayName: "Dimanche", 
    title: "Les Dimanches de libération & d'Impact maximum", 
    time: "09:00 - 12:30", 
    location: "Sanctuaire Principal CEME", 
    icon: Star, 
    color: "text-gold bg-gold/5 border-gold/20", 
    desc: "Culte d'adoration souverain, communion spirituelle avec délivrance intensive et proclamation de la Parole pour vivre une libération totale et un impact maximum." 
  },
  { 
    dayIndex: 3, // Mercredi
    dayName: "Mercredi", 
    title: "École des Affaires", 
    time: "18:00 - 20:00", 
    location: "Salle d'Étude & d'Onction CEME", 
    icon: Flame, 
    color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20", 
    desc: "Un rendez-vous d'impact exceptionnel pour libérer la sagesse entrepreneuriale divine, acquérir des stratégies de réussite et investir avec l'intelligence du Royaume." 
  },
  { 
    dayIndex: 4, // Jeudi
    dayName: "Jeudi", 
    title: "Star University", 
    time: "À partir de 18:00", 
    location: "Amphithéâtre de la Chapelle", 
    icon: BookOpen, 
    color: "text-blue-500 bg-blue-500/5 border-blue-500/20", 
    desc: "Académie d'excellence universitaire, de leadership et d'approfondissement doctrinal pour forger des champions de destinée." 
  },
  { 
    dayIndex: 5, // Vendredi
    dayName: "Vendredi", 
    title: "Star University", 
    time: "À partir de 17:00", 
    location: "Amphithéâtre de la Chapelle", 
    icon: BookOpen, 
    color: "text-burgundy bg-burgundy/5 border-burgundy/20", 
    desc: "Session académique et spirituelle intense pour perfectionner les dons, stimuler la vocation chrétienne et cultiver le service royal." 
  },
  { 
    dayIndex: 6, // Samedi
    dayName: "Samedi", 
    title: "Star University (Matin)", 
    time: "10:00 - 12:00", 
    location: "Amphithéâtre de la Chapelle", 
    icon: BookOpen, 
    color: "text-indigo-500 bg-indigo-500/5 border-indigo-500/20", 
    desc: "Première grande session théorique et d'application doctrinale de l'excellence académique Chrétienne." 
  },
  { 
    dayIndex: 6, // Samedi
    dayName: "Samedi", 
    title: "Star University (Après-midi)", 
    time: "12:30 - 14:00", 
    location: "Amphithéâtre de la Chapelle", 
    icon: BookOpen, 
    color: "text-indigo-500 bg-indigo-500/5 border-indigo-500/20", 
    desc: "Deuxième session de spécialisation avancée avec études thématiques de leadership intergénérationnel et ateliers." 
  }
];

const SPECIALS_AND_ANNUNCEMENTS: SpecialEvent[] = [
  {
    id: "ann-1",
    title: "Méga Concert d'Adoration : Louange Céleste",
    type: "special",
    dateStr: "Vendredi 29 Mai 2026 à 18h30",
    isoDate: "2026-05-29",
    location: "Esplanade de la Chapelle de l'Éternel",
    preacher: "Chorale Unie CEME & Chantres invités",
    desc: "Une soirée grandiose d'élévation spirituelle sous le thème de l'Alliance Auguste de Grâce. Venez expérimenter une présence divine palpable à travers une louange authentique d'onction supérieure.",
    badge: "CONCERT SPÉCIAL",
    badgeColor: "bg-gold text-soft-black font-extrabold",
    image: "https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&q=80&w=800",
    isPopular: true
  },
  {
    id: "ann-2",
    title: "Retraite Spirituelle Annuelle CEME 2026",
    type: "special",
    dateStr: "Ven 12 Juin au Dim 14 Juin 2026",
    isoDate: "2026-06-12",
    location: "Villa des Oliviers & Oasis d'Espérance",
    preacher: "Collège Pastoral CEME & Orateur Invité",
    desc: "Trois jours de mise à part complète loin des bruits du monde. Jeûne, prière intensive, enseignements fondamentaux et restauration d'âmes. Réservations requises via l'onglet d'inscription.",
    badge: "RETRAITE ANNUELLE",
    badgeColor: "bg-burgundy text-white font-extrabold",
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800",
    isPopular: true
  },
  {
    id: "ann-3",
    title: "Grand Séminaire Couple & Famille Rétablie",
    type: "upcoming",
    dateStr: "Samedi 20 Juin 2026 à 14h00",
    isoDate: "2026-06-20",
    location: "Grande Salle CEME",
    preacher: "Conseillers Conjugaux Chrétiens",
    desc: "Ateliers dynamiques et constructifs centrés sur la communication, l'éducation spirituelle des enfants et les piliers financiers de la maison chrétienne unie.",
    badge: "FAMILLE CHRÉTIENNE",
    badgeColor: "bg-blue-600 text-white font-extrabold",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "ann-4",
    title: "Solennité des Saintes Eaux : Baptêmes de la Pentecôte",
    type: "upcoming",
    dateStr: "Dimanche 05 Juillet 2026 à 09h00",
    isoDate: "2026-07-05",
    location: "Piscine Baptismale du Temple",
    preacher: "Rev. Dr. Alphonse ESSOMBA & Diacres",
    desc: "Célébration divine du bain baptismal des nouveaux convertis de la saison. Témoignages vivants de conversion d'âmes et communion fraternelle sainte.",
    badge: "SACREMENT SAINTE",
    badgeColor: "bg-emerald-600 text-white font-extrabold",
    image: "https://images.unsplash.com/photo-1505436660142-b52e3919c01f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "ann-5",
    title: "Séance Nationale d'Impact Social & Charité",
    type: "annonce",
    dateStr: "Samedi 06 Juin 2026 à 09h00",
    isoDate: "2026-06-06",
    location: "Quartier Hospice d'Amour",
    preacher: "Comité d'Impact Social CEME",
    desc: "Distribution de vivre de première nécessité, soupes populaires chrétiennes et temps d'évangélisation douce pour proclamer l'Amour du Christ en action concrète.",
    badge: "IMPACT SOCIAL",
    badgeColor: "bg-indigo-600 text-white font-extrabold",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "ann-6",
    title: "Le Sommet d'Élévation : Consécration & Onction Divine",
    type: "special",
    dateStr: "Mercredi 03 Juin 2026 à 18h00",
    isoDate: "2026-06-03",
    location: "Sanctuaire Principal CEME",
    preacher: "Rev. Dr. Alphonse ESSOMBA & Collège des Enseignants",
    desc: "Un rendez-vous d'impact incontournable chaque premier mercredi du mois. Un temps solennel d'intercession spirituelle puissante, d'adoration élevée et d'onction souveraine pour propulser votre destinée vers de nouveaux sommets.",
    badge: "PREMIER MERCREDI DU MOIS",
    badgeColor: "bg-gold text-soft-black font-extrabold",
    image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=800",
    isPopular: true
  }
];

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const DAYS_OF_WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function Schedule() {
  // Calendar States
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [announcementFilter, setAnnouncementFilter] = useState<'all' | 'special' | 'upcoming' | 'annonce'>('all');
  const [specialEventsList, setSpecialEventsList] = useState<SpecialEvent[]>(SPECIALS_AND_ANNUNCEMENTS);
  
  // Custom dialog sharing & copying feedbacks
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  // Synchronize with Firestore events collection
  useEffect(() => {
    async function loadEvents() {
      try {
        const eventsFb = await getChurchEvents();
        if (eventsFb && eventsFb.length > 0) {
          setSpecialEventsList(eventsFb as unknown as SpecialEvent[]);
        }
      } catch (err) {
        console.error("Firestore events load failure: ", err);
      }
    }
    loadEvents();
  }, []);
  const [activeSpecialDetail, setActiveSpecialDetail] = useState<SpecialEvent | null>(null);

  // Trigger brief visual popup feedback when copying link
  const triggerFeedback = (msg: string) => {
    setActiveAlert(msg);
    setTimeout(() => {
      setActiveAlert(null);
    }, 2000);
  };

  // Monthly logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayIndex = (y: number, m: number) => {
    // Get which day of the week is the 1st of the month (0=Sunday, 1=Monday...)
    let fd = new Date(y, m, 1).getDay();
    // Realign to Monday first (0=Monday, 6=Sunday)
    return fd === 0 ? 6 : fd - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIdx = getFirstDayIndex(year, month);

  // Month Switchers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Check if a specific date contains any events
  const getEventsForDate = (dayNum: number, currentY: number, currentM: number) => {
    const list: any[] = [];
    const dateStr = `${currentY}-${String(currentM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    
    // Check specials matching this specific day
    const matchSpecials = specialEventsList.filter(spec => spec.isoDate === dateStr);
    list.push(...matchSpecials.map(s => ({ ...s, isSpecial: true })));


    // Check if it's Wednesday and the first Wed of the month (within first 7 days)
    const fullDate = new Date(currentY, currentM, dayNum);
    const dayOfWeek = fullDate.getDay();

    if (dayOfWeek === 3 && dayNum <= 7) {
      list.push({
        id: `sommet-${currentY}-${currentM + 1}-${dayNum}`,
        title: "Sommet d'Élévation",
        time: "18:00 - 20:00",
        location: "Sanctuaire Principal CEME",
        icon: Flame,
        color: "text-gold bg-gold/5 border-gold/20",
        desc: "Tous les premiers mercredis du mois. Un rendez-vous divin souverain d'intercession, d'adoration vibrante et d'onction spirituelle élevée pour propulser votre destinée.",
        isSpecial: true,
        badge: "CONFERENCE INTERNATIONALE",
        badgeColor: "bg-gold text-soft-black font-extrabold",
        image: "https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&q=80&w=800"
      });
    }

    // Check weekly cycle day index
    // Note: JS Date.getDay() uses 0=Sunday, 1=Monday...
    const matchWeekly = WEEKLY_EVENTS.filter(w => w.dayIndex === dayOfWeek);
    list.push(...matchWeekly.map(w => ({ ...w, isSpecial: false })));

    return list;
  };

  // Selected date events list for display in side panel
  const getSelectedDayEvents = () => {
    return getEventsForDate(selectedDay.getDate(), selectedDay.getFullYear(), selectedDay.getMonth());
  };

  const selectedDayEvents = getSelectedDayEvents();

  // Filter announcements for the announcements section
  const filteredAnnouncements = specialEventsList.filter(ann => {
    if (announcementFilter === 'all') return true;
    return ann.type === announcementFilter;
  });


  return (
    <div className="pt-28 pb-20 bg-[#FBF9F6] min-h-screen">
      <SEO
        title="Agenda des cultes — Chapelle de l'Éternel Mon Étendard"
        description="Horaires des cultes, soirées de prière et rencontres de la Chapelle de l'Éternel Mon Étendard à Yaoundé, église porteuse de Grâce TV."
        path="/eglise/cultes"
      />
      {/* Visual top notification banner */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1e1b18] text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 border border-gold/35"
          >
            <CheckCircle className="w-5 h-5 text-gold shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">{activeAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Hero Design */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-burgundy/5 text-burgundy text-[11px] font-bold uppercase tracking-widest border border-burgundy/10 mb-4 animate-pulse">
            <CalendarIcon className="w-3.5 h-3.5" />
            Agenda & Vie de la Chapelle
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-extrabold mb-6 text-soft-black leading-tight">
            Calendrier & <span className="text-burgundy">Annonces Royaux</span>
          </h1>
          <p className="text-lg text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
            Naviguez sur notre calendrier liturgique interactif pour découvrir notre vie communautaire hebdomadaire et restez édifiés grâce à notre nouvelle rubrique d'annonces des programmes spéciaux.
          </p>
        </div>

        {/* ======================================================
            INTERACTIVE LITURGICAL CALENDAR SECTION
        ====================================================== */}
        <div className="bg-white rounded-[32px] border border-gold/15 shadow-xl overflow-hidden mb-20 p-6 md:p-10">
          
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-[#f5f2ed] border border-gold/20 flex items-center justify-center text-burgundy shadow-inner">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-soft-black">Calendrier Mensuel</h2>
              <p className="text-xs text-gray-400 font-light italic">Cliquez sur un jour pour voir les services royaux prévus</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LIGNE DE GAUCHE : LE CALENDRIER (8 cols) */}
            <div className="lg:col-span-7 bg-[#fbf9f6]/60 p-5 md:p-6 rounded-[24px] border border-gray-150 relative">
              
              {/* Header de mois */}
              <div className="flex justify-between items-center mb-6 px-2">
                <button 
                  onClick={prevMonth}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-gold border border-gold/10 flex items-center justify-center text-soft-black transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <h3 className="font-serif text-xl font-bold text-soft-black">
                    {MONTHS[month]} {year}
                  </h3>
                  <span className="text-[10px] text-[#B59437] uppercase font-bold tracking-widest block mt-0.5">Calendrier Liturgique</span>
                </div>
                <button 
                  onClick={nextMonth}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-gold border border-gold/10 flex items-center justify-center text-soft-black transition-colors shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Headers Grid */}
              <div className="grid grid-cols-7 text-center gap-2 mb-3">
                {DAYS_OF_WEEK.map((d, i) => (
                  <div key={i} className="text-xs font-bold text-gray-400 uppercase tracking-widest py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty buffer starting cells */}
                {[...Array(firstDayIdx)].map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square bg-gray-50/20 rounded-xl" />
                ))}

                {/* Days of current month */}
                {[...Array(daysInMonth)].map((_, idx) => {
                  const dayNum = idx + 1;
                  const iteratedDate = new Date(year, month, dayNum);
                  
                  const isSelected = selectedDay.getDate() === dayNum && 
                                    selectedDay.getMonth() === month && 
                                    selectedDay.getFullYear() === year;

                  const isCurrentToday = new Date().getDate() === dayNum && 
                                         new Date().getMonth() === month && 
                                         new Date().getFullYear() === year;

                  const eventsList = getEventsForDate(dayNum, year, month);
                  const hasSpecial = eventsList.some(e => e.isSpecial);
                  const hasWeekly = eventsList.some(e => !e.isSpecial);

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedDay(iteratedDate)}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border outline-none cursor-pointer group hover:scale-105 ${
                        isSelected 
                          ? 'bg-soft-black text-white border-gold shadow-lg ring-2 ring-gold/20' 
                          : isCurrentToday 
                            ? 'bg-[#f5f2ed] border-burgundy text-[#7B1D1D] font-extrabold' 
                            : 'bg-white hover:bg-[#f5f2ed] border-gray-150 text-soft-black'
                      }`}
                    >
                      <span className="text-sm font-bold relative z-10">{dayNum}</span>

                      {/* Display small dot indicators for schedules */}
                      <div className="flex gap-1 mt-1 justify-center relative z-10">
                        {hasSpecial && (
                          <span className="w-2 & h-2 rounded-full bg-red-600 border border-white block animate-pulse" title="Message Spécial" />
                        )}
                        {hasWeekly && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gold block" title="Liturgie Hebdomadaire" />
                        )}
                      </div>

                      {/* Accent gold overlay border on hover */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/30 rounded-2xl transition-all" />
                    </button>
                  );
                })}
              </div>

              {/* Quick Legend bottom info */}
              <div className="mt-8 flex flex-wrap gap-4 justify-between items-center text-[10px] text-gray-400 font-semibold border-t border-gray-200/50 pt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold block" />
                  <span>Liturgie Hebdomadaire Régulière</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 block animate-pulse" />
                  <span>Programmes Spéciaux & Veillées</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-burgundy leading-none inline-block text-[9px] text-burgundy font-bold">Jour J</span>
                  <span>Aujourd'hui</span>
                </div>
              </div>

            </div>

            {/* LIGNE DE DROITE : LE DETAIL DU JOUR SÉLECTIONNÉ (4 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full bg-[#FAF8F5] p-6 rounded-[24px] border border-gold/15 shadow-inner">
              
              <div>
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gold/10">
                  <div>
                    <span className="text-[10px] text-burgundy font-bold uppercase tracking-widest font-mono">Journée Royale Sélectionnée</span>
                    <h4 className="font-serif text-lg font-bold text-soft-black mt-0.5">
                      {selectedDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h4>
                  </div>
                </div>

                {/* Day listings */}
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-hide">
                  {selectedDayEvents.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-light text-xs italic">
                        Aucun culte ou rassemblement majeur enregistré pour ce jour. Profitez en pour un culte personnel ou une prière en cellule de quartier.
                      </p>
                    </div>
                  ) : (
                    selectedDayEvents.map((evt, j) => {
                      const IconComponent = evt.icon || Star;
                      return (
                        <div 
                          key={`act-${j}`} 
                          onClick={() => evt.isSpecial ? setActiveSpecialDetail(evt) : null}
                          className={`p-4 rounded-xl border transition-all ${
                            evt.isSpecial 
                              ? 'bg-white border-red-200 hover:border-red-500 cursor-pointer shadow-sm hover:shadow-md'
                              : 'bg-white border-gold/15 shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className={`inline-block px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                              evt.isSpecial 
                                ? 'bg-red-500 text-white' 
                                : 'bg-[#f5f2ed] text-soft-black'
                            }`}>
                              {evt.isSpecial ? "PROGRAMME SPÉCIAL" : "LITURGIE HEBDOMADAIRE"}
                            </span>
                            
                            {evt.isSpecial && (
                              <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                                <Sparkles className="w-3.5 h-3.5" /> Voir Détail
                              </span>
                            )}
                          </div>

                          <h5 className="font-serif text-base font-bold text-soft-black">{evt.title}</h5>
                          <p className="text-gray-500 font-light text-[11px] leading-relaxed mt-1 line-clamp-2">{evt.desc}</p>
                          
                          <div className="mt-3 pt-2.5 border-t border-dashed border-gray-100 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold" /> {evt.time || evt.dateStr}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gold" /> {evt.location}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Informative footer for selected day */}
              <div className="mt-6 pt-4 border-t border-gold/10 text-center text-[10px] text-gray-400 font-medium">
                Participez activement à la vie de la maison chrétienne CEME.
              </div>

            </div>

          </div>

        </div>


        {/* ======================================================
            RUBRIQUE D'ANNONCES : PROGRAMMES SPÉCIAUX & AVENIR
        ====================================================== */}
        <div className="bg-[#1e1b18] text-white rounded-[40px] p-6 sm:p-12 relative overflow-hidden shadow-2xl">
          
          {/* Ambient cosmic styling background stars details */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-burgundy/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          {/* Section title header */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="w-6 h-6 text-gold animate-bounce" />
                <span className="text-xs text-gold uppercase tracking-widest font-bold">Rubrique d'Annonces Royales</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4.5xl font-bold leading-tight">
                Programmes Spéciaux & Avenir
              </h2>
              <p className="text-sm text-white/60 font-light max-w-2xl mt-1 leading-relaxed">
                Retrouvez ici la publication officielle de nos temps uniques de louange divine, de formation théologique et de retraites solennelles.
              </p>
            </div>

            {/* Filter Pills for Announcements */}
            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={() => setAnnouncementFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  announcementFilter === 'all' 
                    ? 'bg-gold text-soft-black border-gold' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                }`}
              >
                Tous
              </button>
              <button 
                onClick={() => setAnnouncementFilter('special')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  announcementFilter === 'special' 
                    ? 'bg-red-600 text-white border-red-600' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                }`}
              >
                Spéciaux
              </button>
              <button 
                onClick={() => setAnnouncementFilter('upcoming')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  announcementFilter === 'upcoming' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                }`}
              >
                Programmes Avenir
              </button>
              <button 
                onClick={() => setAnnouncementFilter('annonce')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  announcementFilter === 'annonce' 
                    ? 'bg-indigo-650 text-white border-indigo-650' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                }`}
              >
                Communauté
              </button>
            </div>
          </div>

          {/* Grid setup for Announcements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 mb-6">
            {filteredAnnouncements.map((ann, k) => (
              <motion.div
                key={ann.id}
                whileHover={{ y: -6 }}
                className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group cursor-pointer hover:border-gold/50 transition-colors"
                onClick={() => setActiveSpecialDetail(ann)}
              >
                <div>
                  {/* Photo representing the announcements */}
                  <div className="relative h-48 w-full bg-soft-black overflow-hidden">
                    <img 
                      src={ann.image} 
                      alt={ann.title} 
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded text-[9px] font-extrabold tracking-widest uppercase shadow-md ${ann.badgeColor}`}>
                        {ann.badge}
                      </span>
                    </div>

                    {ann.isPopular && (
                      <div className="absolute top-3 right-3 bg-gold/90 text-soft-black text-[9px] font-extrabold tracking-wider px-2.5 py-1 rounded shadow-md flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3 block" /> RECOMMANDÉ
                      </div>
                    )}
                  </div>

                  {/* Program Description */}
                  <div className="p-6">
                    <h4 className="font-serif text-xl font-bold text-white group-hover:text-gold transition-colors leading-snug">
                      {ann.title}
                    </h4>
                    {ann.preacher && (
                      <p className="text-gold/85 text-xs font-semibold mt-1.5 font-sans">
                        Orateur/Invité: {ann.preacher}
                      </p>
                    )}
                    <p className="text-white/60 text-xs font-light mt-4 leading-relaxed line-clamp-3">
                      {ann.desc}
                    </p>
                  </div>
                </div>

                {/* Card action triggers */}
                <div className="p-6 pt-0 border-t border-white/5 mt-3 flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1 text-gold">
                    <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-gold" /> {ann.dateStr.split('à')[0]}
                  </span>
                  <span className="text-white group-hover:underline flex items-center gap-1 group-hover:text-gold transition-colors">
                    S'inscrire / Ouvrir &rarr;
                  </span>
                </div>

              </motion.div>
            ))}
          </div>

          {/* Fallback when filter is empty */}
          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-[24px]">
              <Bell className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm font-light italic">
                Aucune annonce active trouvée pour ce critère d'affichage.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* ======================================================
          POPUP MODAL: DETAILED VIEW FOR SPECIAL PROGRAMS
      ====================================================== */}
      <AnimatePresence>
        {activeSpecialDetail && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setActiveSpecialDetail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-3xl max-w-xl w-full p-0 overflow-hidden border border-gold/30 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button top-right */}
              <button
                onClick={() => setActiveSpecialDetail(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-gold text-white hover:text-soft-black rounded-full p-2 transition-all cursor-pointer z-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-56 md:h-64 bg-soft-black w-full">
                <img 
                  src={activeSpecialDetail.image} 
                  alt={activeSpecialDetail.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent h-24" />
                
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold tracking-widest uppercase shadow-lg ${activeSpecialDetail.badgeColor}`}>
                    {activeSpecialDetail.badge}
                  </span>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <span className="text-[10px] text-burgundy font-bold uppercase tracking-widest">{activeSpecialDetail.type === 'special' ? "Programme Souverain d'Alliance" : "Grande Annonce Liturgique"}</span>
                <h3 className="font-serif text-2.5xl font-extrabold text-soft-black leading-tight mt-1 mb-4">
                  {activeSpecialDetail.title}
                </h3>

                <p className="text-gray-700 text-sm font-light leading-relaxed mb-6">
                  {activeSpecialDetail.desc}
                </p>

                {/* Metadata List details */}
                <div className="bg-[#f5f2ed] border border-gold/15 rounded-2xl p-4 space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs text-soft-black font-semibold">
                    <Clock className="w-4 h-4 text-burgundy shrink-0" />
                    <span><strong>Date & Heure :</strong> {activeSpecialDetail.dateStr}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-soft-black font-semibold">
                    <MapIcon className="w-4 h-4 text-burgundy shrink-0" />
                    <span><strong>Lieu Céleste :</strong> {activeSpecialDetail.location}</span>
                  </div>
                  {activeSpecialDetail.preacher && (
                    <div className="flex items-center gap-3 text-xs text-soft-black font-semibold">
                      <Users className="w-4 h-4 text-burgundy shrink-0" />
                      <span><strong>Orateur / Intervenants :</strong> {activeSpecialDetail.preacher}</span>
                    </div>
                  )}
                </div>


              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
