import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Car, Bus, Heart, Star, Users, BookOpen, Smile, Coffee, ChevronRight, CheckCircle } from 'lucide-react';
import { SEO } from '../../components/SEO';

const steps = [
  { icon: MapPin,   title: "Vous Arrivez",            desc: "Un parking gratuit vous attend, ainsi qu'une équipe d'accueil chaleureuse qui vous guidera vers l'entrée. Pas de code vestimentaire, venez comme vous êtes." },
  { icon: Smile,    title: "Vous Êtes Accueillis",    desc: "Notre équipe d'accueil vous remettra un livret de bienvenue. Les enfants seront orientés vers l'École du Dimanche pendant que vous profitez du culte." },
  { icon: Star,     title: "Le Culte Commence",       desc: "30 minutes de louange fervente et authentique, puis un message biblique profond mais pratique d'environ 40 minutes. Vous n'avez pas à lever la main ou à venir devant." },
  { icon: Coffee,   title: "Un Café Ensemble",        desc: "Après le culte, rejoignez-nous pour un moment de convivialité autour d'un café. Notre équipe pastorale est disponible pour toute question ou conversation." },
];

const groups = [
  { icon: Users,    title: 'Cellules de Maison',      desc: 'Chaque jeudi soir, petits groupes dans différents quartiers pour partager la Parole, prier et vivre la communion fraternelle.',    tag: 'Jeudi 19h30'  },
  { icon: Heart,    title: 'Groupe des Femmes',       desc: 'Rencontres mensuelles pour la communion, le soutien mutuel et des enseignements sur la vie de foi au féminin.',                       tag: '1er Samedi'    },
  { icon: Star,     title: 'Impact Jeunesse',         desc: 'Pour les 15-25 ans. Rencontres hebdomadaires, camps et projets missionnaires pour une génération en feu.',                           tag: 'Samedi 15h00'  },
  { icon: BookOpen, title: 'École Biblique',          desc: 'Formation doctrinale pour tout croyant désirant approfondir sa connaissance des Écritures. Cours du soir accessibles à tous.',       tag: 'Mardi 18h30'  },
];

const faqs = [
  {
    q: 'Comment dois-je m\'habiller ?',
    a: 'Venez comme vous êtes. Il n\'y a pas de code vestimentaire. Certains viennent en costume, d\'autres en jeans et baskets. L\'important est que vous soyez à l\'aise pour adorer le Seigneur.',
  },
  {
    q: 'Y a-t-il un programme pour mes enfants ?',
    a: 'Absolument. L\'École du Dimanche accueille les enfants de 3 à 12 ans dans des locaux sécurisés avec des moniteurs qualifiés. Pour les bébés (0-3 ans), une nurserie équipée est à votre disposition avec retransmission du culte.',
  },
  {
    q: 'Serai-je pointé(e) du doigt publiquement ?',
    a: 'Non. Nous ne vous demanderons pas de vous lever ou de venir devant l\'assemblée. À la fin du culte, l\'équipe d\'accueil se tient à votre disposition autour d\'un café pour toute conversation.',
  },
  {
    q: 'Et si je ne suis pas croyant(e) ?',
    a: 'Vous êtes le bienvenu tel que vous êtes. Nos cultes sont conçus pour être accessibles à tous. Vous n\'avez aucune obligation — venez simplement découvrir et poser vos questions.',
  },
  {
    q: 'Comment devenir membre ?',
    a: 'Après quelques visites, vous pouvez rejoindre notre parcours d\'intégration "Les Fondations" — 4 sessions pour découvrir l\'église, notre vision, et comment vous y impliquer.',
  },
];

export function JoinUs() {
  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Nous rejoindre — Chapelle de l'Éternel Mon Étendard"
        description="Rejoignez la Chapelle de l'Éternel Mon Étendard à Yaoundé (Emombo Auberge). Horaires, accès et accueil — vous êtes les bienvenus."
        path="/eglise/nous-rejoindre"
      />

      {/* ======================================================
          HERO
      ====================================================== */}
      <div className="relative bg-soft-black text-white py-36 px-4 overflow-hidden">
        <div className="absolute inset-0 cross-pattern opacity-25" />
        <img
          src="/uploads/externe.JPG"
          alt="Bienvenue"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10 mt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-8 animate-divine-glow">
              <MapPin className="w-10 h-10 text-gold" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Votre Place <span className="text-gold italic">Vous Attend</span>
            </h1>
            <p className="text-xl text-white/65 font-light max-w-2xl mx-auto leading-relaxed">
              Peu importe d'où vous venez, votre passé ou vos blessures — vous avez une place dans notre famille. Nous avons hâte de vous accueillir.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ======================================================
          WHAT TO EXPECT
      ====================================================== */}
      <div className="py-24 bg-[#f5f2ed] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Première Visite</p>
            <h2 className="font-serif text-4xl font-bold">Ce Qui Vous Attend</h2>
            <p className="text-gray-400 max-w-xl mx-auto mt-4">Votre première visite est importante pour nous. Voici ce que vous vivrez pas à pas.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gold/20 transition-all group relative"
              >
                <div className="absolute top-6 right-6 text-gray-200 font-serif text-5xl font-bold leading-none group-hover:text-gold/20 transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold transition-colors">
                  <step.icon className="w-7 h-7 text-gold group-hover:text-soft-black transition-colors" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          MAP + CONTACT
      ====================================================== */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f5f2ed] rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col lg:flex-row">
            {/* Info Side */}
            <div className="lg:w-1/3 bg-soft-black text-white p-10 md:p-12 flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -mr-20 -mt-20" />
 
               <div className="relative z-10">
                 <h2 className="font-serif text-3xl font-bold mb-10 text-gold border-b border-white/20 pb-4">Coordonnées</h2>
                 <div className="space-y-8">
                   {[
                     { icon: MapPin, title: 'Adresse Principale',    content: 'EMOMBO AUBERGE,\nBP 6065 Yaoundé,\nCameroun' },
                     { icon: Clock,  title: 'Rassemblements',        content: 'Dimanche : 09h00 – 12h30\nMercredi : 18h00 – 20h00\nJeudi – Samedi : Star University' },
                     { icon: Phone,  title: 'Contact',               content: '+237 680 82 19 53\nDisponibilité Pastorale' },
                     { icon: Mail,   title: 'Email',                 content: 'contact@chapelle-eternel.org' },
                   ].map((item, i) => (
                     <div key={i} className="flex items-start gap-4">
                       <div className="bg-white/10 p-3 rounded-full shrink-0"><item.icon className="w-5 h-5 text-gold" /></div>
                       <div>
                         <h4 className="font-bold mb-1 text-lg">{item.title}</h4>
                         <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{item.content}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
 
               <div className="relative z-10 mt-12 pt-8 border-t border-white/20 flex gap-4">
                 {[
                   { s: 'Facebook', url: 'https://web.facebook.com/DrAlphonseEssomba?rdid=1dN6E5BKmUndUYJD&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F194eJM2s6G%2F%3F_rdc%3D1%26_rdr#' },
                   { s: 'YouTube', url: 'https://www.youtube.com/@gracetelevision-hc4tv' },
                   { s: 'Instagram', url: 'https://www.instagram.com/chapelledeleternelmonetendard?igsh=MTdpem1nMm9tMW4wZg%3D%3D&utm_source=qr' },
                 ].map(({ s, url }) => (
                   <a key={s} href={url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold text-sm font-bold uppercase tracking-wider transition-colors">{s}</a>
                 ))}
               </div>
             </div>
 
             {/* Map */}
             <div className="lg:w-2/3 min-h-[500px] bg-gray-200 relative">
               <iframe
                 src="https://maps.google.com/maps?q=Emombo%20Auberge,%20Yaound%C3%A9&t=&z=15&ie=UTF8&iwloc=&output=embed"
                 width="100%"
                 height="100%"
                 style={{ border: 0, minHeight: '100%' }}
                 allowFullScreen
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
                 title="Localisation Google Maps"
                 className="inset-0 absolute"
               />
               <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-xl max-w-xs relative z-20">
                 <p className="font-bold text-soft-black text-sm mb-1">Chapelle de l'Éternel (CEME)</p>
                 <p className="text-xs text-gray-500 mb-2">Situé à Emombo Auberge, Yaoundé.</p>
                 <a 
                   href="https://maps.app.goo.gl/6hDy76CHNdDK4JAH9" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 text-xs text-burgundy hover:text-red-800 font-bold uppercase tracking-wider cursor-pointer"
                 >
                   Ouvrir sur Google Maps
                   <ChevronRight className="w-3.5 h-3.5" />
                 </a>
               </div>
             </div>
           </div>
         </div>
       </div>
 
       {/* ======================================================
           TRANSPORTATION
       ====================================================== */}
       <div className="py-16 bg-[#f5f2ed] border-y border-gray-200">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
             >
               <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3">
                 <Car className="w-6 h-6 text-burgundy" /> En Voiture
               </h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-4">
                 L'église est idéalement située au cœur du quartier Emombo, non loin de l'Auberge. Suivez les indications pour l'Auberge d'Emombo.
               </p>
               <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm border border-green-100">
                 <strong className="block mb-1">Espace de Stationnement</strong>
                 Un parking surveillé est aménagé dans l'enceinte et sur l'esplanade du temple pour assurer la tranquillité de toutes les familles.
               </div>
             </motion.div>
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
             >
               <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3">
                 <Bus className="w-6 h-6 text-burgundy" /> Transports en Commun & Taxis
               </h3>
               <ul className="space-y-4">
                 <li className="flex gap-4 items-start">
                   <span className="bg-yellow-500 text-black font-bold px-2 py-1 rounded text-xs shrink-0 uppercase">TAXI</span>
                   <div>
                     <strong className="block text-sm text-soft-black">Axe Poste Centrale – Emombo</strong>
                     <span className="text-xs text-gray-500">Demandez l'arrêt "Emombo Auberge", le temple est à quelques pas.</span>
                   </div>
                 </li>
                 <li className="flex gap-4 items-start">
                   <span className="bg-orange-500 text-white font-bold px-2 py-1 rounded text-xs shrink-0 uppercase">MOTO</span>
                   <div>
                     <strong className="block text-sm text-soft-black">Moto-taxi</strong>
                     <span className="text-xs text-gray-500">Desservie facilement en tout temps depuis Mimboman ou Essos.</span>
                   </div>
                 </li>
               </ul>
             </motion.div>
           </div>
         </div>
       </div>

      {/* ======================================================
          INTEGRATION GROUPS
      ====================================================== */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">S'Intégrer</p>
            <h2 className="font-serif text-4xl font-bold">Trouver Votre Communauté</h2>
            <p className="text-gray-400 max-w-xl mx-auto mt-4">
              Le culte du dimanche est le début. Votre vraie intégration commence dans un groupe à taille humaine.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {groups.map((grp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#f5f2ed] rounded-3xl p-7 border border-transparent hover:border-gold/20 transition-all group cursor-pointer hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold transition-colors">
                    <grp.icon className="w-6 h-6 text-gold group-hover:text-soft-black transition-colors" />
                  </div>
                  <span className="bg-white text-xs font-bold uppercase tracking-wider text-gray-400 px-2 py-1 rounded-full border border-gray-200">{grp.tag}</span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{grp.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{grp.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 bg-soft-black text-white rounded-3xl p-10 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 cross-pattern opacity-20" />
            <div className="relative z-10">
              <h3 className="font-serif text-3xl font-bold mb-4">Le Parcours "Les Fondations"</h3>
              <p className="text-white/65 max-w-2xl mx-auto mb-8 leading-relaxed">
                Vous êtes nouveau ? Rejoignez notre parcours d'intégration en 4 séances — pour découvrir l'église, notre vision, nos valeurs, et comment trouver votre place dans la famille.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                {['Qui sommes-nous ?', 'Notre Vision & Foi', 'Les Dons Spirituels', 'Trouver Ma Place'].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gold text-soft-black text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                    <span className="text-white/70 text-sm whitespace-nowrap">{step}</span>
                    {i < 3 && <ChevronRight className="w-4 h-4 text-white/20 hidden sm:block" />}
                  </div>
                ))}
              </div>
              <button className="bg-gold hover:bg-yellow-400 text-soft-black px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                M'inscrire au Parcours
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ======================================================
          FAQ
      ====================================================== */}
      <div className="py-24 bg-[#f5f2ed] border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-serif text-4xl font-bold">Questions Fréquentes</h2>
            <p className="text-gray-400 max-w-xl mx-auto mt-4">Pour les visiteurs qui souhaitent en savoir plus avant de venir.</p>
          </motion.div>

          <div className="space-y-5">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-gold/20 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-soft-black group-hover:text-burgundy transition-colors">{faq.q}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
