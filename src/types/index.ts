export type Category =
  | 'Environment'
  | 'Health'
  | 'Science'
  | 'Education'
  | 'Public Policy'
  | 'Economic Policy'
  | 'Community'
  | 'Arts & Culture'
  | 'Business'
  | 'Other';

export type CampaignStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'changes_requested'
  | 'funding'
  | 'funding_reached'
  | 'prep_distribution'
  | 'promoting'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface Creator {
  id: string;
  name: string;
  title: string;
  avatar: string;
  organization?: string;
  verifiedIdentity: boolean;
  bio?: string;
}

export interface StorySection {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  imageCredit?: string;
}

export interface StoryStat {
  id: string;
  value: string;
  label: string;
  sourceTitle: string;
}

export interface StorySource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  date: string;
  isPeerReviewedOrOfficial: boolean;
}

export interface CampaignStory {
  headline: string;
  introduction: string;
  sections: StorySection[];
  statistics: StoryStat[];
  sources: StorySource[];
  audienceActions: string[];
}

export interface AdVisuals {
  adHeadline: string;
  adDescription: string;
  callToAction: string;
  adImages: string[];
  adPlacements: ('instagram_feed' | 'instagram_story' | 'facebook_feed')[];
}

export interface ReachSettings {
  targetLocations: string[];
  targetInterests: string[];
  channels: ('Instagram' | 'Facebook' | 'Local Web')[];
  budgetAllocation: {
    directAdSpendPct: number; // default 85%
    reviewAndOpsPct: number; // default 10%
    processingFeePct: number; // default 5%
  };
  estimatedImpressionsPer100INR: number; // e.g. 1000 impressions per ₹100
  uniqueReachRatio: number; // e.g. 0.75 (750 people per 1000 impressions)
}

export interface FundingData {
  goal: number; // in INR
  raised: number; // in INR
  contributionsCount: number;
  deadlineDaysRemaining: number;
  currency: string;
}

export interface CampaignReport {
  generatedDate: string;
  status: 'in_progress' | 'completed';
  fundsRaised: number;
  adBudgetAllocated: number;
  adSpendActual: number;
  platformOpsActual: number;
  paymentProcessingActual: number;
  impressionsDelivered: number;
  uniquePeopleReached: number;
  clickThroughs: number;
  avgCostPerImpression: string;
  campaignDurationDays: number;
  channelsSummary: {
    channel: string;
    impressions: number;
    spend: number;
  }[];
  moderationNotes?: string;
}

export interface Campaign {
  id: string;
  title: string;
  category: Category;
  creator: Creator;
  summary: string;
  coverImage: string;
  story: CampaignStory;
  visuals: AdVisuals;
  reachSettings: ReachSettings;
  funding: FundingData;
  status: CampaignStatus;
  reviewNotes?: string;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  report?: CampaignReport;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking';

export interface ContributionRecord {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  platformFee: number;
  totalPaid: number;
  estimatedImpressions: number;
  estimatedPeopleReached: number;
  timestamp: string;
  receiptNumber: string;
  paymentMethod: PaymentMethod;
  status: 'success' | 'failed' | 'cancelled';
  userEmail?: string;
}

export type NotificationType =
  | 'submission_received'
  | 'campaign_approved'
  | 'changes_requested'
  | 'funding_milestone'
  | 'contribution_success'
  | 'contribution_failed'
  | 'promotion_begun'
  | 'report_available'
  | 'campaign_completed';

export interface ActivityNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  campaignId?: string;
  timestamp: string;
  read: boolean;
  actionRoute?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  backedCampaignIds: string[];
  savedCampaignIds: string[];
  createdCampaignIds: string[];
  notificationsEnabled: boolean;
  emailReceiptsEnabled: boolean;
}

export type CreationStep = 1 | 2 | 3 | 4 | 5;

export interface DraftCampaign {
  currentStep: CreationStep;
  lastSavedAt: string;
  // Step 1: Basics
  title: string;
  category: Category;
  creatorName: string;
  creatorOrg: string;
  summary: string;
  coverImage: string;
  whatItIsAbout: string;
  intendedAudience: string;
  whyItMatters: string;
  initialEvidence: string;
  // Step 2: Story
  headline: string;
  introduction: string;
  sections: StorySection[];
  statistics: StoryStat[];
  sources: StorySource[];
  audienceActions: string[];
  // Step 3: Visuals
  adHeadline: string;
  adDescription: string;
  callToAction: string;
  adImages: string[];
  adPlacements: ('instagram_feed' | 'instagram_story' | 'facebook_feed')[];
  // Step 4: Reach
  targetLocations: string[];
  targetInterests: string[];
  channels: ('Instagram' | 'Facebook' | 'Local Web')[];
  durationDays: number;
  // Step 5: Submission & Funding Goal
  fundingGoal: number;
  confirmedPolicies: boolean;
  hasSlideshow?: boolean;
  customAdVisuals?: boolean;
  targetAudienceDesc?: string;
  whyMatterToThem?: string;
  selectedNetworks?: string[];
  whyMattersSameForBackers?: boolean;
  hasImagePermission?: boolean;
}
