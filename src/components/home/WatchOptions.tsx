import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Youtube, Tv, Globe, ArrowRight } from 'lucide-react';

const options = [
  { icon: Youtube, title: 'YouTube', desc: 'Diffusion 24/7 et replays accessibles partout dans le monde.' },
  { icon: Tv, title: 'Câble — Yaoundé / Douala', desc: 'Disponible chez nos câblodistributeurs partenaires au Cameroun.' },
  { icon: Globe, title: 'Web', desc: 'Regardez directement depuis ce site, sur ordinateur ou mobile.' },
];

export function WatchOptions() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-grace-orange font-semibold">· Disponible partout</span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-grace-dark mt-3">
            Nous regarder <span className="italic text-grace-blue">partout</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {options.map((opt, i) => (
            <motion.div
              key={opt.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to="/comment-nous-regarder"
                className="group block bg-gray-soft rounded-3xl p-8 border border-transparent hover:border-grace-sky/40 hover:shadow-xl hover:-translate-y-1 transition-all text-center h-full"
              >
                <div className="w-14 h-14 rounded-2xl bg-grace-blue/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-grace-blue transition-colors">
                  <opt.icon className="w-7 h-7 text-grace-blue group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display text-xl font-bold text-grace-dark mb-2">{opt.title}</h3>
                <p className="font-body text-sm text-grace-dark/60 leading-relaxed">{opt.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/comment-nous-regarder"
            className="inline-flex items-center gap-2 text-grace-blue font-body font-semibold text-sm uppercase tracking-wider hover:text-grace-orange transition-colors"
          >
            Toutes les options pour nous suivre <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
