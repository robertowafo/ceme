/**
 * GET /api/playlist-items?playlistId=PLxxx
 * Retourne les items d'une playlist YouTube (max 50).
 * Utilisé par la page /emissions pour afficher la grille de vidéos.
 */

interface Env {
  YOUTUBE_API_KEY: string;
}

const CACHE_TTL = 1800; // 30 min

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url      = new URL(context.request.url);
  const plId     = url.searchParams.get('playlistId');
  const apiKey   = context.env.YOUTUBE_API_KEY;

  const empty = () =>
    new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });

  // Format d'ID de playlist YouTube uniquement (évite les clés de cache arbitraires).
  if (!plId || !apiKey || !/^[\w-]{10,64}$/.test(plId)) return empty();

  const cache    = (caches as any).default as Cache;
  const cacheKey = new Request(`https://internal-cache.dev/pl-items-${plId}`);
  const cached   = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(plId)}&maxResults=50&key=${apiKey}`;
    const res    = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data   = (await res.json()) as any;

    const items = (data.items || [])
      .map((item: any) => ({
        videoId  : item.contentDetails?.videoId ?? '',
        title    : item.snippet?.title ?? '',
        thumbnail:
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.medium?.url ??
          `https://img.youtube.com/vi/${item.contentDetails?.videoId}/hqdefault.jpg`,
        position : item.snippet?.position ?? 0,
      }))
      .filter(
        (v: any) =>
          v.videoId &&
          v.videoId !== 'Private video' &&
          !v.title.startsWith('Private video') &&
          !v.title.startsWith('Deleted video'),
      );

    const response = new Response(JSON.stringify(items), {
      headers: {
        'Content-Type' : 'application/json',
        'Cache-Control': `max-age=${CACHE_TTL}`,
      },
    });
    await cache.put(cacheKey, response.clone());
    return response;
  } catch (err: any) {
    console.error('playlist-items error', err?.message);
    return new Response(JSON.stringify({ error: 'Service YouTube momentanément indisponible' }), {
      status : 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
