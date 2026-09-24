import { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { getVideoComments, submitVideoComment, VideoComment } from '../lib/dbService';
import { isYtPlaylistId } from '../lib/youtube';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return minutes <= 1 ? "À l'instant" : `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// Fil de commentaires propre à la plateforme, rattaché à un ID vidéo YouTube.
// N'affiche rien pour une playlist (pas de vidéo unique à commenter) ni tant
// que l'ID n'est pas résolu.
export function VideoComments({ videoId, videoTitle }: { videoId: string | null | undefined; videoTitle?: string }) {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    setIsLoading(true);
    getVideoComments(videoId)
      .then(data => { if (!cancelled) setComments(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [videoId]);

  if (!videoId || isYtPlaylistId(videoId)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setIsSending(true);
    setError('');
    try {
      await submitVideoComment({ videoId, videoTitle, authorName: name.trim(), message: message.trim() });
      setMessage('');
      const updated = await getVideoComments(videoId);
      setComments(updated);
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue, réessayez.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-white/10">
      <h4 className="flex items-center gap-2 text-white font-serif font-bold text-sm mb-4">
        <MessageCircle className="w-4 h-4 text-grace-orange" />
        Commentaires
        {comments.length > 0 && <span className="text-white/40 font-sans font-normal">({comments.length})</span>}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-2.5 mb-6">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Votre nom"
          maxLength={60}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-grace-orange/50 focus:outline-none transition-colors"
        />
        <div className="flex gap-2 items-end">
          <textarea
            rows={2}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Laissez un commentaire sur cette vidéo..."
            maxLength={800}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 resize-none focus:border-grace-orange/50 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isSending || !name.trim() || !message.trim()}
            className="shrink-0 w-10 h-10 rounded-lg bg-grace-orange hover:bg-grace-orange-dark disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            aria-label="Envoyer le commentaire"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </form>

      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-white/30 text-xs">Chargement des commentaires...</p>
        ) : comments.length === 0 ? (
          <p className="text-white/30 text-xs">Soyez le premier à commenter cette vidéo.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-grace-orange/15 text-grace-orange flex items-center justify-center font-serif font-bold text-xs">
                {c.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs font-bold">{c.authorName}</span>
                  <span className="text-white/30 text-[10px]">{timeAgo(c.submittedAt)}</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed mt-0.5 break-words">{c.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
