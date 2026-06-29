import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  targetUnitPrice: string;
  notes: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function InquiryCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateItem = useCallback((productId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, ...updates } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateItem, clearCart, count: items.length }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useInquiryCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useInquiryCart must be used within InquiryCartProvider");
  return ctx;
}
