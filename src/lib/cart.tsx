import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "./products";
import { storeApi } from "./store-api";

export type CartItem = { sku: string; name: string; price: number; qty: number; stock?: number };
type CartContext = {
  items: CartItem[];
  add: (product: Product, qty?: number) => Promise<boolean>;
  remove: (sku: string) => Promise<boolean>;
  setQty: (sku: string, qty: number) => Promise<boolean>;
  clear: () => Promise<boolean>;
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  busy: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};
const Context = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);

  async function refresh() {
    setLoading(true);
    try {
      const result = await storeApi<{ items: CartItem[] }>("/api/cart");
      setItems(result.items);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Your saved cart could not be loaded.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function mutate(body: unknown): Promise<boolean> {
    if (lock.current || loading) return false;
    lock.current = true;
    setBusy(true);
    try {
      const result = await storeApi<{ items: CartItem[] }>("/api/cart", body);
      setItems(result.items);
      setError(null);
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Your cart change could not be saved.";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const add = async (product: Product, qty = 1) => {
    const saved = await mutate({ operation: "add", sku: product.sku, qty });
    if (saved) setOpen(true);
    return saved;
  };
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal =
    items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.qty, 0) / 100;
  return (
    <Context.Provider
      value={{
        items,
        add,
        remove: (sku) => mutate({ operation: "remove", sku }),
        setQty: (sku, qty) => mutate({ operation: "set", sku, qty }),
        clear: () => mutate({ operation: "clear" }),
        count,
        subtotal,
        open,
        setOpen,
        busy,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useCart() {
  const context = useContext(Context);
  if (!context) throw new Error("useCart must be inside CartProvider");
  return context;
}
