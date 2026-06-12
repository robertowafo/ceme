/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { SignJWT, jwtVerify } from 'jose'
import type { Context, Next } from 'hono'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  BUCKET_URL: string
  JWT_SECRET: string
  ADMIN_EMAIL: string
  YOUTUBE_API_KEY: string
}

type Variables = { user: JwtPayload }

interface JwtPayload {
  sub: string
  email: string
  name: string
  picture: string
  isAdmin: boolean
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

// ─── App + middleware ──────────────────────────────────────────────────────────

const app = new Hono<HonoApp>().basePath('/api')

const requireAdmin = async (c: Context<HonoApp>, next: Next) => {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'Non authentifié' }, 401)
  const payload = await verifySession(auth.slice(7), c.env.JWT_SECRET)
  if (!payload?.isAdmin) return c.json({ error: "Accès réservé à l'administrateur" }, 403)
  c.set('user', payload)
  await next()
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
    const isAdmin = info.email === c.env.ADMIN_EMAIL
    const token = await signSession(
      { sub: info.sub, email: info.email, name: info.name, picture: info.picture, isAdmin },
      c.env.JWT_SECRET
    )
    return c.json({ token, user: { email: info.email, name: info.name, picture: info.picture, isAdmin } })
  } catch {
    return c.json({ error: "Erreur d'authentification" }, 500)
  }
})

app.get('/auth/me', async (c) => {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'Non authentifié' }, 401)
  const payload = await verifySession(auth.slice(7), c.env.JWT_SECRET)
  if (!payload) return c.json({ error: 'Session expirée' }, 401)
  return c.json({ user: { email: payload.email, name: payload.name, picture: payload.picture, isAdmin: payload.isAdmin } })
})

// ─── recommended_links ─────────────────────────────────────────────────────────

app.get('/recommended-links', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, title, youtube_id AS youtubeId, description, category FROM recommended_links ORDER BY id ASC'
  ).all()
  return c.json(results)
})

app.put('/recommended-links/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const { title, youtubeId, description, category } = await c.req.json()
  await c.env.DB.prepare(
    `INSERT INTO recommended_links (id, title, youtube_id, description, category) VALUES (?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, youtube_id=excluded.youtube_id,
       description=excluded.description, category=excluded.category`
  ).bind(id, title, youtubeId, description ?? null, category).run()
  return c.json({ success: true })
})

app.delete('/recommended-links/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM recommended_links WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

// ─── gallery_photos ────────────────────────────────────────────────────────────

app.get('/gallery-photos', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, category, title, location, url, note AS desc FROM gallery_photos'
  ).all()
  return c.json(results)
})

app.put('/gallery-photos/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const { category, title, location, url, desc } = await c.req.json()
  await c.env.DB.prepare(
    `INSERT INTO gallery_photos (id, category, title, location, url, note) VALUES (?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET category=excluded.category, title=excluded.title,
       location=excluded.location, url=excluded.url, note=excluded.note`
  ).bind(id, category, title, location ?? null, url, desc ?? null).run()
  return c.json({ success: true })
})

app.delete('/gallery-photos/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM gallery_photos WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

// ─── church_events ─────────────────────────────────────────────────────────────

app.get('/church-events', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, type, date_str AS dateStr, iso_date AS isoDate,
            location, preacher, note AS desc, badge, badge_color AS badgeColor,
            image, is_popular AS isPopular
     FROM church_events ORDER BY iso_date ASC`
  ).all<any>()
  return c.json(results.map((r: any) => ({ ...r, isPopular: r.isPopular === 1 })))
})

app.put('/church-events/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const { title, type, dateStr, isoDate, location, preacher, desc, badge, badgeColor, image, isPopular } = await c.req.json()
  await c.env.DB.prepare(
    `INSERT INTO church_events (id, title, type, date_str, iso_date, location, preacher, note, badge, badge_color, image, is_popular)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, type=excluded.type, date_str=excluded.date_str,
       iso_date=excluded.iso_date, location=excluded.location, preacher=excluded.preacher, note=excluded.note,
       badge=excluded.badge, badge_color=excluded.badge_color, image=excluded.image, is_popular=excluded.is_popular`
  ).bind(id, title, type, dateStr, isoDate, location, preacher ?? null, desc, badge, badgeColor ?? null, image, isPopular ? 1 : 0).run()
  return c.json({ success: true })
})

app.delete('/church-events/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM church_events WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

// ─── testimonials ──────────────────────────────────────────────────────────────

app.get('/testimonials', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, author, since, text, img, category FROM testimonials'
  ).all()
  return c.json(results)
})

app.put('/testimonials/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const { author, since, text, img, category } = await c.req.json()
  await c.env.DB.prepare(
    `INSERT INTO testimonials (id, author, since, text, img, category) VALUES (?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET author=excluded.author, since=excluded.since, text=excluded.text,
       img=excluded.img, category=excluded.category`
  ).bind(id, author, since, text, img ?? null, category).run()
  return c.json({ success: true })
})

app.delete('/testimonials/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM testimonials WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

// ─── study_documents ───────────────────────────────────────────────────────────

app.get('/study-documents', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, title, description, url, category, file_type AS fileType FROM study_documents'
  ).all()
  return c.json(results)
})

app.put('/study-documents/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const { title, description, url, category, fileType } = await c.req.json()
  await c.env.DB.prepare(
    `INSERT INTO study_documents (id, title, description, url, category, file_type) VALUES (?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, url=excluded.url,
       category=excluded.category, file_type=excluded.file_type`
  ).bind(id, title, description ?? null, url, category ?? null, fileType).run()
  return c.json({ success: true })
})

app.delete('/study-documents/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM study_documents WHERE id=?').bind(c.req.param('id')).run()
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

app.post('/donations', async (c) => {
  const { donorName, phone, amount, currency, contribType, paymentMethod, reference } = await c.req.json()
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return c.json({ error: 'Montant invalide' }, 400)
  }
  const id = 'don_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  await c.env.DB.prepare(
    'INSERT INTO donations (id, donor_name, phone, amount, currency, contrib_type, payment_method, reference, submitted_at) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(
    id,
    donorName?.trim() || null,
    phone?.trim() || null,
    Math.round(Number(amount)),
    currency || 'FCFA',
    contribType || 'Offrande',
    paymentMethod || 'OM',
    reference || null,
    new Date().toISOString()
  ).run()
  return c.json({ success: true, id })
})

// /donations/stats doit être avant /donations pour éviter que 'stats' soit capturé comme :id
app.get('/donations/stats', requireAdmin, async (c) => {
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

app.get('/donations', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, donor_name AS donorName, phone, amount, currency,
            contrib_type AS contribType, payment_method AS paymentMethod,
            reference, submitted_at AS submittedAt
     FROM donations ORDER BY submitted_at DESC`
  ).all()
  return c.json(results)
})

app.delete('/donations/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM donations WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

// ─── prayer_requests ───────────────────────────────────────────────────────────

app.post('/prayer-requests', async (c) => {
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

app.get('/prayer-requests', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, phone, message, type, is_public AS isPublic, submitted_at AS submittedAt
     FROM prayer_requests ORDER BY submitted_at DESC`
  ).all<any>()
  return c.json(results.map((r: any) => ({ ...r, isPublic: r.isPublic === 1 })))
})

app.delete('/prayer-requests/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM prayer_requests WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

// ─── Upload (Cloudflare R2) ────────────────────────────────────────────────────

app.post('/upload', requireAdmin, async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  if (!file) return c.json({ error: 'Aucun fichier fourni' }, 400)
  if (file.size > 20 * 1024 * 1024) return c.json({ error: 'Fichier trop lourd (20 Mo max)' }, 400)

  const ext = file.name.split('.').pop() || 'bin'
  const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`

  await c.env.BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' }
  })

  return c.json({ url: `${c.env.BUCKET_URL}/${key}` })
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
  try {
    const { channelId } = await resolveChannelId(apiKey)
    const data = await fetchJson(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`
    )
    if (data.items?.length > 0) {
      const item = data.items[0]
      return c.json({ isLive: true, videoId: item.id.videoId, title: item.snippet.title, channelId })
    }
    const recentData = await fetchJson(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=1&key=${apiKey}`
    )
    const item = recentData.items?.[0]
    return c.json(item
      ? { isLive: false, videoId: item.id.videoId, title: item.snippet.title, description: item.snippet.description, publishedAt: item.snippet.publishedAt, channelId }
      : { isLive: false, videoId: null, channelId })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

app.get('/youtube/playlists', async (c) => {
  const apiKey = c.env.YOUTUBE_API_KEY
  if (!apiKey) return c.json([])
  try {
    const { channelId } = await resolveChannelId(apiKey)
    const data = await fetchJson(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&key=${apiKey}`
    )
    return c.json((data.items || []).map((item: any) => ({
      id: item.id, title: item.snippet.title, description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
      videoCount: item.contentDetails?.itemCount || 0
    })))
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

app.get('/youtube/sermons', async (c) => {
  const apiKey = c.env.YOUTUBE_API_KEY
  if (!apiKey) return c.json([])
  try {
    const { uploadsPlaylistId, channelId } = await resolveChannelId(apiKey)
    const [uploadsData, playlistsData] = await Promise.all([
      fetchJson(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`),
      fetchJson(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=25&key=${apiKey}`)
    ])
    const listPlaylists = playlistsData.items || []
    const videoToPlaylistMap: Record<string, string> = {}
    for (const pl of listPlaylists.slice(0, 8)) {
      try {
        const plItems = await fetchJson(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${pl.id}&maxResults=50&key=${apiKey}`
        )
        for (const item of plItems.items || []) {
          const vidId = item.contentDetails?.videoId
          if (vidId) videoToPlaylistMap[vidId] = pl.snippet.title
        }
      } catch {}
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
        image: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${vidId}/0.jpg`,
        description: item.snippet.description || '',
        youtubeId: vidId
      }
    })
    return c.json(sermons)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

app.get('/youtube/video-info', async (c) => {
  let videoId = (c.req.query('urlOrId') || '').trim()
  if (!videoId) return c.json({ error: 'Paramètre urlOrId manquant' }, 400)
  if (videoId.length !== 11) {
    const match = videoId.match(/^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*)/)
    if (match?.[2]?.length === 11) videoId = match[2]
    else return c.json({ error: 'ID YouTube introuvable' }, 400)
  }
  const apiKey = c.env.YOUTUBE_API_KEY
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

app.put('/blog-categories/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const { name } = await c.req.json()
  await c.env.DB.prepare(
    `INSERT INTO blog_categories (id, name) VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name`
  ).bind(id, name).run()
  return c.json({ success: true })
})

app.delete('/blog-categories/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM blog_categories WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

// ─── blog_posts ────────────────────────────────────────────────────────────────

app.get('/blog-posts/all', requireAdmin, async (c) => {
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

app.put('/blog-posts/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json() as any
  await c.env.DB.prepare(`
    INSERT INTO blog_posts (id, title, category, author, cover_image, excerpt, content, published_at, is_published)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title, category=excluded.category, author=excluded.author,
      cover_image=excluded.cover_image, excerpt=excluded.excerpt, content=excluded.content,
      published_at=excluded.published_at, is_published=excluded.is_published
  `).bind(id, data.title, data.category, data.author, data.coverImage ?? null,
           data.excerpt ?? null, data.content, data.publishedAt, data.isPublished ? 1 : 0).run()
  return c.json({ success: true })
})

app.delete('/blog-posts/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM blog_posts WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

export const onRequest = handle(app)
