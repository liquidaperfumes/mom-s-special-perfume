import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Kit } from "./kits";

type Item = { kit: Kit; qtd: number };
type Ctx = {
  items: Item[];
  add: (k: Kit) => void;
  remove: (id: string) => void;
  setQtd: (id: string, q: number) => void;
  clear: () => void;
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "liquida_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  // BUG FIX: prevent saving empty cart before hydration from localStorage
  const hydrated = useRef(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Corrupted storage — start fresh
      localStorage.removeItem(KEY);
    } finally {
      hydrated.current = true;
    }
  }, []);

  // Persist to localStorage only after hydration
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, [items]);

  const add = (k: Kit) =>
    setItems((s) => {
      const ex = s.find((i) => i.kit.id === k.id);
      if (ex) return s.map((i) => (i.kit.id === k.id ? { ...i, qtd: i.qtd + 1 } : i));
      return [...s, { kit: k, qtd: 1 }];
    });

  const remove = (id: string) => setItems((s) => s.filter((i) => i.kit.id !== id));

  // BUG FIX: setQtd with qty=0 removes item instead of leaving it at 1
  const setQtd = (id: string, q: number) => {
    if (q <= 0) {
      remove(id);
      return;
    }
    setItems((s) => s.map((i) => (i.kit.id === id ? { ...i, qtd: q } : i)));
  };

  const clear = () => setItems([]);

  // BUG FIX: use fixed-point arithmetic to avoid floating-point sum errors (R$0.01 drift)
  const total = Math.round(items.reduce((acc, i) => acc + i.kit.preco * i.qtd, 0) * 100) / 100;
  const count = items.reduce((acc, i) => acc + i.qtd, 0);

  return (
    <CartCtx.Provider value={{ items, add, remove, setQtd, clear, total, count, open, setOpen }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
