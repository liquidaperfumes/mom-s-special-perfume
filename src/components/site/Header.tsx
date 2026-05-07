import { Link } from "@tanstack/react-router";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart";

export function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-rose text-primary-foreground">
            <span className="font-display text-2xl leading-none">L</span>
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-semibold tracking-[0.25em] text-primary">LIQUIDA</div>
            <div className="text-[10px] font-medium tracking-[0.3em] text-muted-foreground">PERFUMES</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <a href="#kits" className="hover:text-primary transition-colors">Kits</a>
          <a href="#emocional" className="hover:text-primary transition-colors">Para Mamãe</a>
          <a href="#frete" className="hover:text-primary transition-colors">Entrega</a>
          <a href="#loja" className="hover:text-primary transition-colors">Loja</a>
          <a href="#faq" className="hover:text-primary transition-colors">Dúvidas</a>
        </nav>

        <button
          onClick={() => setOpen(true)}
          className="relative flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:scale-[1.03]"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Sacola</span>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
              {count}
            </span>
          )}
        </button>
      </div>
      <div className="bg-foreground py-2 text-center text-[11px] font-medium tracking-wide text-background sm:text-xs">
        <Sparkles className="mr-1 inline h-3 w-3" /> Frete grátis acima de R$ 250 · Pague em até 10x · Retire na loja em Olinda
      </div>
    </header>
  );
}
