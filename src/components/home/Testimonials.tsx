import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { getTestimonials, type TestimonialItem } from '../../lib/dbService';

export function Testimonials() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    getTestimonials()
      .then((data) => { if (active && Array.isArray(data)) setItems(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Section masquée tant qu'aucun témoignage n'est disponible
  if (items.length === 0) return null;

  const current = items[index % items.length];
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <section className="bg-gray-soft py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="font-body text-xs uppercase tracking-[0.2em] text-grace-orange font-semibold">· Témoignages</span>
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-grace-dark mt-3 mb-12">
          Ce qu'ils disent de <span className="italic text-grace-blue">Grâce TV</span>
        </h2>

        <div className="relative bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-grace-sky/10">
          <Quote className="w-10 h-10 text-grace-orange/30 mx-auto mb-5" />
          <p className="font-body text-lg sm:text-xl text-grace-dark/80 leading-relaxed italic mb-8">
            « {current.text} »
          </p>
          <div className="flex items-center justify-center gap-3">
            {current.img && (
              <img src={current.img} alt={current.author} className="w-12 h-12 rounded-full object-cover" loading="lazy" />
            )}
            <div className="text-left">
              <p className="font-display font-bold text-grace-dark">{current.author}</p>
              <p className="font-body text-xs text-grace-dark/50">{current.since || current.category}</p>
            </div>
          </div>

          {items.length > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={prev} aria-label="Témoignage précédent" className="w-10 h-10 rounded-full border border-grace-sky/30 flex items-center justify-center text-grace-blue hover:bg-grace-blue hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} aria-label="Témoignage suivant" className="w-10 h-10 rounded-full border border-grace-sky/30 flex items-center justify-center text-grace-blue hover:bg-grace-blue hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
