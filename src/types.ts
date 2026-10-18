export type Role = 'Staff' | 'Head' | 'Admin';

export type ScreenId =
  | 'login'
  | 'staff-upload'
  | 'staff-platforms'
  | 'head-queue'
  | 'published'
  | 'admin-dashboard'
  | 'staff-submissions'
  | 'brand-guidelines'
  | 'head-calendar'
  | 'head-team'
  | 'admin-users'
  | 'admin-connected'
  | 'admin-activity';

export type SubmissionStatus =
  | 'Submitted'
  | 'In review'
  | 'Revision'
  | 'Published'
  | 'Draft'
  | 'Scheduled';

export type PlatformName = 'Instagram' | 'LinkedIn' | 'TikTok';

export type ContentType = 'Poster' | 'Carousel' | 'Video' | 'Story';

export interface PlatformDraft {
  tone: string;
  title: string;
  caption: string;
  hashtags: string[];
  maxChars: number;
}

export interface QueueItem {
  id: string;
  title: string;
  designer: string;
  designerInitials: string;
  designerColor: string;
  submittedAt: string;
  status: 'Submitted' | 'In review' | 'Revision';
  riskLevel: 'LOW RISK' | 'MEDIUM RISK';
  riskScore: number; // e.g., 14 out of 100
  platforms: PlatformName[];
  type: ContentType;
  aiWhatItIs: string;
  aiChecks: string[];
  aiRecommendation: string;
  posterTheme: 'hiring' | 'product' | 'outing' | 'promo' | 'sharing' | 'batik' | 'casestudy';
  captions: {
    Instagram: string;
    LinkedIn: string;
    TikTok?: string;
  };
  revisionNote?: string;
}

export interface PublishedPostItem {
  id: string;
  title: string;
  designer: string;
  platforms: PlatformName[];
  publishedAt: string;
  approvalDuration: string;
  reach: string;
  engagement: string;
  posterTheme: string;
}

export interface StaffSubmissionItem {
  id: string;
  title: string;
  type: ContentType;
  platforms: PlatformName[];
  status: SubmissionStatus;
  updatedAt: string;
  reviewer: string;
  revisionNote?: string;
}

export interface CalendarPostItem {
  id: string;
  title: string;
  designer: string;
  weekIndex: 0 | 1 | 2; // 0: 5-11 Oct, 1: 12-18 Oct, 2: 19-25 Oct 2026
  dayIndex: number; // 0 = Mon .. 6 = Sun
  time: string;
  platforms: PlatformName[];
  status: SubmissionStatus;
}

export interface TeamDesignerItem {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  title: string;
  workload: 'Busy' | 'Normal' | 'Light';
  inReviewCount: number;
  revisionsCount: number;
  publishedCount: number;
  latestItem: string;
  latestStatus: SubmissionStatus;
  avgTurnaround: string;
}

export interface MemberUserItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarBg: string;
  role: Role;
  status: 'Active' | 'Invite pending' | 'Deactivated';
  lastActive: string;
  submissionsCount: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  person: string;
  personRole: Role | 'System';
  actionCategory: 'Submitted' | 'AI check' | 'Approved' | 'Revision' | 'Published' | 'Admin';
  actionLabel: string;
  targetTitle: string;
  detail: string;
}
