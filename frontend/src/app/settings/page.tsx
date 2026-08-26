"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { 
  Building2, 
  Ticket, 
  Volume2, 
  Palette, 
  ShieldCheck, 
  Sparkles,
  Save,
  MessageSquare,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Terminal,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, updateSettings } = useStore();

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const copyDockerCommand = () => {
    navigator.clipboard.writeText('docker run -d -p 3008:3000/tcp -e WAHA_API_KEY="wafflecircle" --name waha devlikeapro/waha');
    toast.success('Docker command copied to clipboard!');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          System Operations & Settings <Sparkles className="w-5 h-5 text-amber-400" />
        </h1>
        <p className="text-sm text-slate-400">Configure POS terminals, ticket numbers, WhatsApp auto-messaging, and outlet branding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Navigation Tabs */}
        <div className="md:col-span-3 space-y-2">
          {[
            { id: 'general', label: 'Store & Branding', icon: Building2 },
            { id: 'whatsapp', label: 'WhatsApp Alerts (WAHA)', icon: MessageSquare },
            { id: 'tokens', label: 'Token & Counter OS', icon: Ticket },
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
                    value={settings.storeName} 
                    onChange={(e) => updateSettings({ storeName: e.target.value })}
                    className="bg-white/[0.04] border-white/[0.08] text-white rounded-xl h-11 focus-visible:ring-amber-500/50" 
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Currency Symbol</Label>
                  <Input 
                    value="INR (₹)" 
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

          {/* WhatsApp WAHA Section */}
          {activeTab === 'whatsapp' && (
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">WhatsApp Notification Engine</h3>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                      100% FREE • Self-Hosted WAHA
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Send real-time WhatsApp updates for Token Creation, Kitchen Preparation, Order Ready, and Delivery.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Auto-Messaging</span>
                  <Switch checked={settings.wahaAutoNotify} onCheckedChange={(val) => updateSettings({ wahaAutoNotify: val })} />
                </div>
              </div>

              {/* Status & Service Endpoint */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">WAHA REST API Service</h4>
                    <p className="text-xs text-slate-400 font-mono">http://localhost:3008</p>
                  </div>
                </div>
                
                <a 
                  href="http://localhost:3008/dashboard" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  Open WAHA Dashboard <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Quick Docker Setup Card */}
              <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" /> Run WAHA Docker Container (1-Step)
                  </span>
                  <button 
                    onClick={copyDockerCommand}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-white/[0.08] px-2.5 py-1 rounded-lg border border-white/[0.1] hover:bg-white/[0.15] transition-all"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" /> Copy Command
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-black font-mono text-xs text-emerald-300 border border-emerald-500/20 overflow-x-auto">
                  docker run -d -p 3008:3000/tcp -e WAHA_API_KEY="wafflecircle" --name waha devlikeapro/waha
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <p className="text-xs font-bold text-white">3 Easy Setup Steps:</p>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1">
                    <li>Execute the Docker command above in your server terminal.</li>
                    <li>Open <a href="http://localhost:3008/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-mono">http://localhost:3008/dashboard</a> in your browser.</li>
                    <li>Scan the WhatsApp QR code using your WhatsApp phone app to authenticate session.</li>
                  </ol>
                </div>
              </div>

              {/* Notification Milestones */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Active Notification Milestones</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Order Confirmed', desc: 'Sends Token # and itemized list' },
                    { title: 'In Preparation', desc: 'Notifies customer when baking starts' },
                    { title: 'Ready for Pickup', desc: 'High-priority counter collection alert' },
                    { title: 'Order Delivered', desc: 'Sends thank you note after collection' },
                  ].map((m, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">{m.title}</p>
                        <p className="text-[11px] text-slate-400">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                <Switch checked={settings.dailyReset} onCheckedChange={(val) => updateSettings({ dailyReset: val })} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-sm font-semibold text-white">Token Number Format</p>
                  <p className="text-xs text-slate-400">Zero padding formatting (e.g. #043 vs #43)</p>
                </div>
                <div className="flex gap-2">
                  {[2, 3, 4].map(d => (
                    <button
                      key={d}
                      onClick={() => updateSettings({ tokenDigits: d })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                        settings.tokenDigits === d 
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
                  #{'43'.padStart(settings.tokenDigits, '0')}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
