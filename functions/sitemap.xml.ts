/**
 * GET /sitemap.xml — généré à la demande : pages statiques + articles de blog
 * publiés (avec leur vraie date de dernière modification). Remplace l'ancien
 * public/sitemap.xml statique, qui oubliait des pages et ne voyait jamais les
 * nouveaux articles.
 */

interface Env {
  DB: D1Database
}

const SITE = 'https://gracetvs.com'

// Pages publiques indexables. Pas de <lastmod> : une date inventée est ignorée
// (voire pénalisée) par Google ; mieux vaut l'omettre.
const STATIC_PAGES = [
  '/', '/live', '/emissions', '/lecture', '/comment-nous-regarder', '/partenaires',
  '/a-propos', '/contact', '/faire-un-don', '/soutenir-grace-tv', '/priere',
  '/eglise', '/eglise/cultes', '/eglise/sermons', '/eglise/priere',
  '/eglise/nous-rejoindre', '/eglise/a-propos', '/eglise/blog',
]

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  let posts: { id: string; publishedAt: string }[] = []
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, published_at AS publishedAt FROM blog_posts WHERE is_published=1 ORDER BY published_at DESC LIMIT 1000'
    ).all<{ id: string; publishedAt: string }>()
    posts = results ?? []
  } catch {
    // Base momentanément indisponible : on sert au moins les pages statiques.
  }

  const urls = [
    ...STATIC_PAGES.map((p) => `  <url><loc>${esc(SITE + p)}</loc></url>`),
    ...posts.map((p) => {
      const d = new Date(p.publishedAt)
      const lastmod = isNaN(d.getTime()) ? '' : `<lastmod>${d.toISOString().slice(0, 10)}</lastmod>`
      return `  <url><loc>${esc(`${SITE}/eglise/blog/${encodeURIComponent(p.id)}`)}</loc>${lastmod}</url>`
    }),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
