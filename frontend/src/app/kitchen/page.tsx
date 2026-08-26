"use client";

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Order, useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { io, Socket } from 'socket.io-client';
import { 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  Clock, 
  Flame, 
  CheckCircle2, 
  ChefHat, 
  Sparkles, 
  ArrowRight,
  PackageCheck,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [connected, setConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { settings } = useStore();

  useEffect(() => {
    fetchTodayOrders();

    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.load();

    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('order:created', (newOrder: Order) => {
      setOrders(prev => [newOrder, ...prev]);
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed', e));
      }
      toast.info(`New Order Ticket #${String(newOrder.tokenNumber).padStart(settings.tokenDigits, '0')}`, {
        description: 'New ticket sent from POS terminal.'
      });
    });

    socket.on('order:status-updated', (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [soundEnabled]);

  const fetchTodayOrders = async () => {
    try {
      const res = await api.get('/orders/today');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    if (mins < 1) return 'Just now';
    return `${mins}m ago`;
  };

  const getCategoryShortForm = (category?: string) => {
    if (!category) return '';
    const map: Record<string, string> = {
      'MINION WAFFLES': 'MINI',
      'SIGNATURE WAFFLES': 'SIGN',
      'STICK WAFFLES': 'STICK',
      'WAFFLE PIZZA': 'PIZZA',
      'HERO SECTION': 'HERO',
      'BOBA MOCKTAILS': 'BOBA',
      'ADD-ONS': 'ADD-ON'
    };
    return map[category] || category.substring(0, 4).toUpperCase();
  };

  const activeOrders = orders.filter(o => ['NEW', 'PREPARING', 'READY'].includes(o.status));
  const newOrders = activeOrders.filter(o => o.status === 'NEW').reverse();
  const prepOrders = activeOrders.filter(o => o.status === 'PREPARING').reverse();
  const readyOrders = activeOrders.filter(o => o.status === 'READY').reverse();

  const renderColumn = (
    title: string, 
    list: Order[], 
    accentColor: 'amber' | 'sky' | 'emerald', 
    nextStatus: string | null, 
    actionText: string
  ) => {
    const config = {
      amber: {
        glowLine: 'from-amber-400 via-amber-500 to-amber-600',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        cardBorder: 'hover:border-amber-400/50 hover:shadow-[0_8px_30px_rgba(230,180,98,0.15)]',
        button: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black hover:from-amber-300 hover:to-amber-500 font-extrabold shadow-lg shadow-amber-500/20',
        icon: Flame,
        iconColor: 'text-amber-400'
      },
      sky: {
        glowLine: 'from-sky-400 via-blue-500 to-indigo-600',
        badge: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
        cardBorder: 'hover:border-sky-400/50 hover:shadow-[0_8px_30px_rgba(56,189,248,0.15)]',
        button: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white hover:from-sky-300 hover:to-indigo-500 font-extrabold shadow-lg shadow-blue-500/20',
        icon: Timer,
        iconColor: 'text-sky-400'
      },
      emerald: {
        glowLine: 'from-emerald-400 via-emerald-500 to-teal-600',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
        cardBorder: 'hover:border-emerald-400/50 hover:shadow-[0_8px_30px_rgba(52,211,153,0.15)]',
        button: 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 text-black hover:from-emerald-300 hover:to-teal-500 font-extrabold shadow-lg shadow-emerald-500/20',
        icon: PackageCheck,
        iconColor: 'text-emerald-400'
      }
    }[accentColor];

    const IconComp = config.icon;

    return (
      <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-3xl p-6 border border-white/[0.08] relative overflow-hidden bg-[#0c0c12]/80 backdrop-blur-2xl shadow-2xl">
        {/* Top Accent Gradient Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.glowLine}`} />

        {/* Column Header */}
        <div className="flex justify-between items-center mb-6 pt-1">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center ${config.iconColor}`}>
              <IconComp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">{title}</h2>
              <span className="text-[11px] text-slate-400 font-medium">Live Ticket Column</span>
            </div>
          </div>
          <Badge className={`px-3 py-1 text-xs font-black font-mono rounded-xl border ${config.badge}`}>
            {list.length} {list.length === 1 ? 'TICKET' : 'TICKETS'}
          </Badge>
        </div>
        
        {/* Order Cards List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar">
          {list.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/[0.06] rounded-2xl my-4 p-6 bg-white/[0.01]">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500 mb-3">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-extrabold text-white">Column Clear</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[180px]">No active orders in this stage right now.</p>
            </div>
          ) : (
            <AnimatePresence>
              {list.map(order => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 15, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className={`glass-card rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl transition-all duration-300 ${config.cardBorder} bg-gradient-to-b from-white/[0.04] to-black/80`}
                >
                  {/* Ticket Header */}
                  <div className="p-4 bg-white/[0.03] border-b border-white/[0.08] flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">Token Ticket</span>
                      <span className="text-3xl font-black font-mono tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                        #{String(order.tokenNumber).padStart(settings.tokenDigits, '0')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/[0.08]">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>{getTimeElapsed(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Ticket Item List */}
                  <div className="p-4 space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-amber-500/20 transition-all"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            {item.category && (
                              <span className="text-[9px] font-black font-mono bg-white/[0.12] text-amber-400/90 px-1.5 py-0.5 rounded border border-white/[0.08] shadow-sm uppercase tracking-wide">
                                {getCategoryShortForm(item.category)}
                              </span>
                            )}
                            <span className="text-white font-bold text-sm">
                              {item.name.replace(' (Milk/White/Dark)', '').replace(' (Any 2)', '')}
                            </span>
                          </div>
                          {item.customizations && item.customizations.length > 0 && (
                            <span className="text-[10px] text-amber-400 font-medium mt-0.5">
                              {item.customizations.map((c: any) => c.name).join(' • ')}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-black text-xs text-black bg-amber-400 px-2.5 py-1 rounded-lg shadow-sm border border-amber-300">
                          {item.quantity}x
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ticket Action Button */}
                  {nextStatus ? (
                    <div className="p-4 pt-1">
                      <Button 
                        className={`w-full h-12 text-xs rounded-xl tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 group ${config.button}`} 
                        onClick={() => updateStatus(order._id, nextStatus)}
                      >
                        <span>{actionText}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  ) : (
                    /* Ready Column Action - Mark Delivered */
                    <div className="p-4 pt-1">
                      <Button 
                        className="w-full h-12 text-xs rounded-xl tracking-wider uppercase transition-all duration-200 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20" 
                        onClick={() => updateStatus(order._id, 'DELIVERED')}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>MARK DELIVERED TO CUSTOMER</span>
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 md:p-8">
      {/* Top Banner Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Kitchen Display OS <ChefHat className="w-6 h-6 text-amber-400" />
            </h1>
            <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-mono font-bold px-3 py-1">
              {activeOrders.length} Active Tickets
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time live kitchen preparation monitor • Synchronized with POS counter</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Socket Sync Badge */}
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition-colors ${
            connected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-500/10' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`} />
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{connected ? 'SOCKET LIVE' : 'DISCONNECTED'}</span>
          </div>

          {/* Sound Alert Toggle */}
          <Button 
            variant="outline" 
            size="sm"
            className={`border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-extrabold rounded-2xl h-11 px-4 transition-all ${
              soundEnabled ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-sm shadow-amber-500/10' : 'text-slate-400'
            }`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 mr-2 text-amber-400" /> : <VolumeX className="w-4 h-4 mr-2" />}
            Sound Alert {soundEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>
      </header>

      {/* 3 Columns Display */}
      <div className="flex gap-6 flex-1 min-h-0">
        {renderColumn('New Orders', newOrders, 'amber', 'PREPARING', 'START PREPARING')}
        {renderColumn('In Preparation', prepOrders, 'sky', 'READY', 'MARK READY FOR PICKUP')}
        {renderColumn('Ready for Pickup', readyOrders, 'emerald', null, '')}
      </div>
    </div>
  );
}
