export type UserRole = "citizen" | "officer" | "admin" | "super_admin";

export type IssueCategory =
  | "pothole"
  | "garbage"
  | "water_leakage"
  | "streetlight"
  | "road_crack"
  | "drainage"
  | "traffic_signal"
  | "illegal_dumping"
  | "tree_fallen"
  | "flooding"
  | "public_infrastructure";

export type IssueStatus =
  | "reported"
  | "ai_triaged"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "verified"
  | "rejected"
  | "duplicate";

export type Severity = "low" | "medium" | "high" | "critical";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  points: number;
  badges: string[];
  department?: string;
  createdAt: string;
}

export interface AIAnalysis {
  category: IssueCategory;
  categoryConfidence: number;
  severity: Severity;
  severityScore: number;
  priorityScore: number;
  isDuplicate: boolean;
  duplicateOf?: string;
  tags: string[];
  summary: string;
  recommendedAction: string;
  estimatedRepairDays: number;
  predictions?: {
    deteriorationForecast: string;
    environmentalImpact?: string;
  };
  repairChecklist?: string[];
  department?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  severity: Severity;
  priorityScore: number;
  location: GeoPoint;
  address: string;
  imageUrls: string[];
  reporterId: string;
  reporterName: string;
  assignedOfficerId?: string;
  department?: string;
  ai?: AIAnalysis;
  upvotes: number;
  verifications: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}