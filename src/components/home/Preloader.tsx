import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

export function Preloader() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Ne joue qu'une fois par session
    if (sessionStorage.getItem('gracetv_intro_seen')) {
      if (root.current) root.current.style.display = 'none';
      return;
    }
    const el = root.current;
    if (!el) return;

    document.body.style.overflow = 'hidden';
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem('gracetv_intro_seen', '1');
          if (el) el.style.display = 'none';
          document.body.style.overflow = '';
        },
      });
      tl.to('.preloader-cross path', { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' })
        .from('.preloader-word', { yPercent: 110, opacity: 0, duration: 0.7, ease: 'power4.out' }, '-=0.5')
        .to('.preloader-word', { opacity: 1, duration: 0.4 })
        .to(el, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' }, '+=0.4');
    }, el);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] bg-grace-blue-deep flex flex-col items-center justify-center gap-6"
    >
      <svg className="preloader-cross" width="56" height="72" viewBox="0 0 56 72" fill="none">
        <path
          d="M28 4 V68 M10 24 H46"
          stroke="#F26522"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ strokeDasharray: 200, strokeDashoffset: 200 }}
        />
      </svg>
      <div className="overflow-hidden">
        <div className="preloader-word font-serif text-white text-3xl sm:text-4xl font-extrabold tracking-[0.2em]">
          GRÂCE TV
        </div>
      </div>
    </div>
  );
}
