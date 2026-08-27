import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomizationOption {
  name: string;
  extraPrice: number;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  isCustomizable?: boolean;
  maxSelections?: number;
  customizationOptions?: CustomizationOption[];
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId: string;
  customizations?: CustomizationOption[];
}

export interface Order {
  _id: string;
  tokenNumber: number;
  tokenDate: string;
  customerPhone?: string;
  items: { productId: string; name: string; quantity: number; price: number; customizations?: CustomizationOption[]; category?: string }[];
  status: 'NEW' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  total: number;
  createdAt: string;
  readyAt?: string;
  deliveredAt?: string;
  paymentMethod?: string;
  waitingTime?: number;
}

export interface AppSettings {
  storeName: string;
  eventName: string;
  wahaAutoNotify: boolean;
  dailyReset: boolean;
  tokenDigits: number;
}

interface AppState {
  cart: CartItem[];
  settings: AppSettings;
  isAuthenticated: boolean;
  token: string | null;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addToCart: (product: Product, customizations?: CustomizationOption[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  setAuth: (token: string) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      isAuthenticated: false,
      token: null,
      settings: {
        storeName: 'Waffle Circle Flagship',
        eventName: '',
        wahaAutoNotify: true,
        dailyReset: true,
        tokenDigits: 3,
      },
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      addToCart: (product, customizations = []) => set((state) => {
        const sortedCustomizations = [...customizations].map(c => c.name).sort();
        const cartItemId = `${product._id}-${sortedCustomizations.join('-')}`;
        const existing = state.cart.find((item) => item.cartItemId === cartItemId);
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1, cartItemId, customizations }] };
      }),
      removeFromCart: (cartItemId) => set((state) => ({
        cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
      })),
      updateQuantity: (cartItemId, quantity) => set((state) => ({
        cart: state.cart.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        ),
      })),
      clearCart: () => set({ cart: [] }),
      cartTotal: () => {
        return get().cart.reduce((total, item) => {
          const extraPrice = item.customizations?.reduce((sum, c) => sum + (c.extraPrice || 0), 0) || 0;
          return total + (item.price + extraPrice) * item.quantity;
        }, 0);
      },
      setAuth: (token: string) => set({ isAuthenticated: true, token }),
      logout: () => set({ isAuthenticated: false, token: null }),
    }),
    {
      name: 'waffle-circle-storage',
    }
  )
);
