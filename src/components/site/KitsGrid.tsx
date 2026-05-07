import { KITS, formatBRL, parcelas, type Kit } from "@/lib/kits";
import { useCart } from "@/lib/cart";
import { Plus, Check, ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SortOption = "relevancia" | "menor" | "maior";

function KitCard({ kit }: { kit: Kit }) {
  const { add, setOpen } = useCart();
  const [added, setAdded] = useState(false);
  const p = parcelas(kit.preco);

  const onAdd = () => {
    add(kit);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    setTimeout(() => setOpen(true), 250);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft transition-premium hover:-translate-y-2 hover:shadow-premium"
    >
      {kit.badge && (
        <span className={`absolute left-4 top-4 z-10 rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] shadow-soft backdrop-blur-md ${
          kit.badge === "Mais Vendido"
            ? "bg-foreground/90 text-background"
            : "bg-rose-deep/90 text-white"
        }`}>
          {kit.badge}
        </span>
      )}

      <div className="relative aspect-[4/5] overflow-hidden bg-secondary/50">
        <img
          src={kit.imagem}
          alt={kit.nome}
          loading="lazy"
          className="h-full w-full object-contain p-8 transition-transform duration-1000 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-deep/60">{kit.marca}</p>
          <h3 className="mt-2 text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">{kit.nome}</h3>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground/80 line-clamp-2 font-light">{kit.descricao}</p>

        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-foreground">{formatBRL(kit.preco)}</span>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                ou {p.vezes}x de <strong className="text-rose-deep font-bold">{formatBRL(p.valor)}</strong>
              </p>
            </div>
            
            <button
              onClick={onAdd}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-premium ${
                added ? "bg-emerald-500 text-white" : "bg-primary text-white hover:scale-110 active:scale-95 shadow-soft"
              }`}
            >
              {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function SortButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-premium ${
        active
          ? "bg-primary text-white shadow-soft"
          : "bg-background border border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function KitsGrid() {
  const [sort, setSort] = useState<SortOption>("relevancia");

  const sorted = useMemo(() => {
    const list = [...KITS];
    if (sort === "menor") list.sort((a, b) => a.preco - b.preco);
    if (sort === "maior") list.sort((a, b) => b.preco - a.preco);
    return list;
  }, [sort]);

  return (
    <section id="kits" className="relative bg-background py-16 sm:py-24">
      <div className="pattern-l absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Coleção 2026</span>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-balance sm:text-5xl">
            16 kits para presentear<br />
            <em className="italic text-primary">com o coração.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Selecionamos os perfumes mais amados das melhores marcas, em kits prontos com embalagem premium para presentear.
          </p>
        </div>

        {/* Sort Filter */}
        <div className="mb-8 flex items-center justify-center gap-2 sm:gap-3">
          <SortButton
            active={sort === "relevancia"}
            onClick={() => setSort("relevancia")}
            icon={<ArrowUpDown className="h-3.5 w-3.5" />}
            label="Relevância"
          />
          <SortButton
            active={sort === "menor"}
            onClick={() => setSort("menor")}
            icon={<ArrowUpNarrowWide className="h-3.5 w-3.5" />}
            label="Menor preço"
          />
          <SortButton
            active={sort === "maior"}
            onClick={() => setSort("maior")}
            icon={<ArrowDownNarrowWide className="h-3.5 w-3.5" />}
            label="Maior preço"
          />
        </div>

        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {sorted.map((k) => <KitCard key={k.id} kit={k} />)}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
