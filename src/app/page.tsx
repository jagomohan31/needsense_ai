'use client';
// ============================================================
// NeedSense AI — Premium Landing Page
// ============================================================
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain, Zap, MapPin, Users, BarChart3, Shield,
  ArrowRight, Check, Menu, X, ChevronDown,
  Heart, Clock, TrendingUp, Globe
} from 'lucide-react';

// ─── Animated Counter ───────────────────────────────────────
function Counter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ─── Feature Card ─────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6 group hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      desc: 'Gemini AI instantly classifies every need request, assigns urgency scores 1–10, and suggests the ideal volunteer skill.',
      color: 'bg-brand-500/20 text-brand-400',
      delay: 0,
    },
    {
      icon: Zap,
      title: 'Smart Matching Engine',
      desc: 'Automatically match requests to the nearest, most qualified volunteer based on skills, location, and availability.',
      color: 'bg-purple-500/20 text-purple-400',
      delay: 0.1,
    },
    {
      icon: MapPin,
      title: 'Live Hotspot Map',
      desc: 'Interactive map with color-coded urgency markers. Red = critical, yellow = medium, green = low priority.',
      color: 'bg-orange-500/20 text-orange-400',
      delay: 0.2,
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      desc: 'Beautiful dashboards showing trends, completion rates, category breakdowns, and volunteer impact metrics.',
      color: 'bg-blue-500/20 text-blue-400',
      delay: 0.3,
    },
    {
      icon: Users,
      title: 'Volunteer Portal',
      desc: 'Dedicated volunteer profiles with skills, availability, task history, and impact tracking.',
      color: 'bg-pink-500/20 text-pink-400',
      delay: 0.4,
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      desc: 'Separate admin and volunteer portals with Firebase Auth security and Firestore rules.',
      color: 'bg-yellow-500/20 text-yellow-400',
      delay: 0.5,
    },
  ];

  const problems = [
    { icon: '📄', text: 'Needs managed through paper forms & WhatsApp' },
    { icon: '⚡', text: 'Urgent cases lost in a sea of messages' },
    { icon: '👤', text: 'Volunteers poorly assigned or underutilized' },
    { icon: '📊', text: 'No real-time visibility or impact tracking' },
  ];

  const solutions = [
    { icon: '🤖', text: 'AI classifies and scores every request automatically' },
    { icon: '🚀', text: 'Critical needs surfaced to top instantly' },
    { icon: '🎯', text: 'Smart algorithm matches ideal volunteer every time' },
    { icon: '📈', text: 'Live dashboard with full impact analytics' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-[#020617]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">NeedSense <span className="text-brand-400">AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
            <a href="#impact" className="text-sm text-slate-400 hover:text-white transition-colors">Impact</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>

          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/[0.06] px-4 py-4 flex flex-col gap-3"
          >
            <a href="#features" className="text-slate-300 py-2">Features</a>
            <a href="#how-it-works" className="text-slate-300 py-2">How It Works</a>
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login" className="btn-secondary flex-1 text-center text-sm">Sign In</Link>
              <Link href="/auth/register" className="btn-primary flex-1 text-center text-sm">Get Started</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-brand-500/10 blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-orange-500/8 blur-[80px]" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400"></span>
              </span>
              AI-Powered NGO Resource Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6"
            >
              Allocate Resources.{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                  Save Lives.
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-400 to-brand-600 origin-left"
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-slate-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              NeedSense AI uses Gemini AI to classify urgency, match volunteers intelligently, and give NGOs the real-time visibility they deserve.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-glow text-base"
              >
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-slate-200 font-medium px-8 py-3.5 rounded-xl transition-all duration-200 text-base"
              >
                View Demo
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-500"
            >
              {['Free to start', 'No credit card needed', 'Built with Gemini AI'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-brand-500" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Floating dashboard mockup cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="glass-card p-6 sm:p-8">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Live Dashboard</h3>
                  <p className="text-slate-500 text-sm">Real-time community needs overview</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-sm text-green-400">Live</span>
                </div>
              </div>

              {/* Mock stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Requests', value: '248', icon: '📋', color: 'text-blue-400' },
                  { label: 'Urgent', value: '12', icon: '🆘', color: 'text-red-400' },
                  { label: 'Volunteers', value: '67', icon: '👥', color: 'text-brand-400' },
                  { label: 'Resolved', value: '189', icon: '✅', color: 'text-green-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/[0.04] rounded-xl p-4">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</div>
                    <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Mock request list */}
              <div className="space-y-3">
                {[
                  { title: 'Emergency food supplies needed', area: 'South District', urgency: 'Critical', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                  { title: 'Medical assistance for elderly', area: 'North Block', urgency: 'High', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                  { title: 'Shelter required for 5 families', area: 'East Zone', urgency: 'High', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                ].map((req) => (
                  <div key={req.title} className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{req.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">📍 {req.area}</p>
                    </div>
                    <span className={`badge ${req.color}`}>{req.urgency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI analysis floating card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 glass-card p-4 w-56 hidden sm:block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-semibold text-brand-400">AI Analysis</span>
              </div>
              <p className="text-xs text-slate-300 mb-2">"Urgent food shortage affecting 30+ families"</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Urgency Score</span>
                <span className="text-xs font-bold text-red-400">9.2/10</span>
              </div>
            </motion.div>

            {/* Match card */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -left-4 glass-card p-4 w-52 hidden sm:block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400">Best Match</span>
              </div>
              <p className="text-sm font-medium text-white">Rania Al-Farsi</p>
              <p className="text-xs text-slate-400">Medical volunteer · 2.3 km away</p>
              <div className="mt-2 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                <div className="h-full w-[92%] bg-gradient-to-r from-brand-500 to-brand-400 rounded-full" />
              </div>
              <p className="text-xs text-brand-400 text-right mt-1">92% match</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-1 text-slate-600"
          >
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section id="impact" className="py-16 border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { end: 500, suffix: '+', label: 'NGOs Ready to Onboard', icon: Globe },
              { end: 10000, suffix: '+', label: 'Lives Can Be Impacted', icon: Heart },
              { end: 85, suffix: '%', label: 'Faster Resource Allocation', icon: Clock },
              { end: 99, suffix: '%', label: 'AI Accuracy Rate', icon: TrendingUp },
            ].map(({ end, suffix, label, icon: Icon }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-2"
              >
                <Icon className="w-6 h-6 text-brand-400 mb-1" />
                <div className="font-display font-extrabold text-4xl text-white">
                  <Counter end={end} />{suffix}
                </div>
                <p className="text-slate-500 text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem vs Solution ──────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-4xl text-white mb-4">The Problem We Solve</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              NGOs are drowning in manual coordination while urgent needs go unmet.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problems */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 border-red-500/20"
            >
              <h3 className="font-display font-bold text-xl text-red-400 mb-6 flex items-center gap-2">
                <span>❌</span> Before NeedSense AI
              </h3>
              <div className="space-y-4">
                {problems.map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <p className="text-slate-400">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 border-brand-500/20"
            >
              <h3 className="font-display font-bold text-xl text-brand-400 mb-6 flex items-center gap-2">
                <span>✅</span> With NeedSense AI
              </h3>
              <div className="space-y-4">
                {solutions.map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <p className="text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-brand-400 text-sm font-semibold tracking-wider uppercase">Core Features</span>
            <h2 className="font-display font-bold text-4xl text-white mt-2 mb-4">Built for Real Impact</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every feature is designed to reduce response time, eliminate manual work, and maximize volunteer effectiveness.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-4xl text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">From need to resolution in 4 simple steps.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Submit Need', desc: 'NGO or admin submits a community need with description, location, and photos.', icon: '📝' },
              { step: '02', title: 'AI Analysis', desc: 'Gemini AI instantly scores urgency (1-10), predicts category, and writes a summary.', icon: '🤖' },
              { step: '03', title: 'Smart Match', desc: 'Algorithm selects the nearest, most skilled volunteer based on the need type.', icon: '🎯' },
              { step: '04', title: 'Track & Resolve', desc: 'Volunteer accepts, completes the task. Dashboard updates in real-time.', icon: '✅' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 relative"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="absolute top-4 right-4 font-display font-extrabold text-5xl text-white/[0.04]">
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass-card p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative">
              <h2 className="font-display font-extrabold text-4xl text-white mb-4">
                Ready to transform how your NGO operates?
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join NeedSense AI and start allocating resources intelligently today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-8 py-3.5">
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/auth/login" className="btn-secondary inline-flex items-center justify-center text-base px-8 py-3.5">
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold text-white">NeedSense AI</span>
          </div>
          <p className="text-slate-600 text-sm">Built for hackathon. Made with ❤️ for communities.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
