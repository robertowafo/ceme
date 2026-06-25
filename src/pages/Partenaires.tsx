import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, Share2, Tv, HandHeart, ArrowRight, Cable } from 'lucide-react';
import { SEO } from '../components/SEO';

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

const pillars = [
  { icon: Share2, title: 'Voix partenaires', desc: "Grâce TV diffuse les enseignements de pasteurs et de ministères partenaires, pour une Bonne Nouvelle partagée au-delà d'une seule église." },
  { icon: Globe, title: 'Une portée sans frontières', desc: "Web, YouTube et satellite portent nos programmes partout dans le monde — bien au-delà de Yaoundé et Douala." },
  { icon: Tv, title: 'Câblodistributeurs', desc: "Des partenaires de câblodistribution relaient Grâce TV à Yaoundé, Douala et au-delà." },
];

export function Partenaires() {
  return (
    <div className="bg-white">
      <SEO
        title="Nos partenaires — Grâce TV"
        description="Grâce TV collabore avec CREOLINK, des câblodistributeurs et des pasteurs partenaires pour porter la Bonne Nouvelle partout, au Cameroun et au-delà."
        path="/partenaires"
      />
      {/* HERO */}
      <section className="relative overflow-hidden bg-grace-blue-deep text-white pt-36 pb-20 sm:pt-44 sm:pb-24">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/uploads/fonds-bleu.jpg')" }} />
        <div className="absolute inset-0 bg-grace-blue-deep/50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-5">Ensemble</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold leading-tight text-white">
            Nos <span className="text-grace-orange italic">partenaires</span>
          </h1>
          <p className="font-sans text-white/80 text-lg mt-6 max-w-2xl mx-auto">
            Ils nous accompagnent pour porter la Bonne Nouvelle partout, partout.
          </p>
        </div>
      </section>

      {/* PILIERS */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              {...reveal}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="rounded-3xl border border-grace-blue/10 bg-gray-soft p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-grace-orange/15 flex items-center justify-center mb-5">
                <p.icon className="w-7 h-7 text-grace-orange" />
              </div>
              <h2 className="font-serif text-xl font-extrabold text-soft-black mb-2">{p.title}</h2>
              <p className="font-sans text-sm text-soft-black/65 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CREOLINK — discret */}
      <section className="pb-20 sm:pb-28 bg-white">
        <motion.div {...reveal} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-grace-blue/10 bg-grace-blue/[0.03] p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-grace-blue/10 flex items-center justify-center shrink-0">
              <Cable className="w-8 h-8 text-grace-blue" />
            </div>
            <div className="text-center sm:text-left">
              <span className="block text-grace-orange text-[11px] font-semibold uppercase tracking-[0.2em] mb-1">Partenaire technique</span>
              <h3 className="font-serif text-xl font-extrabold text-soft-black mb-1">CREOLINK</h3>
              <p className="font-sans text-sm text-soft-black/65 leading-relaxed">
                Partenaire de connectivité et de diffusion, CREOLINK contribue à acheminer le
                signal de Grâce TV.
              </p>
            </div>
          </div>
          {/* TODO: ajouter les logos/noms des autres partenaires et câblodistributeurs fournis par l'équipe */}
        </motion.div>
      </section>

      {/* CTA DEVENIR PARTENAIRE */}
      <section className="relative overflow-hidden bg-grace-blue text-white py-16">
        <div className="absolute -top-1/2 right-0 w-[40%] h-[200%] rounded-full bg-grace-orange/15 blur-[100px]" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HandHeart className="w-10 h-10 text-grace-orange mx-auto mb-5" />
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold mb-4 text-white">Devenir partenaire de Grâce TV</h2>
          <p className="font-sans text-white/80 mb-8">Pasteur, ministère, câblodistributeur ou soutien : rejoignez l'aventure de la Bonne Nouvelle partout, partout.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors">
            Nous contacter <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
