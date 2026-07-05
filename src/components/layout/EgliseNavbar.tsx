import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Tv, Home, Calendar, BookOpen, Heart, MapPin, Users, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { path: '/eglise', label: 'Notre église', icon: Home, end: true },
  { path: '/eglise/cultes', label: 'Cultes', icon: Calendar },
  { path: '/eglise/sermons', label: 'Sermons', icon: BookOpen },
  { path: '/eglise/priere', label: 'Prière', icon: Heart },
  { path: '/eglise/blog', label: 'Blog', icon: BookOpen },
  { path: '/eglise/nous-rejoindre', label: 'Nous rejoindre', icon: MapPin },
  { path: '/eglise/a-propos', label: 'À propos', icon: Info },
];

export function EgliseNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
      <div className={`mx-auto max-w-6xl bg-white/95 backdrop-blur-md border border-soft-black/10 shadow-xl transition-all duration-300 ${isMobileMenuOpen ? 'rounded-3xl' : 'rounded-full'}`}>
        <div className="px-4 sm:px-6 py-2 flex justify-between items-center gap-4">
          <Link to="/eglise" className="flex items-center gap-2 group shrink-0" aria-label="Accueil de l'église CEME">
            <img src="/uploads/logo ceme.png" alt="Logo CEME" className="h-10 sm:h-11 object-contain" referrerPolicy="no-referrer" />
            <div className="hidden sm:block leading-none">
              <span className="block font-serif font-extrabold text-soft-black tracking-wide">CEME</span>
              <span className="block text-[9px] text-burgundy uppercase tracking-[0.2em] mt-0.5">Mon Étendard</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `font-sans text-[13px] font-medium px-2.5 py-2 rounded-lg transition-colors ${
                    isActive ? 'text-burgundy' : 'text-soft-black/80 hover:text-burgundy'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Bascule vers Grâce TV */}
          <div className="hidden xl:flex items-center shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-soft-black hover:bg-burgundy text-white px-4 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Tv className="w-3.5 h-3.5" /> Grâce TV
            </Link>
          </div>

          <button
            className="xl:hidden text-soft-black p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden overflow-hidden"
            >
              <nav className="flex flex-col px-4 pb-4 gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 font-sans text-base font-medium p-2.5 rounded-lg transition-colors ${
                        isActive ? 'bg-burgundy/10 text-burgundy' : 'text-soft-black/80 hover:bg-soft-black/5'
                      }`
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
                <Link
                  to="/"
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-soft-black text-white px-5 py-3 rounded-full font-sans text-xs font-bold uppercase tracking-wider"
                >
                  <Tv className="w-3.5 h-3.5" /> Revenir à Grâce TV
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
