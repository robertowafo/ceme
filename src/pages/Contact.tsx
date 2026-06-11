import { Mail, Phone, MapPin, Send, MessageCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

export function Contact() {
  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      {/* Header Base */}
      <div className="bg-soft-black text-white py-20 mb-16 text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl opacity-5 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <MessageCircle className="w-12 h-12 text-gold mx-auto mb-6" />
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Contact & Écoute</h1>
          <p className="text-white/80 text-lg leading-relaxed font-light">
            Notre secrétariat pastoral et nos équipes sont à votre entière disposition. Que ce soit pour une question, une demande de visite à l'hôpital ou pour un accompagnement pastoral, écrivez-nous.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">
          
          {/* Main Form Col */}
          <div className="lg:w-3/5">
            <div className="bg-[#f5f2ed] border border-gray-200 p-8 md:p-12 rounded-[2.5rem] shadow-sm">
              <h2 className="font-serif text-3xl font-bold mb-2">Envoyez-nous un message</h2>
              <p className="text-gray-500 text-sm mb-8">Nous traitons les messages sous 48h ouvrées. Pour les urgences pastorales, privilégiez le téléphone.</p>
              
              <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Nom Complet</label>
                    <input type="text" placeholder="Jean Dupont" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold transition-all" required/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Adresse Email</label>
                    <input type="email" placeholder="jean@exemple.com" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold transition-all" required/>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Téléphone</label>
                    <input type="tel" placeholder="+237 600 00 00 00" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold transition-all"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Sujet de votre demande</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold appearance-none text-gray-700 cursor-pointer transition-all">
                      <option>Information générale</option>
                      <option>Demande d'entretien pastoral</option>
                      <option>Visite à l'hôpital ou domicile</option>
                      <option>S'engager comme bénévole</option>
                      <option>Baptêmes ou Mariages</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Votre Message</label>
                  <textarea rows={6} placeholder="Comment pouvons-nous vous aider ?" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-gold resize-none transition-all" required></textarea>
                </div>
                
                <button className="bg-soft-black text-white hover:bg-gold hover:text-soft-black px-10 py-5 rounded-xl font-bold uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-xl w-full flex items-center justify-center gap-3">
                  <Send className="w-5 h-5"/> Envoyer le message
                </button>
              </form>
            </div>
          </div>

          {/* Info & FAQ Col */}
          <div className="lg:w-2/5 space-y-12">
            
            {/* Contact Details Card */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="font-serif text-2xl font-bold mb-8 text-soft-black">Contact Direct</h3>
              
              <ul className="space-y-8">
                <li className="flex items-start shrink-0">
                  <div className="bg-[#f5f2ed] border border-gray-200 p-3 rounded-full text-burgundy mr-4 mt-1"><MapPin className="w-6 h-6" /></div>
                  <div>
                    <strong className="block text-sm font-bold uppercase tracking-widest text-soft-black mb-1">Siège & Sanctuaire</strong>
                    <span className="text-gray-600 text-sm leading-relaxed block">EMOMBO AUBERGE,<br />BP 6065 Yaoundé, Cameroun</span>
                  </div>
                </li>
                
                <li className="flex items-start shrink-0">
                  <div className="bg-[#f5f2ed] border border-gray-200 p-3 rounded-full text-burgundy mr-4 mt-1"><Phone className="w-6 h-6" /></div>
                  <div>
                    <strong className="block text-sm font-bold uppercase tracking-widest text-soft-black mb-1">Secrétariat</strong>
                    <span className="text-gray-600 text-sm block mb-1">+237 680 82 19 53</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded inline-block">Lun-Ven • 09:00 - 17:00</span>
                  </div>
                </li>
                
                <li className="flex items-start shrink-0">
                  <div className="bg-[#f5f2ed] border border-gray-200 p-3 rounded-full text-burgundy mr-4 mt-1"><Mail className="w-6 h-6" /></div>
                  <div>
                    <strong className="block text-sm font-bold uppercase tracking-widest text-soft-black mb-1">Emails Utiles</strong>
                    <div className="space-y-2 mt-2">
                       <p className="text-sm"><span className="text-gray-400 font-bold w-20 inline-block">Général :</span> <a href="mailto:contact@chapelle-eternel.org" className="text-burgundy hover:underline">contact@chapelle-eternel.org</a></p>
                       <p className="text-sm"><span className="text-gray-400 font-bold w-20 inline-block">Prière :</span> <a href="mailto:priere@chapelle-eternel.org" className="text-burgundy hover:underline">priere@chapelle-eternel.org</a></p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick FAQ Box */}
             <div className="bg-gold/10 border border-gold/30 rounded-[2.5rem] p-8">
               <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                 <Info className="w-5 h-5 text-burgundy"/> Questions Fréquentes
               </h3>
               <div className="space-y-4">
                 <details className="group cursor-pointer">
                   <summary className="font-bold text-soft-black text-sm list-none font-sans flex justify-between items-center border-b border-gold/20 pb-2">
                     Organisez-vous des dédicaces d'enfants ?
                     <span className="text-gold group-open:rotate-180 transition-transform">▼</span>
                   </summary>
                   <p className="text-gray-700 text-sm mt-3 leading-relaxed">Oui, les présentations d'enfants ont lieu le premier dimanche de chaque mois. Veuillez utiliser le formulaire pour inscrire votre enfant.</p>
                 </details>
                 <details className="group cursor-pointer">
                   <summary className="font-bold text-soft-black text-sm list-none font-sans flex justify-between items-center border-b border-gold/20 pb-2">
                     Le pasteur reçoit-il sur rendez-vous ?
                     <span className="text-gold group-open:rotate-180 transition-transform">▼</span>
                   </summary>
                   <p className="text-gray-700 text-sm mt-3 leading-relaxed">Le corps pastoral reçoit les mardis et jeudis après-midi sur prise de rendez-vous confirmée par le secrétariat.</p>
                 </details>
               </div>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
}
