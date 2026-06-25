import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: 'L’église est-elle ouverte à tous ?', a: "Oui, absolument. Peu importe votre passé, vos doutes ou vos blessures — vous êtes les bienvenus. Nous accueillons chacun avec amour, sans condition." },
  { q: 'Comment accéder à Grâce TV en direct ?', a: "Grâce TV diffuse partout, en continu : sur YouTube, sur ce site, par satellite et sur le câble (Yaoundé, Douala et au-delà). La chaîne partage aussi les enseignements de pasteurs et ministères partenaires." },
  { q: 'Où se trouve l’église CEME ?', a: "Nous sommes à Emombo Auberge, BP 6065 Yaoundé (Région du Centre, Cameroun). Accessibles en taxi ou en moto, arrêt Emombo Auberge." },
  { q: 'Y a-t-il un programme pour les jeunes ?', a: "Oui ! Impact Jeunesse accueille les 15-25 ans avec des rencontres dynamiques, des formations et des temps de mission." },
  { q: 'Comment faire une demande de prière ?', a: "Vous pouvez soumettre votre requête directement depuis notre page « Demandes de prière ». Notre équipe d’intercesseurs prie pour chaque demande reçue." },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="block text-grace-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">Questions</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-soft-black">
            Ce que vous voulez <span className="text-grace-orange italic">savoir.</span>
          </h2>
        </div>

        <div className="divide-y divide-soft-black/10 border-y border-soft-black/10">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg sm:text-xl font-extrabold text-soft-black">{f.q}</span>
                  <span className="shrink-0 w-8 h-8 rounded-full bg-grace-blue/5 flex items-center justify-center text-grace-orange">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="font-sans text-soft-black/70 leading-relaxed pb-6 pr-12">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
