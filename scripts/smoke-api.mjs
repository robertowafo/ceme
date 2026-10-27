// Tests de fumée de l'API contre un serveur LOCAL (jamais la prod).
//
//   1. npm run build
//   2. npx wrangler d1 execute ceme-db --local --persist-to .wrangler/smoke --file=db/schema.sql
//      npx wrangler d1 execute ceme-db --local --persist-to .wrangler/smoke --command "ALTER TABLE donations ADD COLUMN project_id TEXT;"
//      (puis insérer au besoin un admin 'sub@test.local' avec sections ["links"] et un projet 'p1')
//   3. npx wrangler pages dev dist --port 8788 --persist-to .wrangler/smoke \
//        --binding JWT_SECRET=<secret-de-test> ADMIN_EMAIL=admin@test.local
//   4. JWT_SECRET=<secret-de-test> node scripts/smoke-api.mjs
//
// Chaque cas affiche OK/ÉCHEC ; le code de sortie est non nul s'il y a un échec.
import { SignJWT } from 'jose'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8788/api'
const SECRET = process.env.JWT_SECRET
if (!SECRET) { console.error('JWT_SECRET requis (secret du serveur local de test)'); process.exit(2) }
if (!/127\.0\.0\.1|localhost/.test(BASE)) { console.error('Refus : BASE_URL doit être local'); process.exit(2) }

const key = new TextEncoder().encode(SECRET)
const session = (email, isSuperAdmin, isAdmin = true) =>
  new SignJWT({ sub: email, email, name: 'T', picture: '', isAdmin, isSuperAdmin })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(key)

const SUPER = await session('admin@test.local', true)
const SUB = await session('sub@test.local', false)        // admin avec la seule section « links »
const REVOKED = await session('gone@test.local', false)   // JWT valide mais absent de la table admins

let failed = 0
async function check(name, expected, path, { method = 'GET', cookie, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      // IP simulée distincte par requête : on teste la validation, pas le rate limit
      // (5 requêtes / 10 min / IP sur les formulaires publics).
      'CF-Connecting-IP': `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
      ...(cookie ? { Cookie: `session=${cookie}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  })
  const ok = res.status === expected
  if (!ok) failed++
  console.log(`${ok ? 'OK    ' : 'ÉCHEC '} ${name} — attendu ${expected}, reçu ${res.status}`)
}

// Accès
await check('anonyme : /admin/counts refusé', 401, '/admin/counts')
await check('super-admin : /admin/counts', 200, '/admin/counts', { cookie: SUPER })
await check('admin sans la section : /donations refusé', 403, '/donations', { cookie: SUB })
await check('admin révoqué : /admin/counts refusé', 403, '/admin/counts', { cookie: REVOKED })
await check('admin révoqué : ne peut pas se réinscrire', 403, '/auth/password', { method: 'PUT', cookie: REVOKED, body: { newPassword: 'abcdefgh12' } })
await check('/auth/me anonyme : 200 sans utilisateur', 200, '/auth/me')

// Validation
await check('contact : champs manquants', 400, '/contact-messages', { method: 'POST', body: { name: 'a' } })
await check('contact : email invalide', 400, '/contact-messages', { method: 'POST', body: { name: 'a', email: 'x', message: 'm' } })
await check('contact : message trop long', 400, '/contact-messages', { method: 'POST', body: { name: 'a', email: 'a@b.co', message: 'x'.repeat(5001) } })
await check('JSON invalide', 400, '/newsletter', { method: 'POST', body: '{bad' })
await check('don : moyen de paiement hors liste', 400, '/donations', { method: 'POST', body: { amount: 1000, paymentMethod: 'BTC' } })
await check('don : projet inconnu', 400, '/donations', { method: 'POST', body: { amount: 1000, projectId: 'zzz' } })
await check('document : URL javascript: refusée', 400, '/study-documents/t1', { method: 'PUT', cookie: SUPER, body: { title: 'x', url: 'javascript:alert(1)', fileType: 'pdf' } })

// Rate limit : la 6e requête depuis la même IP est refusée
{
  const ip = '10.99.99.99'
  let last = 0
  for (let i = 0; i < 6; i++) {
    const r = await fetch(BASE + '/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip }, body: JSON.stringify({ email: `rl${Date.now()}${i}@t.co` }) })
    last = r.status
  }
  const ok = last === 429
  if (!ok) failed++
  console.log(`${ok ? 'OK    ' : 'ÉCHEC '} rate limit newsletter — 6e requête attendue 429, reçue ${last}`)
}

// Quota YouTube : liste blanche
await check('video-info : ID inconnu refusé (anonyme)', 403, '/youtube/video-info?urlOrId=dQw4w9WgXcQ')
await check('channel-playlists : URL hors partenaires → vide', 200, '/youtube/channel-playlists?channelUrl=https://youtube.com/@x')

console.log(failed ? `\n${failed} échec(s)` : '\nTout est OK')
process.exit(failed ? 1 : 0)
