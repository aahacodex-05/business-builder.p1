"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { findItem } from "@/data/menu";

const STORAGE_KEY = "mocha-express-cart";

/** Item id → quantity. */
type Lines = Record<string, number>;

type Cart = {
  lines: Lines;
  count: number;
  subtotal: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Lines>({});
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved: Lines = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      // Drop items that have since left the menu.
      setLines(Object.fromEntries(Object.entries(saved).filter(([id]) => findItem(id))));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const setQuantity = useCallback(
    (id: string, quantity: number) =>
      setLines(({ [id]: _, ...rest }) => (quantity > 0 ? { ...rest, [id]: quantity } : rest)),
    [],
  );
  const clear = useCallback(() => {
    // Remove storage synchronously so the restore effect can't bring the old cart back.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setLines({});
  }, []);

  const value = useMemo<Cart>(() => {
    const entries = Object.entries(lines);

    return {
      lines,
      count: entries.reduce((sum, [, qty]) => sum + qty, 0),
      subtotal: entries.reduce((sum, [id, qty]) => sum + (findItem(id)?.price ?? 0) * qty, 0),
      isOpen,
      setOpen,
      add: (id) => {
        setQuantity(id, (lines[id] ?? 0) + 1);
        setOpen(true);
      },
      setQuantity,
      clear,
    };
  }, [lines, isOpen, setQuantity, clear]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
