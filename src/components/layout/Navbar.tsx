import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Tv, Clapperboard, MonitorPlay, Handshake, Info, Church, HandHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { path: '/', label: 'Accueil', icon: Home, end: true },
  { path: '/live', label: 'Live', icon: Tv },
  { path: '/emissions', label: 'Émissions', icon: Clapperboard },
  { path: '/comment-nous-regarder', label: 'Nous regarder', icon: MonitorPlay },
  { path: '/partenaires', label: 'Partenaires', icon: Handshake },
  { path: '/a-propos', label: 'À propos', icon: Info },
  { path: '/eglise', label: 'Église CEME', icon: Church },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  return (
    <header className="fixed left-0 right-0 z-50 top-4 sm:top-6 px-4 sm:px-6 lg:px-8 transition-all duration-500">
      <div
        className={`max-w-7xl mx-auto transition-all duration-500 overflow-hidden rounded-2xl border ${
          isScrolled
            ? 'bg-grace-blue/95 backdrop-blur-md shadow-2xl border-white/10'
            : 'bg-grace-blue/80 backdrop-blur-md border-white/10'
        }`}
      >
        <div className="px-5 sm:px-7 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center group shrink-0" aria-label="Accueil Grâce TV">
            <img
              src="/logo-gracetv-white.png"
              alt="Logo Grâce TV"
              className="h-9 sm:h-10 object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `font-display text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'text-grace-orange' : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden xl:flex items-center shrink-0">
            <Link
              to="/faire-un-don"
              className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-5 py-2.5 rounded-full font-display text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              <HandHeart className="w-4 h-4" /> Faire un don
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="xl:hidden text-white p-2"
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
              className="xl:hidden border-t border-white/10"
            >
              <nav className="flex flex-col px-5 py-4 gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 font-display text-base font-medium p-2.5 rounded-lg transition-colors ${
                        isActive ? 'bg-white/10 text-grace-orange' : 'text-white/90 hover:bg-white/5'
                      }`
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
                <Link
                  to="/faire-un-don"
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-grace-orange text-white px-5 py-3 rounded-full font-display text-xs font-bold uppercase tracking-wider"
                >
                  <HandHeart className="w-4 h-4" /> Faire un don
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
