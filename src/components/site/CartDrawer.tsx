import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/kits";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function CartDrawer() {
  const { items, open, setOpen, remove, setQtd, total } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button onClick={() => setOpen(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" aria-label="Fechar" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-elegant">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-xl"><ShoppingBag className="h-5 w-5" /> Sua sacola</h2>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-accent"><X className="h-5 w-5" /></button>
        </header>

        <div className="flex-1 overflow-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <ShoppingBag className="mb-3 h-10 w-10 opacity-50" />
              <p className="text-sm">Sua sacola está vazia.</p>
              <button onClick={() => setOpen(false)} className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground">Ver kits</button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ kit, qtd }) => (
                <li key={kit.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                  <img src={kit.imagem} alt={kit.nome} className="h-20 w-20 rounded-xl object-contain bg-secondary" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight">{kit.nome}</p>
                      <button onClick={() => remove(kit.id)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground">{kit.marca}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button onClick={() => setQtd(kit.id, qtd - 1)} className="p-1.5 hover:bg-accent rounded-l-full"><Minus className="h-3 w-3" /></button>
                        <span className="min-w-6 text-center text-sm font-semibold">{qtd}</span>
                        <button onClick={() => setQtd(kit.id, qtd + 1)} className="p-1.5 hover:bg-accent rounded-r-full"><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="text-sm font-bold text-primary">{formatBRL(kit.preco * qtd)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="space-y-3 border-t border-border bg-secondary p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-display text-2xl text-primary">{formatBRL(total)}</span>
            </div>
            {total >= 250 && <p className="text-xs font-semibold text-primary">🎉 Você ganhou frete grátis!</p>}
            <button
              onClick={() => { setOpen(false); navigate({ to: "/checkout" }); }}
              className="w-full rounded-full bg-primary py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-soft transition hover:bg-primary-glow"
            >
              Finalizar compra →
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
