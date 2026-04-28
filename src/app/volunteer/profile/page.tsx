'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Save, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateUserProfile } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import type { SkillType, AvailabilityStatus } from '@/types';

const ALL_SKILLS: { value: SkillType; label: string; emoji: string }[] = [
  { value: 'medical', label: 'Medical', emoji: '🏥' },
  { value: 'food_distribution', label: 'Food Distribution', emoji: '🍛' },
  { value: 'logistics', label: 'Logistics', emoji: '🚚' },
  { value: 'counseling', label: 'Counseling', emoji: '💬' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'construction', label: 'Construction', emoji: '🔨' },
  { value: 'driving', label: 'Driving', emoji: '🚗' },
  { value: 'elderly_care', label: 'Elderly Care', emoji: '👴' },
  { value: 'child_care', label: 'Child Care', emoji: '👶' },
  { value: 'disaster_relief', label: 'Disaster Relief', emoji: '🆘' },
];

export default function VolunteerProfilePage() {
  const { userProfile, refreshProfile } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [bio, setBio] = useState((userProfile as { bio?: string })?.bio || '');
  const [skills, setSkills] = useState<SkillType[]>((userProfile as { skills?: SkillType[] })?.skills || []);
  const [availability, setAvailability] = useState<AvailabilityStatus>((userProfile as { availability?: AvailabilityStatus })?.availability || 'available');
  const [saving, setSaving] = useState(false);

  if (!userProfile) return null;

  const initials = userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const toggleSkill = (s: SkillType) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    if (!userProfile) return;
    setSaving(true);
    try {
      await updateUserProfile(userProfile.uid, { displayName, phone, address, skills, availability, bio } as Parameters<typeof updateUserProfile>[1]);
      await refreshProfile();
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <header className="h-14 border-b border-white/[0.06] bg-[#020617]/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center"><Heart className="w-3.5 h-3.5 text-white" /></div><span className="font-display font-bold text-white text-sm">NeedSense <span className="text-brand-400">AI</span></span></Link>
        <Link href="/volunteer/tasks" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm"><ArrowLeft className="w-4 h-4" />Back to Tasks</Link>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <h1 className="font-display font-bold text-2xl text-white">My Profile</h1>

        {/* Avatar */}
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-500/20 border-2 border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-xl">{initials}</div>
          <div>
            <p className="font-bold text-white text-lg">{userProfile.displayName}</p>
            <p className="text-slate-400 text-sm">{userProfile.email}</p>
            <p className="text-xs text-brand-400 mt-1 capitalize">{userProfile.role}</p>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display font-semibold text-white">Personal Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input value={displayName} onChange={e => setDisplayName(e.target.value)} className="glass-input w-full px-4 py-2.5 text-sm" /></div>
            <div><label className="label">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 ..." className="glass-input w-full px-4 py-2.5 text-sm" /></div>
          </div>
          <div><label className="label">Address</label><input value={address} onChange={e => setAddress(e.target.value)} placeholder="City, State" className="glass-input w-full px-4 py-2.5 text-sm" /></div>
          <div><label className="label">Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." className="glass-input w-full px-4 py-2.5 text-sm resize-none" /></div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display font-semibold text-white">Availability</h2>
          <div className="flex gap-3">
            {(['available', 'busy', 'offline'] as AvailabilityStatus[]).map(a => (
              <button key={a} onClick={() => setAvailability(a)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ${availability === a ? (a === 'available' ? 'border-green-500/50 bg-green-500/10 text-green-400' : a === 'busy' ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-slate-500/50 bg-slate-500/10 text-slate-400') : 'border-white/[0.08] text-slate-500 hover:bg-white/[0.04]'}`}>{a}</button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display font-semibold text-white">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SKILLS.map(({ value, label, emoji }) => (
              <button key={value} onClick={() => toggleSkill(value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${skills.includes(value) ? 'border-brand-500/50 bg-brand-500/15 text-brand-300' : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04]'}`}>{emoji} {label}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving...' : 'Save Profile'}
        </button>
      </main>
    </div>
  );
}
