'use client';
// ============================================================
// Dashboard Layout — Sidebar + Main content area
// ============================================================
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, Map, BarChart3,
  Bell, LogOut, Heart, Menu, X, Plus, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToNotifications } from '@/lib/db';
import type { Notification } from '@/types';
import { cn, timeAgo } from '@/lib/utils';

const ADMIN_NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/requests', label: 'Requests', icon: FileText },
  { href: '/dashboard/volunteers', label: 'Volunteers', icon: Users },
  { href: '/dashboard/map', label: 'Live Map', icon: Map },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, logOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (userProfile?.role === 'volunteer') {
        router.push('/volunteer/tasks');
      }
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.uid, setNotifications);
    return unsub;
  }, [user]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  const initials = userProfile.displayName
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#020617] flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-[#0a1628] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:block',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">
              NeedSense <span className="text-brand-400">AI</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 mb-3">Menu</p>
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(pathname === href ? 'nav-item-active' : 'nav-item')}
            >
              <Icon className="w-4 h-4" />
              {label}
              {pathname === href && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <Link
            href="/dashboard/requests?new=1"
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Link>
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userProfile.displayName}</p>
              <p className="text-xs text-slate-500 capitalize">{userProfile.role}</p>
            </div>
            <button onClick={logOut} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/[0.06] bg-[#020617]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white p-1">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm text-slate-400 font-medium">
              {ADMIN_NAV.find(n => n.href === pathname)?.label || 'Dashboard'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.05]">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-12 w-80 glass-card shadow-xl z-50"
                    onMouseLeave={() => setNotifOpen(false)}
                  >
                    <div className="p-4 border-b border-white/[0.06]">
                      <h3 className="font-semibold text-white text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0
                        ? <p className="text-slate-500 text-sm text-center py-8">All caught up!</p>
                        : notifications.map(n => (
                          <div key={n.id} className="p-4 border-b border-white/[0.04] hover:bg-white/[0.03]">
                            <p className="text-sm font-medium text-white">{n.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                            <p className="text-xs text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                        ))
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-xs">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
