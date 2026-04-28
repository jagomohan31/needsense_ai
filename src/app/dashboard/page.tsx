'use client';
// ============================================================
// Admin Dashboard — Overview Page
// ============================================================
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle2, Users, Clock, TrendingUp, Brain, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { getDashboardStats, getAllRequests } from '@/lib/db';
import type { DashboardStats, NeedRequest } from '@/types';
import { getUrgencyColor, getStatusColor, getCategoryEmoji, formatStatus, timeAgo } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const TREND_DATA = [
  { day: 'Mon', requests: 8, resolved: 5 },
  { day: 'Tue', requests: 12, resolved: 9 },
  { day: 'Wed', requests: 7, resolved: 7 },
  { day: 'Thu', requests: 15, resolved: 10 },
  { day: 'Fri', requests: 11, resolved: 8 },
  { day: 'Sat', requests: 18, resolved: 14 },
  { day: 'Sun', requests: 9, resolved: 9 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<NeedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, r] = await Promise.all([getDashboardStats(), getAllRequests()]);
      setStats(s);
      setRequests(r.slice(0, 8));
      setLoading(false);
    }
    load();
  }, []);

  const STAT_CARDS = stats ? [
    { label: 'Total Requests', value: stats.totalRequests, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '+12% this week' },
    { label: 'Urgent Requests', value: stats.urgentRequests, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', change: 'Needs attention' },
    { label: 'Active Volunteers', value: stats.activeVolunteers, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10', change: 'Available now' },
    { label: 'Completed', value: stats.completedRequests, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', change: `${stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}% resolution rate` },
  ] : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/dashboard/requests?new=1" className="btn-primary flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4" /> New Request
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <div key={i} className="stat-card"><div className="skeleton h-10 w-10 rounded-xl mb-3" /><div className="skeleton h-8 w-16 mb-2" /><div className="skeleton h-4 w-24" /></div>)
          : STAT_CARDS.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className={`font-display font-extrabold text-3xl ${card.color}`}>{card.value}</p>
                <p className="text-slate-400 text-sm font-medium mt-0.5">{card.label}</p>
                <p className="text-slate-600 text-xs mt-1">{card.change}</p>
              </div>
            </motion.div>
          ))
        }
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-white">Weekly Trend</h2>
              <p className="text-slate-500 text-xs mt-0.5">Requests vs Resolved</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b890" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b890" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="requests" stroke="#14b890" strokeWidth={2} fill="url(#reqGrad)" />
              <Area type="monotone" dataKey="resolved" stroke="#3b82f6" strokeWidth={2} fill="url(#resGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 space-y-4">
          <h2 className="font-display font-bold text-white">AI Insights</h2>
          {[
            { label: 'Avg Urgency Score', value: '7.2/10', icon: Brain, color: 'text-purple-400' },
            { label: 'Avg Response Time', value: '2.4 hrs', icon: Clock, color: 'text-blue-400' },
            { label: 'This Week Growth', value: '+23%', icon: TrendingUp, color: 'text-brand-400' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <div className={`w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center ${item.color}`}><item.icon className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className={`font-display font-bold text-sm ${item.color}`}>{item.value}</p>
              </div>
            </div>
          ))}
          <Link href="/dashboard/analytics" className="block w-full text-center text-xs text-brand-400 hover:text-brand-300 pt-2 border-t border-white/[0.06]">View full analytics →</Link>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="font-display font-bold text-white">Recent Requests</h2>
          <Link href="/dashboard/requests" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="flex items-center gap-4"><div className="skeleton w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><div className="skeleton h-4 w-2/3" /><div className="skeleton h-3 w-1/3" /></div></div>)}</div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No requests yet</p>
            <Link href="/dashboard/requests?new=1" className="text-brand-400 text-sm mt-2 inline-block">Create your first request →</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02]">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl flex-shrink-0">{getCategoryEmoji(req.category)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{req.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{req.address}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-xs text-slate-500">{timeAgo(req.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${getUrgencyColor(req.urgencyLevel)}`}>{req.urgencyLevel}</span>
                  <span className={`badge ${getStatusColor(req.status)} hidden sm:inline-flex`}>{formatStatus(req.status)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
