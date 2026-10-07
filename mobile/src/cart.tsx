import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useCatalog } from "./catalog";

const STORAGE_KEY = "mocha-express-cart";

/** Item id → quantity. */
type Lines = Record<string, number>;

type Cart = {
  lines: Lines;
  count: number;
  subtotal: number;
  add: (id: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { menu } = useCatalog();
  const [saved, setLines] = useState<Lines>({});
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => json && setLines(JSON.parse(json)))
      .catch(() => {})
      .finally(() => setRestored(true));
  }, []);

  useEffect(() => {
    if (restored) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)).catch(() => {});
  }, [saved, restored]);

  const setQuantity = useCallback(
    (id: string, quantity: number) =>
      setLines(({ [id]: _, ...rest }) => (quantity > 0 ? { ...rest, [id]: quantity } : rest)),
    [],
  );
  const add = useCallback(
    (id: string, quantity = 1) => setLines((lines) => ({ ...lines, [id]: (lines[id] ?? 0) + quantity })),
    [],
  );
  const clear = useCallback(() => setLines({}), []);

  const value = useMemo<Cart>(() => {
    // Items that have since left the site's menu drop out of the bag.
    const prices = new Map(menu.map((item) => [item.id, item.price]));
    const entries = Object.entries(saved).filter(([id]) => prices.has(id));

    return {
      lines: Object.fromEntries(entries),
      count: entries.reduce((sum, [, qty]) => sum + qty, 0),
      subtotal: entries.reduce((sum, [id, qty]) => sum + prices.get(id)! * qty, 0),
      add,
      setQuantity,
      clear,
    };
  }, [menu, saved, add, setQuantity, clear]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
