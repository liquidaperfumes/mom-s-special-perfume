import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (k: Kit) =>
    setItems((s) => {
      const ex = s.find((i) => i.kit.id === k.id);
      if (ex) return s.map((i) => (i.kit.id === k.id ? { ...i, qtd: i.qtd + 1 } : i));
      return [...s, { kit: k, qtd: 1 }];
    });

  const remove = (id: string) => setItems((s) => s.filter((i) => i.kit.id !== id));
  const setQtd = (id: string, q: number) =>
    setItems((s) => s.map((i) => (i.kit.id === id ? { ...i, qtd: Math.max(1, q) } : i)));
  const clear = () => setItems([]);

  const total = items.reduce((acc, i) => acc + i.kit.preco * i.qtd, 0);
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
