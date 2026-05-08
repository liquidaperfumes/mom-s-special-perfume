import { useState } from "react";
import { BAIRROS_DISPONIVEIS, calcularFrete, type FreteResult } from "@/lib/frete";
import { formatBRL } from "@/lib/kits";
import { useCart } from "@/lib/cart";
import { Truck, MapPin, Store } from "lucide-react";

export function FreteCalc() {
  const { total } = useCart();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<FreteResult | null>(null);

  const sugestoes = q.length >= 2
    ? BAIRROS_DISPONIVEIS.filter((b) => b.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  const escolher = (b: string) => {
    setQ(b);
    setRes(calcularFrete(b));
  };

  const wa = `https://wa.me/5581995811306?text=${encodeURIComponent(
    `Olá! Meu bairro é "${q}" e gostaria de saber sobre entrega.`
  )}`;

  return (
    <section id="frete" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-secondary p-6 shadow-soft sm:p-10">
          <div className="text-center">
            <Truck className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl">Calcule seu frete</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Digite seu bairro e veja o valor da entrega na hora. Entrega rápida e segura!
            </p>
          </div>

          <div className="relative mx-auto mt-6 max-w-md">
            <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setRes(null); }}
              placeholder="Ex: Casa Caiada, Boa Viagem…"
              className="w-full rounded-full border border-input bg-background py-4 pl-12 pr-4 text-sm outline-none ring-primary focus:ring-2"
            />
            {sugestoes.length > 0 && !res && (
              <ul className="absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-auto rounded-2xl border border-border bg-popover shadow-elegant">
                {sugestoes.map((s) => (
                  <li key={s}>
                    <button onClick={() => escolher(s)} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-accent">
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mx-auto mt-4 flex max-w-md justify-center">
            <button
              onClick={() => setRes(calcularFrete(q))}
              disabled={!q}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-50"
            >
              Calcular
            </button>
          </div>

          {res && (
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border bg-background p-5">
              {res.disponivel ? (
                <div className="space-y-2 text-center">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{res.bairro}</p>
                  <p className="text-3xl text-primary">
                    {formatBRL(res.valor)}
                  </p>
                  <p className="text-sm text-muted-foreground">Entrega rápida</p>
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <p className="text-sm font-semibold">Seu bairro não está na nossa rota fixa 😢</p>
                  <p className="text-xs text-muted-foreground">Mas a gente te atende! Escolha uma das opções:</p>
                  <div className="flex flex-col gap-2 justify-center">
                    <a href="#loja" className="inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-background shadow-soft transition-premium active:scale-95">
                      <Store className="h-4 w-4" /> Retirar na loja
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
