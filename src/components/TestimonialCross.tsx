import { useState, useEffect } from 'react';
import { Quote, Star, ArrowUp, ArrowLeft, BookOpen, Heart } from 'lucide-react';
import { getTestimonials } from '../lib/dbService';


// Horizontal testimonials (Relations, Community, Brotherhood)
const horizontalTestimonials = [
  {
    id: 'h1',
    text: "J'ai trouvé ici une vraie famille solide, engagée à s'aider à chaque étape de la vie. L'amour est palpable dès le premier pas.",
    author: "Marie-Louise T.",
    since: "Membre depuis 2021"
  },
  {
    id: 'h3',
    text: "Servir à la communauté m'a permis de m'ouvrir aux autres et de donner le meilleur de moi-même pour mes frères et sœurs.",
    author: "Pierre-Noël M.",
    since: "Membre depuis 2015"
  },
  {
    id: 'h2',
    text: "L'accueil chaleureux m'a brisé toute solitude. Après le culte, les moments partagés réchauffent toujours mon cœur.",
    author: "Solange A.",
    since: "Membre depuis 2020"
  },
  {
    id: 'h4',
    text: "Une église fraternelle où la communion n’est pas un vain mot, mais une réalité vécue à chaque rencontre de prière.",
    author: "Jean-Emmanuel O.",
    since: "Membre depuis 2019"
  },
  {
    id: 'h5',
    text: "Je suis arrivé étranger et j'ai été accueilli comme un fils de la maison. C’est la puissance de l'amour de Christ.",
    author: "Dimitri K.",
    since: "Membre depuis 2018"
  }
];

// Vertical testimonials (Relation to God, Prayer, Anointing)
const verticalTestimonials = [
  {
    id: 'v1',
    text: "Louer Dieu avec ferveur ici a libéré mon âme. J'ai expérimenté la délivrance divine lors d’un culte d’adoration.",
    author: "Gabriel N.",
    since: "Intercesseur CEME"
  },
  {
    id: 'v2',
    text: "À travers les enseignements stimulants de la parole, j'ai rebâti des fondations chrétiennes saines et victorieuses.",
    author: "Dimitri K.",
    since: "Membre depuis 2018"
  },
  {
    id: 'v3',
    text: "Le Seigneur a répondu miraculeusement à mes prières de foi pendant nos temps d’intercession brûlants du vendredi.",
    author: "Chantale B.",
    since: "Membre active"
  },
  {
    id: 'v4',
    text: "Ma soif de la présence divine s'est amplifiée. Marcher sous la direction du Saint-Esprit est devenu une réalité.",
    author: "Luc R.",
    since: "Protocole CEME"
  },
  {
    id: 'v5',
    text: "Dans cette maison de prière, j'apprends à honorer l'Éternel par ma vie et à marcher fièrement dans son alliance sainte.",
    author: "Marie-Louise T.",
    since: "Choriste"
  },
  {
    id: 'v6',
    text: "La louange enflammée et l'onction ressentie le dimanche transforment toute ma semaine et ravivent ma foi.",
    author: "Pierre-Noël M.",
    since: "Responsable d'Accueil"
  }
];

export function TestimonialCross() {
  const [activeQuote, setActiveQuote] = useState<{ text: string; author: string; type: string } | null>(null);
  const [hList, setHList] = useState<any[]>(horizontalTestimonials);
  const [vList, setVList] = useState<any[]>(verticalTestimonials);

  useEffect(() => {
    async function fetchCrossTestimonials() {
      try {
        const list = await getTestimonials();
        const horiz = list.filter(t => t.category === 'horizontal');
        const vert = list.filter(t => t.category === 'vertical');

        if (horiz && horiz.length > 0) {
          setHList(horiz.map(item => ({ id: item.id, text: item.text, author: item.author, since: item.since })));
        }
        if (vert && vert.length > 0) {
          setVList(vert.map(item => ({ id: item.id, text: item.text, author: item.author, since: item.since })));
        }
      } catch (err) {
        console.error("Failure loading cross testimonials: ", err);
      }
    }
    fetchCrossTestimonials();
  }, []);

  // Doubled lists for smooth infinite transition
  const doubledHorizontal = [...hList, ...hList, ...hList];
  const doubledVertical = [...vList, ...vList, ...vList];


  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6 w-full max-w-6xl mx-auto select-none overflow-hidden my-6">
      
      {/* Styles for continuous smooth scrolling, customized overlay masks, and intersection z-indexes */}
      <style>{`
        @keyframes marquee-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }

        @keyframes marquee-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-33.3333%);
          }
        }

        .animate-scroll-h {
          display: flex;
          width: max-content;
          animation: marquee-horizontal 28s linear infinite;
        }

        .animate-scroll-v {
          display: flex;
          flex-direction: column;
          height: max-content;
          animation: marquee-vertical 32s linear infinite;
        }

        /* Pauses animation on hover to allow reading */
        .scroller-container:hover .animate-scroll-h,
        .scroller-container:hover .animate-scroll-v {
          animation-play-state: paused;
        }

        /* Ambient glowing cross border style */
        .cross-border-glow {
          box-shadow: 0 0 35px rgba(201, 168, 76, 0.15), inset 0 0 25px rgba(201, 168, 76, 0.08);
        }
      `}</style>

      {/* Dynamic Dimensions Banner */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 text-xs sm:text-sm text-gray-500 font-medium w-full justify-center">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-[#f5f2ed] border border-gold/15 rounded-2xl shadow-sm">
          <ArrowLeft className="w-4 h-4 text-burgundy animate-pulse" />
          <span className="text-soft-black/85"><strong className="text-burgundy">Dimension Fraternelle</strong> (Communion des Saints)</span>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 bg-[#f5f2ed] border border-gold/15 rounded-2xl shadow-sm">
          <ArrowUp className="w-4 h-4 text-gold animate-bounce" />
          <span className="text-soft-black/85"><strong className="text-gold">Dimension Spirituelle</strong> (Alliance & Foi)</span>
        </div>
      </div>

      {/* Main Container representing the complete grid viewport in which the Cross is engraved */}
      {/* We use a solid gold border and a light canvas pattern behind the cross lanes to highlight it */}
      <div className="relative w-full max-w-[850px] h-[880px] md:h-[1050px] bg-white border-4 border-gold rounded-[40px] overflow-hidden shadow-2xl cross-border-glow">
        
        {/* Decorative Grid Grid Overlay Pattern on background */}
        <div className="absolute inset-0 cross-pattern opacity-60 pointer-events-none" />

        {/* ======================================================
            THE FOUR QUADRANT BACKDROP BLOCKS Outline the Cross Setup
            These outline a very clean and pristine cross shape without any surrounding clutter.
        ====================================================== */}
        
        {/* Top-Left Quadrant */}
        <div className="absolute top-0 left-0 w-[calc(50%-130px)] md:w-[calc(50%-150px)] h-[160px] md:h-[220px] bg-white border-r-4 border-b-4 border-gold rounded-br-[28px] z-30" />

        {/* Top-Right Quadrant */}
        <div className="absolute top-0 right-0 w-[calc(50%-130px)] md:w-[calc(50%-150px)] h-[160px] md:h-[220px] bg-white border-l-4 border-b-4 border-gold rounded-bl-[28px] z-30" />

        {/* Bottom-Left Quadrant */}
        <div className="absolute top-[350px] md:top-[440px] bottom-0 left-0 w-[calc(50%-130px)] md:w-[calc(50%-150px)] bg-white border-r-4 border-t-4 border-gold rounded-tr-[28px] z-30" />

        {/* Bottom-Right Quadrant */}
        <div className="absolute top-[350px] md:top-[440px] bottom-0 right-0 w-[calc(50%-130px)] md:w-[calc(50%-150px)] bg-white border-l-4 border-t-4 border-gold rounded-tl-[28px] z-30" />


        {/* ======================================================
            VERTICAL SCROLLER TRACK (UNDERNEATH - z-10)
            Flowing smoothly from Bottom to Top (Céleste dimension)
            This forms the vertical beam of our illuminated cross
        ====================================================== */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[260px] md:w-[300px] h-full overflow-hidden scroller-container z-10 bg-gold/5">
          {/* Subtle vertical guiding lines for cross structure */}
          <div className="absolute inset-y-0 left-0 w-0.5 bg-gold/20" />
          <div className="absolute inset-y-0 right-0 w-0.5 bg-gold/20" />
          
          <div className="animate-scroll-v gap-5 py-4">
            {doubledVertical.map((item, index) => (
              <div
                key={`v-${item.id}-${index}`}
                onClick={() => setActiveQuote({ text: item.text, author: item.author, type: "Foi & Dimension Spirituelle" })}
                className="w-[260px] md:w-[300px] h-[190px] md:h-[220px] rounded-[24px] p-5 md:p-6 bg-white border border-gold/30 hover:border-gold shadow-lg flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-gold/[0.04] to-transparent pointer-events-none rounded-[24px]" />
                <div className="relative">
                  <div className="flex gap-0.5 mb-2 text-gold">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-800 text-xs md:text-[13px] leading-relaxed italic line-clamp-4 group-hover:text-soft-black transition-colors">
                    "{item.text}"
                  </p>
                </div>

                <div className="border-t border-dashed border-gray-250 pt-2.5 relative z-10">
                  <h5 className="font-serif text-xs md:text-sm font-bold text-soft-black group-hover:text-gold transition-colors">{item.author}</h5>
                  <span className="text-[9px] md:text-[10px] text-gray-400 font-light block mt-0.5">{item.since}</span>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* ======================================================
            HORIZONTAL SCROLLER TRACK (ON TOP - z-20)
            Flowing smoothly from Right to Left (Fraternelle dimension)
            This forms the horizontal beam of our illuminated cross
        ====================================================== */}
        <div className="absolute top-[160px] md:top-[220px] left-0 w-full h-[190px] md:h-[220px] overflow-hidden scroller-container z-20 bg-white shadow-[0_15px_30px_rgba(0,0,0,0.15)] border-y-4 border-gold">
          {/* Subtle horizontal gold guidelines */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gold/15" />
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gold/15" />

          <div className="animate-scroll-h gap-5 px-4 h-full items-center">
            {doubledHorizontal.map((item, index) => (
              <div
                key={`h-${item.id}-${index}`}
                onClick={() => setActiveQuote({ text: item.text, author: item.author, type: "Communion & Dimension Fraternelle" })}
                className="w-[260px] md:w-[300px] h-[160px] md:h-[185px] rounded-[24px] p-5 bg-white border border-burgundy/25 hover:border-burgundy/60 shadow-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-burgundy/[0.03] to-transparent pointer-events-none rounded-[24px]" />
                <div className="relative">
                  <div className="flex gap-0.5 mb-2 text-burgundy">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-800 text-xs md:text-[13px] leading-relaxed italic line-clamp-3 group-hover:text-soft-black transition-colors">
                    "{item.text}"
                  </p>
                </div>

                <div className="border-t border-dashed border-gray-250 pt-2.5 relative z-10">
                  <h5 className="font-serif text-xs md:text-sm font-bold text-soft-black group-hover:text-burgundy transition-colors">{item.author}</h5>
                  <span className="text-[9px] md:text-[10px] text-gray-400 font-light block mt-0.5">{item.since}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="text-center mt-6 max-w-lg px-4">
        <p className="text-[11px] text-gray-400 leading-relaxed font-light italic">
          💡 <strong className="text-gold animate-pulse">Survoler la croix</strong> pour figer le défilement et lire un témoignage de votre choix. Cliquez dessus pour l'agrandir à l'écran.
        </p>
      </div>

      {/* Pop-up modal when clicking on any specific testimonial */}
      {activeQuote && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setActiveQuote(null)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-lg w-full border border-gold/30 shadow-2xl relative overflow-hidden text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold via-burgundy to-gold" />
            
            <div className="w-12 h-12 rounded-full bg-[#f5f2ed] text-burgundy flex items-center justify-center mx-auto mb-6">
              <Quote className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy bg-burgundy/10 px-3 py-1 rounded-full">{activeQuote.type}</span>
            <p className="text-gray-800 text-base md:text-lg leading-relaxed italic mt-6 mb-8 font-light">
              "{activeQuote.text}"
            </p>

            <div className="border-t border-gray-100 pt-5">
              <h4 className="font-serif font-bold text-lg text-soft-black">{activeQuote.author}</h4>
              <button
                onClick={() => setActiveQuote(null)}
                className="mt-6 bg-soft-black hover:bg-gold text-white hover:text-soft-black text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-colors cursor-pointer"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
