import { Instagram, MessageCircle } from "lucide-react";
import logoImg from "@/assets/logo-liquida.jpg";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 shadow-soft bg-white">
              <img src={logoImg} alt="Liquida Perfumes" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-[0.25em]">LIQUIDA</div>
              <div className="text-[10px] tracking-[0.3em] text-background/60">PERFUMES</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-background/70">
            Conectando pessoas às fragrâncias que expressam quem elas são.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-background/80">Contato</h4>
          <ul className="mt-4 space-y-2 text-sm text-background/70">
            <li>Estrada do Caenga, 235<br />São Benedito · Olinda – PE</li>
            <li>(81) 9.9581-1306</li>
            <li>contato@liquidaperfumes.com.br</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-background/80">Redes</h4>
          <div className="mt-4 flex gap-3">
            <a href="https://instagram.com/liquida.perfumes" target="_blank" rel="noopener" className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 hover:bg-primary"><Instagram className="h-4 w-4" /></a>
            <a href="https://wa.me/5581995811306" target="_blank" rel="noopener" className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 hover:bg-[#25D366]"><MessageCircle className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 py-5 text-center text-xs text-background/50">
        © {new Date().getFullYear()} Liquida Perfumes — Todos os direitos reservados.
      </div>
    </footer>
  );
}
