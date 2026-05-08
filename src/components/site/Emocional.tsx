import emocional from "@/assets/emocional_nova.png";
import { motion } from "framer-motion";

export function Emocional() {
  return (
    <section id="emocional" className="relative overflow-hidden bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="order-2 lg:order-1"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[oklch(0.85_0.07_15)]">
            o presente perfeito
          </span>
          <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] text-balance sm:text-5xl lg:text-6xl">
            Um perfume guarda <em className="italic">tudo</em><br />
            o que as palavras não dizem.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-background/80">
            <p>
              Mãe é colo, é cheiro de casa, é abraço apertado de domingo. E quando o tempo passa,
              é o aroma que traz tudo de volta — a infância, o cuidado, o amor sem palavras.
            </p>
            <p className="text-background/95">
              Presenteie sua mãe com uma fragrância que vai virar memória.
              <br /><span className="font-display italic text-[oklch(0.9_0.06_15)]">Para sempre.</span>
            </p>
          </div>
          <a
            href="#kits"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-elegant transition hover:scale-[1.02]"
          >
            Escolher um kit →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="order-1 lg:order-2"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-elegant">
            <img src={emocional} alt="Mãe e filha em um abraço real e afetuoso" loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
