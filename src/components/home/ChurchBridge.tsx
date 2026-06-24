import { Link } from 'react-router-dom';
import { Church, ArrowRight } from 'lucide-react';

export function ChurchBridge() {
  return (
    <section className="bg-gray-soft py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
        <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl order-last md:order-first">
          <img
            src="/uploads/externe.JPG"
            alt="La Chapelle de l'Éternel Mon Étendard à Yaoundé"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-text-dark/10 rounded-3xl" />
        </div>

        <div>
          <span className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-grace-blue">
            <Church className="w-4 h-4 text-grace-sky" /> Notre église porteuse
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-dark mt-3 mb-5">
            La Chapelle de l'Éternel Mon Étendard
          </h2>
          <p className="font-body text-text-dark/75 leading-relaxed mb-4">
            Grâce TV est née de la <strong>Chapelle de l'Éternel Mon Étendard</strong> (CEME),
            église évangélique de Yaoundé. C'est cet ancrage spirituel qui nourrit chaque
            programme diffusé sur la chaîne.
          </p>
          <p className="font-body text-text-dark/75 leading-relaxed mb-7">
            Cultes, sermons, soirées de prière et vie communautaire : découvrez l'église
            qui porte la chaîne.
          </p>
          <Link
            to="/eglise"
            className="inline-flex items-center gap-2 bg-text-dark hover:bg-grace-blue text-white px-7 py-3.5 rounded-full font-display font-semibold text-sm uppercase tracking-wider transition-colors"
          >
            Découvrir l'église CEME <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
