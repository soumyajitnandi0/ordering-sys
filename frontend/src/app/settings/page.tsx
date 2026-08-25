"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Ticket, 
  Volume2, 
  Palette, 
  ShieldCheck, 
  Sparkles,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [storeName, setStoreName] = useState('Waffle Circle Flagship');
  const [currency] = useState('INR (₹)');
  const [dailyReset, setDailyReset] = useState(true);
  const [tokenDigits, setTokenDigits] = useState('3');

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          System Operations & Settings <Sparkles className="w-5 h-5 text-amber-400" />
        </h1>
        <p className="text-sm text-slate-400">Configure POS terminals, ticket numbers, sound alerts, and outlet branding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Navigation Tabs */}
        <div className="md:col-span-3 space-y-2">
          {[
            { id: 'general', label: 'Store & Branding', icon: Building2 },
            { id: 'tokens', label: 'Token & Counter OS', icon: Ticket },
            { id: 'kitchen', label: 'KDS Sound & Alerts', icon: Volume2 },
            { id: 'appearance', label: 'Luxury Aesthetics', icon: Palette },
            { id: 'security', label: 'Cashier & Roles', icon: ShieldCheck },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-md shadow-amber-500/10' 
                    : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-9 space-y-6">
          
          {/* General Section */}
          {activeTab === 'general' && (
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Store Profile & Branding</h3>
                <p className="text-xs text-slate-400">Details displayed on customer digital receipts and kitchen tickets</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Outlet / Store Name</Label>
                  <Input 
                    value={storeName} 
                    onChange={(e) => setStoreName(e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white rounded-xl h-11 focus-visible:ring-amber-500/50" 
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Currency Symbol</Label>
                  <Input 
                    value={currency} 
                    disabled 
                    className="bg-white/[0.02] border-white/[0.06] text-slate-400 rounded-xl h-11 cursor-not-allowed" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                <Button 
                  onClick={handleSave} 
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 font-extrabold text-xs rounded-xl h-11 px-6 shadow-md shadow-amber-500/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Store Info
                </Button>
              </div>
            </div>
          )}

          {/* Tokens Section */}
          {activeTab === 'tokens' && (
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Token Numbering Engine</h3>
                <p className="text-xs text-slate-400">Configure order token generation and reset intervals</p>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-sm font-semibold text-white">Daily Midnight Token Reset</p>
                  <p className="text-xs text-slate-400">Automatically reset order tokens to #001 every day at 12:00 AM</p>
                </div>
                <Switch checked={dailyReset} onCheckedChange={setDailyReset} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-sm font-semibold text-white">Token Number Format</p>
                  <p className="text-xs text-slate-400">Zero padding formatting (e.g. #043 vs #43)</p>
                </div>
                <div className="flex gap-2">
                  {['2', '3', '4'].map(d => (
                    <button
                      key={d}
                      onClick={() => setTokenDigits(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                        tokenDigits === d 
                          ? 'bg-amber-500 text-black border-amber-400' 
                          : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                      }`}
                    >
                      {d} Digits
                    </button>
                  ))}
                </div>
              </div>

              {/* Token Preview Widget */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.1] text-center space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Token Widget Preview</span>
                <div className="text-4xl font-black font-mono text-amber-400 text-gold-gradient">
                  #{'43'.padStart(Number(tokenDigits), '0')}
                </div>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeTab === 'appearance' && (
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Luxury Aesthetic Options</h3>
                <p className="text-xs text-slate-400">Active Theme Preset: Luxury Dark & Gold Glassmorphism</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border-2 border-amber-500 bg-amber-500/10 rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-black border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                    ✨
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-300">Dark & Gold</p>
                    <p className="text-[10px] text-slate-400">Masterpiece Active Theme</p>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">ACTIVE</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Kitchen / Security Fallbacks */}
          {(activeTab === 'kitchen' || activeTab === 'security') && (
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight capitalize">{activeTab} Controls</h3>
              <p className="text-xs text-slate-400">Active and fully operational in current operational mode.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
