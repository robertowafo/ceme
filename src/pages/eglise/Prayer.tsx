import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, ShieldCheck, Clock, Users, FileText, BookOpen, Quote, Phone, Loader2 } from 'lucide-react';
import { submitPrayerRequest, getPublicPrayerRequests, PrayerRequestPublic } from '../../lib/dbService';

const promises = [
  { ref: 'Matthieu 7:7',    text: '"Demandez, et l\'on vous donnera; cherchez, et vous trouverez; frappez, et l\'on vous ouvrira."',     bg: 'bg-burgundy' },
  { ref: 'Philippiens 4:6', text: '"Ne vous inquiétez de rien, mais faites connaître vos besoins à Dieu par des prières et supplications."', bg: 'bg-soft-black' },
  { ref: 'Jérémie 33:3',    text: '"Invoque-moi, et je te répondrai; je t\'annoncerai de grandes choses que tu ne connais pas."',          bg: 'bg-[#2d5a4a]' },
  { ref: '1 Jean 5:14',     text: '"Si nous lui demandons quelque chose selon sa volonté, il nous écoute."',                               bg: 'bg-[#3a2a1a]' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return minutes <= 1 ? 'À l\'instant' : `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function Prayer() {
  const [activeTab, setActiveTab] = useState<'prayer' | 'testimony'>('prayer');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [allPublic, setAllPublic] = useState<PrayerRequestPublic[]>([]);
  const [isLoadingWall, setIsLoadingWall] = useState(true);

  const wallPrayers = allPublic.filter(r => r.type === 'prayer');
  const testimonies = allPublic.filter(r => r.type === 'testimony');

  useEffect(() => {
    getPublicPrayerRequests()
      .then(data => setAllPublic(data))
      .catch(console.error)
      .finally(() => setIsLoadingWall(false));
  }, []);

  const resetForm = () => {
    setName(''); setPhone(''); setMessage(''); setIsConfidential(false);
  };

  const switchTab = (tab: 'prayer' | 'testimony') => {
    setActiveTab(tab);
    resetForm();
    setFormStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    setFormStatus('idle');
    try {
      const isPublic = activeTab === 'testimony' ? true : !isConfidential;
      await submitPrayerRequest({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim(),
        type: activeTab,
        isPublic,
      });
      setFormStatus('success');
      resetForm();
      if (isPublic) {
        const updated = await getPublicPrayerRequests();
        setAllPublic(updated);
      }
    } catch {
      setFormStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#f5f2ed] min-h-screen">

      {/* ====================================================== HERO */}
      <div className="relative bg-soft-black text-white py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]" />
        <img
          src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=2000"
          alt="Prière"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="max-w-4xl mx-auto text-center relative z-10 mt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-8 animate-divine-glow">
              <Heart className="w-10 h-10 text-gold" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
              La Prière,<br />
              <span className="text-gold italic">Notre Puissance</span>
            </h1>
            <div className="text-xl text-white/70 font-light italic max-w-2xl mx-auto leading-relaxed border-l-4 border-gold pl-6 text-left">
              "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces."
              <span className="font-bold text-sm not-italic block mt-3 text-gold uppercase tracking-widest">— Philippiens 4:6</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ====================================================== WHY PRAYER MATTERS */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Fondement</p>
            <h2 className="font-serif text-4xl font-bold mb-4">Pourquoi la Prière Est Essentielle</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">La prière n'est pas une option pour le croyant — c'est son oxygène, son arme et sa communion avec Dieu.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Confidentialité Totale',  text: 'Notre équipe pastorale traite vos sujets avec la plus grande discrétion. Vos combats sont les nôtres. Rien n\'est partagé sans votre accord.', featured: false },
              { icon: Users,       title: 'Une Équipe Dédiée',       text: 'Des intercesseurs formés se relaient chaque semaine pour prier spécifiquement pour les requêtes soumises à l\'église. Vous n\'êtes pas seul.', featured: true  },
              { icon: Clock,       title: 'Dieu Répond',             text: 'Nous croyons fermement que Dieu entend et répond à nos prières. Les témoignages de réponses divines nous encouragent continuellement.',            featured: false },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-3xl text-center relative ${item.featured ? 'bg-soft-black text-white shadow-2xl border border-gold/20' : 'bg-[#f5f2ed] border border-transparent hover:border-gold/20 transition-colors'}`}>
                {item.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-soft-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">Intercession</span>
                )}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${item.featured ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                  <item.icon className={`w-8 h-8 ${item.featured ? 'text-gold' : 'text-burgundy'}`} />
                </div>
                <h3 className={`font-serif text-xl font-bold mb-3 ${item.featured ? 'text-gold' : 'text-soft-black'}`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed ${item.featured ? 'text-white/65' : 'text-gray-600'}`}>{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================== PROMISES */}
      <div className="py-24 bg-soft-black relative overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-25" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold/4 rounded-full blur-[80px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">La Parole de Dieu</p>
            <h2 className="font-serif text-4xl font-bold text-white">Les Promesses de Prière</h2>
            <p className="text-white/45 max-w-xl mx-auto mt-4">Dieu Lui-même nous a donné Sa parole sur la prière. Appuyons-nous dessus avec foi.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {promises.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`${p.bg} rounded-3xl p-7 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-6 -mt-6" />
                <Quote className="w-7 h-7 text-white/20 mb-4" />
                <p className="text-white/85 text-sm leading-relaxed italic mb-6">{p.text}</p>
                <p className="text-gold font-bold text-xs uppercase tracking-widest border-t border-white/10 pt-4">{p.ref}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================== PRAYER SCHEDULE */}
      <div className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">S'Unir à Nous</p>
            <h2 className="font-serif text-4xl font-bold">Horaires de Prière</h2>
            <p className="text-gray-400 max-w-xl mx-auto mt-4">L'Éternel aime la prière collective. Rejoignez-nous pour ces temps sacrés.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { day: 'Vendredi',  time: '19h00 – 21h00', title: 'Nuit de Prière',          desc: 'Intercession fervente, louange et combat spirituel collectif.',       tag: 'Hebdomadaire', color: 'border-l-burgundy' },
              { day: 'Dimanche',  time: '08h30 – 10h00', title: 'Prière Avant le Culte',   desc: 'Préparer l\'atmosphère et ouvrir la réunion dans la présence de Dieu.', tag: 'Hebdomadaire', color: 'border-l-gold'     },
              { day: 'Mercredi',  time: '06h00 – 07h00', title: 'Prière du Matin (Zoom)',  desc: 'Commencer la journée dans la présence de Dieu avec d\'autres croyants.',  tag: 'En ligne',     color: 'border-l-soft-black' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`bg-[#f5f2ed] p-7 rounded-3xl border-l-4 hover:shadow-md transition-shadow ${s.color}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-bold text-soft-black text-lg">{s.day}</span>
                  <span className="bg-white text-xs font-bold uppercase tracking-wider text-gray-400 px-2 py-1 rounded-full border border-gray-200">{s.tag}</span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">{s.title}</h3>
                <div className="flex items-center gap-2 text-burgundy mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-bold">{s.time}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================== FORM + PRAYER WALL */}
      <div className="py-20 bg-[#f5f2ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

            {/* ── Formulaire avec onglets ── */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold to-burgundy" />

                {/* Onglets */}
                <div className="flex border-b border-gray-100 mt-2">
                  <button
                    onClick={() => switchTab('prayer')}
                    className={`flex-1 py-5 text-sm font-bold uppercase tracking-widest transition-colors relative ${
                      activeTab === 'prayer'
                        ? 'text-soft-black'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Prières
                    {activeTab === 'prayer' && (
                      <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-soft-black" />
                    )}
                  </button>
                  <button
                    onClick={() => switchTab('testimony')}
                    className={`flex-1 py-5 text-sm font-bold uppercase tracking-widest transition-colors relative ${
                      activeTab === 'testimony'
                        ? 'text-gold'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Témoignages
                    {activeTab === 'testimony' && (
                      <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-gold" />
                    )}
                  </button>
                </div>

                <div className="p-8 lg:p-10">
                  <AnimatePresence mode="wait">
                    {activeTab === 'prayer' ? (
                      <motion.div
                        key="prayer-form"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BookOpen className="w-8 h-8 text-soft-black mb-4" />
                        <h3 className="font-serif text-3xl font-bold mb-2">Soumettre une Prière</h3>
                        <p className="text-gray-400 mb-8 text-sm">Confiez votre fardeau à l'équipe d'intercession. Vous n'êtes pas seul.</p>

                        {formStatus === 'success' && (
                          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold text-center">
                            🙏 Votre requête a été envoyée. L'équipe d'intercession priera pour vous !
                          </div>
                        )}
                        {formStatus === 'error' && (
                          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold text-center">
                            Une erreur est survenue. Veuillez réessayer.
                          </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                                Nom / Prénom <span className="text-gray-300 font-normal">(Optionnel)</span>
                              </label>
                              <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Jean DUPONT"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-soft-black focus:bg-white w-full transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Téléphone <span className="text-gray-300 font-normal">(Pour suivi)</span></span>
                              </label>
                              <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="Ex: +237 6XX XXX XXX"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-soft-black focus:bg-white w-full transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Votre Requête</label>
                            <textarea
                              rows={5}
                              required
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              placeholder="Décrivez votre situation, votre besoin de prière..."
                              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-soft-black focus:bg-white w-full resize-none transition-all"
                            />
                          </div>

                          <div className="bg-[#f5f2ed] p-4 rounded-xl flex items-start gap-3 border border-gray-200">
                            <input
                              type="checkbox"
                              id="confidential"
                              checked={isConfidential}
                              onChange={e => setIsConfidential(e.target.checked)}
                              className="accent-burgundy w-5 h-5 shrink-0 mt-0.5"
                            />
                            <label htmlFor="confidential" className="text-sm text-gray-700 cursor-pointer">
                              <strong className="block mb-1">Garder cette requête strictement confidentielle</strong>
                              Si coché, votre message sera lu uniquement par les pasteurs.
                            </label>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSending}
                            className="bg-soft-black text-white hover:bg-gold hover:text-soft-black w-full py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {isSending ? 'Envoi en cours...' : 'Envoyer au Seigneur'}
                          </motion.button>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="testimony-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Heart className="w-8 h-8 text-gold mb-4 fill-gold/20" />
                        <h3 className="font-serif text-3xl font-bold mb-2">Partager un Témoignage</h3>
                        <p className="text-gray-400 mb-8 text-sm">Dieu vous a exaucé ? Partagez votre victoire pour encourager vos frères et sœurs.</p>

                        {formStatus === 'success' && (
                          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-semibold text-center">
                            🙌 Votre témoignage a été partagé. Gloire à Dieu !
                          </div>
                        )}
                        {formStatus === 'error' && (
                          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold text-center">
                            Une erreur est survenue. Veuillez réessayer.
                          </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                                Nom / Prénom <span className="text-gray-300 font-normal">(Optionnel)</span>
                              </label>
                              <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Jean DUPONT"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold focus:bg-white w-full transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Téléphone <span className="text-gray-300 font-normal">(Optionnel)</span></span>
                              </label>
                              <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="Ex: +237 6XX XXX XXX"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold focus:bg-white w-full transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Votre Témoignage</label>
                            <textarea
                              rows={6}
                              required
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              placeholder="Racontez comment Dieu a répondu à votre prière, votre guérison, votre délivrance..."
                              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold focus:bg-white w-full resize-none transition-all"
                            />
                          </div>

                          <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3 border border-amber-100">
                            <Heart className="w-5 h-5 text-gold shrink-0 mt-0.5 fill-gold/30" />
                            <p className="text-sm text-amber-800">
                              Votre témoignage sera affiché publiquement dans la section <strong>"Dieu Répond"</strong> pour édifier la communauté.
                            </p>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSending}
                            className="bg-gold text-soft-black hover:bg-amber-500 w-full py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
                            {isSending ? 'Envoi en cours...' : 'Partager mon Témoignage'}
                          </motion.button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ── Mur d'Intercession (prières uniquement) ── */}
            <div className="lg:w-1/2 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-3xl font-bold flex items-center gap-3">
                  <FileText className="w-8 h-8 text-gold" />
                  Mur d'Intercession
                </h2>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-burgundy shadow-sm border border-gray-100">
                  {wallPrayers.length} Requête{wallPrayers.length !== 1 ? 's' : ''} Publique{wallPrayers.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex-1 space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {isLoadingWall ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    <p className="text-sm">Chargement des requêtes...</p>
                  </div>
                ) : wallPrayers.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                    <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold">Aucune requête publique pour le moment.</p>
                    <p className="text-xs mt-1 text-gray-300">Soyez le premier à soumettre votre prière.</p>
                  </div>
                ) : (
                  wallPrayers.map((req, i) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
                    >
                      <div className="absolute top-6 right-6">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200">
                          <Heart className="w-3.5 h-3.5" /> Intercession
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-serif font-bold text-xl">
                          {(req.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-soft-black text-sm">{req.name || 'Anonyme'}</h4>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">{timeAgo(req.submittedAt)}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">{req.message}</p>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="mt-6 text-center border-t border-gray-200 pt-6">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Les requêtes confidentielles sont visibles uniquement par les pasteurs
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ====================================================== ANSWERED PRAYERS (témoignages dynamiques) */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">La Prière Exaucée</p>
            <h2 className="font-serif text-4xl font-bold">Dieu Répond</h2>
            <p className="text-gray-400 max-w-xl mx-auto mt-4">Des prières simples, une foi sincère — et l'Éternel qui répond avec abondance.</p>
          </motion.div>

          {isLoadingWall ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : testimonies.length === 0 ? (
            <div className="py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl max-w-md mx-auto">
              <Quote className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">Aucun témoignage partagé pour le moment.</p>
              <p className="text-xs mt-1 text-gray-300">Soyez le premier à témoigner de la bonté de Dieu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonies.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#f5f2ed] rounded-3xl p-8 border border-transparent hover:border-gold/20 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-block bg-gold/10 text-gold text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gold/20">
                      Témoignage
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">{timeAgo(t.submittedAt)}</span>
                  </div>
                  <Quote className="w-7 h-7 text-gold/30 mb-4" />
                  <p className="text-gray-700 leading-relaxed italic text-sm mb-6">"{t.message}"</p>
                  <p className="font-bold text-soft-black text-sm border-t border-gray-200 pt-4">
                    {t.name || 'Anonyme'}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
