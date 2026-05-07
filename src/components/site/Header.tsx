import { Link } from "@tanstack/react-router";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart";
import logoImg from "@/assets/logo-liquida.jpg";

export function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl transition-premium">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20 shadow-soft group-hover:scale-110 transition-premium bg-white">
            <img src={logoImg} alt="Liquida Perfumes" className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="text-[12px] font-bold tracking-[0.3em] text-primary">LIQUIDA</div>
            <div className="text-[10px] font-medium tracking-[0.4em] text-muted-foreground/60">PERFUMES</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 md:flex">
          <a href="#kits" className="hover:text-primary transition-colors">Coleção</a>
          <a href="#frete" className="hover:text-primary transition-colors">Entrega</a>
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
      <div className="bg-foreground py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-background/90 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-rose-tea" /> Entrega em 3h</span>
        <span className="hidden sm:flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-rose-tea" /> Até 12x no cartão</span>
        <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-rose-tea" /> 100% Originais</span>
      </div>
    </header>
  );
}
