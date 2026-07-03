import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpenCheck, HeartHandshake, Megaphone, Radio, Church, ArrowRight, MapPin } from 'lucide-react';
import { SEO } from '../components/SEO';
import { founderSchema } from '../lib/structuredData';
import { AboutSection } from '../components/home/AboutSection';
import { ServicesSection } from '../components/home/ServicesSection';
import { ScheduleSection } from '../components/home/ScheduleSection';
import { TimelineSection } from '../components/home/TimelineSection';
import { PartnersBand } from '../components/home/PartnersBand';
import { ProcessSection } from '../components/home/ProcessSection';
import { Testimonials } from '../components/home/Testimonials';
import { FaqSection } from '../components/home/FaqSection';

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6 },
};

const editorial = [
  { icon: BookOpenCheck, title: 'Intégrité biblique', desc: "Une fidélité sans compromis aux Saintes Écritures dans chaque programme diffusé." },
  { icon: HeartHandshake, title: 'Édification du Corps de Christ', desc: "Affermir, encourager et faire grandir les croyants dans la foi." },
  { icon: Megaphone, title: 'Annonce authentique du salut', desc: "Proclamer la Bonne Nouvelle de Jésus-Christ avec clarté et puissance." },
  { icon: Radio, title: 'Diffusion 24h/24', desc: "Cultes, prières, études bibliques, prédications, musique chrétienne et évangélisation, sans interruption." },
];

export function AboutGraceTV() {
  return (
    <div className="bg-white">
      <SEO
        title="À propos de Grâce TV — Une voix chrétienne qui rejoint les nations"
        description="Grâce TV, créée le 14 mars 2011 par le Rev. Dr Alphonse ESSOMBA BOUNOUGOU à Yaoundé, est une chaîne chrétienne dédiée à la diffusion fidèle de l'Évangile."
        path="/a-propos"
        structuredData={founderSchema}
      />
      {/* HERO */}
      <section className="relative overflow-hidden bg-grace-blue-deep text-white pt-36 pb-20 sm:pt-44 sm:pb-28">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/uploads/fonds-bleu.jpg')" }} />
        <div className="absolute inset-0 bg-grace-blue-deep/50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-5">À propos</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold leading-tight text-white">
            À propos de <span className="text-grace-orange italic">Grâce TV</span>
          </h1>
          <p className="font-sans text-white/80 text-lg mt-6 max-w-2xl mx-auto">
            Une voix chrétienne qui rejoint les nations — partout, partout.
          </p>
        </div>
      </section>

      {/* NOTRE HISTOIRE */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...reveal}>
            <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">Notre histoire</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-soft-black leading-tight mb-6">
              Une chaîne née d'un <span className="text-grace-blue italic">appel.</span>
            </h2>
            <div className="font-sans text-soft-black/75 leading-relaxed space-y-4 text-base sm:text-lg">
              <p>
                Grâce TV a été créée le <strong>14 mars 2011 à Yaoundé</strong> par le
                <strong> Rev. Dr Alphonse ESSOMBA BOUNOUGOU</strong>, pasteur fondateur de la
                Chapelle de l'Éternel Mon Étendard (CEME).
              </p>
              <p>
                De cet ancrage spirituel est née la vision d'une télévision chrétienne capable
                de porter la Parole de Dieu au-delà des murs de l'église — jusque dans chaque
                foyer, au Cameroun comme à travers les nations.
              </p>
              <p>
                Aujourd'hui, Grâce TV émet 24h/24 et partage aussi les enseignements de
                pasteurs et ministères partenaires, pour une Bonne Nouvelle vraiment partagée.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* IDENTITÉ DE MARQUE (ex-accueil) */}
      <AboutSection />

      {/* DATES CLÉS (ex-accueil) */}
      <TimelineSection />

      {/* NOTRE VISION */}
      <section className="relative overflow-hidden text-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/uploads/fonds-bleu.jpg')" }} />
        <div className="absolute inset-0 bg-grace-blue-deep/60" />
        <motion.div {...reveal} className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">Notre vision</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold leading-tight mb-6 text-white">
            « Une voix chrétienne qui rejoint les <span className="text-grace-orange italic">nations.</span> »
          </h2>
          <p className="font-sans text-white/80 text-lg leading-relaxed">
            Faire entendre l'Évangile partout où une vie peut être touchée, transformée et
            relevée — sans frontières de villes, de pays ni de moyens de diffusion.
          </p>
        </motion.div>
      </section>

      {/* NOS PROGRAMMES (ex-accueil) */}
      <ServicesSection />

      {/* GRILLE DE DIFFUSION (ex-accueil) */}
      <ScheduleSection />

      {/* NOTRE DÉMARCHE (ex-accueil) */}
      <ProcessSection />

      {/* LIGNE ÉDITORIALE */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...reveal} className="text-center mb-14">
            <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">Notre ligne éditoriale</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-soft-black leading-tight">
              Ce qui guide chacun de nos <span className="text-grace-blue italic">programmes.</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {editorial.map((e, i) => (
              <motion.div
                key={e.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-grace-blue/10 bg-gray-soft p-7"
              >
                <div className="w-12 h-12 rounded-xl bg-grace-orange/15 flex items-center justify-center mb-5">
                  <e.icon className="w-6 h-6 text-grace-orange" />
                </div>
                <h3 className="font-serif text-lg font-extrabold text-soft-black mb-2">{e.title}</h3>
                <p className="font-sans text-sm text-soft-black/65 leading-relaxed">{e.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FONDATEUR */}
      <section className="py-20 sm:py-28 bg-gray-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[auto_1fr] gap-10 items-center">
          <motion.img
            {...reveal}
            src="/uploads/reverand_essomba.png"
            alt="Rev. Dr Alphonse ESSOMBA BOUNOUGOU, fondateur de Grâce TV"
            className="w-52 h-52 sm:w-60 sm:h-60 object-cover rounded-3xl mx-auto shadow-xl ring-4 ring-grace-orange/20"
            loading="lazy"
          />
          <motion.div {...reveal}>
            <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3">Notre fondateur</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-soft-black mb-4">
              Rev. Dr Alphonse ESSOMBA BOUNOUGOU
            </h2>
            <p className="font-sans text-soft-black/75 leading-relaxed">
              Pasteur fondateur de la Chapelle de l'Éternel Mon Étendard et initiateur de
              Grâce TV, il consacre son ministère à l'enseignement fidèle de la Parole de Dieu
              et à l'annonce de l'Évangile au Cameroun comme au-delà des nations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* RAYONNEMENT & PARTENAIRES (ex-accueil) */}
      <PartnersBand />

      {/* TÉMOIGNAGES (ex-accueil) */}
      <Testimonials />

      {/* FAQ (ex-accueil) */}
      <FaqSection />

      {/* ÉGLISE PORTEUSE */}
      <section className="py-20 sm:py-28 bg-white">
        <motion.div {...reveal} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            <Church className="w-4 h-4 text-grace-blue" /> Notre église porteuse
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-soft-black mb-5 leading-tight">
            La Chapelle de l'Éternel Mon Étendard
          </h2>
          <p className="font-sans text-soft-black/75 leading-relaxed mb-8">
            Grâce TV est portée par la CEME, église évangélique de Yaoundé. C'est cet ancrage
            spirituel qui nourrit chaque programme diffusé sur la chaîne.
          </p>
          <Link
            to="/eglise"
            className="inline-flex items-center gap-2 bg-grace-blue hover:bg-grace-blue-deep text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors"
          >
            Découvrir l'église CEME <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* CTA CONTACT */}
      <section className="relative overflow-hidden bg-grace-blue text-white py-20">
        <div className="absolute -top-1/2 right-0 w-[40%] h-[200%] rounded-full bg-grace-orange/15 blur-[100px]" />
        <motion.div {...reveal} className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold mb-4 text-white">Envie d'en savoir plus ?</h2>
          <p className="font-sans text-white/80 mb-8">Contactez l'équipe de Grâce TV — nous serons ravis d'échanger avec vous.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-grace-orange hover:bg-grace-orange-dark text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-wider transition-colors"
          >
            Nous contacter <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* MENTIONS LÉGALES */}
      <section className="bg-gray-soft border-t border-grace-blue/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-xs text-soft-black/55 leading-relaxed">
          <p className="flex items-center justify-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5" /> Siège : Yaoundé, Région du Centre, Cameroun
          </p>
          <p>
            Grâce TV — immatriculée au RCCM sous le n° RC/YAO/2015/A/320 du 16 janvier 2015.
            Chaîne portée par la Chapelle de l'Éternel Mon Étendard (CEME).
          </p>
        </div>
      </section>
    </div>
  );
}
