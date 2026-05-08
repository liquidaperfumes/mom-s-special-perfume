import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/kits";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const { items, open, setOpen, remove, setQtd, total } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-md"
            aria-label="Fechar"
          />
          
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative flex h-full w-full max-w-md flex-col bg-background shadow-premium"
          >
            <header className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="flex items-center gap-3 text-2xl tracking-tight">
                  <ShoppingBag className="h-6 w-6 text-primary" /> 
                  Sua sacola
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Líquida Perfumes</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary transition-colors"><X className="h-6 w-6" /></button>
            </header>

            <div className="flex-1 overflow-auto p-6 scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-30" />
                  </div>
                  <h3 className="text-xl mb-2">Sua sacola está vazia</h3>
                  <p className="text-sm text-muted-foreground font-light mb-8 max-w-[200px]">Adicione algum de nossos kits exclusivos para começar.</p>
                  <button onClick={() => setOpen(false)} className="rounded-full bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:scale-105 transition-premium">Explorar Coleção</button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map(({ kit, qtd }) => (
                    <li key={kit.id} className="group flex gap-4 rounded-3xl border border-border bg-card p-4 transition-premium hover:border-primary/30 hover:shadow-soft">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-secondary/50">
                        <img src={kit.imagem} alt={kit.nome} className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-deep/60">{kit.marca}</p>
                            <h4 className="text-sm font-semibold leading-tight mt-1">{kit.nome}</h4>
                          </div>
                          <button onClick={() => remove(kit.id)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-border p-1 bg-secondary/30">
                            <button onClick={() => setQtd(kit.id, qtd - 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-background transition-colors shadow-sm"><Minus className="h-3 w-3" /></button>
                            <span className="min-w-6 text-center text-xs font-bold">{qtd}</span>
                            <button onClick={() => setQtd(kit.id, qtd + 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-background transition-colors shadow-sm"><Plus className="h-3 w-3" /></button>
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
              <footer className="space-y-4 border-t border-border bg-background p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Estimado</span>
                  <span className="text-3xl text-primary">{formatBRL(total)}</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-full bg-primary py-[18px] text-xs font-bold uppercase tracking-widest text-white shadow-soft transition-premium hover:scale-[1.02] active:scale-[0.98] hover:bg-primary-glow flex items-center justify-center gap-2"
                  >
                    Finalizar pedido →
                  </Link>
                </div>
                <p className="text-center text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">Finalize com segurança e rapidez</p>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
