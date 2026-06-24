import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Clapperboard, MonitorPlay, Handshake, Info, Church, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { path: '/', label: 'Accueil', icon: Home, end: true },
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
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  // Fond transparent uniquement en haut de la home ; cobalt partout ailleurs / au scroll
  const solid = isScrolled || !isHome || isMobileMenuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid ? 'bg-grace-blue/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" className="flex items-center group shrink-0" aria-label="Accueil Grâce TV">
            <img
              src="/logo-gracetv-white.png"
              alt="Logo Grâce TV"
              className="h-9 sm:h-11 object-contain transition-transform group-hover:scale-105"
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
                  `font-body text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'text-grace-gold' : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden xl:flex items-center shrink-0">
            <Link
              to="/live"
              className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-5 py-2.5 rounded-full font-body text-xs font-bold uppercase tracking-wider transition-colors shadow-md animate-live-pulse"
            >
              <Play className="w-4 h-4 fill-white" /> Regarder en direct
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
              className="xl:hidden overflow-hidden"
            >
              <nav className="flex flex-col pb-4 gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 font-body text-base font-medium p-2.5 rounded-lg transition-colors ${
                        isActive ? 'bg-white/10 text-grace-gold' : 'text-white/90 hover:bg-white/5'
                      }`
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
                <Link
                  to="/live"
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-grace-orange text-white px-5 py-3 rounded-full font-body text-xs font-bold uppercase tracking-wider"
                >
                  <Play className="w-4 h-4 fill-white" /> Regarder en direct
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
