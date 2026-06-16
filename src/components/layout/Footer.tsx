import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, MapPin, Mail, Phone, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-soft-black text-white/80 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center space-x-3">
              <img
                src="/uploads/logo ceme.png"
                alt="CEME Logo"
                className="w-12 h-12 object-contain"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h2 className="font-serif text-white font-bold text-2xl mb-1">CEME</h2>
                <p className="text-sm tracking-[0.2em] text-gold uppercase">Mon Étendard</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed">
              Une communauté passionnée par la présence de Dieu, dédiée à faire des disciples et à impacter notre génération avec l'amour de Christ.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-soft-black transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-soft-black transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-soft-black transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-white text-lg mb-6 border-b border-white/10 pb-2">Liens Rapides</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="hover:text-gold transition-colors block">À Propos de Nous</Link></li>
              <li><Link to="/live" className="hover:text-gold transition-colors block">Culte en Direct</Link></li>
              <li><Link to="/sermons" className="hover:text-gold transition-colors block">Messages & Vidéos</Link></li>
              <li><Link to="/schedule" className="hover:text-gold transition-colors block">Notre Agenda</Link></li>
              <li><Link to="/give" className="hover:text-gold transition-colors block">Faire un Don</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-white text-lg mb-6 border-b border-white/10 pb-2">Contactez-nous</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">EMOMBO AUBERGE,<br />BP 6065 Yaoundé</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="text-sm">+237 680 82 19 53</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span className="text-sm">contact@chapelle-eternel.org</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h3 className="font-serif text-white text-lg mb-6 border-b border-white/10 pb-2">Restons Connectés</h3>
            <p className="text-sm mb-4">Recevez nos dernières actualités et encouragements hebdomadaires.</p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
              />
              <button className="w-full bg-gold hover:bg-yellow-500 text-soft-black font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors uppercase tracking-wider">
                S'inscrire
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
          <p>&copy; {new Date().getFullYear()} Chapelle de l'Eternel Mon Étendard. Tous droits réservés.</p>
          <div className="flex items-center space-x-1 text-white/60">
            <span>Fait avec</span>
            <Heart className="w-3 h-3 text-burgundy" />
            <span>pour Sa Gloire.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
