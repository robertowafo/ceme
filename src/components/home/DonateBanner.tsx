import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function DonateBanner() {
  return (
    <section className="relative overflow-hidden bg-grace-blue text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-grace-blue to-grace-blue-deep" />
      <div className="absolute -top-1/2 right-0 w-[40%] h-[200%] rounded-full bg-grace-orange/15 blur-[100px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <Heart className="w-10 h-10 text-grace-orange mx-auto mb-5 fill-grace-orange/20" />
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
          Soutenez la diffusion de la Bonne Nouvelle
        </h2>
        <p className="font-body text-white/80 max-w-xl mx-auto mb-8">
          Votre don permet à Grâce TV de continuer à émettre 24h/24 et de toucher
          toujours plus de foyers.
        </p>
        <Link
          to="/faire-un-don"
          className="inline-flex items-center gap-2 bg-white text-grace-blue px-8 py-4 rounded-full font-display font-bold text-sm uppercase tracking-wider hover:bg-grace-orange hover:text-white transition-colors shadow-lg"
        >
          <Heart className="w-4 h-4" /> Faire un don
        </Link>
      </div>
    </section>
  );
}
