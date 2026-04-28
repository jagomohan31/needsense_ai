// ============================================================
// Utility Functions
// ============================================================
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { UrgencyLevel, NeedCategory, RequestStatus } from '@/types';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Get urgency badge color */
export function getUrgencyColor(level: UrgencyLevel): string {
  const map: Record<UrgencyLevel, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return map[level] || map.medium;
}

/** Get urgency dot color for map markers */
export function getUrgencyMapColor(level: UrgencyLevel): string {
  const map: Record<UrgencyLevel, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };
  return map[level] || map.medium;
}

/** Get status badge style */
export function getStatusColor(status: RequestStatus): string {
  const map: Record<RequestStatus, string> = {
    pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return map[status] || map.pending;
}

/** Get category icon emoji */
export function getCategoryEmoji(category: NeedCategory): string {
  const map: Record<NeedCategory, string> = {
    food: '🍛',
    medicine: '💊',
    shelter: '🏠',
    blood: '🩸',
    elderly_help: '👴',
    disaster: '🆘',
    education: '📚',
    others: '📋',
  };
  return map[category] || '📋';
}

/** Get category display label */
export function getCategoryLabel(category: NeedCategory): string {
  const map: Record<NeedCategory, string> = {
    food: 'Food',
    medicine: 'Medicine',
    shelter: 'Shelter',
    blood: 'Blood',
    elderly_help: 'Elderly Help',
    disaster: 'Disaster Relief',
    education: 'Education',
    others: 'Others',
  };
  return map[category] || 'Others';
}

/** Format urgency score to label */
export function formatUrgencyLabel(level: UrgencyLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

/** Format status to readable label */
export function formatStatus(status: RequestStatus): string {
  const map: Record<RequestStatus, string> = {
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
}

/** Calculate distance between two geo points (km) */
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format relative time */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Generate initials from name */
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/** Urgency score to color gradient */
export function scoreToColor(score: number): string {
  if (score >= 9) return '#ef4444';
  if (score >= 7) return '#f97316';
  if (score >= 4) return '#eab308';
  return '#22c55e';
}
/** Calculate volunteer match score */
export function calculateMatchScore(
  requiredSkill: string,
  volunteerSkills: string[],
  availability: string,
  activeTasksCount: number
): number {
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
