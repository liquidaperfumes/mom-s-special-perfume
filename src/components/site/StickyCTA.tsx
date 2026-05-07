import { useCart } from "@/lib/cart";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { formatBRL } from "@/lib/utils";

const WHATSAPP_CONSULTORA = "5581995811306";

export function StickyCTA() {
  const { count, total, setOpen } = useCart();
  const navigate = useNavigate();

export function StickyCTA() {
  const { count, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
      {count === 0 ? (
        <a
          href="#kits"
          className="flex h-14 items-center justify-center gap-3 rounded-full bg-primary text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-premium transition-premium active:scale-95"
        >
          <ShoppingBag className="h-4 w-4" /> Escolher presente
        </a>
      ) : (
        <button
          onClick={() => navigate({ to: "/checkout" })}
          className="flex h-16 w-full items-center justify-between gap-4 rounded-full bg-primary px-7 text-xs font-bold text-white shadow-premium transition-premium active:scale-95"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px]">{count}</span>
            <span className="uppercase tracking-widest">Finalizar</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <span className="font-display text-lg tracking-normal">{formatBRL(total)}</span>
        </button>
      )}
    </div>
  );
}
