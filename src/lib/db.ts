// ============================================================
// Firestore Database Service
// All database operations for NeedSense AI
// ============================================================
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  NeedRequest,
  UserProfile,
  VolunteerProfile,
  Assignment,
  Notification,
  DashboardStats,
  RequestStatus,
  NeedCategory,
  UrgencyLevel,
} from '@/types';

// ─── Collection References ──────────────────────────────────
export const COLLECTIONS = {
  USERS: 'users',
  REQUESTS: 'requests',
  ASSIGNMENTS: 'assignments',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
} as const;

// ─── Helpers ────────────────────────────────────────────────
const toDate = (ts: Timestamp | Date | undefined): Date => {
  if (!ts) return new Date();
  if (ts instanceof Timestamp) return ts.toDate();
  return ts;
};

const serializeRequest = (data: Record<string, unknown>, id: string): NeedRequest => ({
  id,
  title: data.title as string,
  description: data.description as string,
  category: data.category as NeedCategory,
  address: data.address as string,
  location: data.location as NeedRequest['location'],
  peopleAffected: data.peopleAffected as number,
  imageURL: data.imageURL as string | undefined,
  status: data.status as RequestStatus,
  urgencyLevel: data.urgencyLevel as UrgencyLevel,
  urgencyScore: data.urgencyScore as number,
  submittedBy: data.submittedBy as string,
  submittedByName: data.submittedByName as string,
  assignedTo: data.assignedTo as string | undefined,
  assignedToName: data.assignedToName as string | undefined,
  aiAnalysis: data.aiAnalysis as NeedRequest['aiAnalysis'],
  createdAt: toDate(data.createdAt as Timestamp),
  updatedAt: toDate(data.updatedAt as Timestamp),
  completedAt: data.completedAt ? toDate(data.completedAt as Timestamp) : undefined,
  notes: data.notes as string | undefined,
});

// ─── User Operations ─────────────────────────────────────────
export async function createUserProfile(uid: string, profile: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>) {
  await doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...profile,
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(async () => {
    // Document doesn't exist, create it
    const userDocRef = doc(db, COLLECTIONS.USERS, uid);
    const { setDoc } = await import('firebase/firestore');
    await setDoc(userDocRef, {
      ...profile,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    uid: snap.id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as UserProfile;
}

export async function getVolunteers(): Promise<VolunteerProfile[]> {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('role', '==', 'volunteer')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      uid: d.id,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as VolunteerProfile;
  });
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ─── Request Operations ──────────────────────────────────────
export async function createRequest(
  data: Omit<NeedRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.REQUESTS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getRequest(id: string): Promise<NeedRequest | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.REQUESTS, id));
  if (!snap.exists()) return null;
  return serializeRequest(snap.data(), snap.id);
}

export async function getAllRequests(filters?: {
  status?: RequestStatus;
  category?: NeedCategory;
  urgencyLevel?: UrgencyLevel;
}): Promise<NeedRequest[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (filters?.status) constraints.push(where('status', '==', filters.status));
  if (filters?.category) constraints.push(where('category', '==', filters.category));
  if (filters?.urgencyLevel) constraints.push(where('urgencyLevel', '==', filters.urgencyLevel));

  const q = query(collection(db, COLLECTIONS.REQUESTS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => serializeRequest(d.data(), d.id));
}

export async function updateRequest(id: string, updates: Partial<NeedRequest>) {
  await updateDoc(doc(db, COLLECTIONS.REQUESTS, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRequest(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.REQUESTS, id));
}

export function subscribeToRequests(
  callback: (requests: NeedRequest[]) => void,
  filters?: { status?: RequestStatus }
) {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(50)];
  if (filters?.status) constraints.push(where('status', '==', filters.status));

  const q = query(collection(db, COLLECTIONS.REQUESTS), ...constraints);
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => serializeRequest(d.data(), d.id)));
  });
}

// ─── Assignment Operations ───────────────────────────────────
export async function createAssignment(
  data: Omit<Assignment, 'id' | 'assignedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.ASSIGNMENTS), {
    ...data,
    assignedAt: serverTimestamp(),
  });

  // Update request status
  await updateRequest(data.requestId, {
    status: 'assigned',
    assignedTo: data.volunteerId,
    assignedToName: data.volunteerName,
  });

  // Notify volunteer
  await createNotification({
    userId: data.volunteerId,
    title: 'New Task Assigned',
    message: `You have been assigned to: ${data.requestTitle}`,
    type: 'task_assigned',
    read: false,
    relatedId: data.requestId,
  });

  return ref.id;
}

export async function getAssignmentsByVolunteer(volunteerId: string): Promise<Assignment[]> {
  const q = query(
    collection(db, COLLECTIONS.ASSIGNMENTS),
    where('volunteerId', '==', volunteerId),
    orderBy('assignedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      assignedAt: toDate(data.assignedAt),
      acceptedAt: data.acceptedAt ? toDate(data.acceptedAt) : undefined,
      completedAt: data.completedAt ? toDate(data.completedAt) : undefined,
    } as Assignment;
  });
}

export async function updateAssignment(id: string, updates: Partial<Assignment>) {
  await updateDoc(doc(db, COLLECTIONS.ASSIGNMENTS, id), updates);
}

// ─── Notification Operations ─────────────────────────────────
export async function createNotification(
  data: Omit<Notification, 'id' | 'createdAt'>
) {
  await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: toDate(data.createdAt),
    } as Notification;
  });
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifs: Notification[]) => void
) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => {
      const data = d.data();
      return { ...data, id: d.id, createdAt: toDate(data.createdAt) } as Notification;
    }));
  });
}

// ─── Dashboard Stats ──────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  const [reqSnap, userSnap] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.REQUESTS)),
    getDocs(query(collection(db, COLLECTIONS.USERS), where('role', '==', 'volunteer'))),
  ]);

  const requests = reqSnap.docs.map(d => d.data());
  const urgentLevels = ['critical', 'high'];

  return {
    totalRequests: requests.length,
    urgentRequests: requests.filter(r => urgentLevels.includes(r.urgencyLevel)).length,
    assignedRequests: requests.filter(r => r.status === 'assigned' || r.status === 'in_progress').length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    activeVolunteers: userSnap.docs.filter(d => d.data().availability === 'available').length,
  };
}
