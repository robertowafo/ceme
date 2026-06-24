import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';

// NOTE: contenus de démonstration. À remplacer par les vraies émissions
// (API/D1) lorsqu'une route de listing sera disponible.
const shows = [
  { title: 'Culte Dominical', tag: 'Célébration', img: '/uploads/sermons.jpeg' },
  { title: 'Louange & Adoration', tag: 'Musique', img: '/uploads/louange et adoration.png' },
  { title: 'Impact Jeunesse', tag: 'Jeunesse', img: '/uploads/impact jeunesse.png' },
  { title: 'Heure de Prière', tag: 'Intercession', img: '/uploads/priere.jpeg' },
  { title: 'Études Bibliques', tag: 'Enseignement', img: '/uploads/fonde en.jpeg' },
  { title: 'Témoignages', tag: 'Inspiration', img: '/uploads/mama marie.jpeg' },
];

export function ShowsGrid() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-grace-orange">
            Nos programmes
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-dark mt-2">
            Nos émissions
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {shows.map((show) => (
            <div
              key={show.title}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-grace-blue shadow-md hover:shadow-xl transition-shadow"
            >
              <img
                src={show.img}
                alt={show.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-text-dark/90 via-text-dark/30 to-transparent" />
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-grace-sky mb-1">
                  {show.tag}
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
                  {show.title}
                </h3>
              </div>
              <PlayCircle className="absolute top-4 right-4 w-8 h-8 text-white/0 group-hover:text-white/90 transition-all" />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/emissions"
            className="inline-flex items-center gap-2 bg-grace-blue hover:bg-grace-blue-deep text-white px-7 py-3.5 rounded-full font-display font-semibold text-sm uppercase tracking-wider transition-colors"
          >
            Voir toutes nos émissions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
