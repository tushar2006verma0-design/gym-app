'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Lock, 
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Zap
} from 'lucide-react';

const MeshBackground = () => (
  <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-[#0A0A0A]">
    <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[140px] "></div>
    <div className="absolute bottom-[-10%] right-[-20%] w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[120px] "></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
  </div>
);

export default function AdminDashboard() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
  }, []);

  // Dummy Admin Passcode. In a real app, this should be validated server-side.
  const ADMIN_PASSCODE = 'tusharadmin1984'; 

  if (!hasMounted) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-black uppercase italic tracking-tighter text-slate-700">Connecting Admin Terminal...</div>;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE || passcode === process.env.NEXT_PUBLIC_ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid passcode.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <MeshBackground />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase mb-2">
            Admin Access
          </h1>
          <p className="text-sm text-slate-400 mb-8 font-medium">
            Restricted area. Please enter the master passcode.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                placeholder="Enter Passcode..." 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:bg-white/10 text-white text-center tracking-widest font-mono"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-bold">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-600/20"
            >
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Dashboard Data
  const stats = [
    { label: 'Total Users', value: '0', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Active Sessions', value: '0', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Pro Upgrades', value: '0', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { label: 'MRR', value: '₹0', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  ];

  const recentUsers: any[] = [];

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-[#0A0A0A]">
      <MeshBackground />
      
      {/* Topbar */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-red-500" />
            <span className="font-bold uppercase tracking-widest text-sm">IronTrack / System Admin</span>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-xs font-bold uppercase tracking-wider hover:text-red-400 transition-colors"
          >
            Lock Terminal
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Command Center</h2>
          <p className="text-slate-400">Overview of system metrics and user analytics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`p-6 rounded-2xl bg-white/5 backdrop-blur-lg border ${stat.border}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today</span>
                </div>
                <div>
                  <div className="text-3xl font-black tracking-tight mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users Table */}
          <div className="lg:col-span-2 bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Recent Signups</h3>
              <button className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">View All Directory</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold">User</th>
                    <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Email</th>
                    <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Plan</th>
                    <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Status</th>
                    <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-xs">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </td>
                      <td className="py-4 text-slate-400">{user.email}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.plan === 'Pro' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300 border border-white/10'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.status === 'Online' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                          <span className="text-xs text-slate-400">{user.status}</span>
                        </div>
                      </td>
                      <td className="py-4">
                         <button className="text-slate-400 hover:text-white transition-colors">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions / System Status */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur-lg">
              <h3 className="text-lg font-bold mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-sm font-medium text-slate-300">Database Load</span>
                  <span className="text-sm font-bold text-green-400">0%</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-sm font-medium text-slate-300">API Latency</span>
                  <span className="text-sm font-bold text-green-400">0ms</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-sm font-medium text-slate-300">AI Tokens Used</span>
                  <span className="text-sm font-bold text-yellow-500">0</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur-lg">
              <h3 className="text-lg font-bold mb-4">Admin Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-left transition-colors flex items-center justify-between group">
                  Send Broadcast Push
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>
                <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-left transition-colors flex items-center justify-between group">
                  Manage Workout Templates
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>
                 <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-left transition-colors flex items-center justify-between group">
                  Export User Data (CSV)
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
