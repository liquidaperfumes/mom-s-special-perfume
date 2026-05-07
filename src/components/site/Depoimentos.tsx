import { Star } from "lucide-react";

const D = [
  { n: "Camila R.", b: "Boa Viagem", t: "Comprei o Lily pra minha mãe e ela amou. Embalagem linda, entrega no dia seguinte!", s: 5 },
  { n: "Patrícia L.", b: "Casa Caiada", t: "Atendimento impecável pelo WhatsApp. Os perfumes são originais e o preço imbatível.", s: 5 },
  { n: "Beatriz M.", b: "Aflitos", t: "Já é a terceira vez que compro. Nunca me decepcionaram. Recomendo de olhos fechados!", s: 5 },
];

export function Depoimentos() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">Quem presenteou, voltou.</h2>
          <p className="mt-2 text-sm text-muted-foreground">Mais de 12.000 mães presenteadas no Grande Recife.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {D.map((d) => (
            <figure key={d.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: d.s }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-3 font-display text-lg italic leading-snug text-foreground">"{d.t}"</blockquote>
              <figcaption className="mt-4 text-xs">
                <span className="font-bold text-foreground">{d.n}</span>
                <span className="text-muted-foreground"> · {d.b}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
