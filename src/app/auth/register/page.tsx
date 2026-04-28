'use client';
// ============================================================
// Register Page — Role-based signup for Admin or Volunteer
// ============================================================
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Heart, UserPlus, AlertCircle, Building2, Handshake } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import type { UserRole, SkillType } from '@/types';

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

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<UserRole>('admin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [skills, setSkills] = useState<SkillType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skill: SkillType) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await signUp({ email, password, displayName, role, phone, address, skills });
      toast.success('Account created! Welcome to NeedSense AI.');
      router.push(role === 'admin' ? '/dashboard' : '/volunteer/tasks');
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Please enter a valid email.',
        'auth/weak-password': 'Password must be at least 6 characters.',
      };
      setError(messages[errorCode || ''] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-brand-500/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">
              NeedSense <span className="text-brand-400">AI</span>
            </span>
          </Link>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-white">Create your account</h1>
            <p className="text-slate-400 text-sm mt-1">Join and start making an impact today</p>
          </div>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { value: 'admin', label: 'NGO / Admin', desc: 'Manage requests', icon: Building2 },
              { value: 'volunteer', label: 'Volunteer', desc: 'Help communities', icon: Handshake },
            ] as const).map(({ value, label, desc, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  role === value
                    ? 'border-brand-500/50 bg-brand-500/10 text-white'
                    : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${role === value ? 'text-brand-400' : 'text-slate-500'}`} />
                <p className="font-semibold text-sm">{label}</p>
                <p className={`text-xs mt-0.5 ${role === value ? 'text-brand-400/70' : 'text-slate-600'}`}>{desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@ngo.org"
                required
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="label">Address / Location</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="City, State"
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="glass-input w-full px-4 py-2.5 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Skills selector for volunteers */}
            <AnimatePresence>
              {role === 'volunteer' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="label">Your Skills (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SKILLS.map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleSkill(value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          skills.includes(value)
                            ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                            : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04]'
                        }`}
                      >
                        {emoji} {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Sign in →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
