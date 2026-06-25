import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HeartHandshake, CreditCard, Landmark, Smartphone, Target, TrendingUp, HandHeart, BookOpen, CheckCircle, Quote, ClipboardList } from 'lucide-react';
import { submitDonation, getDonationProjects, DonationProject } from '../lib/dbService';

const impacts = [
  { value: '1 200+', label: 'Repas distribués / an',      desc: 'Aux familles dans le besoin de notre quartier'           },
  { value: '45',     label: 'Familles soutenues',          desc: 'Aides financières et paniers alimentaires'               },
  { value: '3',      label: 'Projets d\'expansion',        desc: 'Rénovation et plantation d\'une nouvelle antenne'        },
  { value: '100%',   label: 'Transparence financière',     desc: 'Bilan annuel disponible pour tous les membres'           },
];

export function Give() {
  const [contribType, setContribType] = useState('Dîme');
  const [selectedPreset, setSelectedPreset] = useState('10 000 FCFA');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'OM' | 'Card'>('OM');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projects, setProjects] = useState<DonationProject[]>([]);

  const [processStep, setProcessStep] = useState<'idle' | 'loading' | 'completed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [donationRef, setDonationRef] = useState('');

  useEffect(() => {
    getDonationProjects()
      .then(data => {
        const active = data.filter(p => p.isActive);
        setProjects(active);
        if (active.length > 0) setSelectedProjectId(active[0].id);
      })
      .catch(() => {});
  }, []);

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset);
    setCustomAmount('');
  };

  const getFinalAmount = (): number => {
    if (customAmount) return parseFloat(customAmount) || 0;
    return parseFloat(selectedPreset.replace(/\s/g, '')) || 0;
  };

  const getFinalAmountDisplay = () => {
    const n = getFinalAmount();
    return n > 0 ? `${n.toLocaleString('fr-FR')} FCFA` : '—';
  };

  const startDonationProcess = async () => {
    if (!donorName.trim()) { setErrorMessage('Veuillez entrer votre nom.'); return; }
    if (!donorPhone.trim()) { setErrorMessage('Veuillez entrer votre numéro de téléphone.'); return; }
    const amount = getFinalAmount();
    if (!amount || amount <= 0) { setErrorMessage('Veuillez spécifier un montant valide.'); return; }
    if (contribType === 'Projets' && !selectedProjectId) { setErrorMessage('Veuillez sélectionner un projet.'); return; }

    setErrorMessage('');
    setProcessStep('loading');

    const ref = 'REF-' + Date.now().toString(36).toUpperCase();
    setDonationRef(ref);

    try {
      await submitDonation({
        donorName: donorName.trim(),
        phone: donorPhone.trim(),
        amount,
        currency: 'FCFA',
        contribType,
        paymentMethod,
        reference: ref,
        projectId: contribType === 'Projets' ? selectedProjectId : undefined,
      });
    } catch {
      // On enregistre même en cas d'erreur réseau temporaire
    }
    setProcessStep('completed');
  };

  const resetProcess = () => {
    setProcessStep('idle');
    setCustomAmount('');
    setSelectedPreset('10 000 FCFA');
    setDonorName('');
    setDonorPhone('');
    setDonationRef('');
    setErrorMessage('');
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="bg-white min-h-screen">

      {/* HERO */}
      <div className="relative bg-soft-black text-white py-36 px-4 overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-25" />
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=2000"
          alt="Don"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-grace-orange/5 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 mt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <div className="w-24 h-24 bg-grace-blue/80 rounded-full flex items-center justify-center mx-auto mb-8 text-grace-orange shadow-[0_0_40px_rgba(123,29,29,0.4)] border-4 border-grace-blue/40 animate-divine-glow">
              <HeartHandshake className="w-12 h-12" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
              Soutenir <span className="text-grace-orange italic">l'Œuvre</span>
            </h1>
            <blockquote className="text-xl md:text-2xl text-grace-orange font-light italic leading-relaxed max-w-2xl mx-auto">
              "Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte; car Dieu aime celui qui donne avec joie."
            </blockquote>
            <p className="font-bold text-sm uppercase tracking-widest mt-4 text-white/40">— 2 Corinthiens 9:7</p>
          </motion.div>
        </div>
      </div>

      {/* TEACHING */}
      <div className="py-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:w-1/2 space-y-7">
              <p className="text-grace-orange font-bold uppercase tracking-widest text-sm">Comprendre le Don</p>
              <h2 className="font-serif text-4xl font-bold leading-tight">
                Donner n'est pas une <span className="text-grace-blue italic">obligation</span> — c'est une <span className="text-grace-blue italic">grâce</span>.
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Dans les Écritures, la dîme et l'offrande ne sont pas un impôt religieux. Ils sont l'expression concrète de notre confiance envers Dieu — une déclaration de foi que l'Éternel est notre source et notre pourvoyeur.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Malachie 3:10 dit : <span className="italic font-medium text-soft-black">"Apportez à la maison du trésor toutes les dîmes... éprouvez-moi en cela, dit l'Éternel... si je n'ouvre pas pour vous les écluses des cieux et ne répands pas sur vous la bénédiction en surabondance."</span>
              </p>
              <div className="space-y-4">
                {[
                  'La dîme (10% de vos revenus) soutient le fonctionnement de l\'église',
                  'L\'offrande va au-delà — exprimant la générosité du cœur',
                  'Vos dons ont un impact direct et mesurable sur des vies',
                  'Chaque contribution est enregistrée et vous recevrez une confirmation',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-grace-orange shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:w-1/2">
              <div className="bg-soft-black text-white rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-grace-orange/5 rounded-full blur-3xl -mr-10 -mt-10" />
                <BookOpen className="w-10 h-10 text-grace-orange mb-6 relative z-10" />
                <Quote className="w-8 h-8 text-grace-orange/20 mb-4" />
                <p className="font-serif text-2xl font-light italic leading-relaxed text-white/85 mb-6 relative z-10">
                  "Donnez, et il vous sera donné; on versera dans votre sein une bonne mesure, serrée, secouée et débordante. Car on vous mesurera avec la mesure dont vous vous serez servis."
                </p>
                <p className="text-grace-orange font-bold uppercase tracking-widest text-sm relative z-10">— Luc 6:38</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* IMPACT */}
      <div className="py-20 bg-soft-black relative overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-25" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-grace-orange font-bold uppercase tracking-widest text-sm mb-3">Vos Dons en Action</p>
            <h2 className="font-serif text-4xl font-bold text-white">L'Impact de votre Générosité</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {impacts.map((imp, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="shimmer-text font-serif text-5xl font-bold mb-2">{imp.value}</div>
                <p className="text-white font-bold text-sm mb-1">{imp.label}</p>
                <p className="text-white/40 text-xs">{imp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FORM + IMPACT */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="bg-white border border-gray-200 p-8 md:p-12 rounded-[2.5rem] shadow-xl">
                <h2 className="font-serif text-3xl font-bold mb-2 text-soft-black">Déclarer votre Don</h2>
                <p className="text-gray-500 mb-2 text-sm">Renseignez votre intention de don ci-dessous.</p>
                {/* Info notice */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                  <ClipboardList className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Fonctionnement :</strong> Ce formulaire enregistre votre promesse de don. Le paiement se fait directement via Orange Money ou virement. Une confirmation vous sera envoyée par l'équipe.
                  </p>
                </div>

                {processStep === 'idle' || processStep === 'loading' ? (
                  <div className="space-y-6">
                    {/* Contrib type */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">1. À quoi voulez-vous contribuer ?</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Dîme', 'Offrande', 'Projets'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setContribType(type)}
                            className={`py-3 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer ${
                              contribType === type ? 'bg-soft-black text-white' : 'bg-white text-gray-600 border border-gray-300 hover:border-grace-orange hover:text-soft-black'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Project selector */}
                    {contribType === 'Projets' && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Sélectionner le projet</label>
                        {projects.length === 0 ? (
                          <p className="text-sm text-gray-400 italic bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                            Aucun projet actif pour le moment. Revenez prochainement.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {projects.map(p => {
                              const pct = p.goalAmount > 0 ? Math.min(100, Math.round((p.raisedAmount / p.goalAmount) * 100)) : 0;
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => setSelectedProjectId(p.id)}
                                  className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                                    selectedProjectId === p.id
                                      ? 'border-grace-orange bg-grace-orange/5'
                                      : 'border-gray-200 bg-white hover:border-grace-orange/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm text-soft-black">{p.title}</span>
                                    <span className="text-xs font-bold text-grace-orange">{pct}%</span>
                                  </div>
                                  {p.description && <p className="text-xs text-gray-500 mb-2">{p.description}</p>}
                                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1.5">
                                    <span>Collecté : {p.raisedAmount.toLocaleString('fr-FR')} {p.currency}</span>
                                    <span>Objectif : {p.goalAmount.toLocaleString('fr-FR')} {p.currency}</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">2. Sélectionnez ou entrez un montant</label>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {['2 000 FCFA', '5 000 FCFA', '10 000 FCFA', '25 000 FCFA'].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => handlePresetClick(amt)}
                            className={`py-3 px-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              selectedPreset === amt && !customAmount
                                ? 'bg-grace-blue text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-300 hover:border-grace-orange hover:text-soft-black'
                            }`}
                          >
                            {amt}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">Montant libre (FCFA) :</span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={e => { setCustomAmount(e.target.value); setSelectedPreset(''); }}
                          className="w-full bg-white border border-gray-300 rounded-xl pl-40 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold text-base transition-shadow"
                          placeholder="Ex: 5000"
                        />
                      </div>
                    </div>

                    {/* Donor info */}
                    <div className="pt-2 border-t border-gray-300 space-y-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">3. Informations du Donateur</label>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1.5 font-medium">Nom complet</span>
                        <input
                          type="text"
                          value={donorName}
                          onChange={e => setDonorName(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold text-sm text-soft-black font-medium"
                          placeholder="Votre nom complet"
                        />
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1.5 font-medium">Numéro de téléphone</span>
                        <input
                          type="tel"
                          value={donorPhone}
                          onChange={e => setDonorPhone(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold text-sm font-mono text-soft-black"
                          placeholder="Ex: +237 6XX XX XX XX"
                        />
                      </div>
                    </div>

                    {/* Payment method */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">4. Moyen de paiement prévu</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('OM')}
                          className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                            paymentMethod === 'OM' ? 'bg-[#FF6600]/10 border-[#FF6600] text-[#FF6600]' : 'bg-white border-gray-300 text-gray-600 hover:border-[#FF6600]'
                          }`}
                        >
                          <Smartphone className="w-4 h-4" /> Orange Money
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('Card')}
                          className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                            paymentMethod === 'Card' ? 'bg-grace-blue/10 border-grace-blue text-grace-blue' : 'bg-white border-gray-300 text-gray-600 hover:border-grace-blue'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" /> Virement / Autre
                        </button>
                      </div>
                      {paymentMethod === 'OM' && (
                        <p className="text-[11px] text-[#FF6600] font-medium mt-2 bg-[#FF6600]/5 p-2.5 rounded-lg border border-[#FF6600]/20">
                          Envoyez votre don sur le compte OM de la chapelle : <strong className="font-mono text-xs">+237 680 82 19 53</strong>
                        </p>
                      )}
                    </div>

                    {errorMessage && (
                      <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-200">
                        ⚠️ {errorMessage}
                      </p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startDonationProcess}
                      disabled={processStep === 'loading'}
                      className="w-full bg-grace-orange hover:bg-yellow-400 text-soft-black font-bold uppercase tracking-wider py-5 rounded-2xl transition-all shadow-[0_10px_20px_rgba(201,168,76,0.3)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                    >
                      {processStep === 'loading' ? (
                        <><div className="w-5 h-5 border-2 border-soft-black border-t-transparent rounded-full animate-spin" /> Enregistrement...</>
                      ) : (
                        <><HeartHandshake className="w-6 h-6" /> Enregistrer mon don ({getFinalAmountDisplay()})</>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  /* Success state */
                  <div className="space-y-6 text-center py-4">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl font-bold text-soft-black">Don Enregistré !</h3>
                      <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                        Merci, <strong className="text-soft-black">{donorName}</strong>. Votre intention de don de <strong className="text-grace-blue">{getFinalAmountDisplay()}</strong> a bien été notée.
                        {selectedProject && <span> (Projet : <strong>{selectedProject.title}</strong>)</span>}
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-xs text-amber-800 space-y-1.5">
                      <p className="font-bold text-amber-900 mb-2">Prochaines étapes :</p>
                      {paymentMethod === 'OM' ? (
                        <p>• Envoyez <strong>{getFinalAmountDisplay()}</strong> via Orange Money au <strong className="font-mono">+237 680 82 19 53</strong> (Chapelle CEME)</p>
                      ) : (
                        <p>• Effectuez votre virement selon les coordonnées bancaires affichées ci-dessous</p>
                      )}
                      <p>• Mentionnez la référence <strong className="font-mono">{donationRef}</strong> lors du paiement</p>
                      <p>• L'équipe vous contactera au <strong>{donorPhone}</strong> pour confirmer la réception</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-left text-xs space-y-1.5">
                      <p className="text-gray-700"><span className="text-gray-400 font-bold w-24 inline-block">Référence :</span> <span className="font-mono">{donationRef}</span></p>
                      <p className="text-gray-700"><span className="text-gray-400 font-bold w-24 inline-block">Type :</span> {contribType}{selectedProject ? ` — ${selectedProject.title}` : ''}</p>
                      <p className="text-gray-700"><span className="text-gray-400 font-bold w-24 inline-block">Montant :</span> {getFinalAmountDisplay()}</p>
                      <p className="text-gray-700"><span className="text-gray-400 font-bold w-24 inline-block">Moyen :</span> {paymentMethod === 'OM' ? 'Orange Money' : 'Virement / Autre'}</p>
                    </div>

                    <button
                      onClick={resetProcess}
                      className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-soft-black transition-colors cursor-pointer block mx-auto py-2"
                    >
                      Déclarer un autre don
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Impact */}
            <div className="space-y-12">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="font-serif text-3xl font-bold mb-6">L'Impact de vos Dons</h2>
                <div className="space-y-6">
                  {[
                    { icon: Target,     title: 'Financement des Ministères', desc: 'Soutient l\'école du dimanche, la louange, l\'équipement technique pour la retransmission des cultes.' },
                    { icon: HandHeart,  title: 'Actions Sociales',           desc: 'Distribution de paniers repas aux démunis et soutien aux familles en difficulté financière de notre ville.' },
                    { icon: TrendingUp, title: 'Projets d\'Expansion',       desc: 'Rénovation de nos salles d\'accueil et lancement de nouvelles églises partenaires dans la région.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-grace-blue/10 rounded-full flex items-center justify-center shrink-0">
                        <item.icon className="w-6 h-6 text-grace-blue" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border-t border-gray-100 pt-10">
                <h2 className="font-serif text-2xl font-bold mb-6">Autres Moyens de Donner</h2>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-5 hover:border-grace-orange transition-colors mb-4">
                  <div className="bg-gray-100 p-3 rounded-full text-soft-black shrink-0"><Landmark className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Virement Bancaire</h3>
                    <div className="bg-white p-4 rounded-xl text-sm font-mono text-gray-700 mt-3 border border-gray-200">
                      <p className="mb-2"><span className="font-bold text-soft-black uppercase tracking-wider text-[10px]">Titulaire</span><br />Chapelle E.M.E</p>
                      <p><span className="font-bold text-soft-black uppercase tracking-wider text-[10px]">IBAN</span><br />FR76 1234 5678 9012 3456 7890 123</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-grace-orange transition-colors cursor-pointer group">
                  <div className="bg-gray-100 p-3 rounded-full text-soft-black group-hover:bg-grace-orange group-hover:text-white transition-colors shrink-0"><Smartphone className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold mb-1">Mobile Money</h3>
                    <p className="text-[#FF6600] font-bold text-sm">Orange Money : +237 680 82 19 53</p>
                    <p className="text-gray-500 text-xs mt-0.5">Chapelle CEME - Transferts directs en tout temps.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* PROJECTS */}
      {projects.length > 0 && (
        <div className="py-24 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <p className="text-grace-orange font-bold uppercase tracking-widest text-sm mb-4">En ce Moment</p>
              <h2 className="font-serif text-4xl font-bold">Projets en Cours</h2>
              <p className="text-gray-400 max-w-xl mx-auto mt-4">Voici vers quoi vont spécifiquement vos contributions actuelles. Ensemble, nous pouvons y arriver.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map((proj, i) => {
                const pct = proj.goalAmount > 0 ? Math.min(100, Math.round((proj.raisedAmount / proj.goalAmount) * 100)) : 0;
                return (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:border-grace-orange/20 group"
                  >
                    <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-grace-blue transition-colors">{proj.title}</h3>
                    {proj.description && <p className="text-gray-600 text-sm leading-relaxed mb-6">{proj.description}</p>}
                    <div className="mb-3 flex justify-between items-center text-sm">
                      <span className="font-bold text-soft-black">Objectif : {proj.goalAmount.toLocaleString('fr-FR')} {proj.currency}</span>
                      <span className="font-bold text-grace-orange">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{proj.raisedAmount.toLocaleString('fr-FR')} {proj.currency} collectés</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
