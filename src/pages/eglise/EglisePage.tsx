import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, BookOpen, Heart, ArrowRight, MapPin, Church } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { churchSchema } from '../../lib/structuredData';

const quickLinks = [
  { to: '/eglise/cultes', label: 'Agenda des cultes', desc: 'Horaires et programme de la semaine', icon: Calendar },
  { to: '/eglise/sermons', label: 'Sermons & enseignements', desc: 'Prédications et messages en replay', icon: BookOpen },
  { to: '/eglise/priere', label: 'Demandes de prière', desc: 'Confiez-nous vos sujets de prière', icon: Heart },
];

export function EglisePage() {
  return (
    <div className="bg-[#f5f2ed] min-h-screen">
      <SEO
        title="Chapelle de l'Éternel Mon Étendard — Église porteuse de Grâce TV"
        description="La Chapelle de l'Éternel Mon Étendard (CEME) est l'église évangélique porteuse de Grâce TV. Découvrez nos cultes, sermons et activités à Yaoundé."
        path="/eglise"
        structuredData={churchSchema}
      />
      {/* ====== HERO ====== */}
      <section className="relative bg-soft-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/uploads/externe.JPG"
            alt="Façade de la Chapelle de l'Éternel Mon Étendard à Yaoundé"
            className="w-full h-full object-cover opacity-40"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-soft-black via-soft-black/80 to-soft-black/50" />
          <div className="absolute inset-0 cross-pattern-dark opacity-30" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest mb-6">
              <Church className="w-4 h-4" /> Église porteuse de Grâce TV
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Chapelle de l'Éternel<br />
              <span className="text-gold">Mon Étendard</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Une communauté évangélique de Yaoundé, dédiée à la présence de Dieu, à
              l'enseignement fidèle de la Parole et à l'évangélisation — berceau de la
              chaîne <span className="text-gold font-semibold">Grâce TV</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ====== PRÉSENTATION ====== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-soft-black mb-6">Notre église</h2>
        <div className="space-y-4 text-soft-black/80 leading-relaxed">
          <p>
            La <strong>Chapelle de l'Éternel Mon Étendard</strong> (CEME) est une église
            évangélique établie à Yaoundé, au Cameroun. Depuis sa fondation, elle a pour
            vocation de proclamer la Bonne Nouvelle de Jésus-Christ, d'édifier les croyants
            et d'accompagner les familles dans une foi vivante et enracinée dans les Écritures.
          </p>
          <p>
            De cet ancrage spirituel est née <strong>Grâce TV</strong>, la chaîne de télévision
            chrétienne qui porte aujourd'hui ce message bien au-delà des murs de l'église —
            partout, partout.
          </p>
          <p>
            Cultes de célébration, soirées de prière, enseignements bibliques et moments de
            communion fraternelle rythment notre vie d'église, ouverte à tous ceux qui
            cherchent à rencontrer Dieu.
          </p>
        </div>
      </section>

      {/* ====== FONDATEUR ====== */}
      <section className="bg-white border-y border-gold/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <img
            src="/uploads/reverand_essomba.png"
            alt="Rev. Dr Alphonse ESSOMBA BOUNOUGOU, fondateur"
            className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-2xl mx-auto shadow-lg border-4 border-gold/20"
            loading="lazy"
          />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-burgundy">Notre fondateur</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-soft-black mt-2 mb-3">
              Rev. Dr Alphonse ESSOMBA BOUNOUGOU
            </h3>
            <p className="text-soft-black/75 leading-relaxed">
              Pasteur fondateur de la Chapelle de l'Éternel Mon Étendard et initiateur de
              Grâce TV, il consacre son ministère à l'enseignement de la Parole de Dieu et
              à l'annonce de l'Évangile au Cameroun comme au-delà des nations.
            </p>
          </div>
        </div>
      </section>

      {/* ====== ACCÈS RAPIDES ====== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-soft-black mb-8 text-center">
          Participer à la vie de l'église
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group bg-white rounded-2xl p-6 border border-gold/15 hover:border-gold/40 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center mb-4 group-hover:bg-burgundy transition-colors">
                <link.icon className="w-6 h-6 text-burgundy group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-serif text-lg font-bold text-soft-black mb-1">{link.label}</h3>
              <p className="text-sm text-soft-black/60 mb-4">{link.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-burgundy font-bold text-sm uppercase tracking-wider group-hover:gap-2.5 transition-all">
                Découvrir <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/eglise/a-propos"
            className="inline-flex items-center gap-2 bg-soft-black text-white px-7 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-gold hover:text-soft-black transition-colors"
          >
            En savoir plus sur l'église <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ====== MENTIONS LÉGALES ====== */}
      <section className="bg-gray-soft border-t border-grace-sky/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-xs text-soft-black/55 leading-relaxed">
          <p className="flex items-center justify-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5" /> EMOMBO Auberge, BP 6065 — Yaoundé, Région du Centre, Cameroun
          </p>
          <p>
            Chapelle de l'Éternel Mon Étendard — association cultuelle créée par Décret
            N° 0001/L/CE/MINATD/DAP/SDLP/SAC du 5 janvier 2001.
          </p>
        </div>
      </section>
    </div>
  );
}
