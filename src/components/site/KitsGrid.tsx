import { KITS, formatBRL, parcelas, type Kit } from "@/lib/kits";
import { useCart } from "@/lib/cart";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant"
    >
      {kit.badge && (
        <span className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-soft ${
          kit.badge === "Mais Vendido"
            ? "bg-foreground text-background"
            : "bg-gradient-rose text-primary-foreground"
        }`}>
          {kit.badge}
        </span>
      )}

      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-secondary to-muted">
        <img
          src={kit.imagem}
          alt={kit.nome}
          loading="lazy"
          className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{kit.marca}</p>
          <h3 className="mt-1 text-base font-semibold leading-tight text-foreground">{kit.nome}</h3>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{kit.descricao}</p>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{formatBRL(kit.preco)}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            ou {p.vezes}x de <strong className="text-foreground">{formatBRL(p.valor)}</strong> sem juros
          </p>

          <button
            onClick={onAdd}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary-glow hover:shadow-soft"
          >
            {added ? <><Check className="h-4 w-4" /> Adicionado</> : <><Plus className="h-4 w-4" /> Comprar</>}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function KitsGrid() {
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {KITS.map((k) => <KitCard key={k.id} kit={k} />)}
        </div>
      </div>
    </section>
  );
}
