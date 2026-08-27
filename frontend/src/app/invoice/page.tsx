"use client";

import { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  History, 
  Printer, 
  Clock,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Mail,
  Send
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from '@/store/useStore';
import api from '@/lib/api';

export default function InvoiceGeneratorPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [isEmailing, setIsEmailing] = useState(false);
  const { settings } = useStore();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!tokenInput.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await api.get(`/orders/token/${tokenInput}`);
      setOrder(res.data);
      toast.success('Invoice retrieved successfully');
    } catch (err: any) {
      setOrder(null);
      toast.error(err.response?.data?.error || 'Order not found');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await api.get('/orders');
      setRecentOrders(res.data.slice(0, 50)); // Last 50 orders
    } catch (err) {
      toast.error('Failed to fetch order history');
    }
  };

  const openHistoryModal = () => {
    setIsHistoryModalOpen(true);
    fetchRecentOrders();
  };

  const selectOrder = (selectedOrder: any) => {
    setOrder(selectedOrder);
    setTokenInput(selectedOrder.tokenNumber.toString());
    setIsHistoryModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailInvoice = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsEmailing(true);
    try {
      const element = document.getElementById('invoice-print-view');
      if (!element) throw new Error('Invoice view not found');
      
      // Temporarily remove complex background for html-to-image performance
      const originalBg = element.style.backgroundImage;
      element.style.backgroundImage = 'none';

      // Temporarily make it opaque for the capture
      element.classList.remove('opacity-0');
      const imgData = await toJpeg(element, { quality: 0.85, pixelRatio: 1.0, cacheBust: true });
      element.classList.add('opacity-0');
      
      // Restore background
      element.style.backgroundImage = originalBg;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBase64 = pdf.output('datauristring');
      
      await api.post('/orders/email-invoice', {
        email: emailInput,
        orderId: order._id,
        tokenNumber: order.tokenNumber,
        pdfBase64
      });
      
      toast.success(`Invoice sent successfully to ${emailInput}`);
      setEmailInput('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || `Failed to send invoice email: ${err.message || 'Unknown error'}`);
    } finally {
      setIsEmailing(false);
    }
  };

  // The actual Bill Component to render both in preview and print mode
  const BillContent = () => {
    if (!order) return null;
    
    return (
      <div className="font-mono text-sm space-y-4">
        {/* Header */}
        <div className="text-center space-y-1 pb-4 border-b border-dashed border-black/30">
          <h2 className="text-xl font-bold uppercase tracking-wider">{settings.storeName}</h2>
          <p className="text-xs text-black/60">Premium Waffle & Mocktail Counter</p>
          <div className="flex justify-between items-center text-xs mt-4">
            <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
            <span>Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>Order ID: {order._id.slice(-6).toUpperCase()}</span>
            <span>Payment: {order.paymentMethod || 'UPI'}</span>
          </div>
        </div>

        {/* Token Number */}
        <div className="text-center py-2">
          <p className="text-xs text-black/60 uppercase tracking-widest">Token Number</p>
          <h1 className="text-4xl font-black">{order.tokenNumber.toString().padStart(settings.tokenDigits, '0')}</h1>
        </div>

        {/* Items */}
        <div className="pb-4 border-b border-dashed border-black/30">
          <div className="flex justify-between text-xs font-bold uppercase mb-2">
            <span>Item</span>
            <span>Total</span>
          </div>
          <div className="space-y-3">
            {order.items.map((item: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between font-semibold">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.customizations && item.customizations.length > 0 && (
                  <div className="text-[11px] text-black/60 pl-4 mt-0.5">
                    {item.customizations.map((c: any) => c.extraPrice > 0 ? `${c.name} (+₹${c.extraPrice})` : c.name).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-1.5 pb-4 border-b border-dashed border-black/30 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          {(order.discountPercentage > 0 || order.discountAmount > 0) && (
            <div className="flex justify-between text-black/70">
              <span>Discount ({order.discountPercentage || 0}%)</span>
              <span>-₹{(order.discountAmount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2">
            <span>TOTAL</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-black/60 pt-2 space-y-1">
          <p className="font-semibold text-black">Thank you for your visit!</p>
          <p>Please keep this receipt for your reference.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar print:h-auto print:overflow-visible print:block print:p-0">
      {/* Screen View (Hidden on Print) */}
      <div className="print:hidden space-y-5">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Invoice Generator <Receipt className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400">Search for past orders via token or history to generate and print PDF bills</p>
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Controls & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" /> Find Order
              </h2>
              
              <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-6">
                <div className="relative">
                  <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <Input
                    type="number"
                    placeholder="Enter Token Number..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="bg-black/60 border-white/[0.08] pl-10 h-12 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-amber-400 font-mono text-sm w-full transition-all hover:bg-black/80"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="h-11 w-full bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform">
                  Search Token
                </Button>
              </form>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-[10px] uppercase tracking-widest font-bold">OR</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <Button 
                onClick={openHistoryModal}
                variant="outline" 
                className="h-11 mt-4 border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 w-full rounded-xl transition-all text-sm active:scale-[0.98]"
              >
                <History className="w-4 h-4 mr-2 text-amber-400" />
                Browse All Orders
              </Button>
            </div>
            
            {order && (
               <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-widest">Order Summary</h3>
                  <div className="space-y-3 text-sm text-slate-300">
                     <div className="flex justify-between items-center"><span className="text-slate-500">Order ID</span> <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded text-xs">{order._id.slice(-6).toUpperCase()}</span></div>
                     <div className="flex justify-between items-center"><span className="text-slate-500">Date</span> <span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                     <div className="flex justify-between items-center"><span className="text-slate-500">Total Items</span> <span className="text-white font-medium">{order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} Items</span></div>
                     <div className="flex justify-between items-center"><span className="text-slate-500">Status</span> <span className="text-emerald-400 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {order.status}</span></div>
                  </div>
               </div>
            )}
          </div>

          {/* Right Column: Invoice Preview */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {order ? (
              <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center w-full mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bill Preview</h3>
                  
                  <Button onClick={handlePrint} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-8 px-3 rounded-lg shadow-lg shadow-emerald-500/20 text-[11px] transition-transform active:scale-95">
                    <Printer className="w-3.5 h-3.5 mr-1.5" />
                    Print PDF
                  </Button>
                </div>

                {/* Email Form */}
                <div className="flex items-center gap-2 w-full mb-5 bg-white/[0.02] p-1.5 rounded-xl border border-white/[0.05] shadow-inner">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="Customer email..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-black/40 border-transparent pl-9 h-9 text-xs text-white placeholder:text-slate-500 rounded-lg focus-visible:ring-amber-400 focus-visible:bg-black/60 transition-colors"
                    />
                  </div>
                  <Button 
                    onClick={handleEmailInvoice}
                    disabled={isEmailing || !emailInput}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold h-9 px-4 rounded-lg shadow-lg shadow-amber-500/20 text-xs flex-shrink-0 transition-transform active:scale-95"
                  >
                    {isEmailing ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-[#f8f9fa] text-black w-full max-w-sm p-8 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 relative">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 rounded-t-xl" />
                  <BillContent />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm aspect-[1/1.4] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 bg-white/[0.01]">
                 <Receipt className="w-12 h-12 mb-4 opacity-20" />
                 <p className="text-sm font-medium">Search for an order to preview bill</p>
                 <p className="text-xs text-slate-600 mt-1">A4 format ready for print</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="bg-[#0f0f14] text-white border-white/[0.1] rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" /> 
              Recent Order History
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {recentOrders.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No recent orders found.</p>
            ) : (
              recentOrders.map((ro) => (
                <div 
                  key={ro._id}
                  onClick={() => selectOrder(ro)}
                  className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-amber-500/30 hover:bg-amber-500/5 cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Token</span>
                      <span className="text-amber-400 font-black font-mono leading-tight">{ro.tokenNumber.toString().padStart(settings.tokenDigits, '0')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">₹{ro.total.toFixed(2)} <span className="text-slate-500 font-normal ml-2">({ro.items.length} items)</span></p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ro.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      ro.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' :
                      ro.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {ro.status}
                    </span>
                    <Button variant="ghost" className="h-8 px-3 text-xs bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Actual Print View (Used for both window.print() and html2canvas PDF generation) */}
      {order && (
        <div 
          id="invoice-print-view" 
          className="fixed left-0 top-0 w-[210mm] bg-[#fffdfa] text-amber-950 p-12 min-h-screen -z-50 opacity-0 pointer-events-none print:relative print:opacity-100 print:z-[999999] print:block print:inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(217, 119, 6, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(217, 119, 6, 0.04) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        >
          <div className="max-w-4xl mx-auto font-sans relative">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-amber-900/40 uppercase tracking-widest">{settings.eventName || settings.storeName}</span>
              <span className="text-sm font-bold text-amber-900/40 uppercase tracking-widest">{new Date().getFullYear()}</span>
            </div>

            {/* Premium Header */}
            <div className="flex justify-between items-start border-b-2 border-amber-200 pb-8 mb-8">
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-amber-950 uppercase mb-1 flex items-center gap-3">
                  WAFFLE CIRCLE
                </h1>
                <p className="text-sm text-amber-900/60 font-medium tracking-wide">Premium Waffle & Mocktail Counter</p>
                <div className="mt-6 text-sm text-amber-950/80">
                  <p>Bengaluru, Karnataka, India, 560066</p>
                  <p>Contact: +91 73844 27171</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-light tracking-widest text-amber-700/50 uppercase mb-4">Invoice</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-left inline-grid">
                  <span className="text-amber-900/60 font-semibold text-right">Invoice No:</span>
                  <span className="font-mono font-bold text-amber-950">INV-{order._id.slice(-6).toUpperCase()}</span>
                  
                  <span className="text-amber-900/60 font-semibold text-right">Date:</span>
                  <span className="font-medium text-amber-950">{new Date(order.createdAt).toLocaleDateString()}</span>
                  
                  <span className="text-amber-900/60 font-semibold text-right">Token No:</span>
                  <span className="font-mono font-black text-amber-600 text-lg">#{order.tokenNumber.toString().padStart(settings.tokenDigits, '0')}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="mb-8 p-5 bg-amber-50/50 rounded-xl border border-amber-200/50 break-inside-avoid">
              <h3 className="text-xs font-bold text-amber-900/40 uppercase tracking-widest mb-2">Billed To</h3>
              <p className="text-sm font-semibold text-amber-950 flex items-center gap-2">
                <span className="text-amber-900/60 font-normal">Customer Phone:</span> {order.customerPhone || '________________'}
              </p>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-left border-collapse mb-8">
              <thead>
                <tr className="border-b-2 border-amber-200 bg-amber-50/80 break-inside-avoid">
                  <th className="py-3 px-4 rounded-tl-lg text-xs font-bold text-amber-900/60 uppercase tracking-widest">Item Description</th>
                  <th className="py-3 px-4 text-xs font-bold text-amber-900/60 uppercase tracking-widest text-right">Qty</th>
                  <th className="py-3 px-4 text-xs font-bold text-amber-900/60 uppercase tracking-widest text-right">Unit Price</th>
                  <th className="py-3 px-4 rounded-tr-lg text-xs font-bold text-amber-900/60 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {order.items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-amber-100/50 break-inside-avoid">
                    <td className="py-4 px-4">
                      <p className="font-bold text-amber-950 text-base">{item.name}</p>
                      {item.customizations && item.customizations.length > 0 && (
                        <p className="text-xs text-amber-900/60 mt-1">
                          <span className="font-semibold text-amber-900/40">Includes:</span> {item.customizations.map((c: any) => c.extraPrice > 0 ? `${c.name} (+₹${c.extraPrice})` : c.name).join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-amber-900/80">{item.quantity}</td>
                    <td className="py-4 px-4 text-right text-amber-900/60 font-mono">₹{item.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right font-bold text-amber-950 font-mono">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end break-inside-avoid">
              <div className="w-80 space-y-3 bg-amber-50 p-6 rounded-2xl border border-amber-200">
                <div className="flex justify-between text-sm text-amber-900/70 px-2">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">₹{order.subtotal.toFixed(2)}</span>
                </div>
                {(order.discountPercentage > 0 || order.discountAmount > 0) && (
                  <div className="flex justify-between text-sm text-amber-900/70 px-2">
                    <span>Discount ({order.discountPercentage || 0}%)</span>
                    <span className="font-mono text-red-600 font-medium">-₹{(order.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black text-amber-950 pt-4 pb-2 border-t-2 border-amber-200/60 px-2 mt-4">
                  <span>Total Amount</span>
                  <span className="font-mono">₹{order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-900/40 pt-2 px-2">
                  <span>Payment Method</span>
                  <span className="font-bold text-amber-900/60 uppercase">{order.paymentMethod || 'UPI'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t-2 border-amber-200/50 text-center text-xs text-amber-900/60 break-inside-avoid">
              <p className="mb-1 font-bold text-amber-950 text-base font-serif italic">Thank you for choosing Waffle Circle!</p>
              <p className="tracking-widest uppercase mt-2 text-[10px]">Instagram: @waffle.circle</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
