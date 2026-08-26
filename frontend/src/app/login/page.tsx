"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        setAuth(response.data.token);
        toast.success('Authentication successful');
        router.push('/pos');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="w-full max-w-md bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8 relative z-10 shadow-2xl shadow-black">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-2">Master Login</h1>
          <p className="text-sm text-slate-400">Authenticate to access the operational system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Master Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/40 border-white/[0.08] text-white pl-10 h-12 rounded-xl focus-visible:ring-amber-500/50 placeholder:text-slate-600"
                placeholder="admin@wafflecircle.com"
              />
            </div>
          </div>

          <div className="space-y-1.5 pb-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/40 border-white/[0.08] text-white pl-10 h-12 rounded-xl focus-visible:ring-amber-500/50 placeholder:text-slate-600 font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Authenticate <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center relative z-10 text-xs font-medium text-slate-500">
        Waffle Circle Operational OS • Protected Access
      </div>
    </div>
  );
}
