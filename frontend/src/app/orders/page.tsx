"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Order, useStore } from '@/store/useStore';
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

const getMakingTime = (order: Order) => {
  const start = new Date(order.createdAt).getTime();
  let end = null;
  if (order.readyAt) end = new Date(order.readyAt).getTime();
  else if (order.deliveredAt) end = new Date(order.deliveredAt).getTime();
  
  if (end) {
    const diffMins = Math.max(0, Math.round((end - start) / 60000));
    return `${diffMins}m prep`;
  } else if (order.status === 'NEW' || order.status === 'PREPARING') {
    const diffMins = Math.max(0, Math.round((new Date().getTime() - start) / 60000));
    return `${diffMins}m elapsed`;
  }
  return '';
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { settings } = useStore();

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
    const tokenStr = String(order.tokenNumber).padStart(settings.tokenDigits, '0');
    const matchesSearch = tokenStr.includes(searchQuery.replace('#', '')) || 
                          (order.customerPhone && order.customerPhone.includes(searchQuery)) ||
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
              placeholder="Search token, mobile or item..." 
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
                      #{String(order.tokenNumber).padStart(settings.tokenDigits, '0')}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="truncate font-medium text-white">
                        {order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold font-mono text-white">
                        ₹{order.total ? order.total.toFixed(0) : '—'}
                      </div>
                      <div className="text-[9px] text-emerald-400/80 font-bold tracking-widest mt-1">
                        {order.paymentMethod || 'CASH'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      <div>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] text-amber-500/80 font-semibold mt-0.5">{getMakingTime(order)}</div>
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
              <span>TOKEN #{selectedOrder?.tokenNumber ? String(selectedOrder.tokenNumber).padStart(settings.tokenDigits, '0') : ''}</span>
              <div className="flex flex-col items-end gap-1">
                {selectedOrder && getStatusBadge(selectedOrder.status)}
                {selectedOrder && (
                  <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {getMakingTime(selectedOrder)}
                  </span>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="py-4 space-y-6">
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/[0.04] p-3 rounded-xl border border-white/[0.08] flex-1">
                  <span className="font-semibold text-slate-400">Payment:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedOrder.paymentMethod || 'CASH'}</span>
                </div>
                {selectedOrder.customerPhone && (
                  <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/[0.04] p-3 rounded-xl border border-white/[0.08] flex-1">
                    <span className="font-semibold text-slate-400">Mobile:</span>
                    <span className="font-mono">{selectedOrder.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Items Breakdown */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ordered Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-white/[0.04] last:border-none">
                    <div>
                      <span className="font-semibold text-white">{item.name}</span>
                      {item.customizations && item.customizations.length > 0 && (
                        <span className="text-[10px] text-amber-400 font-medium block mt-0.5">
                          {item.customizations.map((c: any) => c.name).join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-slate-400 text-xs">×{item.quantity}</span>
                      <span className="text-amber-300 font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center text-sm bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 shadow-inner">
                <span className="font-extrabold text-amber-500 uppercase tracking-wider text-xs">Total Order Value</span>
                <span className="text-amber-400 font-black font-mono text-xl">
                  ₹{selectedOrder.total ? selectedOrder.total.toFixed(0) : '—'}
                </span>
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
