"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Order } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Sparkles, 
  Eye, 
  Ticket
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/today');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'NEW':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">NEW TICKET</Badge>;
      case 'PREPARING':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">PREPARING</Badge>;
      case 'READY':
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">READY FOR PICKUP</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-white/10 text-slate-300 border-white/20">DELIVERED</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">CANCELLED</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const tokenStr = String(order.tokenNumber);
    const matchesSearch = tokenStr.includes(searchQuery.replace('#', '')) || 
                          order.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 md:p-8 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Order Audit & History <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400">Complete log of customer tokens and kitchen fulfillment status</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Token / Name Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search token # or item..." 
              className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl pl-10 h-11 focus-visible:ring-amber-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {['ALL', 'NEW', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              statusFilter === st 
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20' 
                : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Main Table Panel */}
      <div className="flex-1 glass-panel rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.08] text-xs uppercase tracking-wider sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-4 px-6 font-semibold">Token</th>
                <th className="py-4 px-6 font-semibold">Items</th>
                <th className="py-4 px-6 font-semibold">Total</th>
                <th className="py-4 px-6 font-semibold">Time</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6 font-black font-mono text-amber-400 text-base">
                      #{String(order.tokenNumber).padStart(3, '0')}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="truncate font-medium text-white">
                        {order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold font-mono text-white">
                      ₹{order.total ? order.total.toFixed(0) : '—'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.1] text-xs font-semibold rounded-xl"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-amber-400" /> Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-[#0c0c12] text-white border-white/[0.1] rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-mono text-amber-400 flex items-center justify-between">
              <span>TOKEN #{selectedOrder?.tokenNumber ? String(selectedOrder.tokenNumber).padStart(3, '0') : ''}</span>
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="py-4 space-y-6">
              {/* Items Breakdown */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ordered Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-white/[0.04] last:border-none">
                    <span className="font-semibold text-white">{item.name}</span>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-slate-400 text-xs">×{item.quantity}</span>
                      <span className="text-amber-300 font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Stepper Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Quick Status Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 font-bold text-xs"
                    onClick={() => updateStatus(selectedOrder._id, 'PREPARING')}
                  >
                    MARK PREPARING
                  </Button>
                  <Button 
                    className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold text-xs"
                    onClick={() => updateStatus(selectedOrder._id, 'READY')}
                  >
                    MARK READY FOR PICKUP
                  </Button>
                  <Button 
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold text-xs"
                    onClick={() => updateStatus(selectedOrder._id, 'DELIVERED')}
                  >
                    MARK DELIVERED
                  </Button>
                  <Button 
                    variant="destructive"
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-bold text-xs"
                    onClick={() => updateStatus(selectedOrder._id, 'CANCELLED')}
                  >
                    CANCEL TICKET
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
