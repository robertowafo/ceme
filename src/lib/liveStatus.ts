export interface LiveData {
  isLive: boolean;
  videoId: string | null;
  title?: string;
  description?: string;
  publishedAt?: string;
  channelId?: string;
}

/* Récupère le statut du direct avec réessais automatiques : un raté ponctuel
   (API YouTube lente, démarrage à froid du Worker) ne doit jamais bloquer
   l'affichage jusqu'à ce que le visiteur pense à actualiser lui-même. */
export async function fetchLiveStatus(attempts = 3, timeoutMs = 6000, backoffMs = 1000): Promise<LiveData | null> {
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch('/api/youtube/live', { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) return data as LiveData;
      }
    } catch {
      clearTimeout(timer);
    }
    if (i < attempts - 1) await new Promise(r => setTimeout(r, backoffMs * (i + 1)));
  }
  return null;
}
