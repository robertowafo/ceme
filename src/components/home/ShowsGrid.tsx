import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

// NOTE: contenus de démonstration. À câbler sur les vraies émissions (API/D1) plus tard.
const shows = [
  { title: 'Culte du Dimanche', desc: 'Célébration et louange en direct chaque dimanche.', img: '/uploads/sermons.jpeg' },
  { title: 'Étude Biblique', desc: 'Plongée profonde et fidèle dans la Parole de Dieu.', img: '/uploads/fonde en.jpeg' },
  { title: 'Louange & Adoration', desc: 'Concerts et temps de worship inspirés.', img: '/uploads/louange et adoration.png' },
  { title: 'Impact Jeunesse', desc: 'Une génération enracinée dans la foi.', img: '/uploads/impact jeunesse.png' },
  { title: 'Heure de Prière', desc: 'Intercession et délivrance prophétique.', img: '/uploads/priere.jpeg' },
  { title: 'Témoignages de Vie', desc: 'Des histoires de transformation par la grâce.', img: '/uploads/mama marie.jpeg' },
];

export function ShowsGrid() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="font-body text-xs uppercase tracking-[0.2em] text-grace-orange font-semibold">
            · Nos émissions
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-grace-dark mt-3 leading-tight">
            Des programmes qui nourrissent<br />l'âme et inspirent le <span className="italic text-grace-blue">cœur</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show, i) => (
            <motion.div
              key={show.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group bg-white rounded-3xl overflow-hidden border-l-4 border-l-transparent hover:border-l-grace-orange shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={show.img}
                  alt={show.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-grace-dark mb-2">{show.title}</h3>
                <p className="font-body text-sm text-grace-dark/60 leading-relaxed">{show.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/emissions"
            className="inline-flex items-center gap-2 bg-grace-blue hover:bg-grace-blue-deep text-white px-8 py-4 rounded-full font-body font-semibold text-sm uppercase tracking-wider transition-all hover:scale-105"
          >
            Voir toutes nos émissions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
