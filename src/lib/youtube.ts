/* Helpers partagés vidéo / playlist YouTube.
   Un "youtubeId" stocké en base peut être :
   - un ID vidéo (11 caractères)
   - un ID de playlist (PL…, UU…, FL…, OL…) */

export function isYtPlaylistId(id: string): boolean {
  return /^(PL|UU|FL|OL)[\w-]{10,}$/.test(id || '');
}

export function ytEmbedUrl(id: string, autoplay = true): string {
  const ap = autoplay ? '&autoplay=1' : '';
  return isYtPlaylistId(id)
    ? `https://www.youtube.com/embed/videoseries?list=${id}&rel=0${ap}`
    : `https://www.youtube.com/embed/${id}?rel=0${ap}`;
}

/* Vignette : les playlists n'ont pas d'URL de vignette dérivable de l'ID —
   retourne null, le consommateur affiche son fallback ou enrichit via
   /api/youtube/video-info (qui gère aussi les playlists). */
export function ytThumbUrl(id: string): string | null {
  return isYtPlaylistId(id) ? null : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/* Retrouve l'ID (vidéo ou playlist) à partir d'une URL générée par ytEmbedUrl —
   utile quand seul l'embedUrl est disponible (ex: VideoContent du hub d'accueil),
   pour savoir sur quel ID rattacher des commentaires. */
export function extractIdFromEmbedUrl(embedUrl: string): string | null {
  try {
    const url = new URL(embedUrl);
    const listParam = url.searchParams.get('list');
    if (listParam) return listParam;
    const last = url.pathname.split('/').filter(Boolean).pop();
    return last && last !== 'videoseries' ? last : null;
  } catch {
    return null;
  }
}
