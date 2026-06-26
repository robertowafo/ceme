import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { EgliseNavbar } from './EgliseNavbar';
import { EgliseFooter } from './EgliseFooter';
import { useSmoothScroll } from '../../lib/useSmoothScroll';

export function RootLayout() {
  useSmoothScroll();
  const { pathname } = useLocation();
  const isEglise = pathname === '/eglise' || pathname.startsWith('/eglise/');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {isEglise ? <EgliseNavbar /> : <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {isEglise ? <EgliseFooter /> : <Footer />}
    </div>
  );
}
