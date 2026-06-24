import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-grace-blue-deep text-white/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1 — Marque + légales */}
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <img src="/logo-gracetv-white.png" alt="Logo Grâce TV" className="h-11 object-contain" loading="lazy" />
            </Link>
            <p className="font-body text-sm leading-relaxed">
              La Bonne Nouvelle Partout Partout. Chaîne de télévision chrétienne basée à Yaoundé,
              Cameroun — diffusion 24/7.
            </p>
            <p className="font-body text-xs text-white/50 leading-relaxed">
              RCCM RC/YAO/2015/A/320 — Siège : Yaoundé, Région du Centre, Cameroun.
            </p>
          </div>

          {/* Col 2 — Grâce TV */}
          <div>
            <h3 className="font-display text-white text-sm font-bold uppercase tracking-wider mb-5">Grâce TV</h3>
            <ul className="space-y-3 font-body text-sm">
              <li><Link to="/live" className="hover:text-grace-orange transition-colors">Regarder en direct</Link></li>
              <li><Link to="/emissions" className="hover:text-grace-orange transition-colors">Nos émissions</Link></li>
              <li><Link to="/comment-nous-regarder" className="hover:text-grace-orange transition-colors">Comment nous regarder</Link></li>
              <li><Link to="/partenaires" className="hover:text-grace-orange transition-colors">Nos partenaires</Link></li>
              <li><Link to="/a-propos" className="hover:text-grace-orange transition-colors">À propos</Link></li>
            </ul>
          </div>

          {/* Col 3 — Église CEME */}
          <div>
            <h3 className="font-display text-white text-sm font-bold uppercase tracking-wider mb-5">Église CEME</h3>
            <ul className="space-y-3 font-body text-sm">
              <li><Link to="/eglise" className="hover:text-grace-orange transition-colors">Notre église</Link></li>
              <li><Link to="/eglise/cultes" className="hover:text-grace-orange transition-colors">Agenda des cultes</Link></li>
              <li><Link to="/eglise/sermons" className="hover:text-grace-orange transition-colors">Sermons</Link></li>
              <li><Link to="/eglise/priere" className="hover:text-grace-orange transition-colors">Demandes de prière</Link></li>
              <li><Link to="/eglise/blog" className="hover:text-grace-orange transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Col 4 — Contact + réseaux */}
          <div>
            <h3 className="font-display text-white text-sm font-bold uppercase tracking-wider mb-5">Contact</h3>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-grace-sky shrink-0 mt-0.5" />
                <span>EMOMBO Auberge, BP 6065 — Yaoundé</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-grace-sky shrink-0" />
                <span>+237 680 82 19 53</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-grace-sky shrink-0" />
                <span>contact@chapelle-eternel.org</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-5">
              {/* TODO: remplacer href="#" par les vraies URLs réseaux */}
              <a href="#" aria-label="YouTube Grâce TV" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-grace-orange transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook Grâce TV" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-grace-orange transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram Grâce TV" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-grace-orange transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-7 text-center text-xs text-white/55 font-body">
          © {new Date().getFullYear()} Grâce TV — Tous droits réservés. Une chaîne portée par la
          Chapelle de l'Éternel Mon Étendard.
        </div>
      </div>
    </footer>
  );
}
