import { Link } from 'react-router-dom';
import { Youtube, Tv, Globe, ArrowRight } from 'lucide-react';

const options = [
  { icon: Youtube, title: 'YouTube', desc: 'Diffusion 24/7 et replays accessibles partout dans le monde.' },
  { icon: Tv, title: 'Câble — Yaoundé / Douala', desc: 'Disponible chez nos câblodistributeurs partenaires au Cameroun.' },
  { icon: Globe, title: 'Web', desc: 'Regardez directement depuis ce site, sur ordinateur ou mobile.' },
];

export function WatchOptions() {
  return (
    <section className="bg-gray-soft py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-grace-orange">
            Disponible partout
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-dark mt-2">
            Nous regarder partout
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {options.map((opt) => (
            <Link
              key={opt.title}
              to="/comment-nous-regarder"
              className="group bg-white rounded-2xl p-7 border border-grace-sky/15 hover:border-grace-sky/40 hover:shadow-lg transition-all text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-grace-blue/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-grace-blue transition-colors">
                <opt.icon className="w-7 h-7 text-grace-blue group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display text-lg font-bold text-text-dark mb-2">{opt.title}</h3>
              <p className="font-body text-sm text-text-dark/60 leading-relaxed">{opt.desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/comment-nous-regarder"
            className="inline-flex items-center gap-2 text-grace-blue font-display font-semibold text-sm uppercase tracking-wider hover:text-grace-orange transition-colors"
          >
            Toutes les options pour nous suivre <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
