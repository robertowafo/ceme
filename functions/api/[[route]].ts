/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { SignJWT, jwtVerify } from 'jose'
import type { Context, Next } from 'hono'

const SESSION_COOKIE = 'session'

// Cookie « Secure » uniquement en HTTPS (prod) — sinon le dev local en http://
// ne recevrait jamais le cookie de retour.
function isHttps(c: Context<any>): boolean {
  return new URL(c.req.url).protocol === 'https:'
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  BUCKET_URL: string
  JWT_SECRET: string
  ADMIN_EMAIL: string
  YOUTUBE_API_KEY: string
  RATE_LIMIT: KVNamespace
}

type Variables = { user: JwtPayload }

interface JwtPayload {
  sub: string
  email: string
  name: string
  picture: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

type HonoApp = { Bindings: Bindings; Variables: Variables }

// ─── JWT ───────────────────────────────────────────────────────────────────────

async function signSession(payload: JwtPayload, secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret)
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(key)
}

async function verifySession(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const key = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, key)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

// ─── Mots de passe (PBKDF2 via Web Crypto, dispo nativement dans les Workers) ──
// Format stocké : "pbkdf2:<iterations>:<sel base64>:<hash base64>"

async function hashPassword(password: string): Promise<string> {
  const iterations = 100_000
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256)
  const saltB64 = btoa(String.fromCharCode(...salt))
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)))
  return `pbkdf2:${iterations}:${saltB64}:${hashB64}`
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = parseInt(parts[1], 10)
  const salt = Uint8Array.from(atob(parts[2]), ch => ch.charCodeAt(0))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256)
  const computedB64 = btoa(String.fromCharCode(...new Uint8Array(bits)))
  return timingSafeEqual(computedB64, parts[3])
}

// ─── App + middleware ──────────────────────────────────────────────────────────

const app = new Hono<HonoApp>().basePath('/api')

const requireAdmin = async (c: Context<HonoApp>, next: Next) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return c.json({ error: 'Non authentifié' }, 401)
  const payload = await verifySession(token, c.env.JWT_SECRET)
  if (!payload?.isAdmin) return c.json({ error: "Accès réservé à l'administrateur" }, 403)
  c.set('user', payload)
  await next()
}

const requireSuperAdmin = async (c: Context<HonoApp>, next: Next) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return c.json({ error: 'Non authentifié' }, 401)
  const payload = await verifySession(token, c.env.JWT_SECRET)
  if (!payload?.isSuperAdmin) return c.json({ error: 'Accès réservé au super-administrateur' }, 403)
  c.set('user', payload)
  await next()
}

// ─── Contrôle d'accès par section (RBAC) ────────────────────────────────────────
// Chaque admin (hors super-admin) ne peut agir que sur les sections qui lui ont
// été attribuées par le super-admin, stockées en JSON dans `admins.sections`.
// 'audit' (Registre) et 'admins' (Gestion) restent exclusifs au super-admin et
// ne figurent donc PAS ici. Doit rester synchronisé avec le registre SECTIONS
// du frontend (src/pages/Admin.tsx).
const ASSIGNABLE_SECTIONS = [
  'links', 'photos', 'events', 'testimonials', 'documents', 'prayers',
  'donations', 'blog', 'newsletter', 'contactMessages', 'projects', 'partners', 'books',
] as const

// Lit les sections autorisées d'un admin depuis la base — source de vérité,
// toujours à jour (un changement de droits s'applique sans re-login). Renvoie []
// en cas d'erreur (ex. colonne pas encore migrée) plutôt que de casser en 500.
async function getAdminSections(db: D1Database, email: string): Promise<string[]> {
  try {
    const row = await db.prepare('SELECT sections FROM admins WHERE email=?')
      .bind(email.toLowerCase()).first<{ sections: string | null }>()
    if (!row?.sections) return []
    const arr = JSON.parse(row.sections)
    return Array.isArray(arr) ? arr.filter((s: unknown): s is string => typeof s === 'string') : []
  } catch {
    return []
  }
}

// Sections renvoyées au client pour piloter l'affichage de la sidebar.
// Le super-admin les a toutes ; l'affichage de 'audit'/'admins' côté client
// reste piloté par le drapeau isSuperAdmin, pas par cette liste.
function sectionsForUser(isSuperAdmin: boolean, dbSections: string[]): string[] {
  return isSuperAdmin ? [...ASSIGNABLE_SECTIONS] : dbSections
}

// Middleware paramétré : le super-admin passe partout ; sinon la section doit
// figurer dans les droits de l'admin.
const requireSection = (section: string) => async (c: Context<HonoApp>, next: Next) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return c.json({ error: 'Non authentifié' }, 401)
  const payload = await verifySession(token, c.env.JWT_SECRET)
  if (!payload?.isAdmin) return c.json({ error: "Accès réservé à l'administrateur" }, 403)
  c.set('user', payload)
  if (payload.isSuperAdmin) return await next()
  const allowed = await getAdminSections(c.env.DB, payload.email)
  if (!allowed.includes(section)) return c.json({ error: "Vous n'avez pas accès à cette section" }, 403)
  await next()
}

// ─── Limitation de débit (anti-spam formulaires publics) ──────────────────────
// Compteur à fenêtre glissante fixe, stocké dans Workers KV, clé par IP + route.
// Pas parfaitement atomique sous forte concurrence (get+put), mais largement
// suffisant pour bloquer un script qui flood un formulaire public — ce n'est
// pas un rempart anti-DDoS, juste un frein au spam/abus basique.
async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const now = Date.now()
  const raw = await kv.get(key)
  let data = raw ? (JSON.parse(raw) as { count: number; resetAt: number }) : null
  if (!data || now > data.resetAt) {
    data = { count: 0, resetAt: now + windowSeconds * 1000 }
  }
  data.count++
  await kv.put(key, JSON.stringify(data), { expirationTtl: windowSeconds })
  return data.count <= limit
}

function rateLimit(name: string, limit: number, windowSeconds: number) {
  return async (c: Context<HonoApp>, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || 'unknown'
    const allowed = await checkRateLimit(c.env.RATE_LIMIT, `rl:${name}:${ip}`, limit, windowSeconds)
    if (!allowed) {
      return c.json({ error: 'Trop de requêtes envoyées depuis cette adresse. Merci de réessayer un peu plus tard.' }, 429)
    }
    await next()
  }
}

async function audit(
  db: D1Database,
  email: string,
  action: 'Création' | 'Modification' | 'Suppression' | 'Upload',
  section: string,
  itemId: string | null,
  description: string
): Promise<void> {
  const id = 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await db.prepare(
    'INSERT INTO audit_log (id, admin_email, action, section, item_id, description, performed_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(id, email, action, section, itemId ?? null, description, new Date().toISOString()).run()
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

app.post('/auth/google', async (c) => {
  const { accessToken } = await c.req.json()
  if (!accessToken) return c.json({ error: 'accessToken manquant' }, 400)
  try {
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!googleRes.ok) return c.json({ error: 'Token Google invalide' }, 401)
    const info = await googleRes.json() as any
    if (!info.email_verified) return c.json({ error: 'Adresse email Google non vérifiée' }, 403)
    const isSuperAdmin = info.email === c.env.ADMIN_EMAIL
    const isAdminFromDB = !isSuperAdmin
      ? !!(await c.env.DB.prepare('SELECT 1 FROM admins WHERE email=?').bind(info.email).first())
      : false
    const isAdmin = isSuperAdmin || isAdminFromDB
    const token = await signSession(
      { sub: info.sub, email: info.email, name: info.name, picture: info.picture, isAdmin, isSuperAdmin },
      c.env.JWT_SECRET
    )
    // Le JWT ne part plus jamais dans le corps JSON : il vit uniquement dans un
    // cookie HttpOnly, inaccessible au JavaScript (protège contre le vol de
    // session via une éventuelle faille XSS ailleurs sur le site).
    setCookie(c, SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isHttps(c),
      sameSite: 'Strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    const sections = sectionsForUser(isSuperAdmin, isAdminFromDB ? await getAdminSections(c.env.DB, info.email) : [])
    return c.json({ user: { email: info.email, name: info.name, picture: info.picture, isAdmin, isSuperAdmin, sections } })
  } catch {
    return c.json({ error: "Erreur d'authentification" }, 500)
  }
})

app.post('/auth/logout', async (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ success: true })
})

// Connexion email + mot de passe — alternative à Google pour les admins avec un
// email professionnel ou un autre fournisseur. Limité pour freiner le bruteforce.
app.post('/auth/login', rateLimit('auth-login', 10, 10 * 60), async (c) => {
  const { email, password } = await c.req.json()
  if (!email?.trim() || !password) return c.json({ error: 'Email et mot de passe requis' }, 400)
  const normalized = email.trim().toLowerCase()
  const row = await c.env.DB.prepare('SELECT password_hash FROM admins WHERE email=?')
    .bind(normalized).first<{ password_hash: string | null }>()
  if (!row?.password_hash || !(await verifyPassword(password, row.password_hash))) {
    return c.json({ error: 'Identifiants invalides' }, 401)
  }
  const isSuperAdmin = normalized === c.env.ADMIN_EMAIL.toLowerCase()
  const name = normalized.split('@')[0]
  const token = await signSession(
    { sub: normalized, email: normalized, name, picture: '', isAdmin: true, isSuperAdmin },
    c.env.JWT_SECRET
  )
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps(c),
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  const sections = sectionsForUser(isSuperAdmin, isSuperAdmin ? [] : await getAdminSections(c.env.DB, normalized))
  return c.json({ user: { email: normalized, name, picture: '', isAdmin: true, isSuperAdmin, sections } })
})

// Changement de son propre mot de passe. Si aucun mot de passe n'existe encore
// pour ce compte (premier réglage, notamment pour le super-admin qui n'a pas
// forcément de ligne dans `admins`), currentPassword n'est pas requis.
app.put('/auth/password', requireAdmin, async (c) => {
  const { currentPassword, newPassword } = await c.req.json()
  if (!newPassword || newPassword.length < 8) {
    return c.json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' }, 400)
  }
  const email = c.get('user').email.toLowerCase()
  const row = await c.env.DB.prepare('SELECT password_hash FROM admins WHERE email=?')
    .bind(email).first<{ password_hash: string | null }>()
  if (row?.password_hash) {
    if (!currentPassword || !(await verifyPassword(currentPassword, row.password_hash))) {
      return c.json({ error: 'Mot de passe actuel incorrect' }, 403)
    }
  }
  const hash = await hashPassword(newPassword)
  if (row) {
    await c.env.DB.prepare('UPDATE admins SET password_hash=? WHERE email=?').bind(hash, email).run()
  } else {
    await c.env.DB.prepare(
      'INSERT INTO admins (email, added_by, added_at, password_hash) VALUES (?,?,?,?)'
    ).bind(email, 'auto', new Date().toISOString(), hash).run()
  }
  return c.json({ success: true })
})

app.get('/auth/me', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return c.json({ error: 'Non authentifié' }, 401)
  const payload = await verifySession(token, c.env.JWT_SECRET)
  if (!payload) return c.json({ error: 'Session expirée' }, 401)
  const sections = sectionsForUser(payload.isSuperAdmin, payload.isSuperAdmin ? [] : await getAdminSections(c.env.DB, payload.email))
  return c.json({ user: { email: payload.email, name: payload.name, picture: payload.picture, isAdmin: payload.isAdmin, isSuperAdmin: payload.isSuperAdmin, sections } })
})

// D1 peut lever une erreur transitoire au démarrage à froid du Worker
// (« Network connection lost », « internal error ») — sans réessai, ce hoquet
// remonte en 500 brut et l'onglet du dashboard s'affiche vide alors que la
// donnée est intacte. On réexécute la requête quelques fois avec un léger
// backoff avant de laisser remonter une vraie erreur.
async function d1All<T = Record<string, unknown>>(stmt: D1PreparedStatement): Promise<T[]> {
  let lastErr: unknown
  for (let i = 0; i < 3; i++) {
    try {
      const { results } = await stmt.all<T>()
      return results ?? []
    } catch (err) {
      lastErr = err
      if (i < 2) await new Promise(r => setTimeout(r, 150 * (i + 1)))
    }
  }
  throw lastErr
}

// ─── recommended_links ─────────────────────────────────────────────────────────

app.get('/recommended-links', async (c) => {
  const results = await d1All(c.env.DB.prepare(
    'SELECT id, title, youtube_id AS youtubeId, description, category FROM recommended_links ORDER BY id ASC'
  ))
  return c.json(results)
})

app.put('/recommended-links/:id', requireSection('links'), async (c) => {
  const id = c.req.param('id')
  const { title, youtubeId, description, category } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM recommended_links WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO recommended_links (id, title, youtube_id, description, category) VALUES (?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, youtube_id=excluded.youtube_id,
       description=excluded.description, category=excluded.category`
  ).bind(id, title, youtubeId, description ?? null, category).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Vidéos YouTube', id, `${existing ? 'Modification' : 'Ajout'} de la vidéo : "${title}"`)
  return c.json({ success: true })
})

app.delete('/recommended-links/:id', requireSection('links'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT title FROM recommended_links WHERE id=?').bind(id).first<{title:string}>()
  await c.env.DB.prepare('DELETE FROM recommended_links WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Vidéos YouTube', id, `Suppression de la vidéo : "${row?.title ?? id}"`)
  return c.json({ success: true })
})

// ─── gallery_photos ────────────────────────────────────────────────────────────

app.get('/gallery-photos', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, category, title, location, url, note AS desc FROM gallery_photos'
  ).all()
  return c.json(results)
})

app.put('/gallery-photos/:id', requireSection('photos'), async (c) => {
  const id = c.req.param('id')
  const { category, title, location, url, desc } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM gallery_photos WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO gallery_photos (id, category, title, location, url, note) VALUES (?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET category=excluded.category, title=excluded.title,
       location=excluded.location, url=excluded.url, note=excluded.note`
  ).bind(id, category, title, location ?? null, url, desc ?? null).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Galerie Photos', id, `${existing ? 'Modification' : 'Ajout'} photo : "${title}"`)
  return c.json({ success: true })
})

app.delete('/gallery-photos/:id', requireSection('photos'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT title FROM gallery_photos WHERE id=?').bind(id).first<{title:string}>()
  await c.env.DB.prepare('DELETE FROM gallery_photos WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Galerie Photos', id, `Suppression photo : "${row?.title ?? id}"`)
  return c.json({ success: true })
})

// ─── church_events ─────────────────────────────────────────────────────────────

app.get('/church-events', async (c) => {
  const results = await d1All<any>(c.env.DB.prepare(
    `SELECT id, title, type, date_str AS dateStr, iso_date AS isoDate,
            location, preacher, note AS desc, badge, badge_color AS badgeColor,
            image, is_popular AS isPopular
     FROM church_events WHERE iso_date >= date('now') ORDER BY iso_date ASC`
  ))
  return c.json(results.map((r: any) => ({ ...r, isPopular: r.isPopular === 1 })))
})

app.post('/admin/events/cleanup', requireSection('events'), async (c) => {
  const result = await c.env.DB.prepare(
    `DELETE FROM church_events WHERE iso_date < date('now')`
  ).run()
  return c.json({ deleted: result.meta.changes ?? 0 })
})

app.put('/church-events/:id', requireSection('events'), async (c) => {
  const id = c.req.param('id')
  const { title, type, dateStr, isoDate, location, preacher, desc, badge, badgeColor, image, isPopular } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM church_events WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO church_events (id, title, type, date_str, iso_date, location, preacher, note, badge, badge_color, image, is_popular)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, type=excluded.type, date_str=excluded.date_str,
       iso_date=excluded.iso_date, location=excluded.location, preacher=excluded.preacher, note=excluded.note,
       badge=excluded.badge, badge_color=excluded.badge_color, image=excluded.image, is_popular=excluded.is_popular`
  ).bind(id, title, type, dateStr, isoDate, location, preacher ?? null, desc, badge, badgeColor ?? null, image, isPopular ? 1 : 0).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Événements', id, `${existing ? 'Modification' : 'Ajout'} événement : "${title}" (${dateStr})`)
  return c.json({ success: true })
})

app.delete('/church-events/:id', requireSection('events'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT title FROM church_events WHERE id=?').bind(id).first<{title:string}>()
  await c.env.DB.prepare('DELETE FROM church_events WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Événements', id, `Suppression événement : "${row?.title ?? id}"`)
  return c.json({ success: true })
})

// ─── testimonials ──────────────────────────────────────────────────────────────

app.get('/testimonials', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, author, since, text, img, category FROM testimonials'
  ).all()
  return c.json(results)
})

app.put('/testimonials/:id', requireSection('testimonials'), async (c) => {
  const id = c.req.param('id')
  const { author, since, text, img, category } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM testimonials WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO testimonials (id, author, since, text, img, category) VALUES (?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET author=excluded.author, since=excluded.since, text=excluded.text,
       img=excluded.img, category=excluded.category`
  ).bind(id, author, since, text, img ?? null, category).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Témoignages', id, `${existing ? 'Modification' : 'Ajout'} témoignage de : "${author}"`)
  return c.json({ success: true })
})

app.delete('/testimonials/:id', requireSection('testimonials'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT author FROM testimonials WHERE id=?').bind(id).first<{author:string}>()
  await c.env.DB.prepare('DELETE FROM testimonials WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Témoignages', id, `Suppression témoignage de : "${row?.author ?? id}"`)
  return c.json({ success: true })
})

// ─── study_documents ───────────────────────────────────────────────────────────

app.get('/study-documents', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, title, description, url, category, file_type AS fileType FROM study_documents'
  ).all()
  return c.json(results)
})

app.put('/study-documents/:id', requireSection('documents'), async (c) => {
  const id = c.req.param('id')
  const { title, description, url, category, fileType } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM study_documents WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO study_documents (id, title, description, url, category, file_type) VALUES (?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, url=excluded.url,
       category=excluded.category, file_type=excluded.file_type`
  ).bind(id, title, description ?? null, url, category ?? null, fileType).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Documents', id, `${existing ? 'Modification' : 'Ajout'} document : "${title}" (${fileType})`)
  return c.json({ success: true })
})

app.delete('/study-documents/:id', requireSection('documents'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT title FROM study_documents WHERE id=?').bind(id).first<{title:string}>()
  await c.env.DB.prepare('DELETE FROM study_documents WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Documents', id, `Suppression document : "${row?.title ?? id}"`)
  return c.json({ success: true })
})

// ─── document download ─────────────────────────────────────────────────────────

app.get('/documents/download/:id', async (c) => {
  const doc = await c.env.DB.prepare(
    'SELECT title, file_type AS fileType, url FROM study_documents WHERE id=?'
  ).bind(c.req.param('id')).first<{ title: string; fileType: string; url: string }>()
  if (!doc) return c.json({ error: 'Document introuvable' }, 404)

  const filename = `${doc.title}.${doc.fileType.toLowerCase()}`

  // URL externe (Google Drive, etc.) → redirection directe
  if (doc.url.startsWith('http')) {
    return c.redirect(doc.url)
  }

  // Fichier stocké dans R2
  const key = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
  const object = await c.env.BUCKET.get(key)
  if (!object) return c.json({ error: 'Fichier introuvable dans le stockage' }, 404)

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    }
  })
})

// ─── donations ─────────────────────────────────────────────────────────────────

// ─── donation_projects ─────────────────────────────────────────────────────────

app.get('/donation-projects', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.description, p.goal_amount AS goalAmount, p.currency,
            p.is_active AS isActive, p.created_at AS createdAt,
            COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.project_id = p.id), 0) AS raisedAmount
     FROM donation_projects p ORDER BY p.created_at DESC`
  ).all<any>()
  return c.json(results.map((r: any) => ({ ...r, isActive: r.isActive === 1 })))
})

app.put('/donation-projects/:id', requireSection('projects'), async (c) => {
  const id = c.req.param('id')
  const { title, description, goalAmount, currency, isActive } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM donation_projects WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO donation_projects (id, title, description, goal_amount, currency, is_active, created_at)
     VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       title=excluded.title, description=excluded.description,
       goal_amount=excluded.goal_amount, currency=excluded.currency, is_active=excluded.is_active`
  ).bind(id, title, description ?? null, Math.round(Number(goalAmount)), currency || 'FCFA',
         isActive === false ? 0 : 1, new Date().toISOString()).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Projets', id,
    `${existing ? 'Modification' : 'Création'} projet : "${title}"`)
  return c.json({ success: true })
})

app.delete('/donation-projects/:id', requireSection('projects'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT title FROM donation_projects WHERE id=?').bind(id).first<{title:string}>()
  await c.env.DB.prepare('DELETE FROM donation_projects WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Projets', id, `Suppression projet : "${row?.title ?? id}"`)
  return c.json({ success: true })
})

// ─── donations ────────────────────────────────────────────────────────────────

app.post('/donations', rateLimit('donations', 5, 600), async (c) => {
  const { donorName, phone, amount, currency, contribType, paymentMethod, reference, projectId } = await c.req.json()
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return c.json({ error: 'Montant invalide' }, 400)
  }
  const id = 'don_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await c.env.DB.prepare(
    'INSERT INTO donations (id, donor_name, phone, amount, currency, contrib_type, payment_method, reference, project_id, submitted_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).bind(
    id,
    donorName?.trim() || null,
    phone?.trim() || null,
    Math.round(Number(amount)),
    currency || 'FCFA',
    contribType || 'Offrande',
    paymentMethod || 'OM',
    reference || null,
    projectId || null,
    new Date().toISOString()
  ).run()
  return c.json({ success: true, id })
})

// /donations/stats doit être avant /donations pour éviter que 'stats' soit capturé comme :id
app.get('/donations/stats', requireSection('donations'), async (c) => {
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  const [totals, byType, byMethod, monthly] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations')
      .first<{ count: number; total: number }>(),
    c.env.DB.prepare(
      'SELECT contrib_type AS type, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations GROUP BY contrib_type ORDER BY total DESC'
    ).all<{ type: string; count: number; total: number }>(),
    c.env.DB.prepare(
      'SELECT payment_method AS method, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations GROUP BY payment_method'
    ).all<{ method: string; count: number; total: number }>(),
    c.env.DB.prepare(
      `SELECT strftime('%Y-%m', submitted_at) AS month, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total
       FROM donations WHERE submitted_at >= ? GROUP BY month ORDER BY month`
    ).bind(sixMonthsAgo).all<{ month: string; count: number; total: number }>()
  ])
  const thisMonth = new Date().toISOString().slice(0, 7)
  const thisMonthRow = monthly.results.find(r => r.month === thisMonth)
  return c.json({
    totalCount: Number(totals?.count ?? 0),
    totalAmount: Number(totals?.total ?? 0),
    thisMonthAmount: Number(thisMonthRow?.total ?? 0),
    thisMonthCount: Number(thisMonthRow?.count ?? 0),
    byType: byType.results.map(r => ({ type: r.type, count: Number(r.count), total: Number(r.total) })),
    byMethod: byMethod.results.map(r => ({ method: r.method, count: Number(r.count), total: Number(r.total) })),
    monthly: monthly.results.map(r => ({ month: r.month, count: Number(r.count), total: Number(r.total) }))
  })
})

app.get('/donations', requireSection('donations'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT d.id, d.donor_name AS donorName, d.phone, d.amount, d.currency,
            d.contrib_type AS contribType, d.payment_method AS paymentMethod,
            d.reference, d.project_id AS projectId, d.submitted_at AS submittedAt,
            p.title AS projectTitle
     FROM donations d
     LEFT JOIN donation_projects p ON p.id = d.project_id
     ORDER BY d.submitted_at DESC`
  ).all()
  return c.json(results)
})

app.delete('/donations/:id', requireSection('donations'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT donor_name, amount, currency FROM donations WHERE id=?').bind(id).first<{donor_name:string|null,amount:number,currency:string}>()
  await c.env.DB.prepare('DELETE FROM donations WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Dons', id, `Suppression don de ${row?.donor_name ?? 'Anonyme'} : ${row?.amount ?? '?'} ${row?.currency ?? 'FCFA'}`)
  return c.json({ success: true })
})

// ─── prayer_requests ───────────────────────────────────────────────────────────

app.post('/prayer-requests', rateLimit('prayer-requests', 5, 600), async (c) => {
  const { name, phone, message, type, isPublic } = await c.req.json()
  if (!message?.trim()) return c.json({ error: 'Le message est requis' }, 400)
  const id = 'prq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await c.env.DB.prepare(
    'INSERT INTO prayer_requests (id, name, phone, message, type, is_public, submitted_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(
    id,
    name?.trim() || null,
    phone?.trim() || null,
    message.trim(),
    type === 'testimony' ? 'testimony' : 'prayer',
    isPublic !== false ? 1 : 0,
    new Date().toISOString()
  ).run()
  return c.json({ success: true, id })
})

app.get('/prayer-requests/public', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, message, type, submitted_at AS submittedAt
     FROM prayer_requests WHERE is_public = 1 ORDER BY submitted_at DESC LIMIT 50`
  ).all()
  return c.json(results)
})

app.get('/prayer-requests', requireSection('prayers'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, phone, message, type, is_public AS isPublic, submitted_at AS submittedAt
     FROM prayer_requests ORDER BY submitted_at DESC`
  ).all<any>()
  return c.json(results.map((r: any) => ({ ...r, isPublic: r.isPublic === 1 })))
})

app.delete('/prayer-requests/:id', requireSection('prayers'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT name, type FROM prayer_requests WHERE id=?').bind(id).first<{name:string|null,type:string}>()
  await c.env.DB.prepare('DELETE FROM prayer_requests WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Requêtes de Prière', id, `Suppression ${row?.type === 'testimony' ? 'témoignage' : 'prière'} de : "${row?.name ?? 'Anonyme'}"`)
  return c.json({ success: true })
})

// ─── Upload (Cloudflare R2) ────────────────────────────────────────────────────

// Types acceptés : images (galerie/couvertures/avatars) + documents d'étude.
// Aucun HTML/SVG/exécutable — l'attribut "accept" des <input> est un simple
// filtre côté client, la vraie validation doit se faire côté serveur.
const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/epub+zip': 'epub',
}

app.post('/upload', requireAdmin, async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  if (!file) return c.json({ error: 'Aucun fichier fourni' }, 400)
  if (file.size > 20 * 1024 * 1024) return c.json({ error: 'Fichier trop lourd (20 Mo max)' }, 400)

  const ext = ALLOWED_UPLOAD_TYPES[file.type]
  if (!ext) return c.json({ error: 'Type de fichier non autorisé' }, 400)

  const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`

  await c.env.BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' }
  })

  const url = `${c.env.BUCKET_URL}/${key}`
  await audit(c.env.DB, c.get('user').email, 'Upload', 'Fichiers', key, `Upload fichier : "${file.name}" (${(file.size / 1024).toFixed(1)} Ko)`)
  return c.json({ url })
})

// ─── YouTube ───────────────────────────────────────────────────────────────────

const CACHE_TTL = 15 * 60
const CHANNEL_HANDLE = '@gracetelevision-hc4tv'

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function resolveChannelId(apiKey: string): Promise<{ channelId: string; uploadsPlaylistId: string }> {
  const cache = caches.default
  const cacheKey = new Request('https://internal-cache.dev/yt-channel-id')
  const cached = await cache.match(cacheKey)
  if (cached) return cached.json()

  let channelId: string | null = null
  let uploadsPlaylistId: string | null = null

  try {
    const data = await fetchJson(
      `https://www.googleapis.com/youtube/v3/channels?part=id,contentDetails&forHandle=${encodeURIComponent(CHANNEL_HANDLE)}&key=${apiKey}`
    )
    if (data.items?.length > 0) {
      channelId = data.items[0].id
      uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads
    }
  } catch {}

  if (!channelId) {
    const searchData = await fetchJson(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(CHANNEL_HANDLE)}&type=channel&maxResults=1&key=${apiKey}`
    )
    if (searchData.items?.length > 0) {
      const cid = searchData.items[0].id.channelId
      const chanData = await fetchJson(
        `https://www.googleapis.com/youtube/v3/channels?part=id,contentDetails&id=${cid}&key=${apiKey}`
      )
      if (chanData.items?.length > 0) {
        channelId = chanData.items[0].id
        uploadsPlaylistId = chanData.items[0].contentDetails.relatedPlaylists.uploads
      }
    }
  }

  if (!channelId || !uploadsPlaylistId) throw new Error('Impossible de résoudre le channel YouTube')

  const result = { channelId, uploadsPlaylistId }
  await cache.put(cacheKey, new Response(JSON.stringify(result), {
    headers: { 'Cache-Control': `max-age=${CACHE_TTL}`, 'Content-Type': 'application/json' }
  }))
  return result
}

function parsePreacher(title: string): string {
  const t = title.toUpperCase()
  if (t.includes('MARIE CHARLOTTE') || t.includes('MAMAN MARIE') || t.includes('M.C. ESSOMBA')) {
    return 'Maman Marie Charlotte ESSOMBA'
  }
  return 'Rev. Dr. Alphonse ESSOMBA'
}

function formatDateStr(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    const months = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return 'Récemment'
  }
}

app.get('/youtube/live', async (c) => {
  const apiKey = c.env.YOUTUBE_API_KEY
  if (!apiKey) return c.json({ isLive: false, videoId: null })

  const cache = caches.default
  const cacheKey = new Request('https://internal-cache.dev/yt-live')
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  try {
    const { channelId } = await resolveChannelId(apiKey)
    const data = await fetchJson(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`
    )
    let result: any
    if (data.items?.length > 0) {
      const item = data.items[0]
      result = { isLive: true, videoId: item.id.videoId, title: item.snippet.title, channelId }
    } else {
      const recentData = await fetchJson(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=1&key=${apiKey}`
      )
      const item = recentData.items?.[0]
      result = item
        ? { isLive: false, videoId: item.id.videoId, title: item.snippet.title, description: item.snippet.description, publishedAt: item.snippet.publishedAt, channelId }
        : { isLive: false, videoId: null, channelId }
    }
    // TTL court : reste réactif si un direct démarre, tout en évitant de
    // ré-interroger l'API YouTube (2-3 appels en cascade) à chaque visite.
    const response = new Response(JSON.stringify(result), {
      headers: { 'Cache-Control': 'max-age=45', 'Content-Type': 'application/json' }
    })
    await cache.put(cacheKey, response.clone())
    return response
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

app.get('/youtube/playlists', async (c) => {
  const apiKey = c.env.YOUTUBE_API_KEY
  if (!apiKey) return c.json([])
  const cache = caches.default
  const cacheKey = new Request('https://internal-cache.dev/yt-playlists')
  const cached = await cache.match(cacheKey)
  if (cached) return cached
  try {
    const { channelId } = await resolveChannelId(apiKey)
    const data = await fetchJson(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&key=${apiKey}`
    )
    const result = (data.items || []).map((item: any) => ({
      id: item.id, title: item.snippet.title, description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
      videoCount: item.contentDetails?.itemCount || 0
    }))
    const response = new Response(JSON.stringify(result), {
      headers: { 'Cache-Control': `max-age=${CACHE_TTL}`, 'Content-Type': 'application/json' }
    })
    await cache.put(cacheKey, response.clone())
    return response
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// ─── Émissions curées (programmes) ──────────────────────────────────────────────
// Présentation soignée (image 16:9 + description + type), reliée à sa playlist
// YouTube par mots-clés. Source UNIQUE pour le site ET l'app mobile.
const PROGRAMS = [
  { id: 'culte-du-dimanche', title: 'Culte du Dimanche', category: 'Cultes & Célébrations', image: '/uploads/culte-du-dimanche-16x9.jpg',
    description: "Le rassemblement principal de la semaine : adoration, louange et prédication de la Parole, retransmis en direct.", keywords: ['culte', 'dimanche'] },
  { id: 'manne-matinale', title: 'Manne Matinale', category: 'Dévotion quotidienne', image: '/uploads/manne-matinale-16x9.jpg',
    description: "Le rendez-vous quotidien pour commencer la journée nourri de la Parole de Dieu, où que vous soyez.", keywords: ['manne', 'matinale'] },
  { id: 'sommet-elevation', title: "Sommet d'Élévation", category: 'Conférences & Rassemblements', image: '/uploads/sommet-delevation-16x9.jpg',
    description: "Un grand rassemblement d'élévation spirituelle, de délivrance et d'enseignement de haut niveau.", keywords: ['sommet', 'élévation', 'elevation'] },
  { id: 'ecole-affaires-royaume', title: 'École des Affaires du Royaume', category: 'Enseignements', image: '/uploads/ecole-des-affaires-du-royaume-16x9.jpg',
    description: "Sagesse entrepreneuriale et leadership selon les principes bibliques, pour impacter le monde des affaires.", keywords: ['affaires', 'royaume', 'école', 'ecole'] },
  { id: 'prieres-intercession', title: "Prières d'Intercession", category: 'Prière & Intercession', image: '/uploads/prieres-intercession-16x9.jpg',
    description: "Des temps d'intercession et de combat spirituel où l'Éternel intervient dans les situations impossibles.", keywords: ['prière', 'priere', 'intercession'] },
  { id: 'temoignage-gloire', title: 'Témoignage pour la Gloire de Dieu', category: 'Témoignages', image: '/uploads/temoignage-pour-la-gloire-de-dieu-16x9.jpg',
    description: "Des vies transformées qui rendent gloire à Dieu et fortifient la foi de toute la communauté.", keywords: ['témoignage', 'temoignage', 'gloire'] },
]

function normalizeStr(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

app.get('/programs', async (c) => {
  const origin = new URL(c.req.url).origin
  const apiKey = c.env.YOUTUBE_API_KEY
  let playlists: Array<{ id: string; title: string; videoCount: number }> = []
  if (apiKey) {
    try {
      const cache = caches.default
      const cached = await cache.match(new Request('https://internal-cache.dev/yt-playlists'))
      if (cached) {
        playlists = await cached.json()
      } else {
        const { channelId } = await resolveChannelId(apiKey)
        const data = await fetchJson(
          `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&key=${apiKey}`
        )
        playlists = (data.items || []).map((item: any) => ({
          id: item.id, title: item.snippet.title, videoCount: item.contentDetails?.itemCount || 0,
        }))
      }
    } catch {
      playlists = []
    }
  }
  const result = PROGRAMS.map((p) => {
    const match = playlists.find((pl) => {
      const t = normalizeStr(pl.title)
      return p.keywords.some((k) => t.includes(normalizeStr(k)))
    })
    return {
      id: p.id, title: p.title, category: p.category, description: p.description,
      image: `${origin}${p.image}`,
      playlistId: match?.id ?? null,
      videoCount: match?.videoCount ?? 0,
    }
  })
  return c.json(result)
})

app.get('/youtube/sermons', async (c) => {
  const apiKey = c.env.YOUTUBE_API_KEY
  if (!apiKey) return c.json([])
  const cache = caches.default
  const cacheKey = new Request('https://internal-cache.dev/yt-sermons')
  const cached = await cache.match(cacheKey)
  if (cached) return cached
  try {
    const { uploadsPlaylistId, channelId } = await resolveChannelId(apiKey)
    const [uploadsData, playlistsData] = await Promise.all([
      fetchJson(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`),
      fetchJson(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=25&key=${apiKey}`)
    ])
    const listPlaylists = playlistsData.items || []
    const videoToPlaylistMap: Record<string, string> = {}
    const playlistItemResults = await Promise.all(
      listPlaylists.slice(0, 8).map((pl: any) =>
        fetchJson(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${pl.id}&maxResults=50&key=${apiKey}`)
          .then(plItems => ({ pl, plItems }))
          .catch(() => null)
      )
    )
    for (const entry of playlistItemResults) {
      if (!entry) continue
      for (const item of entry.plItems.items || []) {
        const vidId = item.contentDetails?.videoId
        if (vidId) videoToPlaylistMap[vidId] = entry.pl.snippet.title
      }
    }
    const sermons = (uploadsData.items || []).map((item: any, index: number) => {
      const vidId = item.snippet.resourceId?.videoId || item.id
      const title = item.snippet.title || 'Sermon de Grâce'
      const playlistName = videoToPlaylistMap[vidId] || 'Spécial'
      return {
        id: index + 1, title,
        series: `Série: ${playlistName}`,
        playlistId: listPlaylists.find((p: any) => p.snippet.title === playlistName)?.id || '',
        date: formatDateStr(item.snippet.publishedAt),
        preacher: parsePreacher(title),
        duration: '45-60 min',
        image: item.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
        description: item.snippet.description || '',
        youtubeId: vidId
      }
    })
    const response = new Response(JSON.stringify(sermons), {
      headers: { 'Cache-Control': `max-age=${CACHE_TTL}`, 'Content-Type': 'application/json' }
    })
    await cache.put(cacheKey, response.clone())
    return response
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

app.get('/youtube/video-info', async (c) => {
  let videoId = (c.req.query('urlOrId') || '').trim()
  if (!videoId) return c.json({ error: 'Paramètre urlOrId manquant' }, 400)
  const apiKey = c.env.YOUTUBE_API_KEY

  // Playlist ? (URL contenant list=… ou ID brut PL/UU/FL/OL…)
  const listMatch = videoId.match(/[?&]list=([\w-]+)/)
  const playlistId = listMatch ? listMatch[1] : (/^(PL|UU|FL|OL)[\w-]{10,}$/.test(videoId) ? videoId : null)
  if (playlistId) {
    if (!apiKey) return c.json({ error: 'Clé API YouTube absente' }, 500)
    try {
      const data = await fetchJson(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`
      )
      const item = data.items?.[0]
      if (!item) return c.json({ error: 'Playlist introuvable' }, 404)
      return c.json({
        id: playlistId, isPlaylist: true,
        title: item.snippet.title, preacher: item.snippet.channelTitle,
        duration: `${item.contentDetails?.itemCount || 0} vidéos`,
        image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        description: item.snippet.description || ''
      })
    } catch (err: any) {
      return c.json({ error: err.message }, 500)
    }
  }

  if (videoId.length !== 11) {
    const match = videoId.match(/^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*)/)
    if (match?.[2]?.length === 11) videoId = match[2]
    else return c.json({ error: 'ID YouTube introuvable' }, 400)
  }
  try {
    if (apiKey) {
      const data = await fetchJson(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
      )
      if (data.items?.length > 0) {
        const item = data.items[0]
        const m = (item.contentDetails?.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
        const [, h, min, s] = (m || []).map((v: any) => (v ? parseInt(v) : 0))
        const duration = h > 0 ? `${h}h ${min}m` : min > 0 ? `${min} min` : `${s}s`
        return c.json({
          id: videoId, title: item.snippet.title, preacher: item.snippet.channelTitle,
          duration, image: item.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/0.jpg`,
          description: item.snippet.description || ''
        })
      }
    }
    const fb = await fetchJson(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
    return c.json({
      id: videoId, title: fb.title || 'Message', preacher: fb.author_name || 'Chaîne',
      duration: '15 min', image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, description: ''
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// ─── blog_categories ───────────────────────────────────────────────────────────

app.get('/blog-categories', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, name FROM blog_categories ORDER BY name ASC'
  ).all()
  return c.json(results)
})

app.put('/blog-categories/:id', requireSection('blog'), async (c) => {
  const id = c.req.param('id')
  const { name } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM blog_categories WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO blog_categories (id, name) VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name`
  ).bind(id, name).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Catégories Blog', id, `${existing ? 'Modification' : 'Création'} catégorie : "${name}"`)
  return c.json({ success: true })
})

app.delete('/blog-categories/:id', requireSection('blog'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT name FROM blog_categories WHERE id=?').bind(id).first<{name:string}>()
  await c.env.DB.prepare('DELETE FROM blog_categories WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Catégories Blog', id, `Suppression catégorie : "${row?.name ?? id}"`)
  return c.json({ success: true })
})

// ─── blog_posts ────────────────────────────────────────────────────────────────

app.get('/blog-posts/all', requireSection('blog'), async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, title, category, author, cover_image AS coverImage, excerpt, content, published_at AS publishedAt, is_published AS isPublished FROM blog_posts ORDER BY published_at DESC'
  ).all()
  return c.json(results.map((r: any) => ({ ...r, isPublished: r.isPublished === 1 })))
})

app.get('/blog-posts/:id', async (c) => {
  const row = await c.env.DB.prepare(
    'SELECT id, title, category, author, cover_image AS coverImage, excerpt, content, published_at AS publishedAt, is_published AS isPublished FROM blog_posts WHERE id=? AND is_published=1'
  ).bind(c.req.param('id')).first() as any
  if (!row) return c.json({ error: 'Article introuvable' }, 404)
  return c.json({ ...row, isPublished: row.isPublished === 1 })
})

app.get('/blog-posts', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, title, category, author, cover_image AS coverImage, excerpt, published_at AS publishedAt FROM blog_posts WHERE is_published=1 ORDER BY published_at DESC'
  ).all()
  return c.json(results)
})

app.put('/blog-posts/:id', requireSection('blog'), async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json() as any
  const existing = await c.env.DB.prepare('SELECT id FROM blog_posts WHERE id=?').bind(id).first()
  await c.env.DB.prepare(`
    INSERT INTO blog_posts (id, title, category, author, cover_image, excerpt, content, published_at, is_published)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title, category=excluded.category, author=excluded.author,
      cover_image=excluded.cover_image, excerpt=excluded.excerpt, content=excluded.content,
      published_at=excluded.published_at, is_published=excluded.is_published
  `).bind(id, data.title, data.category, data.author, data.coverImage ?? null,
           data.excerpt ?? null, data.content, data.publishedAt, data.isPublished ? 1 : 0).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Articles Blog', id, `${existing ? 'Modification' : 'Création'} article : "${data.title}"`)
  return c.json({ success: true })
})

app.delete('/blog-posts/:id', requireSection('blog'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT title FROM blog_posts WHERE id=?').bind(id).first<{title:string}>()
  await c.env.DB.prepare('DELETE FROM blog_posts WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Articles Blog', id, `Suppression article : "${row?.title ?? id}"`)
  return c.json({ success: true })
})

// ─── newsletter_subscribers ────────────────────────────────────────────────────

app.post('/newsletter', rateLimit('newsletter', 5, 600), async (c) => {
  const { email } = await c.req.json()
  if (!email?.trim() || !email.includes('@')) return c.json({ error: 'Adresse email invalide' }, 400)
  const id = 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  try {
    await c.env.DB.prepare(
      'INSERT INTO newsletter_subscribers (id, email, subscribed_at) VALUES (?,?,?)'
    ).bind(id, email.trim().toLowerCase(), new Date().toISOString()).run()
  } catch (e: any) {
    if (e?.message?.includes('UNIQUE') || e?.message?.includes('unique')) {
      return c.json({ error: 'Cette adresse email est déjà abonnée.' }, 409)
    }
    throw e
  }
  return c.json({ success: true })
})

app.get('/newsletter', requireSection('newsletter'), async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, email, subscribed_at AS subscribedAt FROM newsletter_subscribers ORDER BY subscribed_at DESC'
  ).all()
  return c.json(results)
})

app.delete('/newsletter/:id', requireSection('newsletter'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT email FROM newsletter_subscribers WHERE id=?').bind(id).first<{email:string}>()
  await c.env.DB.prepare('DELETE FROM newsletter_subscribers WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Newsletter', id, `Désinscription email : "${row?.email ?? id}"`)
  return c.json({ success: true })
})

// ─── admins ────────────────────────────────────────────────────────────────────

// Filtre une liste de sections reçue du client : ne garde que des clés valides.
function sanitizeSections(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  const valid = ASSIGNABLE_SECTIONS as readonly string[]
  return [...new Set(input.filter((s): s is string => typeof s === 'string' && valid.includes(s)))]
}

app.get('/admins', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT email, added_by AS addedBy, added_at AS addedAt, sections, (password_hash IS NOT NULL) AS hasPassword FROM admins ORDER BY added_at DESC'
  ).all<any>()
  return c.json(results.map((r: any) => {
    let sections: string[] = []
    try { const a = JSON.parse(r.sections || '[]'); if (Array.isArray(a)) sections = a } catch { /* colonne absente ou JSON invalide → aucun accès */ }
    return { email: r.email, addedBy: r.addedBy, addedAt: r.addedAt, hasPassword: r.hasPassword, sections }
  }))
})

app.post('/admins', requireSuperAdmin, async (c) => {
  const { email, password, sections } = await c.req.json()
  if (!email?.trim() || !email.includes('@')) return c.json({ error: 'Email invalide' }, 400)
  if (password && password.length < 8) {
    return c.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400)
  }
  const normalized = email.trim().toLowerCase()
  if (normalized === c.env.ADMIN_EMAIL.toLowerCase()) return c.json({ error: 'Cet email est déjà le super-administrateur' }, 409)
  const hash = password ? await hashPassword(password) : null
  const cleanSections = sanitizeSections(sections)
  try {
    await c.env.DB.prepare(
      'INSERT INTO admins (email, added_by, added_at, password_hash, sections) VALUES (?,?,?,?,?)'
    ).bind(normalized, c.get('user').email, new Date().toISOString(), hash, JSON.stringify(cleanSections)).run()
  } catch (e: any) {
    if (e?.message?.includes('UNIQUE') || e?.message?.includes('unique')) {
      return c.json({ error: 'Cet email est déjà administrateur' }, 409)
    }
    throw e
  }
  await audit(c.env.DB, c.get('user').email, 'Création', 'Administrateurs', normalized, `Ajout administrateur : "${normalized}" (${cleanSections.length ? cleanSections.join(', ') : 'aucun accès'})`)
  return c.json({ success: true })
})

// Le super-admin (re)définit les sections accessibles à un admin.
app.put('/admins/:email/sections', requireSuperAdmin, async (c) => {
  const email = decodeURIComponent(c.req.param('email')).trim().toLowerCase()
  const { sections } = await c.req.json()
  if (email === c.env.ADMIN_EMAIL.toLowerCase()) return c.json({ error: 'Le super-administrateur a déjà accès à tout' }, 400)
  const existing = await c.env.DB.prepare('SELECT 1 FROM admins WHERE email=?').bind(email).first()
  if (!existing) return c.json({ error: 'Administrateur introuvable' }, 404)
  const clean = sanitizeSections(sections)
  await c.env.DB.prepare('UPDATE admins SET sections=? WHERE email=?').bind(JSON.stringify(clean), email).run()
  await audit(c.env.DB, c.get('user').email, 'Modification', 'Administrateurs', email, `Droits mis à jour pour "${email}" : ${clean.length ? clean.join(', ') : 'aucun accès'}`)
  return c.json({ success: true, sections: clean })
})

app.delete('/admins/:email', requireSuperAdmin, async (c) => {
  const email = decodeURIComponent(c.req.param('email'))
  await c.env.DB.prepare('DELETE FROM admins WHERE email=?').bind(email).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Administrateurs', email, `Révocation administrateur : "${email}"`)
  return c.json({ success: true })
})

// Le super-admin définit/réinitialise le mot de passe d'un admin (y compris le
// sien — son email n'a pas forcément de ligne dans `admins`, d'où l'upsert).
app.put('/admins/:email/password', requireSuperAdmin, async (c) => {
  const email = decodeURIComponent(c.req.param('email')).trim().toLowerCase()
  const { password } = await c.req.json()
  if (!password || password.length < 8) {
    return c.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400)
  }
  const isSelf = email === c.env.ADMIN_EMAIL.toLowerCase()
  const existing = await c.env.DB.prepare('SELECT 1 FROM admins WHERE email=?').bind(email).first()
  if (!existing && !isSelf) return c.json({ error: 'Administrateur introuvable' }, 404)
  const hash = await hashPassword(password)
  if (existing) {
    await c.env.DB.prepare('UPDATE admins SET password_hash=? WHERE email=?').bind(hash, email).run()
  } else {
    await c.env.DB.prepare(
      'INSERT INTO admins (email, added_by, added_at, password_hash) VALUES (?,?,?,?)'
    ).bind(email, c.get('user').email, new Date().toISOString(), hash).run()
  }
  await audit(c.env.DB, c.get('user').email, 'Modification', 'Administrateurs', email, `Mot de passe défini pour : "${email}"`)
  return c.json({ success: true })
})

// ─── audit_log ─────────────────────────────────────────────────────────────────

app.get('/audit-log', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, admin_email AS adminEmail, action, section, item_id AS itemId,
            description, performed_at AS performedAt
     FROM audit_log ORDER BY performed_at DESC LIMIT 500`
  ).all()
  return c.json(results)
})

// ─── partners ─────────────────────────────────────────────────────────────────

app.get('/partners', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, first_name AS firstName, last_name AS lastName, title, church, location, bio,
            youtube_url AS youtubeUrl, website, avatar_url AS avatarUrl, created_at AS createdAt
     FROM partners ORDER BY created_at ASC`
  ).all()
  return c.json(results)
})

app.put('/partners/:id', requireSection('partners'), async (c) => {
  const id = c.req.param('id')
  const { firstName, lastName, title, church, location, bio, youtubeUrl, website, avatarUrl } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM partners WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO partners (id, first_name, last_name, title, church, location, bio, youtube_url, website, avatar_url, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       first_name=excluded.first_name, last_name=excluded.last_name, title=excluded.title,
       church=excluded.church, location=excluded.location, bio=excluded.bio,
       youtube_url=excluded.youtube_url, website=excluded.website, avatar_url=excluded.avatar_url`
  ).bind(id, firstName, lastName, title ?? null, church ?? null, location ?? null, bio ?? null, youtubeUrl, website ?? null, avatarUrl ?? null).run()
  const fullName = [title, firstName, lastName].filter(Boolean).join(' ')
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Partenaires', id, `${existing ? 'Modification' : 'Ajout'} partenaire : "${fullName}"`)
  return c.json({ success: true })
})

app.delete('/partners/:id', requireSection('partners'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT first_name, last_name FROM partners WHERE id=?').bind(id).first<{first_name:string, last_name:string}>()
  await c.env.DB.prepare('DELETE FROM partners WHERE id=?').bind(id).run()
  const name = row ? `${row.first_name} ${row.last_name}` : id
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Partenaires', id, `Suppression partenaire : "${name}"`)
  return c.json({ success: true })
})

// ─── library_books ──────────────────────────────────────────────────────────────

app.get('/library-books', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, author, category, description, created_at AS createdAt
     FROM library_books ORDER BY created_at ASC`
  ).all()
  return c.json(results)
})

app.put('/library-books/:id', requireSection('books'), async (c) => {
  const id = c.req.param('id')
  const { title, author, category, description } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM library_books WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO library_books (id, title, author, category, description, created_at)
     VALUES (?,?,?,?,?,datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       title=excluded.title, author=excluded.author, category=excluded.category, description=excluded.description`
  ).bind(id, title, author, category ?? null, description ?? null).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Bibliothèque', id, `${existing ? 'Modification' : 'Ajout'} ouvrage : "${title}"`)
  return c.json({ success: true })
})

app.delete('/library-books/:id', requireSection('books'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT title FROM library_books WHERE id=?').bind(id).first<{title:string}>()
  await c.env.DB.prepare('DELETE FROM library_books WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Bibliothèque', id, `Suppression ouvrage : "${row?.title ?? id}"`)
  return c.json({ success: true })
})

// ─── book_orders ────────────────────────────────────────────────────────────────

app.post('/book-orders', rateLimit('book-orders', 5, 600), async (c) => {
  const { bookId, bookTitle, name, phone, email } = await c.req.json()
  if (!bookTitle?.trim() || !name?.trim()) return c.json({ error: 'Nom et ouvrage requis' }, 400)
  const id = 'bko_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await c.env.DB.prepare(
    'INSERT INTO book_orders (id, book_id, book_title, name, phone, email, submitted_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(id, bookId ?? null, bookTitle.trim(), name.trim(), phone?.trim() || null, email?.trim() || null, new Date().toISOString()).run()
  return c.json({ success: true, id })
})

app.get('/book-orders', requireSection('books'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, book_id AS bookId, book_title AS bookTitle, name, phone, email, submitted_at AS submittedAt
     FROM book_orders ORDER BY submitted_at DESC`
  ).all()
  return c.json(results)
})

app.delete('/book-orders/:id', requireSection('books'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT name, book_title FROM book_orders WHERE id=?').bind(id).first<{name:string,book_title:string}>()
  await c.env.DB.prepare('DELETE FROM book_orders WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Commandes Livres', id, `Suppression commande de "${row?.book_title ?? '?'}" par ${row?.name ?? id}`)
  return c.json({ success: true })
})

// ─── contact_messages ───────────────────────────────────────────────────────────

app.post('/contact-messages', rateLimit('contact-messages', 5, 600), async (c) => {
  const { name, email, phone, subject, message } = await c.req.json()
  if (!name?.trim() || !email?.trim() || !message?.trim()) return c.json({ error: 'Nom, email et message sont requis' }, 400)
  const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await c.env.DB.prepare(
    'INSERT INTO contact_messages (id, name, email, phone, subject, message, submitted_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(id, name.trim(), email.trim(), phone?.trim() || null, subject?.trim() || null, message.trim(), new Date().toISOString()).run()
  return c.json({ success: true, id })
})

app.get('/contact-messages', requireSection('contactMessages'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, email, phone, subject, message, submitted_at AS submittedAt
     FROM contact_messages ORDER BY submitted_at DESC`
  ).all()
  return c.json(results)
})

app.delete('/contact-messages/:id', requireSection('contactMessages'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT name FROM contact_messages WHERE id=?').bind(id).first<{name:string}>()
  await c.env.DB.prepare('DELETE FROM contact_messages WHERE id=?').bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Messages Contact', id, `Suppression message de : "${row?.name ?? id}"`)
  return c.json({ success: true })
})

// ─── youtube/channel-playlists ────────────────────────────────────────────────

app.get('/youtube/channel-playlists', async (c) => {
  const channelUrl = c.req.query('channelUrl') || ''
  const apiKey = c.env.YOUTUBE_API_KEY
  if (!channelUrl || !apiKey) return c.json([])

  const cache = caches.default
  const cacheKey = new Request(`https://internal-cache.dev/yt-ch-pls-${encodeURIComponent(channelUrl)}`)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  try {
    let channelId = ''
    const urlObj = new URL(channelUrl)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)

    if (pathParts[0] === 'channel' && pathParts[1]) {
      channelId = pathParts[1]
    } else {
      let handle = ''
      if (pathParts[0]?.startsWith('@')) {
        handle = pathParts[0].slice(1)
      } else if (pathParts[0] === 'c' && pathParts[1]) {
        handle = pathParts[1]
      } else if (pathParts[0]) {
        handle = pathParts[0]
      }
      if (handle) {
        const data = await fetchJson(
          `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`
        )
        channelId = data.items?.[0]?.id || ''
        if (!channelId) {
          const sd = await fetchJson(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handle)}&type=channel&maxResults=1&key=${apiKey}`
          )
          const cid = sd.items?.[0]?.id?.channelId
          if (cid) channelId = cid
        }
      }
    }

    if (!channelId) return c.json([])

    const data = await fetchJson(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&key=${apiKey}`
    )
    const result = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
      videoCount: item.contentDetails?.itemCount ?? 0,
    }))

    const response = new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${CACHE_TTL}` },
    })
    await cache.put(cacheKey, response.clone())
    return response
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// ─── admin counts (all tabs in one query) ──────────────────────────────────────

app.get('/admin/counts', requireAdmin, async (c) => {
  const [links, photos, events, testimonials, documents, prayers, donations, blog, newsletter, projects, auditLog, partners, books, bookOrders, contactMessages] =
    await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM recommended_links').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM gallery_photos').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM church_events').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM testimonials').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM study_documents').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM prayer_requests').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM donations').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM blog_posts').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM newsletter_subscribers').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM donation_projects').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM audit_log').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM partners').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM library_books').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM book_orders').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM contact_messages').first<{n:number}>(),
    ])
  return c.json({
    links:        Number(links?.n        ?? 0),
    photos:       Number(photos?.n       ?? 0),
    events:       Number(events?.n       ?? 0),
    testimonials: Number(testimonials?.n ?? 0),
    documents:    Number(documents?.n    ?? 0),
    prayers:      Number(prayers?.n      ?? 0),
    donations:    Number(donations?.n    ?? 0),
    blog:         Number(blog?.n         ?? 0),
    newsletter:   Number(newsletter?.n   ?? 0),
    projects:     Number(projects?.n     ?? 0),
    audit:        Number(auditLog?.n     ?? 0),
    partners:     Number(partners?.n     ?? 0),
    books:        Number(books?.n        ?? 0),
    bookOrders:   Number(bookOrders?.n   ?? 0),
    contactMessages: Number(contactMessages?.n ?? 0),
  })
})

export const onRequest = handle(app)
