import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Church, ArrowRight } from 'lucide-react';

export function ChurchBridge() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl order-last md:order-first"
        >
          <img
            src="/uploads/externe.JPG"
            alt="La Chapelle de l'Éternel Mon Étendard à Yaoundé"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-[0.2em] text-grace-orange">
            <Church className="w-4 h-4 text-grace-blue" /> · Notre église porteuse
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-grace-dark mt-3 mb-5 leading-tight">
            La Chapelle de l'Éternel<br />Mon Étendard
          </h2>
          <p className="font-body text-grace-dark/70 leading-relaxed mb-4">
            Grâce TV est née de la <strong>Chapelle de l'Éternel Mon Étendard</strong> (CEME),
            église évangélique de Yaoundé. C'est cet ancrage spirituel qui nourrit chaque
            programme diffusé sur la chaîne.
          </p>
          <p className="font-body text-grace-dark/70 leading-relaxed mb-7">
            Cultes, sermons, soirées de prière et vie communautaire : découvrez l'église
            qui porte la chaîne.
          </p>
          <Link
            to="/eglise"
            className="inline-flex items-center gap-2 bg-grace-dark hover:bg-grace-blue text-white px-8 py-4 rounded-full font-body font-semibold text-sm uppercase tracking-wider transition-all hover:scale-105"
          >
            Découvrir l'église CEME <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
