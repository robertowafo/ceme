import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Youtube, Globe, Satellite, Tv, Play, ArrowRight, Share2 } from 'lucide-react';

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

const channels = [
  { icon: Globe, title: 'Sur le web', desc: "Regardez Grâce TV en direct directement depuis ce site, sur ordinateur, tablette ou mobile.", action: { label: 'Regarder maintenant', to: '/live' } },
  { icon: Youtube, title: 'Sur YouTube', desc: "Suivez la diffusion en continu et retrouvez les replays de nos émissions sur notre chaîne YouTube." },
  { icon: Satellite, title: 'Par satellite', desc: "Grâce TV rayonne au-delà des frontières grâce à la diffusion satellite — partout, partout." },
  { icon: Tv, title: 'Sur le câble', desc: "Disponible chez nos câblodistributeurs partenaires à Yaoundé, Douala et au-delà." },
];

export function CommentNousRegarder() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-grace-blue-deep text-white pt-36 pb-20 sm:pt-44 sm:pb-24">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/uploads/fonds-bleu.jpg')" }} />
        <div className="absolute inset-0 bg-grace-blue-deep/50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-5">Disponible partout</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold leading-tight text-white">
            Comment nous <span className="text-grace-orange italic">regarder</span>
          </h1>
          <p className="font-sans text-white/80 text-lg mt-6 max-w-2xl mx-auto">
            Grâce TV vous rejoint partout, 24h/24 — choisissez le canal qui vous convient.
          </p>
        </div>
      </section>

      {/* CANAUX */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-6">
          {channels.map((c, i) => (
            <motion.div
              key={c.title}
              {...reveal}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
              className="rounded-3xl border border-grace-blue/10 bg-gray-soft p-8 flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-grace-blue/10 flex items-center justify-center mb-5">
                <c.icon className="w-7 h-7 text-grace-blue" />
              </div>
              <h2 className="font-serif text-2xl font-extrabold text-soft-black mb-2">{c.title}</h2>
              <p className="font-sans text-soft-black/65 leading-relaxed flex-1">{c.desc}</p>
              {c.action && (
                <Link to={c.action.to} className="mt-5 inline-flex items-center gap-2 text-grace-blue font-sans font-bold text-sm uppercase tracking-wider hover:text-grace-orange transition-colors">
                  {c.action.label} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Note câblodistributeurs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="rounded-2xl border border-dashed border-grace-blue/20 bg-white p-6 text-sm text-soft-black/60 font-sans">
            <p className="flex items-center gap-2 font-semibold text-soft-black mb-1">
              <Share2 className="w-4 h-4 text-grace-orange" /> Voix partenaires
            </p>
            Grâce TV partage aussi les enseignements de pasteurs et ministères partenaires.
            {/* TODO: liste précise des câblodistributeurs et fréquences à fournir par l'équipe */}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-grace-blue text-white py-16">
        <div className="absolute -top-1/2 right-0 w-[40%] h-[200%] rounded-full bg-grace-orange/15 blur-[100px]" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold mb-4 text-white">Prêt à nous rejoindre ?</h2>
          <p className="font-sans text-white/80 mb-8">Lancez la diffusion en direct dès maintenant.</p>
          <Link to="/live" className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors">
            <Play className="w-4 h-4 fill-white" /> Regarder en direct
          </Link>
        </div>
      </section>
    </div>
  );
}
