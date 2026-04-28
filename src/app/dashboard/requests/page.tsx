'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, UserPlus, Brain, X, MapPin, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllRequests, createRequest, deleteRequest, updateRequest, getVolunteers, createAssignment } from '@/lib/db';
import { analyzeNeedRequest } from '@/lib/gemini';
import { useAuth } from '@/context/AuthContext';
import type { NeedRequest, VolunteerProfile, NeedCategory, UrgencyLevel, RequestStatus } from '@/types';
import { getUrgencyColor, getStatusColor, getCategoryEmoji, getCategoryLabel, formatStatus, timeAgo, cn } from '@/lib/utils';

const CATEGORIES: NeedCategory[] = ['food', 'medicine', 'shelter', 'blood', 'elderly_help', 'disaster', 'education', 'others'];
const STATUSES: RequestStatus[] = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
const URGENCY_LEVELS: UrgencyLevel[] = ['critical', 'high', 'medium', 'low'];

function calculateMatchScore(requiredSkill: string, volunteerSkills: string[], availability: string, activeTasksCount: number): number {
  let score = 0;
  if (volunteerSkills.includes(requiredSkill)) score += 50;
  else if (volunteerSkills.includes('other')) score += 10;
  if (availability === 'available') score += 30;
  else if (availability === 'busy') score += 10;
  if (activeTasksCount === 0) score += 20;
  else if (activeTasksCount === 1) score += 15;
  else if (activeTasksCount === 2) score += 8;
  return score;
}

function RequestModal({ onClose, onSuccess, editRequest }: { onClose: () => void; onSuccess: () => void; editRequest?: NeedRequest | null }) {
  const { userProfile } = useAuth();
  const [title, setTitle] = useState(editRequest?.title || '');
  const [description, setDescription] = useState(editRequest?.description || '');
  const [category, setCategory] = useState<NeedCategory>(editRequest?.category || 'food');
  const [address, setAddress] = useState(editRequest?.address || '');
  const [lat, setLat] = useState<number>(editRequest?.location?.lat || 22.5726);
  const [lng, setLng] = useState<number>(editRequest?.location?.lng || 88.4124);
  const [peopleAffected, setPeopleAffected] = useState(editRequest?.peopleAffected || 1);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiResult, setAiResult] = useState(editRequest?.aiAnalysis || null);

  const runAI = async () => {
    if (!title || !description) { toast.error('Enter title and description first'); return; }
    setAnalyzing(true);
    try {
      const r = await analyzeNeedRequest(title, description);
      setAiResult(r); setCategory(r.predictedCategory);
      toast.success('AI analysis complete!');
    } catch { toast.error('AI analysis failed'); }
    finally { setAnalyzing(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSaving(true);
    try {
      let analysis = aiResult;
      if (!analysis) analysis = await analyzeNeedRequest(title, description);
      const data = {
        title,
        description,
        category: analysis.predictedCategory,
        address,
        location: { lat: lat || 22.5726, lng: lng || 88.4124 },
        peopleAffected,
        status: 'pending' as RequestStatus,
        urgencyLevel: analysis.urgencyLevel,
        urgencyScore: analysis.urgencyScore,
        submittedBy: userProfile.uid,
        submittedByName: userProfile.displayName,
        aiAnalysis: analysis
      };
      if (editRequest) { await updateRequest(editRequest.id, data); toast.success('Request updated'); }
      else { await createRequest(data); toast.success('Request submitted & AI analyzed!'); }
      onSuccess(); onClose();
    } catch { toast.error('Failed to save request'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h2 className="font-display font-bold text-xl text-white">{editRequest ? 'Edit Request' : 'New Need Request'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief title of the need" required className="glass-input w-full px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the need in detail..." required rows={3} className="glass-input w-full px-4 py-3 text-sm resize-none" />
          </div>

          <button type="button" onClick={runAI} disabled={analyzing || !title || !description} className={cn('w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all', analyzing ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' : 'border-brand-500/30 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20')}>
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {analyzing ? 'Analyzing with Gemini AI...' : '✨ Run AI Analysis'}
          </button>

          <AnimatePresence>
            {aiResult && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
                <div className="flex items-center gap-2 text-brand-400 text-sm font-semibold mb-3"><CheckCircle className="w-4 h-4" /> AI Analysis Result</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Urgency Score</p>
                    <p className="font-display font-bold text-xl" style={{ color: aiResult.urgencyScore >= 8 ? '#ef4444' : aiResult.urgencyScore >= 5 ? '#f97316' : '#22c55e' }}>{aiResult.urgencyScore}/10</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Category</p>
                    <p className="text-white">{getCategoryEmoji(aiResult.predictedCategory)} {getCategoryLabel(aiResult.predictedCategory)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs">AI Summary</p>
                    <p className="text-slate-300 text-sm">{aiResult.summary}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Suggested Skill</p>
                    <p className="text-white">{aiResult.suggestedSkill?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Confidence</p>
                    <p className="text-white">{Math.round((aiResult.confidence || 0) * 100)}%</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as NeedCategory)} className="glass-input w-full px-4 py-3 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1e293b]">{getCategoryEmoji(c)} {getCategoryLabel(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">People Affected</label>
              <input type="number" min={1} value={peopleAffected} onChange={e => setPeopleAffected(parseInt(e.target.value) || 1)} className="glass-input w-full px-4 py-3 text-sm" />
            </div>
          </div>

          <div>
            <label className="label"><MapPin className="w-3.5 h-3.5 inline mr-1" />Address *</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, Area, City" required className="glass-input w-full px-4 py-3 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">📍 Latitude</label>
              <input type="number" step="any" value={lat} onChange={e => setLat(parseFloat(e.target.value) || 22.5726)} placeholder="22.5726" className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="label">📍 Longitude</label>
              <input type="number" step="any" value={lng} onChange={e => setLng(parseFloat(e.target.value) || 88.4124)} placeholder="88.4124" className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/15 text-xs text-slate-400">
            💡 <strong className="text-brand-400">Kolkata area coordinates:</strong> Lat: 22.5726, Lng: 88.4124 &nbsp;|&nbsp;
            Change slightly for each request to show different map markers
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{saving ? 'Saving...' : editRequest ? 'Update' : 'Submit Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function AssignModal({ request, onClose, onSuccess }: { request: NeedRequest; onClose: () => void; onSuccess: () => void }) {
  const { userProfile } = useAuth();
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getVolunteers().then(vs => {
      const skill = request.aiAnalysis?.suggestedSkill || 'other';
      setVolunteers(vs.sort((a, b) =>
        calculateMatchScore(skill, b.skills||[], b.availability||'offline', b.activeTasksCount||0) -
        calculateMatchScore(skill, a.skills||[], a.availability||'offline', a.activeTasksCount||0)
      ));
      setLoading(false);
    });
  }, [request]);

  const handleAssign = async () => {
    if (!selected || !userProfile) return;
    setSaving(true);
    try {
      const vol = volunteers.find(v => v.uid === selected)!;
      await createAssignment({ requestId: request.id, requestTitle: request.title, volunteerId: vol.uid, volunteerName: vol.displayName, assignedBy: userProfile.uid, status: 'pending_acceptance' });
      toast.success(`✅ Assigned to ${vol.displayName}`);
      onSuccess(); onClose();
    } catch { toast.error('Assignment failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div>
            <h2 className="font-display font-bold text-lg text-white">Assign Volunteer</h2>
            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{request.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {request.aiAnalysis && (
            <div className="flex items-center gap-2 text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2">
              <Brain className="w-3.5 h-3.5" />
              AI suggests: <span className="font-semibold">{request.aiAnalysis.suggestedSkill?.replace(/_/g, ' ')}</span>
              &nbsp;| Urgency: <span className="font-bold text-red-400">{request.aiAnalysis.urgencyScore}/10</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : volunteers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No volunteers registered yet</p>
              <p className="text-slate-600 text-xs mt-1">Register a volunteer account first</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {volunteers.map((vol, idx) => {
                const score = calculateMatchScore(
                  request.aiAnalysis?.suggestedSkill || 'other',
                  vol.skills || [], vol.availability || 'offline', vol.activeTasksCount || 0
                );
                return (
                  <button key={vol.uid} onClick={() => setSelected(vol.uid)} className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all', selected === vol.uid ? 'border-brand-500/50 bg-brand-500/10' : 'border-white/[0.06] hover:bg-white/[0.04]')}>
                    <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
                      {vol.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{vol.displayName}</p>
                        {idx === 0 && <span className="badge bg-brand-500/15 text-brand-400 border-brand-500/20 text-xs">⭐ Best</span>}
                      </div>
                      <p className="text-xs text-slate-500">{(vol.skills || []).slice(0, 2).join(', ').replace(/_/g, ' ') || 'No skills listed'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${score >= 70 ? 'text-brand-400' : score >= 40 ? 'text-yellow-400' : 'text-slate-400'}`}>{score}%</p>
                      <p className={`text-xs ${vol.availability === 'available' ? 'text-green-400' : vol.availability === 'busy' ? 'text-orange-400' : 'text-slate-500'}`}>
                        {vol.availability || 'offline'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAssign} disabled={!selected || saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {saving ? 'Assigning...' : 'Assign Volunteer'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<NeedRequest[]>([]);
  const [filtered, setFiltered] = useState<NeedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === '1');
  const [editingRequest, setEditingRequest] = useState<NeedRequest | null>(null);
  const [assigningRequest, setAssigningRequest] = useState<NeedRequest | null>(null);

  const load = useCallback(async () => { setLoading(true); setRequests(await getAllRequests()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let r = [...requests];
    if (search) r = r.filter(x => x.title.toLowerCase().includes(search.toLowerCase()) || x.address.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') r = r.filter(x => x.status === statusFilter);
    if (urgencyFilter !== 'all') r = r.filter(x => x.urgencyLevel === urgencyFilter);
    setFiltered(r);
  }, [requests, search, statusFilter, urgencyFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this request?')) return;
    await deleteRequest(id); toast.success('Deleted'); load();
  };

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    await updateRequest(id, { status, ...(status === 'completed' ? { completedAt: new Date() } : {}) });
    toast.success('Status updated'); load();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Requests</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} of {requests.length} requests</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />New Request
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." className="glass-input w-full pl-9 pr-4 py-2.5 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as RequestStatus | 'all')} className="glass-input px-4 py-2.5 text-sm">
          <option value="all" className="bg-[#1e293b]">All Status</option>
          {STATUSES.map(s => <option key={s} value={s} className="bg-[#1e293b]">{formatStatus(s)}</option>)}
        </select>
        <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value as UrgencyLevel | 'all')} className="glass-input px-4 py-2.5 text-sm">
          <option value="all" className="bg-[#1e293b]">All Urgency</option>
          {URGENCY_LEVELS.map(u => <option key={u} value={u} className="bg-[#1e293b]">{u[0].toUpperCase() + u.slice(1)}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2"><div className="skeleton h-4 w-1/2" /><div className="skeleton h-3 w-1/3" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No requests found</p>
            <p className="text-slate-600 text-sm mt-1">Create a new request to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(req => (
              <div key={req.id} className="flex items-start gap-4 px-4 sm:px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-2xl flex-shrink-0">{getCategoryEmoji(req.category)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{req.title}</p>
                    {req.aiAnalysis && <Brain className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" title="AI analyzed" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{req.description}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-slate-500">📍 {req.address}</span>
                    <span className="text-xs text-slate-500">👥 {req.peopleAffected} people</span>
                    <span className="text-xs text-slate-600">{timeAgo(req.createdAt)}</span>
                    {req.assignedToName && <span className="text-xs text-blue-400">→ {req.assignedToName}</span>}
                    {req.location && <span className="text-xs text-green-500">📌 Map pinned</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`badge ${getUrgencyColor(req.urgencyLevel)}`}>
                    {req.urgencyScore ? `${req.urgencyScore}/10` : req.urgencyLevel}
                  </span>
                  <select
                    value={req.status}
                    onChange={e => handleStatusChange(req.id, e.target.value as RequestStatus)}
                    className={cn('text-xs rounded-lg border px-2 py-1 bg-transparent cursor-pointer', getStatusColor(req.status))}
                  >
                    {STATUSES.map(s => <option key={s} value={s} className="bg-[#1e293b] text-slate-200">{formatStatus(s)}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    {req.status === 'pending' && (
                      <button onClick={() => setAssigningRequest(req)} title="Assign Volunteer" className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors">
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => setEditingRequest(req)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.06]">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(req.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(modalOpen || editingRequest) && (
          <RequestModal
            onClose={() => { setModalOpen(false); setEditingRequest(null); }}
            onSuccess={load}
            editRequest={editingRequest}
          />
        )}
        {assigningRequest && (
          <AssignModal
            request={assigningRequest}
            onClose={() => setAssigningRequest(null)}
            onSuccess={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
