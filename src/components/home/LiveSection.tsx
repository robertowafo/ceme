import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Play } from 'lucide-react';

export function LiveSection() {
  const [live, setLive] = useState<{ isLive: boolean; videoId: string | null }>({
    isLive: false,
    videoId: null,
  });

  useEffect(() => {
    let active = true;
    fetch('/api/youtube/live')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active && d) setLive({ isLive: !!d.isLive, videoId: d.videoId ?? null }); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <section className="bg-text-dark text-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <span className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${live.isLive ? 'bg-red-500 animate-ping' : 'bg-grace-sky'}`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${live.isLive ? 'bg-red-600' : 'bg-grace-sky'}`} />
          </span>
          <span className="font-display text-xs font-bold uppercase tracking-widest text-grace-sky">
            {live.isLive ? 'En direct maintenant' : 'Diffusion Grâce TV'}
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
          En direct sur Grâce TV
        </h2>
        <p className="font-body text-white/70 text-center max-w-2xl mx-auto mb-10">
          Suivez nos cultes, prières et enseignements diffusés en continu, où que vous soyez.
        </p>

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
          {live.videoId ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${live.videoId}?rel=0`}
              title="Grâce TV en direct"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-grace-blue to-grace-blue-deep">
              <Radio className="w-12 h-12 text-grace-sky mb-4" />
              <p className="font-body text-white/80 mb-6 text-center px-6 max-w-md">
                Rejoignez la diffusion en direct de Grâce TV sur notre page dédiée.
              </p>
              <Link
                to="/live"
                className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-7 py-3.5 rounded-full font-display font-semibold text-sm uppercase tracking-wider transition-colors"
              >
                <Play className="w-4 h-4 fill-white" /> Accéder au direct
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
