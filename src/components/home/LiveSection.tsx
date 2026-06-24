import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Play, Clock } from 'lucide-react';

const schedule = [
  { day: 'Dimanche', time: '10:00', label: 'Culte de célébration' },
  { day: 'Mardi', time: '18:00', label: 'Enseignement biblique' },
  { day: 'Vendredi', time: '19:00', label: 'Soirée de prière' },
  { day: 'Tous les jours', time: '24h/24', label: 'Diffusion continue' },
];

export function LiveSection() {
  const [live, setLive] = useState<{ isLive: boolean; videoId: string | null }>({ isLive: false, videoId: null });

  useEffect(() => {
    let active = true;
    fetch('/api/youtube/live')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active && d) setLive({ isLive: !!d.isLive, videoId: d.videoId ?? null }); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <section className="relative overflow-hidden bg-grace-blue-deep text-white py-16 sm:py-24">
      <div className="absolute inset-0 gracetv-stars opacity-60 pointer-events-none" />
      <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[60%] h-[50%] rounded-full bg-grace-sky/15 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-grace-orange/90 text-white px-4 py-1.5 rounded-full text-xs font-body font-bold uppercase tracking-widest animate-live-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {live.isLive ? 'En direct maintenant' : 'Diffusion Grâce TV'}
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mt-5">
            Rejoignez-nous <span className="italic text-grace-gold">en direct</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Player */}
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
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-grace-blue to-grace-blue-deep text-center px-6">
                <Radio className="w-12 h-12 text-grace-sky mb-4" />
                <p className="font-body text-white/80 mb-6 max-w-md">
                  Accédez à la diffusion en direct de Grâce TV sur notre page dédiée.
                </p>
                <Link
                  to="/live"
                  className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-7 py-3.5 rounded-full font-body font-semibold text-sm uppercase tracking-wider transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" /> Accéder au direct
                </Link>
              </div>
            )}
          </div>

          {/* Timeline prochaines émissions */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
              <Clock className="w-5 h-5 text-grace-gold" /> À l'antenne
            </h3>
            <ul className="space-y-4">
              {schedule.map((s) => (
                <li key={s.day} className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <span className="font-display text-grace-gold font-bold text-sm w-20 shrink-0">{s.time}</span>
                  <div>
                    <p className="font-body text-sm font-semibold">{s.label}</p>
                    <p className="font-body text-xs text-white/50">{s.day}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
