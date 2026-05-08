import { Truck, ShieldCheck, Gift, Lock, Store, Sparkles } from "lucide-react";

const items = [
  { icon: Truck, t: "Entregamos Presentes", d: "Levamos o presente até quem você ama em até 3h no Grande Recife." },
  { icon: ShieldCheck, t: "100% Originais", d: "Produtos lacrados, direto das melhores marcas." },
  { icon: Gift, t: "Embalagem Presenteável", d: "Tudo pronto para presentear, sem nenhuma fricção." },
  { icon: Lock, t: "Parcelamento em até 12x", d: "Pague com cartão de crédito ou Pix com total segurança." },
  { icon: Store, t: "Retire em Olinda", d: "Pegue na loja no mesmo dia, em São Benedito." },
  { icon: Sparkles, t: "Atendimento VIP", d: "Finalize seu pedido com uma de nossas consultoras." },
];

export function Beneficios() {
  return (
    <section className="bg-secondary py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">Tudo pensado para você presentear sem preocupação.</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
          {items.map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex flex-col items-center rounded-3xl bg-background p-4 sm:p-6 text-center shadow-soft transition-premium hover:-translate-y-2 hover:shadow-premium">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold tracking-tight">{t}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/70 font-light">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
