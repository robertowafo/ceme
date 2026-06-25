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

  // Masqué tant qu'aucun témoignage réel n'est disponible (aucune donnée inventée)
  if (items.length === 0) return null;

  const current = items[index % items.length];
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <section className="bg-grace-blue-deep text-white py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">Ce que Dieu a fait</span>
        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold mb-12 text-white">
          Des vies <span className="text-grace-orange italic">transformées</span>
        </h2>

        <div className="relative border border-white/10 rounded-3xl p-8 sm:p-12 bg-white/[0.03]">
          <Quote className="w-10 h-10 text-grace-orange/40 mx-auto mb-6" />
          <p className="font-serif text-xl sm:text-2xl leading-relaxed italic text-white/90 mb-8">
            « {current.text} »
          </p>
          <div className="flex items-center justify-center gap-3">
            {current.img && (
              <img src={current.img} alt={current.author} className="w-12 h-12 rounded-full object-cover ring-2 ring-grace-orange/30" loading="lazy" />
            )}
            <div className="text-left">
              <p className="font-serif font-extrabold">{current.author}</p>
              <p className="font-sans text-xs text-grace-orange uppercase tracking-widest">{current.since || current.category}</p>
            </div>
          </div>

          {items.length > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={prev} aria-label="Témoignage précédent" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-grace-orange hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} aria-label="Témoignage suivant" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-grace-orange hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
