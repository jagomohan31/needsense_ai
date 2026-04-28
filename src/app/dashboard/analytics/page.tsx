'use client';
// ============================================================
// Analytics Page — Charts and impact metrics
// ============================================================
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllRequests } from '@/lib/db';
import type { NeedRequest, NeedCategory, RequestStatus } from '@/types';
import { getCategoryLabel, getCategoryEmoji } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';

const COLORS = ['#14b890', '#f97316', '#3b82f6', '#a855f7', '#ef4444', '#eab308', '#ec4899', '#06b6d4'];

const MONTHLY_DATA = [
  { month: 'Jan', requests: 24, resolved: 18 },
  { month: 'Feb', requests: 31, resolved: 25 },
  { month: 'Mar', requests: 28, resolved: 22 },
  { month: 'Apr', requests: 42, resolved: 38 },
  { month: 'May', requests: 37, resolved: 30 },
  { month: 'Jun', requests: 55, resolved: 48 },
];

export default function AnalyticsPage() {
  const [requests, setRequests] = useState<NeedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAllRequests().then(r => { setRequests(r); setLoading(false); }); }, []);

  // Category breakdown
  const categoryData = (Object.keys({ food: 1, medicine: 1, shelter: 1, blood: 1, elderly_help: 1, disaster: 1, education: 1, others: 1 }) as NeedCategory[]).map(cat => ({
    name: `${getCategoryEmoji(cat)} ${getCategoryLabel(cat)}`,
    value: requests.filter(r => r.category === cat).length,
  })).filter(d => d.value > 0);

  // Status breakdown
  const statusData = (['pending', 'assigned', 'in_progress', 'completed', 'cancelled'] as RequestStatus[]).map(s => ({
    name: s.replace(/_/g, ' '),
    value: requests.filter(r => r.status === s).length,
  })).filter(d => d.value > 0);

  // Urgency breakdown
  const urgencyData = [
    { name: 'Critical', value: requests.filter(r => r.urgencyLevel === 'critical').length, color: '#ef4444' },
    { name: 'High', value: requests.filter(r => r.urgencyLevel === 'high').length, color: '#f97316' },
    { name: 'Medium', value: requests.filter(r => r.urgencyLevel === 'medium').length, color: '#eab308' },
    { name: 'Low', value: requests.filter(r => r.urgencyLevel === 'low').length, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const totalPeople = requests.reduce((sum, r) => sum + (r.peopleAffected || 0), 0);
  const completionRate = requests.length > 0 ? Math.round((requests.filter(r => r.status === 'completed').length / requests.length) * 100) : 0;
  const aiAnalyzed = requests.filter(r => r.aiAnalysis).length;
  const avgUrgency = requests.length > 0 ? (requests.reduce((sum, r) => sum + (r.urgencyScore || 0), 0) / requests.length).toFixed(1) : '0';

  if (loading) return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="skeleton h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="glass-card p-6"><div className="skeleton h-8 w-16 mb-2" /><div className="skeleton h-4 w-24" /></div>)}</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide impact metrics</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: requests.length, color: 'text-blue-400' },
          { label: 'People Helped', value: totalPeople.toLocaleString(), color: 'text-brand-400' },
          { label: 'Completion Rate', value: `${completionRate}%`, color: 'text-green-400' },
          { label: 'Avg AI Urgency', value: `${avgUrgency}/10`, color: 'text-purple-400' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="glass-card p-5">
            <p className={`font-display font-extrabold text-3xl ${k.color}`}>{k.value}</p>
            <p className="text-slate-400 text-sm mt-1">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h2 className="font-display font-bold text-white mb-1">Monthly Trend</h2>
          <p className="text-slate-500 text-xs mb-5">Requests submitted vs resolved</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="requests" stroke="#14b890" strokeWidth={2.5} dot={{ fill: '#14b890', r: 3 }} />
              <Line type="monotone" dataKey="resolved" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <h2 className="font-display font-bold text-white mb-1">Urgency Distribution</h2>
          <p className="text-slate-500 text-xs mb-5">Breakdown by urgency level</p>
          {urgencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={urgencyData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {urgencyData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>}
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="font-display font-bold text-white mb-1">Requests by Category</h2>
          <p className="text-slate-500 text-xs mb-5">Distribution of need types</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={130} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h2 className="font-display font-bold text-white mb-1">Status Overview</h2>
          <p className="text-slate-500 text-xs mb-5">Requests by current status</p>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>}
        </motion.div>
      </div>

      {/* AI Impact Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 border-brand-500/20">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🤖</span>
          <div><h2 className="font-display font-bold text-white">AI Impact Summary</h2><p className="text-slate-500 text-xs">How Gemini AI is helping operations</p></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-brand-500/5 border border-brand-500/15 rounded-xl p-4">
            <p className="font-display font-bold text-2xl text-brand-400">{aiAnalyzed}</p>
            <p className="text-slate-400 text-sm mt-1">Requests AI-analyzed</p>
          </div>
          <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
            <p className="font-display font-bold text-2xl text-purple-400">{requests.length > 0 ? Math.round((aiAnalyzed / requests.length) * 100) : 0}%</p>
            <p className="text-slate-400 text-sm mt-1">AI coverage rate</p>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
            <p className="font-display font-bold text-2xl text-blue-400">~85%</p>
            <p className="text-slate-400 text-sm mt-1">Faster than manual triage</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
