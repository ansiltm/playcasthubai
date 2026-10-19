import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (idOrProductId: string) => void;
  updateQuantity: (idOrProductId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const itemId = item.id || `${item.productId}-${item.color || 'default'}`;
        const normalizedItem = { ...item, id: itemId };
        const existingIndex = items.findIndex(
          (i) => i.id === itemId || (i.productId === item.productId && (i.color || '') === (item.color || ''))
        );
        if (existingIndex > -1) {
          set({
            items: items.map((i, idx) =>
              idx === existingIndex
                ? { ...i, quantity: Math.min(99, i.quantity + item.quantity) }
                : i
            ),
          });
        } else {
          set({ items: [...items, normalizedItem] });
        }
      },
      removeItem: (id) =>
        set({
          items: get().items.filter((i) => (i.id || i.productId) !== id),
        }),
      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((i) =>
            (i.id || i.productId) === id
              ? { ...i, quantity: Math.max(1, Math.min(99, Math.floor(quantity))) }
              : i
          ),
        }),
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'playcasthub-v2-cart',
    }
  )
);
