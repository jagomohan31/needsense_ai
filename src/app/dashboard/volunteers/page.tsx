'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Star, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { getVolunteers } from '@/lib/db';
import type { VolunteerProfile } from '@/types';
import { cn } from '@/lib/utils';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [filtered, setFiltered] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState('all');

  useEffect(() => {
    getVolunteers().then(vs => { setVolunteers(vs); setFiltered(vs); setLoading(false); });
  }, []);

  useEffect(() => {
    let r = [...volunteers];
    if (search) r = r.filter(v => v.displayName.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase()));
    if (availFilter !== 'all') r = r.filter(v => v.availability === availFilter);
    setFiltered(r);
  }, [volunteers, search, availFilter]);

  const availColor = (a: string) => a === 'available' ? 'text-green-400 bg-green-500/10 border-green-500/20' : a === 'busy' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Volunteers</h1>
        <p className="text-slate-400 text-sm mt-1">{filtered.length} of {volunteers.length} volunteers</p>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search volunteers..." className="glass-input w-full pl-9 pr-4 py-2.5 text-sm" /></div>
        <select value={availFilter} onChange={e => setAvailFilter(e.target.value)} className="glass-input px-4 py-2.5 text-sm">
          <option value="all" className="bg-[#1e293b]">All</option>
          <option value="available" className="bg-[#1e293b]">Available</option>
          <option value="busy" className="bg-[#1e293b]">Busy</option>
          <option value="offline" className="bg-[#1e293b]">Offline</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Available', value: volunteers.filter(v => v.availability === 'available').length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Busy', value: volunteers.filter(v => v.availability === 'busy').length, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Total', value: volunteers.length, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div><p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p><p className="text-slate-500 text-xs">{s.label}</p></div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="glass-card p-6"><div className="skeleton h-12 w-12 rounded-full mb-4" /><div className="skeleton h-5 w-32 mb-2" /><div className="skeleton h-4 w-24" /></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card py-20 text-center"><Users className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-slate-400">No volunteers found</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vol, i) => (
            <motion.div key={vol.uid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 hover:border-white/[0.15] transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-base flex-shrink-0">
                  {vol.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{vol.displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{vol.email}</p>
                </div>
                <span className={`badge ${availColor(vol.availability || 'offline')}`}>{vol.availability || 'offline'}</span>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {(vol.skills || []).slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 text-xs border border-white/[0.06]">{s.replace(/_/g, ' ')}</span>
                  ))}
                  {(vol.skills || []).length > 3 && <span className="text-xs text-slate-600">+{(vol.skills || []).length - 3} more</span>}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/[0.04]">
                  <span>✅ {vol.completedTasksCount || 0} completed</span>
                  <span>⚡ {vol.activeTasksCount || 0} active</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
