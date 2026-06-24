import { Outlet, NavLink, Link } from 'react-router-dom';
import { ArrowLeft, Church } from 'lucide-react';

const egliseLinks = [
  { path: '/eglise', label: 'Notre église', end: true },
  { path: '/eglise/cultes', label: 'Cultes' },
  { path: '/eglise/sermons', label: 'Sermons' },
  { path: '/eglise/priere', label: 'Prière' },
  { path: '/eglise/blog', label: 'Blog' },
  { path: '/eglise/nous-rejoindre', label: 'Nous rejoindre' },
  { path: '/eglise/a-propos', label: 'À propos' },
];

/**
 * Layout de l'univers église CEME (sous-domaine /eglise/*).
 * S'imbrique sous le header Grâce TV global (RootLayout). Ajoute :
 *  - un bandeau discret « Église porteuse de Grâce TV » + retour Grâce TV
 *  - une sous-nav dédiée (accent grace-sky pour distinguer de l'univers TV)
 */
export function EgliseLayout() {
  return (
    <>
      {/* Bandeau + sous-nav — pt-28 dégage la navbar flottante Grâce TV */}
      <div className="bg-gray-soft border-b border-grace-sky/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-grace-blue">
            <Church className="w-4 h-4 text-grace-sky shrink-0" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Église porteuse de Grâce TV
            </span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-grace-blue/70 hover:text-grace-orange transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Retour à Grâce TV</span>
            <span className="sm:hidden">Grâce TV</span>
          </Link>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-grace-sky/15">
          <ul className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 -mb-px text-sm">
            {egliseLinks.map((link) => (
              <li key={link.path} className="shrink-0">
                <NavLink
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    `block px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-grace-sky text-white'
                        : 'text-grace-blue/80 hover:bg-grace-sky/10 hover:text-grace-blue'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <Outlet />
    </>
  );
}
