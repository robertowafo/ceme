import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-grace-blue-deep text-white/70 border-t-2 border-grace-orange/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Marque + adresse */}
          <div className="space-y-5">
            <Link to="/" className="inline-block bg-white rounded-xl px-4 py-2.5">
              <img src="/logo-gracetv.png" alt="Logo Grâce TV" className="h-10 object-contain" loading="lazy" />
            </Link>
            <p className="font-sans text-sm leading-relaxed">
              <span className="text-grace-orange font-semibold">CEME Church</span> — Chapelle de l'Éternel Mon Étendard,
              Yaoundé, Cameroun.
            </p>
            <ul className="space-y-2.5 font-sans text-sm">
              <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-grace-orange shrink-0 mt-0.5" /> Emombo Auberge, BP 6065 — Yaoundé</li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-grace-orange shrink-0" /> +237 680 82 19 53</li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-grace-orange shrink-0" /> contact@chapelle-eternel.org</li>
            </ul>
          </div>

          {/* Nav Grâce TV */}
          <div>
            <h3 className="font-sans text-white text-sm font-bold uppercase tracking-wider mb-5">Grâce TV</h3>
            <ul className="space-y-3 font-sans text-sm">
              <li><Link to="/live" className="hover:text-grace-orange transition-colors">Regarder en direct</Link></li>
              <li><Link to="/emissions" className="hover:text-grace-orange transition-colors">Nos émissions</Link></li>
              <li><Link to="/comment-nous-regarder" className="hover:text-grace-orange transition-colors">Comment nous regarder</Link></li>
              <li><Link to="/partenaires" className="hover:text-grace-orange transition-colors">Nos partenaires</Link></li>
              <li><Link to="/a-propos" className="hover:text-grace-orange transition-colors">À propos</Link></li>
            </ul>
          </div>

          {/* Nav Église */}
          <div>
            <h3 className="font-sans text-white text-sm font-bold uppercase tracking-wider mb-5">Église CEME</h3>
            <ul className="space-y-3 font-sans text-sm">
              <li><Link to="/eglise" className="hover:text-grace-orange transition-colors">Notre église</Link></li>
              <li><Link to="/eglise/cultes" className="hover:text-grace-orange transition-colors">Agenda des cultes</Link></li>
              <li><Link to="/eglise/sermons" className="hover:text-grace-orange transition-colors">Sermons</Link></li>
              <li><Link to="/eglise/priere" className="hover:text-grace-orange transition-colors">Demandes de prière</Link></li>
              <li><Link to="/eglise/blog" className="hover:text-grace-orange transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Social + newsletter */}
          <div>
            <h3 className="font-sans text-white text-sm font-bold uppercase tracking-wider mb-5">Restons connectés</h3>
            <div className="flex gap-3 mb-6">
              <a href="https://www.youtube.com/@gracetelevision-hc4tv" target="_blank" rel="noopener noreferrer" aria-label="YouTube Grâce TV" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-grace-orange hover:text-white transition-colors"><Youtube className="w-4 h-4" /></a>
              <a href="https://web.facebook.com/DrAlphonseEssomba?rdid=1dN6E5BKmUndUYJD&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F194eJM2s6G%2F%3F_rdc%3D1%26_rdr#" target="_blank" rel="noopener noreferrer" aria-label="Facebook Grâce TV" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-grace-orange hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="https://www.instagram.com/chapelledeleternelmonetendard?igsh=MTdpem1nMm9tMW4wZg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram Grâce TV" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-grace-orange hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
            </div>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Votre adresse email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-grace-orange transition-colors"
                style={{ backdropFilter: 'blur(7px)' }}
              />
              <button className="w-full bg-grace-orange hover:bg-grace-orange-dark text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-colors uppercase tracking-wider">
                S'inscrire
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/50 font-sans">
          <p>© {new Date().getFullYear()} Grâce TV · CEME Church — Yaoundé, Cameroun. Tous droits réservés.</p>
          <p className="text-white/40">La Bonne Nouvelle, partout, partout…</p>
        </div>
      </div>
    </footer>
  );
}
