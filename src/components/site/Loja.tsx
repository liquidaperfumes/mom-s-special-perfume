import { MapPin, Clock, Phone } from "lucide-react";

export function Loja() {
  return (
    <section id="loja" className="bg-secondary py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2 lg:items-stretch">
        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Retirada Expressa</span>
          <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
            Retire na loja em <em className="italic">Olinda</em>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Sem frete, sem espera. Compre online e retire no mesmo dia em nossa loja em São Benedito.
          </p>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Endereço</p>
                <p className="text-muted-foreground">Estrada do Caenga, 235<br />São Benedito · Olinda – PE</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Horário</p>
                <p className="text-muted-foreground">Seg a Sáb · 9h às 19h<br />Domingo · 9h às 14h</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Atendimento</p>
                <p className="text-muted-foreground">(81) 9.9712-7309 · WhatsApp</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Estrada+do+Caenga+235+São+Benedito+Olinda+PE"
              target="_blank" rel="noopener"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-soft transition hover:scale-[1.02]"
            >
              Como chegar →
            </a>
            <a
              href="https://wa.me/5581997127309"
              target="_blank" rel="noopener"
              className="inline-flex items-center justify-center rounded-full border border-foreground/20 bg-background px-6 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Reservar pelo WhatsApp
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl shadow-elegant">
          <iframe
            title="Loja Liquida Perfumes - São Benedito Olinda"
            src="https://www.google.com/maps?q=Estrada+do+Caenga+235+São+Benedito+Olinda+PE&output=embed"
            className="h-full min-h-[320px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
