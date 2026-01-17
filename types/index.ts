
export enum IssueType {
  ACCIDENT = 'Accident',
  TRAFFIC = 'Traffic Congestion',
  POTHOLE = 'Pothole',
  GARBAGE = 'Garbage Pileup'
}

export enum AlertStatus {
  PENDING = 'Pending',
  RESOLVED = 'Resolved',
  DISMISSED = 'Dismissed'
}

export interface BoundingBox {
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
  confidence: number;
}

export interface Reporter {
  name: string;
  phone: string;
  email: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
}

export interface Feedback {
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface Alert {
  id: string;
  type: IssueType;
  confidence: number;
  location: string;
  timestamp: string;
  status: AlertStatus;
  thumbnailUrl: string;
  fullImageUrl: string;
  cameraId?: string;
  description: string;
  detections?: BoundingBox[];
  notes?: string;
  source: 'camera' | 'citizen';
  reporter?: Reporter;
  feedback?: Feedback;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastPing: string;
  ip: string;
  streamUrl?: string;
  sourceType: 'webcam' | 'remote';
}

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'viewer';
}

export type View = 'dashboard' | 'alerts' | 'citizen-reports' | 'analytics' | 'cameras' | 'settings' | 'track-issue' | 'live-feed' | 'map' | 'voice-reports' | 'voice-analytics' | 'citizen-map' | 'feedback-reports' | 'air-quality';
export type AppMode = 'citizen' | 'admin';
