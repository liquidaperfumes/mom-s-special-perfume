import { MapPin, Clock, Phone, ExternalLink, Navigation } from "lucide-react";
import { motion } from "framer-motion";

export function Loja() {
  return (
    <section id="loja" className="bg-[#FDFBFB] py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Retirada Expressa</span>
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
              Retire na loja em <br />
              <span className="font-medium italic text-primary">Olinda</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
              Economize no frete e receba seu presente agora. Compre online e retire no mesmo dia em nossa unidade física em São Benedito.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <InfoCard 
                icon={<MapPin className="h-5 w-5" />}
                title="Localização"
                content={<>Estrada do Caenga, 235<br />São Benedito · Olinda – PE</>}
              />
              <InfoCard 
                icon={<Clock className="h-5 w-5" />}
                title="Horário de Funcionamento"
                content={<>Seg a Sáb · 9h às 19h<br />Domingo · 9h às 14h</>}
              />
              <div className="sm:col-span-2">
                <InfoCard 
                  icon={<Phone className="h-5 w-5" />}
                  title="Atendimento & Suporte"
                  content="(81) 99510-0851 · WhatsApp"
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Estrada+do+Caenga+235+São+Benedito+Olinda+PE"
                target="_blank" rel="noopener"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-background shadow-premium transition-premium hover:scale-[1.03] active:scale-[0.95] hover:bg-primary"
              >
                <Navigation className="h-4 w-4" />
                Como chegar no Maps
                <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Map Decoration */}
            <div className="absolute -inset-4 rounded-[3rem] bg-primary/5 blur-3xl -z-10" />
            <div className="absolute -top-6 -right-6 h-32 w-32 bg-rose-tea/10 rounded-full blur-2xl -z-10" />
            
            <div className="relative group overflow-hidden rounded-[2.5rem] border border-rose-tea/10 bg-white p-2 shadow-premium h-[450px] sm:h-[550px]">
              <iframe
                title="Loja Liquida Perfumes - São Benedito Olinda"
                src="https://www.google.com/maps?q=Estrada+do+Caenga+235+São+Benedito+Olinda+PE&output=embed"
                className="h-full w-full rounded-[2rem] grayscale-[0.2] contrast-[1.1] brightness-[1.02] hover:grayscale-0 transition-all duration-700"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Mobile Interaction Overlay */}
              <div className="absolute inset-2 rounded-[2rem] bg-foreground/5 pointer-events-none group-focus-within:opacity-0 transition-opacity flex items-center justify-center lg:hidden">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-soft">
                  Clique para interagir com o mapa
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-rose-tea/5 bg-white p-6 shadow-soft transition-premium hover:shadow-elegant hover:border-primary/20">
      <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-secondary text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{title}</p>
        <div className="text-sm font-medium leading-relaxed text-foreground">
          {content}
        </div>
      </div>
    </div>
  );
}
