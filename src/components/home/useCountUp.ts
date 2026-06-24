import { useEffect, useRef, useState } from 'react';

/**
 * Compteur animé déclenché quand l'élément entre dans le viewport.
 * Retourne [valeurAffichée, ref à attacher au conteneur].
 */
export function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
              setValue(Math.round(target * eased));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return [value, ref] as const;
}
