/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { Home } from './pages/Home';
import { Live } from './pages/Live';
import { Sermons } from './pages/Sermons';
import { Schedule } from './pages/Schedule';
import { Prayer } from './pages/Prayer';
import { JoinUs } from './pages/JoinUs';
import { About } from './pages/About';
import { Give } from './pages/Give';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { DocumentReader } from './pages/DocumentReader';
import { AuthProvider } from './lib/AuthContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="live" element={<Live />} />
            <Route path="sermons" element={<Sermons />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="prayer" element={<Prayer />} />
            <Route path="join" element={<JoinUs />} />
            <Route path="about" element={<About />} />
            <Route path="give" element={<Give />} />
            <Route path="blog" element={<Blog />} />
            <Route path="contact" element={<Contact />} />
            <Route path="admin" element={<Admin />} />
          </Route>
          {/* Page lecteur autonome — sans navbar ni footer */}
          <Route path="document/:id" element={<DocumentReader />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
