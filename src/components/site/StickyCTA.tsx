import { useCart } from "@/lib/cart";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

export function StickyCTA() {
  const { count, total, setOpen } = useCart();
  const navigate = useNavigate();

  if (count === 0) {
    return (
      <a
        href="#kits"
        className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-elegant md:hidden"
      >
        <ShoppingBag className="h-4 w-4" /> Ver kits para mamãe
      </a>
    );
  }

  return (
    <button
      onClick={() => navigate({ to: "/checkout" })}
      onContextMenu={(e) => { e.preventDefault(); setOpen(true); }}
      className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-elegant md:hidden"
    >
      <span>{count} {count === 1 ? "item" : "itens"}</span>
      <span className="uppercase tracking-wider">Finalizar →</span>
      <span>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
    </button>
  );
}
