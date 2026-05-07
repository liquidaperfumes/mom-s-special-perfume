import heroImg from "@/assets/hero-maes.jpg";
import { Countdown } from "./Countdown";
import { ShieldCheck, Truck, Store } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "overlay",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.18_0.05_350)]/95" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-6"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur">
            ✦ Edição Dia das Mães 2026
          </span>

          <h1 className="font-display text-5xl font-medium leading-[0.95] text-balance sm:text-6xl lg:text-7xl">
            Transforme<br />
            <em className="italic text-[oklch(0.92_0.05_15)]">carinho</em> em<br />
            <span className="text-[oklch(0.95_0.04_15)]">memória.</span>
          </h1>

          <p className="max-w-xl text-base text-primary-foreground/85 sm:text-lg">
            Kits especiais com os perfumes preferidos de quem cuidou de você a vida inteira.
            <strong className="font-semibold text-primary-foreground"> Originais, prontos para presentear</strong> e
            entregues no tempo certo.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#kits"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground px-7 py-4 text-sm font-bold uppercase tracking-wider text-primary shadow-elegant transition hover:scale-[1.02]"
            >
              Garantir meu kit →
            </a>
            <a
              href="#emocional"
              className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 px-7 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-foreground/10"
            >
              Ver história
            </a>
          </div>

          <div className="mt-2 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> 100% Originais</span>
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Entrega Rápida</span>
            <span className="flex items-center gap-1.5"><Store className="h-4 w-4" /> Retirada em Olinda</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-start gap-4 rounded-3xl border border-primary-foreground/20 bg-primary-foreground/8 p-6 backdrop-blur-md sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/80">
            ⏱ Faltam para o Dia das Mães
          </p>
          <Countdown light />
          <p className="text-sm text-primary-foreground/80">
            Compre até <strong>04/05</strong> para garantir entrega antes do domingo de presentear.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
