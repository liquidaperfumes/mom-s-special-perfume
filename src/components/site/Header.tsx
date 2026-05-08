import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart";
import logoImg from "@/assets/logo-liquida.png";
import { motion } from "framer-motion";

// High-reliability SVGs to prevent broken images
const BOTICARIO_SVG = "https://www.boticario.com.br/on/demandware.static/-/Sites-boticario-Library/default/dw1d96096a/images/header/logo-boticario.svg";

export function Header() {
  const { count, setOpen } = useCart();
  const [boticarioError, setBoticarioError] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl transition-premium">
      {/* Promo TopBar */}
      <div className="bg-primary py-2 text-center overflow-hidden">
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2"
        >
          <span className="animate-pulse">⚡</span> Estoque limitado · Compre até 10/05 para aproveitar as ofertas do Dia das Mães
        </motion.p>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center group">
            <div className="h-10 sm:h-12 overflow-hidden group-hover:scale-105 transition-premium flex items-center">
              <img src={logoImg} alt="Liquida Perfumes" className="h-full w-auto object-contain" />
            </div>
          </Link>
          
          <div className="h-8 w-px bg-border/60 mx-1" />
          
          {/* Partnership Widget */}
          <div className="flex flex-col justify-center">
            <div className="h-5 sm:h-7 flex items-center">
              {boticarioError ? (
                <span className="text-[10px] font-black uppercase text-foreground/80">O Boticário</span>
              ) : (
                <img 
                  src={BOTICARIO_SVG} 
                  alt="O Boticário" 
                  className="h-full w-auto object-contain brightness-0 opacity-80" 
                  onError={() => setBoticarioError(true)}
                />
              )}
            </div>
            <p className="text-[6px] sm:text-[7px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 -mt-0.5">Onde tem amor tem beleza</p>
          </div>
        </div>

        <nav className="hidden items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 md:flex">
          <a href="#kits" className="hover:text-primary transition-colors">Coleção</a>
          <a href="#loja" className="hover:text-primary transition-colors">Loja</a>
        </nav>

        <button
          onClick={() => setOpen(true)}
          className="group relative flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white shadow-soft transition-premium hover:scale-[1.05] active:scale-[0.98] hover:bg-primary-glow"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Sacola</span>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-black text-background ring-2 ring-background">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
