import { Instagram, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/logo-liquida.png";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <img src={logoImg} alt="Liquida Perfumes" className="h-10 w-auto object-contain" />
            <div className="h-6 w-px bg-background/20" />
            <div className="flex flex-col">
              <img 
                src="https://upload.wikimedia.org/wikipedia/pt/thumb/f/f6/O_Botic%C3%A1rio_logo.svg/512px-O_Botic%C3%A1rio_logo.svg.png" 
                alt="O Boticário" 
                className="h-6 w-auto object-contain brightness-0 invert opacity-60" 
              />
              <p className="text-[6px] font-black uppercase tracking-[0.15em] text-background/30 -mt-0.5">Onde tem amor tem beleza</p>
            </div>
          </div>
          <p className="max-w-xs text-sm text-background/60 leading-relaxed font-light">
            Especialistas em fragrâncias que eternizam momentos. Parceria oficial Liquida & O Boticário para este Dia das Mães.
          </p>
          <div className="pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-background/40 mb-4">Formas de Pagamento</h4>
            <div className="flex flex-wrap gap-4 items-center opacity-80">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Pix.png/512px-Logo_Pix.png" alt="Pix" className="h-5 w-auto object-contain brightness-0 invert" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 w-auto object-contain brightness-0 invert" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/512px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 w-auto object-contain" />
            </div>
            <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-primary">✓ Pagamento na Entrega ou Retirada</p>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-background/80">Onde estamos</h4>
          <ul className="mt-6 space-y-4 text-sm text-background/60 font-light">
            <li className="leading-relaxed">Estrada do Caenga, 235<br />São Benedito · Olinda – PE</li>
            <li className="flex items-center gap-2 text-background/90 font-medium">
              <MessageCircle className="h-4 w-4" /> (81) 9.9581-1306
            </li>
            <li>contato@liquidaperfumes.com.br</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-background/80">Conecte-se</h4>
          <p className="mt-6 text-sm text-background/60 font-light mb-6">Siga-nos para acompanhar novidades e promoções exclusivas.</p>
          <div className="flex gap-4">
            <a href="https://instagram.com/liquida.perfumes" target="_blank" rel="noopener" className="flex h-12 w-12 items-center justify-center rounded-full bg-background/5 border border-background/10 hover:bg-primary transition-all duration-300"><Instagram className="h-5 w-5" /></a>
            <a href="https://wa.me/5581995811306" target="_blank" rel="noopener" className="flex h-12 w-12 items-center justify-center rounded-full bg-background/5 border border-background/10 hover:bg-[#25D366] transition-all duration-300"><MessageCircle className="h-5 w-5" /></a>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-background/30">
            <ShieldCheck className="h-4 w-4" /> Site 100% Seguro
          </div>
        </div>
      </div>
      <div className="border-t border-background/5 py-8 text-center text-[10px] text-background/30 flex flex-col sm:flex-row items-center justify-center gap-4">
        <span>© {new Date().getFullYear()} Liquida Perfumes — Todos os direitos reservados.</span>
        <div className="h-1 w-1 rounded-full bg-background/10 hidden sm:block" />
        <Link to="/admin" className="hover:text-primary transition-colors hover:opacity-100">Painel Consultoras</Link>
      </div>
    </footer>
  );
}
