import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Church, Sunrise, Sparkles, Briefcase, HandHeart, Quote, ArrowRight } from 'lucide-react';
import { PagePlaceholder } from '../components/PagePlaceholder';

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

const programs = [
  { icon: Church, title: 'Culte du Dimanche', cat: 'Célébration', img: '/uploads/sermons.jpeg',
    desc: "Le rassemblement principal de la semaine : adoration, louange et prédication de la Parole, retransmis en direct." },
  { icon: Sunrise, title: 'Manne Matinale', cat: 'Quotidien', img: '/uploads/fonde en.jpeg',
    desc: "Le rendez-vous quotidien pour commencer la journée nourri de la Parole de Dieu, où que vous soyez." },
  { icon: Sparkles, title: "Sommet d'Élévation", cat: 'Rassemblement', img: '/uploads/impact jeunesse.png',
    desc: "Un grand rassemblement d'élévation spirituelle, de délivrance et d'enseignement de haut niveau." },
  { icon: Briefcase, title: 'École des Affaires du Royaume', cat: 'Enseignement', img: '/uploads/louange et adoration.png',
    desc: "Sagesse entrepreneuriale et leadership selon les principes bibliques, pour impacter le monde des affaires." },
  { icon: HandHeart, title: 'Prières Intercession', cat: 'Intercession', img: '/uploads/priere.jpeg',
    desc: "Des temps d'intercession et de combat spirituel où l'Éternel intervient dans les situations impossibles." },
  { icon: Quote, title: 'Témoignage pour la Gloire de Dieu', cat: 'Inspiration', img: '/uploads/mama marie.jpeg',
    desc: "Des vies transformées qui rendent gloire à Dieu et fortifient la foi de toute la communauté." },
];

export function Emissions() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-grace-blue-deep text-white pt-36 pb-20 sm:pt-44 sm:pb-24">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/uploads/fonds-bleu.jpg')" }} />
        <div className="absolute inset-0 bg-grace-blue-deep/50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-5">Programmes</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold leading-tight text-white">
            Nos <span className="text-grace-orange italic">émissions</span>
          </h1>
          <p className="font-sans text-white/80 text-lg mt-6 max-w-2xl mx-auto">
            Enseignements, cultes, prières, musique et témoignages — diffusés 24h/24, partout,
            et en replay sur nos plateformes.
          </p>
        </div>
      </section>

      {/* GRILLE ÉMISSIONS */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p, i) => (
              <motion.div
                key={p.title}
                {...reveal}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="group rounded-3xl overflow-hidden border border-grace-blue/10 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-grace-blue-deep/70 to-transparent" />
                  <span className="absolute top-3 left-3 bg-grace-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">{p.cat}</span>
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-grace-blue" />
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="font-serif text-xl font-extrabold text-soft-black mb-2 leading-tight">{p.title}</h2>
                  <p className="font-sans text-sm text-soft-black/65 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-grace-blue text-white py-16">
        <div className="absolute -top-1/2 right-0 w-[40%] h-[200%] rounded-full bg-grace-orange/15 blur-[100px]" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold mb-4 text-white">Ne manquez aucune émission</h2>
          <p className="font-sans text-white/80 mb-8">Suivez Grâce TV en direct, 24h/24, où que vous soyez.</p>
          <Link to="/live" className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors">
            <Play className="w-4 h-4 fill-white" /> Regarder en direct <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// Détail d'une émission — page à enrichir lorsque les données seront disponibles (V2).
export function EmissionDetail() {
  return (
    <PagePlaceholder
      title="Émission"
      subtitle="Le détail de cette émission sera disponible prochainement. En attendant, retrouvez tous nos programmes en direct."
    />
  );
}
