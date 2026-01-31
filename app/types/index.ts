export type UserRole = 'superAdmin' | 'gymAdmin' | 'member';
export type EnrollmentStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'online' | 'offline' | 'Quarterly' | '6-Month';
export type IssueType = 'Equipment' | 'Cleanliness' | 'Staff' | 'Safety' | 'Other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected';

export interface Gym {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  upiId: string;
  monthlyFee: number;
  createdAt: Date;
  adminId: string;
  isActive: boolean;
  description?: string;
  quarterlyFee?: number;
  annualFee?: number;
  amenities?: string[];
  images?: string[];
  rating?: number;
  reviews?: number;
  openingHours?: string;
  capacity?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  gymId: string | null;
  enrollmentStatus: EnrollmentStatus;
  paymentMethod: PaymentMethod | null;
  transactionId: string | null;
  enrolledAt: Date | null;
  createdAt: Date;
  planDuration?: number;
  timeSlot?: 'Morning' | 'Evening' | 'Night' | null;
}

export interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  gymId: string;
  gymName: string;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  amount: number;
  status: EnrollmentStatus;
  createdAt: Date;
  verifiedAt: Date | null;
  verifiedBy: string | null;
}
export type PlanChangeStatus = 'pending' | 'approved' | 'rejected';

export interface PlanChangeRequest {
  id: string;
  userId: string;
  gymId: string | null;
  currentDuration: number;
  requestedDuration: number;
  status: PlanChangeStatus;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}
export interface GymReport {
  id?: string; // Optional because Firestore adds it
  gymId: string;
  gymName: string;
  userId: string;
  userName: string;
  userEmail: string;
  issueTypes: IssueType[]; // Array of issues (multiple selection)
  description: string;
  status: ReportStatus;
  createdAt: Date;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  adminNotes?: string;
}
