"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { 
  IndianRupee, 
  TrendingUp, 
  ShoppingBag, 
  Award, 
  ArrowUpRight, 
  Sparkles,
  BarChart3,
  Layers,
  Wallet
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

export default function SalesPage() {
  const [salesData, setSalesData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month'>('today');

  useEffect(() => {
    fetchSales();
    const interval = setInterval(fetchSales, 5 * 60 * 1000); // Live update every 5 minutes
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchSales = async () => {
    try {
      const res = await api.get('/orders/analytics');
      setSalesData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = salesData?.hourlySales || [];

  const totalRevenue = salesData?.today?.revenue || 0;
  const totalOrders = salesData?.today?.orders || 0;
  const avgOrderValue = salesData?.today?.aov || 0;

  const yesterdayRevenue = salesData?.yesterday?.revenue || 0;
  const revGrowth = yesterdayRevenue > 0 
    ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) 
    : 100;

  const yesterdayOrders = salesData?.yesterday?.orders || 0;
  const ordGrowth = yesterdayOrders > 0 
    ? ((totalOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1) 
    : 100;
    
  const topProducts = salesData?.topProducts || [];
  const maxTopQty = topProducts.length > 0 ? topProducts[0].quantity : 1;
  const totalUnits = salesData?.today?.unitsSold || 0;

  const paymentMetrics = salesData?.paymentMetrics || { cash: { revenue: 0 }, upi: { revenue: 0 } };
  const paymentData = [
    { name: 'CASH', value: paymentMetrics.cash.revenue },
    { name: 'UPI', value: paymentMetrics.upi.revenue }
  ];
  const PIE_COLORS = ['#E6B462', '#10b981'];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
      
      {/* Top Banner Header & Time Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Sales & Operational Analytics <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400">Real-time revenue metrics, item breakdown, and peak performance</p>
        </div>

        <div className="flex items-center bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08]">
          <button 
            onClick={() => setTimeRange('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'today' 
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setTimeRange('7days')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeRange === '7days' 
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'month' 
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Revenue Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="glass-card p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden group bg-gradient-to-br from-amber-500/10 via-transparent to-transparent"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Gross Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white font-mono tracking-tight text-gold-gradient">
              ₹{totalRevenue.toLocaleString()}
            </h2>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>{Number(revGrowth) > 0 ? '+' : ''}{revGrowth}% from yesterday</span>
          </div>
        </motion.div>

        {/* Total Orders Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="glass-card p-6 rounded-2xl border border-white/[0.08] relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Completed Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white font-mono tracking-tight">
            {totalOrders}
          </h2>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>{Number(ordGrowth) > 0 ? '+' : ''}{ordGrowth}% volume</span>
          </div>
        </motion.div>

        {/* Average Order Value Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="glass-card p-6 rounded-2xl border border-white/[0.08] relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Avg Order Value</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white font-mono tracking-tight">
            ₹{avgOrderValue.toFixed(0)}
          </h2>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Per ticket average</span>
          </div>
        </motion.div>

        {/* Units Sold Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="glass-card p-6 rounded-2xl border border-white/[0.08] relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Waffles & Drinks</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white font-mono tracking-tight">
            {totalUnits} units
          </h2>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-300 font-semibold">
            <span>Peak hour: {salesData?.today?.orders > 0 ? chartData.reduce((max: any, c: any) => c.orders > max.orders ? c : max, chartData[0])?.hour : 'N/A'}</span>
          </div>
        </motion.div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Velocity Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" /> Revenue Curve
              </h3>
              <p className="text-xs text-slate-400">Hourly sales volume in INR (₹)</p>
            </div>
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Hourly Velocity
            </Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E6B462" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#E6B462" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090d', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#E6B462" strokeWidth={3} fillOpacity={1} fill="url(#goldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products List */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-400" /> Top Selling Items
            </h3>
            <p className="text-xs text-slate-400 mb-6">Popular items ranking by order volume</p>

            <div className="space-y-5">
              {topProducts.length === 0 ? (
                <div className="text-sm text-slate-500 py-4 text-center">No sales data today</div>
              ) : (
                topProducts.map((item: any, i: number) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white flex items-center gap-2">
                        <span className="text-amber-400 font-mono">#{i + 1}</span> {item.name}
                      </span>
                      <span className="text-amber-300 font-mono">₹{item.revenue.toLocaleString()} ({item.quantity})</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" 
                        style={{ width: `${(item.quantity / maxTopQty) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <span className="text-xs text-slate-400 font-medium">Updated live every 5 minutes</span>
          </div>
        </div>

      </div>

      {/* Secondary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Split Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" /> Payment Split
              </h3>
              <p className="text-xs text-slate-400">Cash vs UPI distribution</p>
            </div>
          </div>
          
          <div className="h-64 w-full flex flex-col justify-center">
            {paymentData[0].value === 0 && paymentData[1].value === 0 ? (
              <div className="text-sm text-slate-500 text-center py-10">No payment data today</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090d', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    formatter={(value, entry, index) => <span className="text-slate-300 text-xs font-semibold mr-4">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
