/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { RootLayout } from './components/layout/RootLayout';
import { EgliseLayout } from './components/layout/EgliseLayout';
import { AuthProvider } from './lib/AuthContext';
import { Admin } from './pages/Admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ===== Pages chargées à la demande (code-splitting) =====
// Univers Grâce TV
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Live = lazy(() => import('./pages/Live').then((m) => ({ default: m.Live })));
const Emissions = lazy(() => import('./pages/Emissions').then((m) => ({ default: m.Emissions })));
const EmissionDetail = lazy(() => import('./pages/Emissions').then((m) => ({ default: m.EmissionDetail })));
const CommentNousRegarder = lazy(() => import('./pages/CommentNousRegarder').then((m) => ({ default: m.CommentNousRegarder })));
const Partenaires = lazy(() => import('./pages/Partenaires').then((m) => ({ default: m.Partenaires })));
const AboutGraceTV = lazy(() => import('./pages/AboutGraceTV').then((m) => ({ default: m.AboutGraceTV })));
const Give = lazy(() => import('./pages/Give').then((m) => ({ default: m.Give })));
const SupportGraceTV = lazy(() => import('./pages/SupportGraceTV').then((m) => ({ default: m.SupportGraceTV })));
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const DocumentReader = lazy(() => import('./pages/DocumentReader').then((m) => ({ default: m.DocumentReader })));

// Univers Église CEME
const EglisePage = lazy(() => import('./pages/eglise/EglisePage').then((m) => ({ default: m.EglisePage })));
const Schedule = lazy(() => import('./pages/eglise/Schedule').then((m) => ({ default: m.Schedule })));
const Sermons = lazy(() => import('./pages/eglise/Sermons').then((m) => ({ default: m.Sermons })));
const Prayer = lazy(() => import('./pages/eglise/Prayer').then((m) => ({ default: m.Prayer })));
const JoinUs = lazy(() => import('./pages/eglise/JoinUs').then((m) => ({ default: m.JoinUs })));
const About = lazy(() => import('./pages/eglise/About').then((m) => ({ default: m.About })));
const Blog = lazy(() => import('./pages/eglise/Blog').then((m) => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/eglise/BlogPost').then((m) => ({ default: m.BlogPost })));

// Redirige /blog/:id -> /eglise/blog/:id en conservant le paramètre (filet dev)
function RedirectBlogPost() {
  const { id } = useParams();
  return <Navigate to={`/eglise/blog/${id}`} replace />;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grace-blue-deep">
      <div className="w-10 h-10 border-4 border-grace-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              {/* ----- Grâce TV ----- */}
              <Route index element={<Home />} />
              <Route path="live" element={<Live />} />
              <Route path="emissions" element={<Emissions />} />
              <Route path="emissions/:slug" element={<EmissionDetail />} />
              <Route path="comment-nous-regarder" element={<CommentNousRegarder />} />
              <Route path="partenaires" element={<Partenaires />} />
              <Route path="a-propos" element={<AboutGraceTV />} />
              <Route path="faire-un-don" element={<Give />} />
              <Route path="soutenir-grace-tv" element={<SupportGraceTV />} />
              <Route path="contact" element={<Contact />} />
              <Route path="admin" element={<Admin />} />

              {/* ----- Église CEME ----- */}
              <Route path="eglise" element={<EgliseLayout />}>
                <Route index element={<EglisePage />} />
                <Route path="cultes" element={<Schedule />} />
                <Route path="sermons" element={<Sermons />} />
                <Route path="priere" element={<Prayer />} />
                <Route path="nous-rejoindre" element={<JoinUs />} />
                <Route path="a-propos" element={<About />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:id" element={<BlogPost />} />
              </Route>

              {/* ----- Redirections client-side (filet; les 301 SEO sont dans public/_redirects) ----- */}
              <Route path="sermons" element={<Navigate to="/eglise/sermons" replace />} />
              <Route path="schedule" element={<Navigate to="/eglise/cultes" replace />} />
              <Route path="agenda" element={<Navigate to="/eglise/cultes" replace />} />
              <Route path="prayer" element={<Navigate to="/eglise/priere" replace />} />
              <Route path="join" element={<Navigate to="/eglise/nous-rejoindre" replace />} />
              <Route path="about" element={<Navigate to="/eglise/a-propos" replace />} />
              <Route path="blog" element={<Navigate to="/eglise/blog" replace />} />
              <Route path="blog/:id" element={<RedirectBlogPost />} />
              <Route path="give" element={<Navigate to="/faire-un-don" replace />} />
            </Route>

            {/* Page lecteur autonome — sans navbar ni footer */}
            <Route path="document/:id" element={<DocumentReader />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
