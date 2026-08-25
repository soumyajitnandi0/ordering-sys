"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Product } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  Utensils
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Waffles');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
      const uniqueCats = Array.from(new Set(res.data.map((p: Product) => p.category))) as string[];
      setCategories(['ALL', ...uniqueCats]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const updated = !product.available;
      await api.put(`/products/${product._id}`, { ...product, available: updated });
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, available: updated } : p));
      toast.success(`${product.name} is now ${updated ? 'Available' : 'Sold Out'}`);
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      const payload = {
        name,
        price: parseFloat(price),
        category,
        available
      };

      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.data : p));
        toast.success('Product updated successfully');
      } else {
        const res = await api.post('/products', payload);
        setProducts(prev => [res.data, ...prev]);
        toast.success('New product added to menu catalog');
      }

      closeModal();
    } catch (err) {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product removed');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCategory('Waffles');
    setAvailable(true);
    setIsAddOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(String(product.price));
    setCategory(product.category);
    setAvailable(product.available);
    setIsAddOpen(true);
  };

  const closeModal = () => {
    setIsAddOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 md:p-8 space-y-6">
      
      {/* Top Banner Header & Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Menu Catalog Management <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400">Configure prices, availability toggles, and new product offerings</p>
        </div>

        <Button 
          className="bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 font-extrabold text-sm rounded-xl px-5 h-11 shadow-lg shadow-amber-500/20 flex items-center gap-2"
          onClick={openAddModal}
        >
          <Plus className="w-5 h-5" /> Add New Item
        </Button>
      </div>

      {/* Search & Category Filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat 
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20' 
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Search catalog..." 
            className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl pl-10 h-10 focus-visible:ring-amber-500/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="flex-1 glass-panel rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.08] text-xs uppercase tracking-wider sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-4 px-6 font-semibold">Product Name</th>
                <th className="py-4 px-6 font-semibold">Category</th>
                <th className="py-4 px-6 font-semibold">Price</th>
                <th className="py-4 px-6 font-semibold">Live Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {product.name[0]}
                      </div>
                      <span>{product.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className="bg-white/[0.06] text-amber-300 border-white/[0.1] text-xs">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 font-bold font-mono text-amber-400 text-base">
                      ₹{product.price.toFixed(0)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={product.available}
                          onCheckedChange={() => handleToggleAvailability(product)}
                        />
                        <span className={`text-xs font-semibold ${product.available ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {product.available ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.1] text-xs font-semibold rounded-xl"
                          onClick={() => openEditModal(product)}
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1 text-amber-400" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#0c0c12] text-white border-white/[0.1] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {editingProduct ? 'Edit Menu Product' : 'Add New Menu Item'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="py-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                Item Name
              </label>
              <Input 
                type="text" 
                placeholder="e.g. Belgian Chocolate Waffle" 
                required
                className="bg-white/[0.04] border-white/[0.08] text-white rounded-xl h-11 focus-visible:ring-amber-500/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                Category
              </label>
              <Input 
                type="text" 
                placeholder="e.g. Waffles, Beverages, Shakes" 
                required
                className="bg-white/[0.04] border-white/[0.08] text-white rounded-xl h-11 focus-visible:ring-amber-500/50"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                Price (INR ₹)
              </label>
              <Input 
                type="number" 
                step="1"
                placeholder="e.g. 180" 
                required
                className="bg-white/[0.04] border-white/[0.08] text-white rounded-xl h-11 focus-visible:ring-amber-500/50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-white/[0.06] pt-4">
              <span className="text-sm font-semibold text-slate-300">Item Availability</span>
              <Switch checked={available} onCheckedChange={setAvailable} />
            </div>

            <Button type="submit" className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm rounded-xl tracking-wider shadow-lg shadow-amber-500/20 mt-4">
              {editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
