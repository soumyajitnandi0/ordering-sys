import { create } from 'zustand';

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  _id: string;
  tokenNumber: number;
  tokenDate: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  status: 'NEW' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  total: number;
  createdAt: string;
  waitingTime?: number; // computed client side
}

interface AppState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

export const useStore = create<AppState>((set, get) => ({
  cart: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item._id === product._id);
    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item._id !== productId),
  })),
  updateQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map((item) =>
      item._id === productId ? { ...item, quantity } : item
    ),
  })),
  clearCart: () => set({ cart: [] }),
  cartTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
