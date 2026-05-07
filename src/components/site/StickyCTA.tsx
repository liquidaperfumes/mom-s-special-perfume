import { useCart } from "@/lib/cart";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingBag, MessageCircle } from "lucide-react";

const WHATSAPP_CONSULTORA = "5581995811306";

export function StickyCTA() {
  const { count, total, setOpen } = useCart();
  const navigate = useNavigate();

  if (count === 0) {
    return (
      <div className="fixed inset-x-3 bottom-3 z-30 flex flex-col gap-2 md:hidden">
        <a
          href="#kits"
          className="flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-elegant"
        >
          <ShoppingBag className="h-4 w-4" /> Ver kits para mamãe
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent("Olá! Gostaria de ver os kits disponíveis.")}`}
          target="_blank"
          rel="noopener"
          className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-elegant"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Falar com consultora
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-30 flex flex-col gap-2 md:hidden">
      <button
        onClick={() => navigate({ to: "/checkout" })}
        onContextMenu={(e) => { e.preventDefault(); setOpen(true); }}
        className="flex items-center justify-between gap-3 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-elegant"
      >
        <span>{count} {count === 1 ? "item" : "itens"}</span>
        <span className="uppercase tracking-wider">Finalizar →</span>
        <span>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
      </button>
      <a
        href={`https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent("Olá! Gostaria de finalizar meu pedido com uma consultora.")}`}
        target="_blank"
        rel="noopener"
        className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-2.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-elegant"
      >
        <MessageCircle className="h-3 w-3" /> Ou finalize pelo WhatsApp
      </a>
    </div>
  );
}
