/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { SignJWT, jwtVerify } from 'jose'
import type { Context, Next } from 'hono'
import { ValidationError, str, reqStr, oneOf, posInt, url as optUrl, email as vEmail, matchesMagicBytes } from '../_lib/validate'

const SESSION_COOKIE = 'session'
// Session courte : le JWT n'est pas révocable, on limite donc sa durée de vie.
const SESSION_SECONDS = 60 * 60 * 24

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
  // Client id OAuth Google : sert à vérifier l'audience des jetons de connexion.
  // En prod, VITE_GOOGLE_CLIENT_ID (variable Pages) est aussi lisible ici.
  GOOGLE_CLIENT_ID?: string
  VITE_GOOGLE_CLIENT_ID?: string
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
    .setExpirationTime('1d')
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

let dummyHashCache: string | null = null
async function dummyHash(): Promise<string> {
  return (dummyHashCache ??= await hashPassword('dummy-password-for-timing'))
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

// Erreurs de validation → 400 lisible ; tout le reste → 500 générique (le détail
// part dans les logs, jamais dans la réponse).
app.onError((err, c) => {
  if (err instanceof ValidationError) return c.json({ error: err.message }, 400)
  if (err instanceof SyntaxError) return c.json({ error: 'Corps de requête invalide' }, 400)
  console.error(err)
  return c.json({ error: 'Erreur interne du serveur' }, 500)
})

const normEmail = (e: string | undefined | null) => (e ?? '').trim().toLowerCase()

// Vérifie le cookie de session ET que le compte est toujours autorisé : le JWT
// seul n'est pas révocable, donc un admin supprimé de la table `admins` perdrait
// sinon l'accès seulement à l'expiration du jeton. Le super-admin est déterminé
// par ADMIN_EMAIL (secret serveur), pas uniquement par la revendication du JWT.
async function authenticate(c: Context<HonoApp>): Promise<
  { payload: JwtPayload; isSuper: boolean } | { res: Response }
> {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return { res: c.json({ error: 'Non authentifié' }, 401) }
  const payload = await verifySession(token, c.env.JWT_SECRET)
  if (!payload) return { res: c.json({ error: 'Session expirée' }, 401) }
  const isSuper = !!payload.isSuperAdmin && normEmail(payload.email) === normEmail(c.env.ADMIN_EMAIL)
  if (!isSuper) {
    const row = payload.isAdmin
      ? await c.env.DB.prepare('SELECT 1 FROM admins WHERE email=?').bind(normEmail(payload.email)).first()
      : null
    if (!row) return { res: c.json({ error: "Accès réservé à l'administrateur" }, 403) }
  }
  return { payload, isSuper }
}

const requireAdmin = async (c: Context<HonoApp>, next: Next) => {
  const auth = await authenticate(c)
  if ('res' in auth) return auth.res
  c.set('user', auth.payload)
  await next()
}

const requireSuperAdmin = async (c: Context<HonoApp>, next: Next) => {
  const auth = await authenticate(c)
  if ('res' in auth) return auth.res
  if (!auth.isSuper) return c.json({ error: 'Accès réservé au super-administrateur' }, 403)
  c.set('user', auth.payload)
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
  'donations', 'blog', 'newsletter', 'contactMessages', 'projects', 'partners', 'books', 'trailer',
  'videoComments',
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
  const auth = await authenticate(c)
  if ('res' in auth) return auth.res
  c.set('user', auth.payload)
  if (auth.isSuper) return await next()
  const allowed = await getAdminSections(c.env.DB, auth.payload.email)
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

const reqStrUrl = (value: unknown, field: string) => optUrl(value, field, true) as string

async function audit(
  db: D1Database,
  email: string,
  action: 'Création' | 'Modification' | 'Suppression' | 'Upload' | 'Réponse' | 'Confirmation',
  section: string,
  itemId: string | null,
  description: string
): Promise<void> {
  const id = 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  try {
    await db.prepare(
      'INSERT INTO audit_log (id, admin_email, action, section, item_id, description, performed_at) VALUES (?,?,?,?,?,?,?)'
    ).bind(id, email, action, section, itemId ?? null, description.slice(0, 500), new Date().toISOString()).run()
  } catch (err) {
    // La modification est déjà faite : un échec du journal ne doit pas la
    // transformer en 500 côté client.
    console.error('audit_log insert failed', err)
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

app.post('/auth/google', rateLimit('auth-google', 20, 10 * 60), async (c) => {
  const body = await c.req.json().catch(() => ({})) as { accessToken?: unknown }
  const accessToken = typeof body.accessToken === 'string' ? body.accessToken : ''
  if (!accessToken) return c.json({ error: 'accessToken manquant' }, 400)
  try {
    // Le jeton doit avoir été émis POUR cette application : sans ce contrôle,
    // un jeton Google obtenu par n'importe quelle autre application suffirait.
    const clientId = c.env.GOOGLE_CLIENT_ID || c.env.VITE_GOOGLE_CLIENT_ID
    if (clientId) {
      const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`)
      if (!tokenRes.ok) return c.json({ error: 'Token Google invalide' }, 401)
      const tokenInfo = await tokenRes.json() as { aud?: string; azp?: string }
      if (tokenInfo.aud !== clientId && tokenInfo.azp !== clientId) {
        return c.json({ error: 'Token Google invalide' }, 401)
      }
    } else {
      console.warn('GOOGLE_CLIENT_ID absent : audience du jeton Google non vérifiée')
    }
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!googleRes.ok) return c.json({ error: 'Token Google invalide' }, 401)
    const info = await googleRes.json() as any
    if (!info.email_verified) return c.json({ error: 'Adresse email Google non vérifiée' }, 403)
    const userEmail = normEmail(info.email)
    const isSuperAdmin = userEmail === normEmail(c.env.ADMIN_EMAIL)
    const isAdminFromDB = !isSuperAdmin
      ? !!(await c.env.DB.prepare('SELECT 1 FROM admins WHERE email=?').bind(userEmail).first())
      : false
    const isAdmin = isSuperAdmin || isAdminFromDB
    const token = await signSession(
      { sub: info.sub, email: userEmail, name: info.name, picture: info.picture, isAdmin, isSuperAdmin },
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
      maxAge: SESSION_SECONDS,
    })
    const sections = sectionsForUser(isSuperAdmin, isAdminFromDB ? await getAdminSections(c.env.DB, userEmail) : [])
    return c.json({ user: { email: userEmail, name: info.name, picture: info.picture, isAdmin, isSuperAdmin, sections } })
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
  const body = await c.req.json().catch(() => ({})) as { email?: unknown; password?: unknown }
  if (typeof body.email !== 'string' || !body.email.trim() || typeof body.password !== 'string' || !body.password) {
    return c.json({ error: 'Email et mot de passe requis' }, 400)
  }
  if (body.password.length > 256) return c.json({ error: 'Identifiants invalides' }, 401)
  const password = body.password
  const normalized = normEmail(body.email)
  const row = await c.env.DB.prepare('SELECT password_hash FROM admins WHERE email=?')
    .bind(normalized).first<{ password_hash: string | null }>()
  // Toujours dériver un hash, même si le compte n'existe pas : évite de révéler
  // par le temps de réponse quels emails sont des comptes admin.
  const stored = row?.password_hash || await dummyHash()
  const valid = await verifyPassword(password, stored)
  if (!row?.password_hash || !valid) {
    return c.json({ error: 'Identifiants invalides' }, 401)
  }
  const isSuperAdmin = normalized === normEmail(c.env.ADMIN_EMAIL)
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
    maxAge: SESSION_SECONDS,
  })
  const sections = sectionsForUser(isSuperAdmin, isSuperAdmin ? [] : await getAdminSections(c.env.DB, normalized))
  return c.json({ user: { email: normalized, name, picture: '', isAdmin: true, isSuperAdmin, sections } })
})

// Changement de son propre mot de passe. Si aucun mot de passe n'existe encore
// pour ce compte (premier réglage, notamment pour le super-admin qui n'a pas
// forcément de ligne dans `admins`), currentPassword n'est pas requis.
app.put('/auth/password', requireAdmin, async (c) => {
  const { currentPassword, newPassword } = await c.req.json()
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 256) {
    return c.json({ error: 'Le nouveau mot de passe doit contenir entre 8 et 256 caractères' }, 400)
  }
  const email = normEmail(c.get('user').email)
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
  } else if (email === normEmail(c.env.ADMIN_EMAIL)) {
    // Seul le super-admin (qui n'a pas forcément de ligne) peut créer sa ligne ;
    // un admin révoqué ne doit pas pouvoir se réinscrire lui-même.
    await c.env.DB.prepare(
      'INSERT INTO admins (email, added_by, added_at, password_hash) VALUES (?,?,?,?)'
    ).bind(email, 'auto', new Date().toISOString(), hash).run()
  } else {
    return c.json({ error: "Accès réservé à l'administrateur" }, 403)
  }
  return c.json({ success: true })
})

app.get('/auth/me', async (c) => {
  const auth = await authenticate(c)
  if ('res' in auth) return auth.res
  const { payload, isSuper } = auth
  const sections = sectionsForUser(isSuper, isSuper ? [] : await getAdminSections(c.env.DB, payload.email))
  return c.json({ user: { email: payload.email, name: payload.name, picture: payload.picture, isAdmin: true, isSuperAdmin: isSuper, sections } })
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
  reqStr(title, 'title', 200); reqStr(youtubeId, 'youtubeId', 64); str(description, 'description', 2000); reqStr(category, 'category', 50)
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

// ─── trailer (bannière bande-annonce, enregistrement unique id='main') ─────────

app.get('/trailer', async (c) => {
  const row = await c.env.DB.prepare(
    'SELECT title, description, youtube_id AS youtubeId, video_url AS videoUrl, end_date AS endDate FROM trailer WHERE id=?'
  ).bind('main').first<{ title: string | null; description: string | null; youtubeId: string | null; videoUrl: string | null; endDate: string }>()
  return c.json(row ?? null)
})

app.put('/trailer', requireSection('trailer'), async (c) => {
  const { title, description, youtubeId, videoUrl, endDate } = await c.req.json()
  str(title, 'title', 200); str(description, 'description', 2000); str(youtubeId, 'youtubeId', 64); optUrl(videoUrl, 'videoUrl'); str(endDate, 'endDate', 40)
  if (!youtubeId && !videoUrl) return c.json({ error: 'Une vidéo est requise (lien YouTube ou fichier importé)' }, 400)
  if (!endDate) return c.json({ error: 'Date de fin requise' }, 400)
  const existing = await c.env.DB.prepare('SELECT id FROM trailer WHERE id=?').bind('main').first()
  await c.env.DB.prepare(
    `INSERT INTO trailer (id, title, description, youtube_id, video_url, end_date, updated_at) VALUES ('main',?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description,
       youtube_id=excluded.youtube_id, video_url=excluded.video_url,
       end_date=excluded.end_date, updated_at=excluded.updated_at`
  ).bind(title ?? null, description ?? null, youtubeId ?? null, videoUrl ?? null, endDate, new Date().toISOString()).run()
  await audit(c.env.DB, c.get('user').email, existing ? 'Modification' : 'Création', 'Bande-annonce', 'main', `${existing ? 'Modification' : 'Activation'} de la bande-annonce : "${title || 'sans titre'}"`)
  return c.json({ success: true })
})

app.delete('/trailer', requireSection('trailer'), async (c) => {
  await c.env.DB.prepare('DELETE FROM trailer WHERE id=?').bind('main').run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Bande-annonce', 'main', 'Retrait de la bande-annonce')
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
  reqStr(category, 'category', 100); reqStr(title, 'title', 200); str(location, 'location', 200); reqStrUrl(url, 'url'); str(desc, 'desc', 1000)
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
  reqStr(title, 'title', 200); oneOf(type, ['special', 'upcoming', 'annonce'] as const, 'type'); reqStr(dateStr, 'dateStr', 100)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate))) throw new ValidationError('Date invalide : isoDate')
  str(location, 'location', 200); str(preacher, 'preacher', 200); str(desc, 'desc', 3000); str(badge, 'badge', 60); optUrl(image, 'image')
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
  reqStr(author, 'author', 100); str(since, 'since', 60); reqStr(text, 'text', 3000); optUrl(img, 'img'); reqStr(category, 'category', 50)
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
    'SELECT id, title, description, url, category, file_type AS fileType, cover_image AS coverImage FROM study_documents'
  ).all()
  return c.json(results)
})

app.put('/study-documents/:id', requireSection('documents'), async (c) => {
  const id = c.req.param('id')
  const { title, description, url, category, fileType, coverImage } = await c.req.json()
  reqStr(title, 'title', 200); str(description, 'description', 2000); reqStrUrl(url, 'url'); str(category, 'category', 100); reqStr(fileType, 'fileType', 10); optUrl(coverImage, 'coverImage')
  const existing = await c.env.DB.prepare('SELECT id FROM study_documents WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO study_documents (id, title, description, url, category, file_type, cover_image) VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, url=excluded.url,
       category=excluded.category, file_type=excluded.file_type, cover_image=excluded.cover_image`
  ).bind(id, title, description ?? null, url, category ?? null, fileType, coverImage ?? null).run()
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

// La colonne `status` vient de la migration 002 : tant qu'elle n'est pas passée,
// le code retombe sur l'ancien comportement (tous les dons comptent).
let donationStatusKnown = false
async function hasDonationStatus(db: D1Database): Promise<boolean> {
  if (donationStatusKnown) return true
  try {
    const row = await db.prepare("SELECT 1 AS ok FROM pragma_table_info('donations') WHERE name='status'").first()
    donationStatusKnown = !!row
  } catch {
    donationStatusKnown = false
  }
  return donationStatusKnown
}

app.get('/donation-projects', async (c) => {
  const confirmedOnly = (await hasDonationStatus(c.env.DB)) ? " AND d.status = 'confirmed'" : ''
  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.description, p.goal_amount AS goalAmount, p.currency,
            p.is_active AS isActive, p.created_at AS createdAt,
            COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.project_id = p.id${confirmedOnly}), 0) AS raisedAmount
     FROM donation_projects p ORDER BY p.created_at DESC`
  ).all<any>()
  return c.json(results.map((r: any) => ({ ...r, isActive: r.isActive === 1 })))
})

app.put('/donation-projects/:id', requireSection('projects'), async (c) => {
  const id = c.req.param('id')
  const { title, description, goalAmount, currency, isActive } = await c.req.json()
  reqStr(title, 'title', 200); str(description, 'description', 2000); posInt(goalAmount, 'goalAmount', 1e12); str(currency, 'currency', 10)
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
  const body = await c.req.json()
  const donorName = str(body.donorName, 'donorName', 100)
  const phone = str(body.phone, 'phone', 30)
  const amount = posInt(body.amount, 'amount', 1e10)
  const currency = oneOf(body.currency, ['FCFA', 'XAF', 'EUR', 'USD'] as const, 'currency', 'FCFA')
  const contribType = oneOf(body.contribType, ['Dîme', 'Offrande', 'Projets'] as const, 'contribType', 'Offrande')
  const paymentMethod = oneOf(body.paymentMethod, ['OM', 'MTN', 'Card'] as const, 'paymentMethod', 'OM')
  const reference = str(body.reference, 'reference', 100)
  const projectId = str(body.projectId, 'projectId', 128)
  if (projectId) {
    const project = await c.env.DB.prepare('SELECT 1 FROM donation_projects WHERE id=?').bind(projectId).first()
    if (!project) return c.json({ error: 'Projet inconnu' }, 400)
  }
  const id = 'don_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  // Un don déclaré en ligne n'est qu'une déclaration : il reste « pending » (et
  // ne compte pas dans les totaux publics) tant qu'un admin ne l'a pas confirmé
  // après vérification du paiement. Voir db/migrations/002_donation_status.sql.
  if (await hasDonationStatus(c.env.DB)) {
    await c.env.DB.prepare(
      'INSERT INTO donations (id, donor_name, phone, amount, currency, contrib_type, payment_method, reference, project_id, submitted_at, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
    ).bind(id, donorName, phone, amount, currency, contribType, paymentMethod, reference, projectId, new Date().toISOString(), 'pending').run()
  } else {
    await c.env.DB.prepare(
      'INSERT INTO donations (id, donor_name, phone, amount, currency, contrib_type, payment_method, reference, project_id, submitted_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
    ).bind(id, donorName, phone, amount, currency, contribType, paymentMethod, reference, projectId, new Date().toISOString()).run()
  }
  return c.json({ success: true, id })
})

// /donations/stats doit être avant /donations pour éviter que 'stats' soit capturé comme :id
app.get('/donations/stats', requireSection('donations'), async (c) => {
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  // Les statistiques ne comptent que les dons confirmés (une fois la migration passée).
  const hasStatus = await hasDonationStatus(c.env.DB)
  const only = hasStatus ? " WHERE status='confirmed'" : ''
  const and = hasStatus ? " AND status='confirmed'" : ''
  const [totals, byType, byMethod, monthly] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations${only}`)
      .first<{ count: number; total: number }>(),
    c.env.DB.prepare(
      `SELECT contrib_type AS type, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations${only} GROUP BY contrib_type ORDER BY total DESC`
    ).all<{ type: string; count: number; total: number }>(),
    c.env.DB.prepare(
      `SELECT payment_method AS method, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations${only} GROUP BY payment_method`
    ).all<{ method: string; count: number; total: number }>(),
    c.env.DB.prepare(
      `SELECT strftime('%Y-%m', submitted_at) AS month, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total
       FROM donations WHERE submitted_at >= ?${and} GROUP BY month ORDER BY month`
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
  const statusCol = (await hasDonationStatus(c.env.DB)) ? 'd.status' : "'confirmed'"
  const { results } = await c.env.DB.prepare(
    `SELECT d.id, d.donor_name AS donorName, d.phone, d.amount, d.currency,
            d.contrib_type AS contribType, d.payment_method AS paymentMethod,
            d.reference, d.project_id AS projectId, d.submitted_at AS submittedAt,
            p.title AS projectTitle, ${statusCol} AS status
     FROM donations d
     LEFT JOIN donation_projects p ON p.id = d.project_id
     ORDER BY d.submitted_at DESC LIMIT 2000`
  ).all()
  return c.json(results)
})

// Confirme un don après vérification du paiement : il entre alors dans les totaux.
app.patch('/donations/:id/confirm', requireSection('donations'), async (c) => {
  if (!(await hasDonationStatus(c.env.DB))) {
    return c.json({ error: 'Migration 002_donation_status.sql à exécuter avant de confirmer des dons' }, 409)
  }
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT donor_name, amount, currency FROM donations WHERE id=?').bind(id).first<{donor_name:string|null,amount:number,currency:string}>()
  if (!row) return c.json({ error: 'Don introuvable' }, 404)
  await c.env.DB.prepare("UPDATE donations SET status='confirmed' WHERE id=?").bind(id).run()
  await audit(c.env.DB, c.get('user').email, 'Confirmation', 'Dons', id, `Confirmation du don de ${row.donor_name ?? 'Anonyme'} : ${row.amount} ${row.currency}`)
  return c.json({ success: true })
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
  const body = await c.req.json()
  const name = str(body.name, 'name', 100)
  const phone = str(body.phone, 'phone', 30)
  const message = reqStr(body.message, 'message', 3000)
  const id = 'prq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await c.env.DB.prepare(
    'INSERT INTO prayer_requests (id, name, phone, message, type, is_public, submitted_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(
    id,
    name,
    phone,
    message,
    body.type === 'testimony' ? 'testimony' : 'prayer',
    // Privé par défaut : une demande de prière ne devient publique que si la
    // personne le choisit explicitement.
    body.isPublic === true ? 1 : 0,
    new Date().toISOString()
  ).run()
  return c.json({ success: true, id })
})

app.get('/prayer-requests/public', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, message, type, submitted_at AS submittedAt,
            admin_reply AS adminReply, replied_at AS repliedAt
     FROM prayer_requests WHERE is_public = 1 ORDER BY submitted_at DESC LIMIT 50`
  ).all()
  return c.json(results)
})

app.get('/prayer-requests', requireSection('prayers'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, phone, message, type, is_public AS isPublic, submitted_at AS submittedAt,
            admin_reply AS adminReply, replied_at AS repliedAt
     FROM prayer_requests ORDER BY submitted_at DESC`
  ).all<any>()
  return c.json(results.map((r: any) => ({ ...r, isPublic: r.isPublic === 1 })))
})

app.patch('/prayer-requests/:id/reply', requireSection('prayers'), async (c) => {
  const id = c.req.param('id')
  const { reply } = await c.req.json<{ reply: string }>()
  reqStr(reply, 'reply', 3000)
  const now = new Date().toISOString()
  await c.env.DB.prepare(
    'UPDATE prayer_requests SET admin_reply=?, replied_at=? WHERE id=?'
  ).bind(reply.trim(), now, id).run()
  await audit(c.env.DB, c.get('user').email, 'Réponse', 'Requêtes de Prière', id, `Réponse envoyée à la requête ${id}`)
  return c.json({ success: true, repliedAt: now })
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
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
}
const VIDEO_UPLOAD_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])

app.post('/upload', requireAdmin, async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as unknown as File | null
  if (!file) return c.json({ error: 'Aucun fichier fourni' }, 400)

  const isVideo = VIDEO_UPLOAD_TYPES.has(file.type)
  const maxSize = (isVideo ? 100 : 20) * 1024 * 1024
  if (file.size > maxSize) return c.json({ error: `Fichier trop lourd (${isVideo ? 100 : 20} Mo max)` }, 400)

  const ext = ALLOWED_UPLOAD_TYPES[file.type]
  if (!ext) return c.json({ error: 'Type de fichier non autorisé' }, 400)

  // `file.type` est déclaré par le client : on vérifie aussi l'en-tête binaire.
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (!matchesMagicBytes(file.type, head)) return c.json({ error: 'Le contenu du fichier ne correspond pas à son type' }, 400)

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
    headers: { 'Cache-Control': 'max-age=86400', 'Content-Type': 'application/json' }
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
  const staleKey = new Request('https://internal-cache.dev/yt-live-stale')
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  try {
    const { channelId, uploadsPlaylistId } = await resolveChannelId(apiKey)
    // Détection à 2 unités de quota (playlistItems + videos) au lieu de 100 par
    // `search.list` : le quota quotidien (10 000) s'épuisait sinon en quelques
    // dizaines de ratés de cache et faisait tomber le direct. Un direct apparaît
    // dans la playlist « uploads » de la chaîne dès son démarrage.
    const uploads = await fetchJson(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=5&key=${apiKey}`
    )
    const ids: string[] = (uploads.items || []).map((i: any) => i.contentDetails?.videoId).filter(Boolean)
    let result: any = { isLive: false, videoId: null, channelId }
    if (ids.length > 0) {
      const vids = await fetchJson(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.join(',')}&key=${apiKey}`
      )
      const items: any[] = vids.items || []
      const live = items.find((v) => v.snippet?.liveBroadcastContent === 'live')
      if (live) {
        result = { isLive: true, videoId: live.id, title: live.snippet.title, channelId }
      } else {
        const latest = items.find((v) => v.id === ids[0]) ?? items[0]
        if (latest) {
          result = {
            isLive: false, videoId: latest.id, title: latest.snippet.title,
            description: latest.snippet.description, publishedAt: latest.snippet.publishedAt, channelId,
          }
        }
      }
    }
    // TTL court pour rester réactif à un démarrage de direct ; une copie « de
    // secours » plus longue sert de repli si l'API YouTube échoue (quota, panne).
    const body = JSON.stringify(result)
    const response = new Response(body, { headers: { 'Cache-Control': 'max-age=60', 'Content-Type': 'application/json' } })
    await cache.put(cacheKey, response.clone())
    await cache.put(staleKey, new Response(body, { headers: { 'Cache-Control': 'max-age=3600', 'Content-Type': 'application/json' } }))
    return response
  } catch (err: any) {
    console.error('youtube live error', err?.message)
    const stale = await cache.match(staleKey)
    if (stale) return stale
    return c.json({ error: 'Service YouTube momentanément indisponible' }, 502)
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
    console.error('youtube error', err?.message)
    return c.json({ error: 'Service YouTube momentanément indisponible' }, 502)
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
  // Émissions les mieux remplies d'abord ; celles à 0 vidéo (playlist YouTube
  // encore vide) passent en fin de liste.
  result.sort((a, b) => b.videoCount - a.videoCount)
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
    console.error('youtube error', err?.message)
    return c.json({ error: 'Service YouTube momentanément indisponible' }, 502)
  }
})

// Les infos vidéo ne sont servies que pour des IDs déjà enregistrés comme liens
// recommandés (le site public en a besoin) ou à un admin connecté (auto-remplissage
// du formulaire) : sinon n'importe qui pouvait consommer le quota YouTube.
async function canQueryVideoInfo(c: Context<HonoApp>, id: string): Promise<boolean> {
  const known = await c.env.DB.prepare('SELECT 1 FROM recommended_links WHERE youtube_id=?').bind(id).first()
  if (known) return true
  const auth = await authenticate(c)
  return !('res' in auth)
}

app.get('/youtube/video-info', async (c) => {
  const input = (c.req.query('urlOrId') || '').trim()
  if (!input) return c.json({ error: 'Paramètre urlOrId manquant' }, 400)
  if (input.length > 300) return c.json({ error: 'Paramètre urlOrId invalide' }, 400)
  const apiKey = c.env.YOUTUBE_API_KEY

  // Playlist ? (URL contenant list=… ou ID brut PL/UU/FL/OL…)
  const listMatch = input.match(/[?&]list=([\w-]+)/)
  const playlistId = listMatch ? listMatch[1] : (/^(PL|UU|FL|OL)[\w-]{10,}$/.test(input) ? input : null)
  let videoId = ''
  if (!playlistId) {
    if (/^[\w-]{11}$/.test(input)) {
      videoId = input
    } else {
      const m = input.match(/(?:youtu\.be\/|\/v\/|\/embed\/|watch\?v=|[?&]v=|shorts\/)([\w-]{11})(?![\w-])/)
      if (!m) return c.json({ error: 'ID YouTube introuvable' }, 400)
      videoId = m[1]
    }
  }
  const id = (playlistId ?? videoId) as string
  if (!(await canQueryVideoInfo(c, id))) return c.json({ error: 'Non autorisé' }, 403)

  const cache = caches.default
  const cacheKey = new Request(`https://internal-cache.dev/yt-info-${id}`)
  const cached = await cache.match(cacheKey)
  if (cached) return cached
  const done = async (body: unknown) => {
    const res = new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=3600' } })
    await cache.put(cacheKey, res.clone())
    return res
  }

  try {
    if (playlistId) {
      if (!apiKey) return c.json({ error: 'Clé API YouTube absente' }, 500)
      const data = await fetchJson(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`
      )
      const item = data.items?.[0]
      if (!item) return c.json({ error: 'Playlist introuvable' }, 404)
      return await done({
        id: playlistId, isPlaylist: true,
        title: item.snippet.title, preacher: item.snippet.channelTitle,
        duration: `${item.contentDetails?.itemCount || 0} vidéos`,
        image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        description: item.snippet.description || ''
      })
    }

    if (apiKey) {
      const data = await fetchJson(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
      )
      if (data.items?.length > 0) {
        const item = data.items[0]
        const m = (item.contentDetails?.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
        const [, h, min, sec] = (m || []).map((v: any) => (v ? parseInt(v) : 0))
        const duration = h > 0 ? `${h}h ${min}m` : min > 0 ? `${min} min` : `${sec}s`
        return await done({
          id: videoId, title: item.snippet.title, preacher: item.snippet.channelTitle,
          duration, image: item.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/0.jpg`,
          description: item.snippet.description || ''
        })
      }
    }
    const fb = await fetchJson(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
    return await done({
      id: videoId, title: fb.title || 'Message', preacher: fb.author_name || 'Chaîne',
      duration: '15 min', image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, description: ''
    })
  } catch (err: any) {
    console.error('youtube error', err?.message)
    return c.json({ error: 'Service YouTube momentanément indisponible' }, 502)
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
  reqStr(name, 'name', 100)
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
  reqStr(data.title, 'title', 300); reqStr(data.category, 'category', 100); reqStr(data.author, 'author', 100)
  optUrl(data.coverImage, 'coverImage'); str(data.excerpt, 'excerpt', 1000); reqStr(data.content, 'content', 200000); reqStr(data.publishedAt, 'publishedAt', 40)
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
  const { email: rawEmail } = await c.req.json()
  const email = vEmail(rawEmail, 'email', true) as string
  const id = 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  try {
    await c.env.DB.prepare(
      'INSERT INTO newsletter_subscribers (id, email, subscribed_at) VALUES (?,?,?)'
    ).bind(id, email, new Date().toISOString()).run()
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
  const normalized = vEmail(email, 'email', true) as string
  if (password && (typeof password !== 'string' || password.length < 8 || password.length > 256)) {
    return c.json({ error: 'Le mot de passe doit contenir entre 8 et 256 caractères' }, 400)
  }
  if (normalized === normEmail(c.env.ADMIN_EMAIL)) return c.json({ error: 'Cet email est déjà le super-administrateur' }, 409)
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
  if (email === normEmail(c.env.ADMIN_EMAIL)) return c.json({ error: 'Le super-administrateur a déjà accès à tout' }, 400)
  const existing = await c.env.DB.prepare('SELECT 1 FROM admins WHERE email=?').bind(email).first()
  if (!existing) return c.json({ error: 'Administrateur introuvable' }, 404)
  const clean = sanitizeSections(sections)
  await c.env.DB.prepare('UPDATE admins SET sections=? WHERE email=?').bind(JSON.stringify(clean), email).run()
  await audit(c.env.DB, c.get('user').email, 'Modification', 'Administrateurs', email, `Droits mis à jour pour "${email}" : ${clean.length ? clean.join(', ') : 'aucun accès'}`)
  return c.json({ success: true, sections: clean })
})

app.delete('/admins/:email', requireSuperAdmin, async (c) => {
  const email = decodeURIComponent(c.req.param('email')).trim().toLowerCase()
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
  const isSelf = email === normEmail(c.env.ADMIN_EMAIL)
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
  reqStr(firstName, 'firstName', 100); reqStr(lastName, 'lastName', 100); str(title, 'title', 100); str(church, 'church', 200); str(location, 'location', 200)
  str(bio, 'bio', 3000); reqStrUrl(youtubeUrl, 'youtubeUrl'); optUrl(website, 'website'); optUrl(avatarUrl, 'avatarUrl')
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
    `SELECT id, title, author, category, description, cover_image AS coverImage, created_at AS createdAt
     FROM library_books ORDER BY created_at ASC`
  ).all()
  return c.json(results)
})

app.put('/library-books/:id', requireSection('books'), async (c) => {
  const id = c.req.param('id')
  const { title, author, category, description, coverImage } = await c.req.json()
  reqStr(title, 'title', 200); reqStr(author, 'author', 200); str(category, 'category', 100); str(description, 'description', 3000); optUrl(coverImage, 'coverImage')
  const existing = await c.env.DB.prepare('SELECT id FROM library_books WHERE id=?').bind(id).first()
  await c.env.DB.prepare(
    `INSERT INTO library_books (id, title, author, category, description, cover_image, created_at)
     VALUES (?,?,?,?,?,?,datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       title=excluded.title, author=excluded.author, category=excluded.category, description=excluded.description, cover_image=excluded.cover_image`
  ).bind(id, title, author, category ?? null, description ?? null, coverImage ?? null).run()
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
  const body = await c.req.json()
  const bookTitle = reqStr(body.bookTitle, 'bookTitle', 200)
  const name = reqStr(body.name, 'name', 100)
  const bookId = str(body.bookId, 'bookId', 128)
  const phone = str(body.phone, 'phone', 30)
  const orderEmail = vEmail(body.email, 'email')
  const id = 'bko_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await c.env.DB.prepare(
    'INSERT INTO book_orders (id, book_id, book_title, name, phone, email, submitted_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(id, bookId, bookTitle, name, phone, orderEmail, new Date().toISOString()).run()
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
  const body = await c.req.json()
  const name = reqStr(body.name, 'name', 100)
  const contactEmail = vEmail(body.email, 'email', true) as string
  const phone = str(body.phone, 'phone', 30)
  const subject = str(body.subject, 'subject', 200)
  const message = reqStr(body.message, 'message', 5000)
  const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await c.env.DB.prepare(
    'INSERT INTO contact_messages (id, name, email, phone, subject, message, submitted_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(id, name, contactEmail, phone, subject, message, new Date().toISOString()).run()
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

// ─── video_comments ─────────────────────────────────────────────────────────────
// Commentaires propres à la plateforme, rattachés à un ID vidéo YouTube. Visibles
// publiquement dès l'envoi (comme les requêtes de prière publiques) ; l'admin
// peut en supprimer a posteriori depuis l'onglet de modération.

app.get('/video-comments', async (c) => {
  const videoId = c.req.query('videoId') || ''
  if (!videoId || videoId.length > 64) return c.json({ error: 'videoId requis' }, 400)
  const results = await d1All(c.env.DB.prepare(
    `SELECT id, video_id AS videoId, author_name AS authorName, message, submitted_at AS submittedAt, parent_id AS parentId
     FROM video_comments WHERE video_id=? ORDER BY submitted_at DESC LIMIT 500`
  ).bind(videoId))
  return c.json(results)
})

app.post('/video-comments', rateLimit('video-comments', 8, 600), async (c) => {
  const body = await c.req.json()
  const videoId = reqStr(body.videoId, 'videoId', 64)
  if (!/^[\w-]+$/.test(videoId)) throw new ValidationError('Champ invalide : videoId')
  const videoTitle = str(body.videoTitle, 'videoTitle', 200)
  const authorName = reqStr(body.authorName, 'authorName', 60)
  const message = reqStr(body.message, 'message', 800)
  const parentId = str(body.parentId, 'parentId', 64)
  let parent: string | null = null
  if (parentId) {
    // Une réponse ne peut viser qu'un commentaire racine (pas de réponse à une
    // réponse) de la même vidéo — un seul niveau de fil.
    const parentRow = await c.env.DB.prepare(
      'SELECT id FROM video_comments WHERE id=? AND video_id=? AND parent_id IS NULL'
    ).bind(parentId, videoId).first()
    if (!parentRow) return c.json({ error: 'Commentaire parent introuvable' }, 400)
    parent = parentId
  }
  const id = 'vc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await c.env.DB.prepare(
    'INSERT INTO video_comments (id, video_id, video_title, author_name, message, submitted_at, parent_id) VALUES (?,?,?,?,?,?,?)'
  ).bind(id, videoId, videoTitle, authorName, message, new Date().toISOString(), parent).run()
  return c.json({ success: true, id })
})

app.get('/video-comments/all', requireSection('videoComments'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, video_id AS videoId, video_title AS videoTitle, author_name AS authorName, message, submitted_at AS submittedAt, parent_id AS parentId
     FROM video_comments ORDER BY submitted_at DESC`
  ).all()
  return c.json(results)
})

app.delete('/video-comments/:id', requireSection('videoComments'), async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT author_name, video_title FROM video_comments WHERE id=?').bind(id).first<{author_name:string,video_title:string|null}>()
  // Supprime aussi les réponses rattachées, pour ne pas laisser de fil orphelin.
  await c.env.DB.prepare('DELETE FROM video_comments WHERE id=? OR parent_id=?').bind(id, id).run()
  await audit(c.env.DB, c.get('user').email, 'Suppression', 'Commentaires Vidéos', id, `Suppression commentaire de "${row?.author_name ?? id}" sur "${row?.video_title ?? '?'}"`)
  return c.json({ success: true })
})

// ─── youtube/channel-playlists ────────────────────────────────────────────────

app.get('/youtube/channel-playlists', async (c) => {
  const channelUrl = c.req.query('channelUrl') || ''
  const apiKey = c.env.YOUTUBE_API_KEY
  if (!channelUrl || !apiKey || channelUrl.length > 300) return c.json([])

  // Uniquement les chaînes enregistrées comme partenaires : sans cette liste
  // blanche, chaque URL arbitraire consommait du quota YouTube (jusqu'à 100
  // unités par recherche) et permettait de le vider.
  const knownPartner = await c.env.DB.prepare('SELECT 1 FROM partners WHERE youtube_url=?').bind(channelUrl).first()
  if (!knownPartner) return c.json([])

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
    console.error('youtube error', err?.message)
    return c.json({ error: 'Service YouTube momentanément indisponible' }, 502)
  }
})

// ─── admin counts (all tabs in one query) ──────────────────────────────────────

app.get('/admin/counts', requireAdmin, async (c) => {
  const [links, photos, events, testimonials, documents, prayers, donations, blog, newsletter, projects, auditLog, partners, books, bookOrders, contactMessages, trailer, videoComments] =
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
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM trailer').first<{n:number}>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM video_comments').first<{n:number}>(),
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
    trailer:      Number(trailer?.n      ?? 0),
    videoComments: Number(videoComments?.n ?? 0),
  })
})

export const onRequest = handle(app)
