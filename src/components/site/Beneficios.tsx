import { Truck, ShieldCheck, Gift, Lock, Store, Sparkles } from "lucide-react";

const items = [
  { icon: Truck, t: "Entrega em 3h", d: "Receba seu pedido em até 3 horas no Grande Recife." },
  { icon: ShieldCheck, t: "100% Originais", d: "Produtos lacrados, direto das melhores marcas." },
  { icon: Gift, t: "Embalagem Presenteável", d: "Tudo pronto para presentear, sem nenhuma fricção." },
  { icon: Lock, t: "Até 12x sem juros", d: "Pagamento seguro via Pagar.me com Pix ou cartão." },
  { icon: Store, t: "Retire em Olinda", d: "Pegue na loja no mesmo dia, em São Benedito." },
  { icon: Sparkles, t: "Atendimento VIP", d: "Finalize pelo WhatsApp com nossa consultora." },
];

export function Beneficios() {
  return (
    <section className="bg-secondary py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">Tudo pensado para você presentear sem preocupação.</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {items.map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex flex-col items-center rounded-2xl bg-background p-5 text-center shadow-soft transition hover:-translate-y-1">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-rose text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold">{t}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
