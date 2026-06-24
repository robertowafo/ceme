import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Tv, Calendar, Heart, MapPin, Users, HandHeart, BookOpen, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { path: '/live', label: 'Direct', icon: Tv },
  { path: '/eglise/sermons', label: 'Sermons', icon: BookOpen },
  { path: '/eglise/cultes', label: 'Agenda', icon: Calendar },
  { path: '/eglise/priere', label: 'Prière', icon: Heart },
  { path: '/eglise/nous-rejoindre', label: 'Nous rejoindre', icon: MapPin },
  { path: '/eglise/a-propos', label: 'À propos', icon: Users },
  { path: '/eglise/blog', label: 'Blog', icon: BookOpen },
  { path: '/contact', label: 'Contact', icon: Mail },
  { path: '/faire-un-don', label: 'Donner', icon: HandHeart },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'top-3 px-4 sm:px-6 lg:px-8' : 'top-6 px-4 sm:px-6 lg:px-8'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto transition-all duration-500 overflow-hidden ${
          isScrolled
            ? 'bg-soft-black/95 backdrop-blur-md shadow-2xl border border-white/10 rounded-2xl'
            : 'bg-soft-black/85 backdrop-blur-md border border-white/5 rounded-3xl'
        }`}
      >
        <div className="px-6 sm:px-8 py-3.5 sm:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/uploads/logo ceme.png"
              alt="CEME Logo"
              className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="font-serif text-white font-bold leading-none tracking-wider text-lg sm:text-xl">
                CEME
              </h1>
              <span className="text-[10px] text-white/70 uppercase tracking-[0.2em] block mt-1">
                Mon Étendard
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-5">
            {navLinks.slice(0, 7).map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide uppercase transition-colors hover:text-gold ${
                    isActive ? 'text-gold' : 'text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="hidden xl:flex items-center space-x-4">
            <Link to="/faire-un-don" className="text-white hover:text-gold text-sm font-medium uppercase transition-colors">
              Donner
            </Link>
            <Link
              to="/live"
              className="bg-burgundy hover:bg-red-800 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_15px_rgba(123,29,29,0.5)] flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>En Direct</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden text-white hover:text-gold p-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation inside the cards */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden bg-soft-black/40 border-t border-white/10"
            >
              <nav className="flex flex-col px-6 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 text-base font-medium transition-colors p-2 rounded-lg ${
                        isActive ? 'bg-white/10 text-gold' : 'text-white/80 hover:bg-white/5 hover:text-gold'
                      }`
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
                <div className="pt-2 border-t border-white/10 mt-2">
                  <Link
                    to="/live"
                    className="bg-burgundy text-white px-6 py-2.5 rounded-full text-center text-xs font-bold uppercase tracking-wider w-full flex items-center justify-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>Direct</span>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
