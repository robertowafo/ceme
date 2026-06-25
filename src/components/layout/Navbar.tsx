import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Clapperboard, Info, Church, Mail, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { path: '/emissions', label: 'Émissions', icon: Clapperboard },
  { path: '/a-propos', label: 'À propos', icon: Info },
  { path: '/eglise', label: 'Église CEME', icon: Church },
  { path: '/contact', label: 'Contact', icon: Mail },
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

  // Pilule sombre dès qu'on scrolle, ou sur les pages non-home (lisibilité)
  const compact = isScrolled || !isHome || isMobileMenuOpen;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
      <div
        className={`mx-auto transition-all duration-500 ${
          compact
            ? 'max-w-3xl bg-soft-black/95 backdrop-blur-md border border-white/10 rounded-full shadow-xl'
            : 'max-w-7xl bg-transparent'
        }`}
      >
        <div className="px-5 sm:px-7 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center group shrink-0" aria-label="Accueil Grâce TV">
            <img
              src="/logo-gracetv-white.png"
              alt="Logo Grâce TV"
              className={`object-contain transition-all duration-500 ${compact ? 'h-8' : 'h-9 sm:h-11'}`}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `font-sans text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'text-gold' : 'text-white/90 hover:text-gold'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center shrink-0">
            <Link
              to="/live"
              className="inline-flex items-center gap-2 bg-gold hover:bg-yellow-500 text-soft-black px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-soft-black" /> Regarder en direct
            </Link>
          </div>

          <button
            className="lg:hidden text-white p-2"
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
              className="lg:hidden overflow-hidden"
            >
              <nav className="flex flex-col px-5 pb-4 gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 font-sans text-base font-medium p-2.5 rounded-lg transition-colors ${
                        isActive ? 'bg-white/10 text-gold' : 'text-white/90 hover:bg-white/5'
                      }`
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
                <Link
                  to="/live"
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-gold text-soft-black px-5 py-3 rounded-full font-sans text-xs font-bold uppercase tracking-wider"
                >
                  <Play className="w-3.5 h-3.5 fill-soft-black" /> Regarder en direct
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
