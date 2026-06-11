import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import fs from 'fs';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = 3000;

// ─── PostgreSQL ────────────────────────────────────────────────────────────────

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDb() {
  const schema = fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf-8');
  await pool.query(schema);
  console.log('Database schema ready.');
}

// ─── Auth helpers ──────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'impacttech237@gmail.com';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
}

function signSession(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifySession(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }
  const payload = verifySession(auth.slice(7));
  if (!payload?.isAdmin) {
    res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
    return;
  }
  (req as any).user = payload;
  next();
}

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());

// ─── File uploads ──────────────────────────────────────────────────────────────

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Servir les fichiers inline (pas de téléchargement automatique)
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Content-Disposition', 'inline');
  next();
}, express.static(uploadsDir));

// Téléchargement avec bon nom de fichier
app.get('/api/documents/download/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT title, file_type AS "fileType", url FROM study_documents WHERE id=$1',
      [req.params.id]
    );
    if (result.rows.length === 0) { res.status(404).json({ error: 'Document introuvable' }); return; }
    const doc = result.rows[0];
    const filename = `${doc.title}.${doc.fileType.toLowerCase()}`;
    // doc.url is like "/uploads/file-xxx.pdf" — resolve to filesystem path
    const filePath = path.join(process.cwd(), doc.url.startsWith('/') ? doc.url.slice(1) : doc.url);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.sendFile(filePath);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Auth endpoint ─────────────────────────────────────────────────────────────

// POST /api/auth/google  { accessToken: string }
// Vérifie le token Google, renvoie un JWT de session
app.post('/api/auth/google', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    res.status(400).json({ error: 'accessToken manquant' });
    return;
  }
  try {
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!googleRes.ok) {
      res.status(401).json({ error: 'Token Google invalide' });
      return;
    }
    const info = await googleRes.json() as {
      sub: string;
      email: string;
      email_verified: boolean;
      name: string;
      picture: string;
    };

    if (!info.email_verified) {
      res.status(403).json({ error: 'Adresse email Google non vérifiée' });
      return;
    }

    const isAdmin = info.email === ADMIN_EMAIL;
    const token = signSession({
      sub: info.sub,
      email: info.email,
      name: info.name,
      picture: info.picture,
      isAdmin
    });

    res.json({ token, user: { email: info.email, name: info.name, picture: info.picture, isAdmin } });
  } catch (err: any) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
});

// GET /api/auth/me  — vérifie un JWT existant
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }
  const payload = verifySession(auth.slice(7));
  if (!payload) {
    res.status(401).json({ error: 'Session expirée' });
    return;
  }
  res.json({ user: { email: payload.email, name: payload.name, picture: payload.picture, isAdmin: payload.isAdmin } });
});

// ─── CRUD: recommended_links ───────────────────────────────────────────────────

app.get('/api/recommended-links', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, youtube_id AS "youtubeId", description, category FROM recommended_links ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/recommended-links/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, youtubeId, description, category } = req.body;
  try {
    await pool.query(
      `INSERT INTO recommended_links (id, title, youtube_id, description, category)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE
         SET title=$2, youtube_id=$3, description=$4, category=$5`,
      [id, title, youtubeId, description ?? null, category]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recommended-links/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM recommended_links WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CRUD: gallery_photos ──────────────────────────────────────────────────────

app.get('/api/gallery-photos', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, category, title, location, url, note AS desc FROM gallery_photos'
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/gallery-photos/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { category, title, location, url, desc } = req.body;
  try {
    await pool.query(
      `INSERT INTO gallery_photos (id, category, title, location, url, note)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE
         SET category=$2, title=$3, location=$4, url=$5, note=$6`,
      [id, category, title, location ?? null, url, desc ?? null]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/gallery-photos/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM gallery_photos WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CRUD: church_events ───────────────────────────────────────────────────────

app.get('/api/church-events', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, type, date_str AS "dateStr", iso_date AS "isoDate",
              location, preacher, note AS desc, badge, badge_color AS "badgeColor",
              image, is_popular AS "isPopular"
       FROM church_events ORDER BY iso_date ASC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/church-events/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, type, dateStr, isoDate, location, preacher, desc, badge, badgeColor, image, isPopular } = req.body;
  try {
    await pool.query(
      `INSERT INTO church_events (id, title, type, date_str, iso_date, location, preacher, note, badge, badge_color, image, is_popular)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE
         SET title=$2, type=$3, date_str=$4, iso_date=$5, location=$6, preacher=$7,
             note=$8, badge=$9, badge_color=$10, image=$11, is_popular=$12`,
      [id, title, type, dateStr, isoDate, location, preacher ?? null, desc, badge, badgeColor ?? null, image, isPopular ?? false]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/church-events/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM church_events WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CRUD: testimonials ────────────────────────────────────────────────────────

app.get('/api/testimonials', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, author, since, text, img, category FROM testimonials'
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/testimonials/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { author, since, text, img, category } = req.body;
  try {
    await pool.query(
      `INSERT INTO testimonials (id, author, since, text, img, category)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE
         SET author=$2, since=$3, text=$4, img=$5, category=$6`,
      [id, author, since, text, img ?? null, category]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/testimonials/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM testimonials WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CRUD: study_documents ─────────────────────────────────────────────────────

app.get('/api/study-documents', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, url, category, file_type AS "fileType"
       FROM study_documents`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/study-documents/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, url, category, fileType } = req.body;
  try {
    await pool.query(
      `INSERT INTO study_documents (id, title, description, url, category, file_type)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE
         SET title=$2, description=$3, url=$4, category=$5, file_type=$6`,
      [id, title, description ?? null, url, category ?? null, fileType]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/study-documents/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM study_documents WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CRUD: donations ──────────────────────────────────────────────────────────

// Enregistrement public d'un don
app.post('/api/donations', async (req, res) => {
  const { donorName, phone, amount, currency, contribType, paymentMethod, reference } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    res.status(400).json({ error: 'Montant invalide' });
    return;
  }
  try {
    const id = 'don_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    await pool.query(
      `INSERT INTO donations (id, donor_name, phone, amount, currency, contrib_type, payment_method, reference)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        id,
        donorName?.trim() || null,
        phone?.trim() || null,
        Math.round(Number(amount)),
        currency || 'FCFA',
        contribType || 'Offrande',
        paymentMethod || 'OM',
        reference || null,
      ]
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin — liste complète
app.get('/api/donations', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, donor_name AS "donorName", phone, amount, currency,
              contrib_type AS "contribType", payment_method AS "paymentMethod",
              reference, submitted_at AS "submittedAt"
       FROM donations
       ORDER BY submitted_at DESC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin — statistiques dashboard
app.get('/api/donations/stats', requireAdmin, async (_req, res) => {
  try {
    const [totals, byType, byMethod, monthly] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations`),
      pool.query(`SELECT contrib_type AS type, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations GROUP BY contrib_type ORDER BY total DESC`),
      pool.query(`SELECT payment_method AS method, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations GROUP BY payment_method`),
      pool.query(
        `SELECT TO_CHAR(submitted_at, 'YYYY-MM') AS month,
                COUNT(*) AS count,
                COALESCE(SUM(amount),0) AS total
         FROM donations
         WHERE submitted_at >= NOW() - INTERVAL '6 months'
         GROUP BY month ORDER BY month`
      ),
    ]);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthRow = monthly.rows.find((r: any) => r.month === thisMonth);
    res.json({
      totalCount: Number(totals.rows[0].count),
      totalAmount: Number(totals.rows[0].total),
      thisMonthAmount: Number(thisMonthRow?.total ?? 0),
      thisMonthCount: Number(thisMonthRow?.count ?? 0),
      byType: byType.rows.map((r: any) => ({ type: r.type, count: Number(r.count), total: Number(r.total) })),
      byMethod: byMethod.rows.map((r: any) => ({ method: r.method, count: Number(r.count), total: Number(r.total) })),
      monthly: monthly.rows.map((r: any) => ({ month: r.month, count: Number(r.count), total: Number(r.total) })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/donations/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM donations WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CRUD: prayer_requests ─────────────────────────────────────────────────────

// Soumission publique (pas d'auth requise)
app.post('/api/prayer-requests', async (req, res) => {
  const { name, phone, message, type, isPublic } = req.body;
  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Le message est requis' });
    return;
  }
  try {
    const id = 'prq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    await pool.query(
      `INSERT INTO prayer_requests (id, name, phone, message, type, is_public)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, name?.trim() || null, phone?.trim() || null, message.trim(),
       type === 'testimony' ? 'testimony' : 'prayer',
       isPublic !== false]
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mur public — prières non confidentielles
app.get('/api/prayer-requests/public', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, message, type, submitted_at AS "submittedAt"
       FROM prayer_requests
       WHERE is_public = true
       ORDER BY submitted_at DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin — toutes les prières
app.get('/api/prayer-requests', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, message, type, is_public AS "isPublic", submitted_at AS "submittedAt"
       FROM prayer_requests
       ORDER BY submitted_at DESC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/prayer-requests/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM prayer_requests WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── YouTube API ───────────────────────────────────────────────────────────────

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const CHANNEL_HANDLE = '@gracetelevision-hc4tv';

interface CacheEntry<T> { data: T; timestamp: number; }

let cachedChannelId: string | null = null;
let cachedUploadsPlaylistId: string | null = null;
let cachePlaylists: CacheEntry<any[]> | null = null;
let cacheSermons: CacheEntry<any[]> | null = null;
let cacheLive: CacheEntry<any> | null = null;

const CACHE_TTL = 15 * 60 * 1000;

function isCacheValid<T>(entry: CacheEntry<T> | null): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${text}`);
  }
  return response.json();
}

async function resolveChannelId(): Promise<{ channelId: string; uploadsPlaylistId: string }> {
  if (cachedChannelId && cachedUploadsPlaylistId) {
    return { channelId: cachedChannelId, uploadsPlaylistId: cachedUploadsPlaylistId };
  }
  if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY non défini');

  const url = `https://www.googleapis.com/youtube/v3/channels?part=id,contentDetails,snippet&forHandle=${encodeURIComponent(CHANNEL_HANDLE)}&key=${YOUTUBE_API_KEY}`;
  try {
    const data = await fetchJson(url);
    if (data.items?.length > 0) {
      cachedChannelId = data.items[0].id;
      cachedUploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
      return { channelId: cachedChannelId!, uploadsPlaylistId: cachedUploadsPlaylistId! };
    }
  } catch (err) {
    console.error('Erreur forHandle, fallback recherche:', err);
  }

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(CHANNEL_HANDLE)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
  const searchData = await fetchJson(searchUrl);
  if (searchData.items?.length > 0) {
    const channelId = searchData.items[0].id.channelId;
    const chanData = await fetchJson(`https://www.googleapis.com/youtube/v3/channels?part=id,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`);
    if (chanData.items?.length > 0) {
      cachedChannelId = chanData.items[0].id;
      cachedUploadsPlaylistId = chanData.items[0].contentDetails.relatedPlaylists.uploads;
      return { channelId: cachedChannelId!, uploadsPlaylistId: cachedUploadsPlaylistId! };
    }
  }
  throw new Error(`Impossible de résoudre l'ID de la chaîne: ${CHANNEL_HANDLE}`);
}

function parsePreacher(title: string): string {
  const t = title.toUpperCase();
  if (t.includes("MARIE CHARLOTTE") || t.includes("MAMAN MARIE") || t.includes("MAMAN CHARLOTTE") || t.includes("M.C. ESSOMBA")) {
    return "Maman Marie Charlotte ESSOMBA";
  }
  if (t.includes("ALPHONSE") || t.includes("BOUNOUNGOU") || t.includes("ALPHONSE ESSOMBA") || t.includes("REV") || t.includes("REVEREND")) {
    return "Rev. Dr. Alphonse ESSOMBA";
  }
  return "Rev. Dr. Alphonse ESSOMBA";
}

function formatDateStr(isoStr: string): string {
  try {
    const date = new Date(isoStr);
    const months = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return "Récemment";
  }
}

app.get('/api/youtube/live', async (_req, res) => {
  try {
    if (isCacheValid(cacheLive)) return res.json(cacheLive!.data);
    const { channelId } = await resolveChannelId();
    const data = await fetchJson(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`);
    let liveData = { isLive: false, videoId: null, title: '', description: '', publishedAt: '', channelId };
    if (data.items?.length > 0) {
      const item = data.items[0];
      liveData = { isLive: true, videoId: item.id.videoId, title: item.snippet.title, description: item.snippet.description, publishedAt: item.snippet.publishedAt, channelId };
    } else {
      const recentData = await fetchJson(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=1&key=${YOUTUBE_API_KEY}`);
      if (recentData.items?.length > 0) {
        const item = recentData.items[0];
        liveData = { isLive: false, videoId: item.id.videoId, title: item.snippet.title, description: item.snippet.description, publishedAt: item.snippet.publishedAt, channelId };
      }
    }
    cacheLive = { data: liveData, timestamp: Date.now() };
    res.json(liveData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/youtube/playlists', async (_req, res) => {
  try {
    if (isCacheValid(cachePlaylists)) return res.json(cachePlaylists!.data);
    const { channelId } = await resolveChannelId();
    const data = await fetchJson(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&key=${YOUTUBE_API_KEY}`);
    const playlists = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
      videoCount: item.contentDetails?.itemCount || 0
    }));
    cachePlaylists = { data: playlists, timestamp: Date.now() };
    res.json(playlists);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/youtube/sermons', async (_req, res) => {
  try {
    if (isCacheValid(cacheSermons)) return res.json(cacheSermons!.data);
    const { uploadsPlaylistId, channelId } = await resolveChannelId();
    const uploadsData = await fetchJson(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`);
    const playlistsData = await fetchJson(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=25&key=${YOUTUBE_API_KEY}`);
    const listPlaylists = playlistsData.items || [];
    const videoToPlaylistMap: Record<string, string> = {};
    for (const pl of listPlaylists.slice(0, 8)) {
      try {
        const plItemsData = await fetchJson(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${pl.id}&maxResults=50&key=${YOUTUBE_API_KEY}`);
        for (const item of plItemsData.items || []) {
          const vidId = item.contentDetails?.videoId;
          if (vidId) videoToPlaylistMap[vidId] = pl.snippet.title;
        }
      } catch (e) {
        console.warn(`Erreur mapping playlist ${pl.snippet.title}:`, e);
      }
    }
    const sermons = (uploadsData.items || []).map((item: any, index: number) => {
      const vidId = item.snippet.resourceId?.videoId || item.id;
      const title = item.snippet.title || 'Sermon de Grâce';
      const playlistName = videoToPlaylistMap[vidId] || 'Spécial';
      return {
        id: index + 1,
        title,
        series: `Série: ${playlistName}`,
        playlistId: listPlaylists.find((p: any) => p.snippet.title === playlistName)?.id || '',
        date: formatDateStr(item.snippet.publishedAt),
        preacher: parsePreacher(title),
        duration: '45-60 min',
        image: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=800',
        description: item.snippet.description || '',
        youtubeId: vidId
      };
    });
    cacheSermons = { data: sermons, timestamp: Date.now() };
    res.json(sermons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/youtube/video-info', async (req, res) => {
  const { urlOrId } = req.query;
  if (!urlOrId || typeof urlOrId !== 'string') {
    res.status(400).json({ error: 'Paramètre urlOrId manquant' });
    return;
  }
  let videoId = urlOrId.trim();
  if (videoId.length !== 11) {
    const match = videoId.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      res.status(400).json({ error: 'ID YouTube introuvable' });
      return;
    }
  }
  try {
    if (YOUTUBE_API_KEY) {
      try {
        const data = await fetchJson(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`);
        if (data.items?.length > 0) {
          const item = data.items[0];
          const durationRaw = item.contentDetails?.duration || '';
          let duration = '10 min';
          const matchTime = durationRaw.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (matchTime) {
            const [, h, m, s] = matchTime.map((v: string | undefined) => v ? parseInt(v, 10) : 0);
            duration = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m} min` : `${s}s`;
          }
          return res.json({
            id: videoId,
            title: item.snippet.title,
            preacher: item.snippet.channelTitle || 'Chaîne Recommandée',
            duration,
            image: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/0.jpg`,
            description: item.snippet.description || ''
          });
        }
      } catch (err) {
        console.warn('API YouTube officielle échouée, fallback noembed:', err);
      }
    }
    const fbData = await fetchJson(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (fbData?.title) {
      return res.json({ id: videoId, title: fbData.title, preacher: fbData.author_name || 'Chaîne Recommandée', duration: '15 min', image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, description: '' });
    }
    res.json({ id: videoId, title: 'Message de Foi Grâce', preacher: 'Chaîne Recommandée', duration: '15 min', image: `https://img.youtube.com/vi/${videoId}/0.jpg`, description: '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── File upload ───────────────────────────────────────────────────────────────

app.post('/api/upload', requireAdmin, (req, res) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      console.error('Erreur multer:', err);
      return res.status(400).json({ error: `Erreur d'importation : ${err.message || err}` });
    }
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

// ─── Dev / Prod serving ────────────────────────────────────────────────────────

async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

startServer();
