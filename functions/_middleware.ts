/**
 * Une seule adresse publique : https://gracetvs.com (évite le contenu dupliqué).
 *
 *  - www.gracetvs.com           → gracetvs.com (301)
 *  - ceme-27o.pages.dev (pages) → gracetvs.com (301)
 *  - autres *.pages.dev (aperçus de branches) → servis, mais noindex
 *
 * L'ancienne adresse reste SERVIE pour /api/* et /uploads/* : l'application mobile
 * y appelle encore l'API et charge des images. Seules les requêtes GET/HEAD de
 * pages sont redirigées (une redirection casserait les POST).
 */

const CANONICAL_HOST = 'gracetvs.com'
const LEGACY_HOST = 'ceme-27o.pages.dev'

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url)
  const method = context.request.method
  const isRead = method === 'GET' || method === 'HEAD'

  const isApiOrMedia = url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')

  if (isRead && !isApiOrMedia && (url.hostname === `www.${CANONICAL_HOST}` || url.hostname === LEGACY_HOST)) {
    return Response.redirect(`https://${CANONICAL_HOST}${url.pathname}${url.search}`, 301)
  }

  const response = await context.next()

  // Le fallback de l'application renvoie index.html (200) pour toute URL inconnue :
  // les scanners croient alors que /.env, /.git/config, /backup.sql… existent, et
  // Google indexe des « soft 404 ». Une URL qui ressemble à un fichier (extension ou
  // segment caché) et qui n'a donné que la page d'accueil est un vrai 404.
  const looksLikeFile = /\.[A-Za-z0-9]{1,8}$/.test(url.pathname) || /(^|\/)\.(?!well-known\/)/.test(url.pathname)
  const servedHtml = (response.headers.get('content-type') || '').includes('text/html')
  if (isRead && response.status === 200 && servedHtml && looksLikeFile && !url.pathname.endsWith('.html')) {
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
  }

  // Aperçus de branches et ancienne adresse : ne pas les indexer.
  if (url.hostname.endsWith('.pages.dev')) {
    const res = new Response(response.body, response)
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }
  return response
}
