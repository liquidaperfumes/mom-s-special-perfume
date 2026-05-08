import heroImg from "@/assets/hero-maes.jpg";
import logoImg from "@/assets/logo-liquida.png";
import { Countdown } from "./Countdown";
import { ShieldCheck, Truck, Store } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-hero text-primary-foreground flex items-center">
      <div
        className="absolute inset-0 opacity-30 scale-105 animate-pulse"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "overlay",
          filter: "blur(20px)"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.18_0.05_350)]/40 to-[oklch(0.18_0.05_350)]" />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 pb-20 pt-10 sm:pt-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-8"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="flex items-center gap-5 bg-white/10 backdrop-blur-md rounded-[1.5rem] p-3 px-5 border border-white/20"
            >
              <img src={logoImg} alt="Liquida Perfumes" className="h-10 sm:h-12 w-auto object-contain" />
              <div className="h-8 w-px bg-white/20" />
              <div className="flex flex-col">
                <img 
                  src="https://www.boticario.com.br/on/demandware.static/-/Sites-boticario-Library/default/dw1d96096a/images/header/logo-boticario.svg" 
                  alt="O Boticário" 
                  className="h-6 sm:h-8 w-auto object-contain brightness-0 invert" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML += '<span class="text-[10px] font-black uppercase text-white">O Boticário</span>';
                  }}
                />
                <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] text-white/70 -mt-1">Onde tem amor tem beleza</p>
              </div>
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] backdrop-blur-md"
            >
              Campanha Especial 2026
            </motion.span>
          </div>

          <h1 className="text-4xl font-bold leading-[1.05] text-balance sm:text-6xl lg:text-7xl tracking-tight">
            O presente que <br />
            <span className="font-medium italic" style={{ color: '#F7ADAF' }}>eterniza</span> <br />
            o <span className="text-white font-extrabold">sentimento.</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-primary-foreground/80 sm:text-xl font-light">
            Em uma parceria exclusiva entre <strong className="text-white font-medium">Liquida Perfumes</strong> e <strong className="text-white font-medium">O Boticário</strong>, trazemos kits premium com fragrâncias originais e lacradas para o presente perfeito.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="#kits"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 py-5 text-sm font-bold uppercase tracking-wider text-rose-deep shadow-premium transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-rose-tea/10 opacity-0 transition-opacity group-hover:opacity-100" />
              Escolher meu presente
            </a>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 sm:gap-6 text-[11px] font-medium uppercase tracking-widest text-white/70">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-rose-tea" /> 100% Originais</span>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-rose-tea" /> Entregamos presentes</span>
            <span className="flex items-center gap-2"><Store className="h-4 w-4 text-rose-tea" /> Retirada Hoje</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-rose-deep/20 to-gold/20 blur-2xl" />
          <div className="relative flex flex-col items-center gap-6 rounded-[2rem] border border-white/20 bg-white/5 p-8 backdrop-blur-2xl shadow-premium sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
              Contagem Regressiva
            </p>
            <Countdown light />
            <div className="h-px w-full bg-white/10" />
            <p className="text-center text-sm font-light leading-relaxed text-white/80">
              Garanta seu kit até <strong className="font-semibold text-white">10/05</strong> para receber a tempo do <strong className="font-semibold text-white">Dia das Mães!</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
