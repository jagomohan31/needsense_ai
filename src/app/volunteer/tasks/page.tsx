'use client';
// ============================================================
// Volunteer Tasks Portal
// ============================================================
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, LogOut, Heart, User } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getAssignmentsByVolunteer, updateAssignment, updateRequest, updateUserProfile } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import type { Assignment } from '@/types';
import { timeAgo, cn } from '@/lib/utils';

export default function VolunteerTasksPage() {
  const { user, userProfile, logOut, loading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && userProfile?.role === 'admin') router.push('/dashboard');
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    if (user) {
      getAssignmentsByVolunteer(user.uid).then(a => { setAssignments(a); setFetching(false); });
    }
  }, [user]);

  const handleAccept = async (assignment: Assignment) => {
    await updateAssignment(assignment.id, { status: 'accepted', acceptedAt: new Date() });
    await updateRequest(assignment.requestId, { status: 'in_progress' });
    toast.success('Task accepted!');
    setAssignments(prev => prev.map(a => a.id === assignment.id ? { ...a, status: 'accepted' } : a));
  };

  const handleReject = async (assignment: Assignment) => {
    await updateAssignment(assignment.id, { status: 'rejected' });
    await updateRequest(assignment.requestId, { status: 'pending', assignedTo: undefined, assignedToName: undefined });
    toast('Task returned to pool');
    setAssignments(prev => prev.map(a => a.id === assignment.id ? { ...a, status: 'rejected' } : a));
  };

  const handleComplete = async (assignment: Assignment) => {
    await updateAssignment(assignment.id, { status: 'completed', completedAt: new Date() });
    await updateRequest(assignment.requestId, { status: 'completed', completedAt: new Date() });
    if (userProfile) {
      await updateUserProfile(userProfile.uid, {
        completedTasksCount: (userProfile.completedTasksCount || 0) + 1,
        activeTasksCount: Math.max(0, (userProfile.activeTasksCount || 0) - 1),
      });
    }
    toast.success('Task marked complete! 🎉');
    setAssignments(prev => prev.map(a => a.id === assignment.id ? { ...a, status: 'completed' } : a));
  };

  const activeCount = assignments.filter(a => a.status === 'accepted').length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;
  const pendingCount = assignments.filter(a => a.status === 'pending_acceptance').length;

  if (loading || !userProfile) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400"><div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />Loading...</div>
    </div>
  );

  const initials = userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="h-14 border-b border-white/[0.06] bg-[#020617]/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center"><Heart className="w-3.5 h-3.5 text-white" /></div><span className="font-display font-bold text-white text-sm">NeedSense <span className="text-brand-400">AI</span></span></Link>
        <div className="flex items-center gap-3">
          <Link href="/volunteer/profile" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.05]"><User className="w-4 h-4" /></Link>
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-xs">{initials}</div>
          <button onClick={logOut} className="text-slate-500 hover:text-red-400 p-1"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Welcome, {userProfile.displayName.split(' ')[0]}!</h1>
          <p className="text-slate-400 text-sm mt-1">Your assigned community tasks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending', value: pendingCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Active', value: activeCount, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Completed', value: completedCount, color: 'text-green-400', bg: 'bg-green-500/10' },
          ].map(s => (
            <div key={s.label} className={`glass-card p-4 text-center ${s.bg} border-transparent`}>
              <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tasks */}
        {fetching ? (
          <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="glass-card p-5"><div className="skeleton h-5 w-1/2 mb-3" /><div className="skeleton h-4 w-full mb-2" /><div className="skeleton h-4 w-2/3" /></div>)}</div>
        ) : assignments.length === 0 ? (
          <div className="glass-card py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No tasks assigned yet</p>
            <p className="text-slate-600 text-sm mt-1">You'll see tasks here when an admin assigns you</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className={cn('glass-card p-5', a.status === 'completed' ? 'opacity-60' : '', a.status === 'pending_acceptance' ? 'border-yellow-500/20' : '')}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-white">{a.requestTitle}</p>
                    <p className="text-xs text-slate-500 mt-1">Assigned {timeAgo(a.assignedAt)}</p>
                  </div>
                  <span className={cn('badge text-xs', a.status === 'pending_acceptance' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' : a.status === 'accepted' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' : a.status === 'completed' ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-red-500/15 text-red-400 border-red-500/25')}>
                    {a.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {a.status === 'pending_acceptance' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(a)} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm"><CheckCircle2 className="w-4 h-4" />Accept</button>
                    <button onClick={() => handleReject(a)} className="btn-danger flex-1 flex items-center justify-center gap-2 py-2 text-sm"><XCircle className="w-4 h-4" />Decline</button>
                  </div>
                )}
                {a.status === 'accepted' && (
                  <button onClick={() => handleComplete(a)} className="w-full btn-primary flex items-center justify-center gap-2 py-2 text-sm bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-4 h-4" />Mark as Complete</button>
                )}
                {a.status === 'completed' && a.completedAt && (
                  <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Completed {timeAgo(a.completedAt)}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
