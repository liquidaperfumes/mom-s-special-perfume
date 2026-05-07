import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "Os produtos são originais?", a: "Sim, 100%. Trabalhamos diretamente com produtos lacrados e originais das melhores marcas, com garantia." },
  { q: "Em quanto tempo recebo meu pedido?", a: "Entregas no Grande Recife levam de 1 a 5 dias úteis dependendo do bairro. O prazo aparece após você inserir o CEP/bairro." },
  { q: "Posso retirar na loja?", a: "Sim! Retirada gratuita em nossa loja em Olinda – Estrada do Caenga, 235 – São Benedito. Disponível no mesmo dia da compra." },
  { q: "Quais formas de pagamento?", a: "Pix, cartão de crédito (até 10x sem juros) e boleto. Pagamento 100% seguro." },
  { q: "E se eu quiser trocar?", a: "Você tem até 7 dias após o recebimento para trocar, desde que o produto esteja lacrado." },
  { q: "Vocês embalam para presente?", a: "Todos os kits já vêm em embalagem premium pronta para presentear. Por dentro, ainda incluímos um cartão personalizável grátis." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-secondary py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">Perguntas frequentes</h2>
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
          {FAQS.map((f, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition hover:bg-secondary/50"
              >
                {f.q}
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
