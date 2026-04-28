// ============================================================
// NeedSense AI — Complete Type Definitions
// ============================================================

export type UserRole = 'admin' | 'volunteer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  location?: GeoPoint;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VolunteerProfile extends UserProfile {
  role: 'volunteer';
  skills: SkillType[];
  availability: AvailabilityStatus;
  activeTasksCount: number;
  completedTasksCount: number;
  rating?: number;
  bio?: string;
}

export type SkillType =
  | 'medical'
  | 'food_distribution'
  | 'logistics'
  | 'counseling'
  | 'education'
  | 'construction'
  | 'driving'
  | 'elderly_care'
  | 'child_care'
  | 'disaster_relief'
  | 'admin'
  | 'other';

export type AvailabilityStatus = 'available' | 'busy' | 'offline';

export type NeedCategory =
  | 'food'
  | 'medicine'
  | 'shelter'
  | 'blood'
  | 'elderly_help'
  | 'disaster'
  | 'education'
  | 'others';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type RequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface AIAnalysis {
  predictedCategory: NeedCategory;
  urgencyScore: number; // 1-10
  urgencyLevel: UrgencyLevel;
  summary: string;
  suggestedSkill: SkillType;
  confidence: number; // 0-1
  analysisTimestamp: Date;
}

export interface NeedRequest {
  id: string;
  title: string;
  description: string;
  category: NeedCategory;
  address: string;
  location?: GeoPoint;
  peopleAffected: number;
  imageURL?: string;
  status: RequestStatus;
  urgencyLevel: UrgencyLevel;
  urgencyScore: number;
  submittedBy: string; // user uid
  submittedByName: string;
  assignedTo?: string; // volunteer uid
  assignedToName?: string;
  aiAnalysis?: AIAnalysis;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface Assignment {
  id: string;
  requestId: string;
  requestTitle: string;
  volunteerId: string;
  volunteerName: string;
  assignedBy: string;
  assignedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  status: 'pending_acceptance' | 'accepted' | 'rejected' | 'completed';
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'new_request' | 'task_assigned' | 'task_completed' | 'urgent_alert' | 'system';
  read: boolean;
  relatedId?: string; // requestId or assignmentId
  createdAt: Date;
}

export interface AnalyticsSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  totalRequests: number;
  completedRequests: number;
  activeVolunteers: number;
  requestsByCategory: Record<NeedCategory, number>;
  requestsByStatus: Record<RequestStatus, number>;
  avgResolutionTimeHours: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalRequests: number;
  urgentRequests: number;
  assignedRequests: number;
  completedRequests: number;
  activeVolunteers: number;
  pendingRequests: number;
}

// Smart Match Result
export interface MatchResult {
  volunteer: VolunteerProfile;
  score: number;
  reasons: string[];
}

// Form types
export interface CreateRequestForm {
  title: string;
  description: string;
  category: NeedCategory;
  address: string;
  lat?: number;
  lng?: number;
  peopleAffected: number;
  image?: File;
  priorityOverride?: UrgencyLevel;
}

export interface RegisterForm {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  skills?: SkillType[]; // for volunteers
  address?: string;
}
