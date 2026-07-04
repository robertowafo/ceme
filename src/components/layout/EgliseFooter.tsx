import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, MapPin, Mail, Phone, Tv, Heart } from 'lucide-react';

export function EgliseFooter() {
  return (
    <footer className="bg-soft-black text-white/80 border-t-2 border-gold/50 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Marque */}
          <div className="space-y-5">
            <Link to="/eglise" className="inline-flex items-center gap-3">
              <img src="/uploads/logo ceme.png" alt="Logo CEME" className="w-12 h-12 object-contain" loading="lazy" referrerPolicy="no-referrer" />
              <div>
                <h2 className="font-serif text-white font-extrabold text-2xl leading-none">CEME</h2>
                <p className="text-[11px] tracking-[0.2em] text-gold uppercase mt-1">Mon Étendard</p>
              </div>
            </Link>
            <p className="font-sans text-sm leading-relaxed">
              Chapelle de l'Éternel Mon Étendard — une communauté évangélique de Yaoundé,
              dédiée à la présence de Dieu et à l'élévation des vies.
            </p>
            <div className="flex gap-3">
              <a href="https://web.facebook.com/DrAlphonseEssomba?rdid=1dN6E5BKmUndUYJD&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F194eJM2s6G%2F%3F_rdc%3D1%26_rdr#" target="_blank" rel="noopener noreferrer" aria-label="Facebook CEME" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-soft-black transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="https://www.youtube.com/@gracetelevision-hc4tv" target="_blank" rel="noopener noreferrer" aria-label="YouTube CEME" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-soft-black transition-colors"><Youtube className="w-4 h-4" /></a>
              <a href="https://www.instagram.com/chapelledeleternelmonetendard?igsh=MTdpem1nMm9tMW4wZg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram CEME" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-soft-black transition-colors"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Vie de l'église */}
          <div>
            <h3 className="font-sans text-white text-sm font-bold uppercase tracking-wider mb-5 border-b border-white/10 pb-2">Vie de l'église</h3>
            <ul className="space-y-3 font-sans text-sm">
              <li><Link to="/eglise" className="hover:text-gold transition-colors">Notre église</Link></li>
              <li><Link to="/eglise/cultes" className="hover:text-gold transition-colors">Agenda des cultes</Link></li>
              <li><Link to="/eglise/sermons" className="hover:text-gold transition-colors">Sermons</Link></li>
              <li><Link to="/eglise/priere" className="hover:text-gold transition-colors">Demandes de prière</Link></li>
              <li><Link to="/eglise/blog" className="hover:text-gold transition-colors">Blog</Link></li>
              <li><Link to="/eglise/nous-rejoindre" className="hover:text-gold transition-colors">Nous rejoindre</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans text-white text-sm font-bold uppercase tracking-wider mb-5 border-b border-white/10 pb-2">Nous contacter</h3>
            <ul className="space-y-4 font-sans text-sm">
              <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" /><span>EMOMBO Auberge,<br />BP 6065 — Yaoundé</span></li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-gold shrink-0" /><span>+237 680 82 19 53</span></li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-gold shrink-0" /><span>contact@chapelle-eternel.org</span></li>
            </ul>
          </div>

          {/* Pont Grâce TV */}
          <div>
            <h3 className="font-sans text-white text-sm font-bold uppercase tracking-wider mb-5 border-b border-white/10 pb-2">Notre chaîne</h3>
            <p className="font-sans text-sm mb-4">La Chapelle porte la chaîne de télévision chrétienne Grâce TV — la Bonne Nouvelle partout, partout.</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-gold hover:bg-yellow-500 text-soft-black px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-colors">
              <Tv className="w-4 h-4" /> Découvrir Grâce TV
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-7 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/55 font-sans">
          <p>© {new Date().getFullYear()} Chapelle de l'Éternel Mon Étendard — Yaoundé, Cameroun.</p>
          <p className="flex items-center gap-1.5">Fait avec <Heart className="w-3 h-3 text-burgundy fill-burgundy" /> pour Sa Gloire.</p>
        </div>
      </div>
    </footer>
  );
}
