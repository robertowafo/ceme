import { motion } from 'motion/react';
import { useCountUp } from './useCountUp';

function StatCard({
  target, prefix = '', suffix = '', label, className,
}: { target: number; prefix?: string; suffix?: string; label: string; className: string }) {
  const [value, ref] = useCountUp(target);
  return (
    <div ref={ref} className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between min-h-[160px] ${className}`}>
      <span className="font-display text-4xl sm:text-5xl font-bold leading-none">
        {prefix}{value}{suffix}
      </span>
      <span className="font-body text-sm mt-4 opacity-80">{label}</span>
    </div>
  );
}

export function StatsBento() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="font-body text-xs uppercase tracking-[0.2em] text-grace-orange font-semibold">
            · Qui sommes-nous
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-grace-dark mt-3 leading-tight">
            Une chaîne de télévision<br />au service de la <span className="italic text-grace-blue">Foi</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard target={2011} label="Année de création — Yaoundé" className="bg-grace-blue text-white" />
          <StatCard target={24} suffix="/7" label="Diffusion en continu, jour et nuit" className="bg-grace-gold text-grace-dark" />
          <StatCard target={2} label="Villes câblées : Yaoundé & Douala" className="bg-grace-sky text-white" />
          <div className="rounded-3xl p-7 sm:p-8 flex flex-col justify-between min-h-[160px] bg-grace-dark text-white">
            <span className="font-display text-4xl sm:text-5xl font-bold leading-none">∞</span>
            <span className="font-body text-sm mt-4 opacity-80">La Bonne Nouvelle, partout</span>
          </div>
        </div>
      </div>
    </section>
  );
}
