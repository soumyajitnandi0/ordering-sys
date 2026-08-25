"use client";

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useStore, Product } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Ticket, 
  ArrowRight, 
  ShoppingBag,
  LayoutGrid,
  ListFilter,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const categoryIcons: Record<string, string> = {
  'All': '✨',
  'Waffles': '🧇',
  'Belgian Waffles': '🧇',
  'Fries': '🍟',
  'Beverages': '🥤',
  'Shakes': '🥤',
  'Desserts': '🍨',
  'Combos': '🍱',
  'Pancakes': '🥞'
};

const getProductImage = (name: string, category: string) => {
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  if (n.includes('cheese fries') || n.includes('fries')) {
    return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=300&q=80';
  }
  if (n.includes('brownie')) {
    return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&q=80';
  }
  if (n.includes('shake') || c.includes('shake')) {
    return 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=300&q=80';
  }
  if (n.includes('coffee') || c.includes('beverage') || n.includes('drink')) {
    return 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&q=80';
  }
  if (n.includes('waffle') || c.includes('waffle')) {
    return 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=300&q=80';
  }
  return 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=300&q=80';
};

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreating, setIsCreating] = useState(false);
  const [latestToken, setLatestToken] = useState<number | null>(null);
  const [searchToken, setSearchToken] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useStore();

  useEffect(() => {
    fetchProducts();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
      const uniqueCats = Array.from(new Set(res.data.map((p: Product) => p.category))) as string[];
      setCategories(['All', ...uniqueCats]);
    } catch (err) {
      console.error('Error fetching products', err);
    }
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) return;
    setIsCreating(true);
    try {
      const items = cart.map((item) => ({ productId: item._id, quantity: item.quantity }));
      const res = await api.post('/orders', { items });
      setLatestToken(res.data.tokenNumber);
      clearCart();
      toast.success('Order Generated Successfully', {
        description: `Token #${String(res.data.tokenNumber).padStart(3, '0')} sent to kitchen.`,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create order');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchToken.trim()) {
      try {
        const token = searchToken.replace('#', '').trim();
        const res = await api.get(`/orders/token/${token}`);
        setSearchedOrder(res.data);
        setIsSearchOpen(true);
      } catch (err: any) {
        toast.error('Order not found');
      }
    }
  };

  const markDelivered = async () => {
    if (!searchedOrder) return;
    try {
      await api.patch(`/orders/${searchedOrder._id}/status`, { status: 'DELIVERED' });
      toast.success('Order Delivered');
      setIsSearchOpen(false);
      setSearchedOrder(null);
      setSearchToken('');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCartQuantity = (productId: string) => {
    const item = cart.find(c => c._id === productId);
    return item ? item.quantity : 0;
  };

  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return products.length;
    return products.filter(p => p.category === cat).length;
  };

  return (
    <div className="flex h-full overflow-hidden relative z-10">
      
      {/* Main Left Menu Section */}
      <div className="flex-1 flex flex-col p-6 md:p-8 min-w-0 overflow-hidden">
        
        {/* Controls Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Menu Explorer <Sparkles className="w-5 h-5 text-amber-400" />
              </h2>
              <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-mono font-bold px-2.5 py-0.5">
                {filteredProducts.length} Items
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">Tap items to add • Quick search shortcut <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-amber-300 font-mono text-[10px] border border-white/[0.1]">/</kbd></p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Compact Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Dense List"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>

            {/* Search items */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search menu... (/)" 
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl pl-10 pr-8 h-11 focus-visible:ring-amber-500/50 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Token Lookup */}
            <div className="relative flex-1 sm:w-48">
              <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input 
                type="text" 
                placeholder="Token search #..." 
                className="bg-amber-500/10 border-amber-500/20 text-amber-200 placeholder:text-amber-500/60 rounded-xl pl-10 h-11 focus-visible:ring-amber-400 font-mono text-xs"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const icon = categoryIcons[cat] || '🍽️';
              const count = getCategoryCount(cat);

              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border select-none ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/25 scale-105' 
                      : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="text-sm">{icon}</span>
                  <span>{cat}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-black/25 text-black' : 'bg-white/[0.08] text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact & Premium Product Catalog Grid */}
        <ScrollArea className="flex-1 pr-3">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 pb-12">
              {filteredProducts.map((product) => {
                const cartQty = getCartQuantity(product._id);
                const imgUrl = getProductImage(product.name, product.category);

                return (
                  <motion.div
                    key={product._id}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`group relative p-3.5 rounded-2xl backdrop-blur-xl transition-all duration-200 flex items-center justify-between gap-3 border ${
                      cartQty > 0 
                        ? 'border-amber-400/80 bg-gradient-to-r from-amber-500/[0.1] via-black/80 to-black/90 shadow-[0_4px_20px_rgba(230,180,98,0.18)]' 
                        : 'border-white/[0.08] bg-white/[0.03] hover:border-amber-500/40 hover:bg-white/[0.06] hover:shadow-lg'
                    } ${
                      !product.available ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => product.available && addToCart(product)}
                  >
                    {/* Left: Compact Thumbnail & In-Cart Badge */}
                    <div className="relative flex-shrink-0">
                      <img 
                        src={imgUrl} 
                        alt={product.name} 
                        className="w-14 h-14 rounded-xl object-cover border border-white/[0.1] shadow-md group-hover:scale-105 transition-transform"
                      />
                      {cartQty > 0 && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-black font-black text-[10px] flex items-center justify-center shadow-lg border border-black font-mono">
                          {cartQty}
                        </div>
                      )}
                    </div>

                    {/* Middle: Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-extrabold text-amber-300/90 uppercase tracking-widest truncate">
                          {product.category}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                        {product.name}
                      </h4>
                      <span className="text-sm font-black font-mono bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                        ₹{product.price.toFixed(0)}
                      </span>
                    </div>

                    {/* Right: Compact Action CTA / Stepper */}
                    <div className="flex-shrink-0">
                      {product.available ? (
                        cartQty > 0 ? (
                          <div 
                            className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/50 rounded-xl p-1 shadow-md"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              type="button"
                              className="w-6 h-6 rounded-lg bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-black flex items-center justify-center font-black text-xs transition-all active:scale-90"
                              onClick={() => cartQty > 1 ? updateQuantity(product._id, cartQty - 1) : removeFromCart(product._id)}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-mono font-black text-amber-300">
                              {cartQty}
                            </span>
                            <button 
                              type="button"
                              className="w-6 h-6 rounded-lg bg-amber-400 text-black hover:bg-amber-300 flex items-center justify-center font-black text-xs transition-all shadow-sm active:scale-90"
                              onClick={() => updateQuantity(product._id, cartQty + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-400 hover:text-black border border-amber-500/30 flex items-center justify-center transition-all duration-200 shadow-sm group-hover:scale-105 active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Dense Handy List View */
            <div className="space-y-2.5 pb-12">
              {filteredProducts.map((product) => {
                const cartQty = getCartQuantity(product._id);
                const imgUrl = getProductImage(product.name, product.category);

                return (
                  <div
                    key={product._id}
                    className={`flex items-center justify-between p-3 rounded-2xl backdrop-blur-xl border transition-all ${
                      cartQty > 0 ? 'border-amber-400/70 bg-amber-500/[0.06] shadow-lg shadow-amber-500/10' : 'border-white/[0.08] bg-white/[0.02]'
                    } ${!product.available ? 'opacity-50 grayscale' : 'hover:border-amber-500/40'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img 
                        src={imgUrl} 
                        alt={product.name} 
                        className="w-11 h-11 rounded-xl object-cover border border-white/[0.1] shadow-md" 
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white truncate">{product.name}</h4>
                          <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-[10px] font-bold">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <span className="font-black font-mono bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent text-sm">
                        ₹{product.price.toFixed(0)}
                      </span>

                      {product.available ? (
                        cartQty > 0 ? (
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/40 rounded-xl p-1">
                            <button 
                              type="button"
                              className="w-6 h-6 rounded-lg bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-black flex items-center justify-center font-extrabold"
                              onClick={() => cartQty > 1 ? updateQuantity(product._id, cartQty - 1) : removeFromCart(product._id)}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-mono font-black text-amber-300">{cartQty}</span>
                            <button 
                              type="button"
                              className="w-6 h-6 rounded-lg bg-amber-400 text-black hover:bg-amber-300 flex items-center justify-center font-extrabold"
                              onClick={() => updateQuantity(product._id, cartQty + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-400 hover:text-black border border-amber-500/30 flex items-center justify-center transition-all"
                            onClick={() => addToCart(product)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold">Sold Out</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Side - Cart Panel */}
      <div className="w-[420px] border-l border-white/[0.08] flex flex-col h-full bg-[#0a0a0f]/90 backdrop-blur-2xl relative z-20 shadow-2xl">
        {/* Cart Header */}
        <div className="p-6 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Current Order</h3>
              <p className="text-xs text-slate-400">{cart.length} item types in cart</p>
            </div>
          </div>

          {cart.length > 0 && (
            <button 
              type="button"
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <ScrollArea className="flex-1 p-6">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/[0.06] rounded-2xl my-8">
              <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500 mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">Your Cart is Empty</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Click any product from the catalog to build an order ticket.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 transition-all"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-sm text-white truncate">{item.name}</span>
                      <span className="text-xs text-amber-400/90 font-mono font-medium">
                        ₹{item.price.toFixed(0)} × {item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Stepper Buttons */}
                      <div className="flex items-center bg-black/40 rounded-lg border border-white/[0.08] p-1">
                        <button 
                          type="button"
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => item.quantity > 1 ? updateQuantity(item._id, item.quantity - 1) : removeFromCart(item._id)}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-mono font-bold text-white">{item.quantity}</span>
                        <button 
                          type="button"
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-sm text-white w-14 text-right font-mono">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Order Summary & Master Submit Action */}
        <div className="p-6 border-t border-white/[0.08] bg-white/[0.02]">
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal</span>
              <span className="text-white font-mono">₹{cartTotal().toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>GST / Taxes (0%)</span>
              <span className="text-emerald-400 font-mono">₹0</span>
            </div>
            <div className="h-px bg-white/[0.08] my-3" />
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Total Amount</span>
                <p className="text-2xl font-black text-amber-400 font-mono leading-none mt-1">
                  ₹{cartTotal().toFixed(0)}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 bg-white/[0.04] px-2 py-1 rounded border border-white/[0.06]">
                Cash Payment
              </span>
            </div>
          </div>

          <Button 
            className="w-full h-14 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-base rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-300 flex items-center justify-between px-6 group disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={cart.length === 0 || isCreating}
            onClick={handleCreateOrder}
          >
            <span className="tracking-wide">{isCreating ? 'Generating Token...' : 'GENERATE ORDER TOKEN'}</span>
            <div className="w-8 h-8 rounded-lg bg-black/15 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5 text-black" />
            </div>
          </Button>
        </div>

        {/* Token Reveal Splash Overlay */}
        <AnimatePresence>
          {latestToken !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div 
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                className="w-full max-w-sm glass-card p-8 rounded-3xl border border-amber-500/40 shadow-2xl flex flex-col items-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-amber-600" />
                
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
                  <CheckCircle2 className="w-8 h-8 text-amber-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">Order Sent to Kitchen</h3>
                <p className="text-xs text-slate-400 mb-6">Write this token on the customer's order slip.</p>

                <div className="w-full bg-black/50 border border-amber-500/30 rounded-2xl py-6 mb-8 flex flex-col items-center justify-center glow-gold">
                  <span className="text-[11px] text-amber-400 uppercase tracking-widest font-extrabold mb-1">Token Number</span>
                  <span className="text-7xl font-black text-amber-300 tracking-tight font-mono leading-none">
                    #{String(latestToken).padStart(3, '0')}
                  </span>
                </div>

                <Button 
                  className="w-full h-12 bg-amber-400 text-black hover:bg-amber-300 font-extrabold text-sm rounded-xl tracking-wider shadow-lg shadow-amber-500/20" 
                  onClick={() => setLatestToken(null)}
                >
                  COMPLETE & CLEAR
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Token Search Result Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="bg-[#0f0f14] text-white border-white/[0.1] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" /> 
              TOKEN #{searchedOrder?.tokenNumber?.toString().padStart(3, '0')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
              {searchedOrder?.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-white">{item.name}</span>
                  <span className="text-amber-400 font-mono font-bold">×{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center py-2 px-1">
              <span className="text-slate-400 text-sm">Order Status:</span>
              <Badge className={`px-3 py-1 font-bold text-xs ${
                searchedOrder?.status === 'READY' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : searchedOrder?.status === 'PREPARING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
              }`}>
                {searchedOrder?.status}
              </Badge>
            </div>

            {searchedOrder?.status === 'READY' && (
              <Button className="w-full h-12 text-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold tracking-wider rounded-xl shadow-lg shadow-emerald-500/20" onClick={markDelivered}>
                MARK DELIVERED TO CUSTOMER
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
