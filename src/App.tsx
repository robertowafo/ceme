/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { RootLayout } from './components/layout/RootLayout';
import { EgliseLayout } from './components/layout/EgliseLayout';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ===== Univers Grâce TV (top-level) =====
import { Home } from './pages/Home';
import { Live } from './pages/Live';
import { Emissions, EmissionDetail } from './pages/Emissions';
import { CommentNousRegarder } from './pages/CommentNousRegarder';
import { Partenaires } from './pages/Partenaires';
import { AboutGraceTV } from './pages/AboutGraceTV';
import { Give } from './pages/Give';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { DocumentReader } from './pages/DocumentReader';

// ===== Univers Église CEME (/eglise/*) =====
import { EglisePage } from './pages/eglise/EglisePage';
import { Schedule } from './pages/eglise/Schedule';
import { Sermons } from './pages/eglise/Sermons';
import { Prayer } from './pages/eglise/Prayer';
import { JoinUs } from './pages/eglise/JoinUs';
import { About } from './pages/eglise/About';
import { Blog } from './pages/eglise/Blog';
import { BlogPost } from './pages/eglise/BlogPost';

import { AuthProvider } from './lib/AuthContext';

// Redirige /blog/:id -> /eglise/blog/:id en conservant le paramètre (filet dev)
function RedirectBlogPost() {
  const { id } = useParams();
  return <Navigate to={`/eglise/blog/${id}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
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

            {/* ----- Redirections client-side (filet de sécurité; les 301 SEO sont dans public/_redirects) ----- */}
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
      </AuthProvider>
    </BrowserRouter>
  );
}
