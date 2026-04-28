'use client';
// ============================================================
// Live Map Page — Leaflet with urgency markers
// ============================================================
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { getAllRequests } from '@/lib/db';
import type { NeedRequest } from '@/types';
import { getCategoryEmoji, getUrgencyColor, formatStatus, getUrgencyMapColor } from '@/lib/utils';

// Dynamic import to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-surface-900 rounded-2xl">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        Loading map...
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [requests, setRequests] = useState<NeedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NeedRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    getAllRequests().then(r => { setRequests(r.filter(x => x.location)); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.urgencyLevel === filter);
  const counts = {
    critical: requests.filter(r => r.urgencyLevel === 'critical').length,
    high: requests.filter(r => r.urgencyLevel === 'high').length,
    medium: requests.filter(r => r.urgencyLevel === 'medium').length,
    low: requests.filter(r => r.urgencyLevel === 'low').length,
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Live Map</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} active requests shown</p>
        </div>
      </div>

      {/* Legend & filters */}
      <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
        {([['all', '#94a3b8', `All (${requests.length})`], ['critical', '#ef4444', `Critical (${counts.critical})`], ['high', '#f97316', `High (${counts.high})`], ['medium', '#eab308', `Medium (${counts.medium})`], ['low', '#22c55e', `Low (${counts.low})`]] as const).map(([val, color, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === val ? 'bg-white/[0.1] border-white/[0.2] text-white' : 'border-white/[0.06] text-slate-400 hover:bg-white/[0.04]'}`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {label}
          </button>
        ))}
      </div>

      {/* Map + Sidebar */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-white/[0.06]">
          {!loading && (
            <MapComponent
              requests={filtered}
              onSelectRequest={setSelected}
              selectedRequest={selected}
            />
          )}
        </div>

        {/* Side panel */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
          {selected ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{getCategoryEmoji(selected.category)}</span>
                <h3 className="font-bold text-white text-sm leading-tight">{selected.title}</h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">{selected.description}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Urgency</span><span className={`badge ${getUrgencyColor(selected.urgencyLevel)}`}>{selected.urgencyLevel} ({selected.urgencyScore}/10)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-slate-300">{formatStatus(selected.status)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Affected</span><span className="text-slate-300">{selected.peopleAffected} people</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-slate-300 text-right max-w-[140px]">{selected.address}</span></div>
                {selected.aiAnalysis && <div className="pt-2 mt-2 border-t border-white/[0.06]"><p className="text-slate-500 mb-1">AI Summary</p><p className="text-slate-300">{selected.aiAnalysis.summary}</p></div>}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-4 text-center text-slate-500 text-sm">Click a map marker to view details</div>
          )}

          {/* Request list */}
          <div className="glass-card overflow-hidden flex-1">
            <div className="p-3 border-b border-white/[0.06]">
              <p className="text-xs font-semibold text-slate-400">Requests with Location</p>
            </div>
            <div className="divide-y divide-white/[0.04] overflow-y-auto max-h-96">
              {filtered.length === 0 ? (
                <p className="text-slate-600 text-xs text-center py-6">No requests with coordinates</p>
              ) : filtered.map(req => (
                <button key={req.id} onClick={() => setSelected(req)} className={`w-full flex items-start gap-2 p-3 text-left hover:bg-white/[0.04] transition-colors ${selected?.id === req.id ? 'bg-white/[0.04]' : ''}`}>
                  <span className="text-base mt-0.5">{getCategoryEmoji(req.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{req.title}</p>
                    <p className="text-xs text-slate-600 truncate">{req.address}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: getUrgencyMapColor(req.urgencyLevel) }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
