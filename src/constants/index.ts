import { Category, UserProfile } from '../types';

export const APP_CONFIG = {
  name: 'Reach',
  tagline: 'Community-Funded Message Amplification',
  currencySymbol: '₹',
  defaultReachRatePer100INR: 1000, // 1000 impressions per ₹100
  uniqueReachRatio: 0.75, // 750 unique people per 1000 impressions
  budgetBreakdown: {
    directAdSpendPct: 85,
    platformOpsPct: 10,
    processingFeePct: 5,
  },
  disclaimers: {
    distributionNotDonation:
      'Contributions fund targeted advertising and distribution of this message. Contributions are NOT direct donations to a person, nonprofit, charity, or cause.',
    estimateNotGuarantee:
      'Audience reach values are transparent mathematical estimates based on average digital ad inventory costs. They do not constitute commercial guarantees.',
    reviewRequired:
      'Funding completion does not immediately launch advertising. Campaigns begin distribution only after passing factual verification, editorial review, and ad creative compliance.',
    refundPolicy:
      'If a campaign is rejected during platform review, 100% of unspent funds are credited back to contributors.',
  },
};

export const APP_NAME = APP_CONFIG.name;

export const CATEGORIES: Category[] = [
  'Environment',
  'Health',
  'Science',
  'Education',
  'Public Policy',
  'Economic Policy',
  'Community',
  'Arts & Culture',
  'Business',
  'Other',
];

export const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500];

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr_demo_882',
  name: 'Dr. Maya Sen',
  role: 'Research Fellow & Community Backer',
  email: 'maya.sen@reach-impact.org',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  backedCampaignIds: ['RCH-1001', 'RCH-1003'],
  savedCampaignIds: ['RCH-1002', 'RCH-1004'],
  createdCampaignIds: ['RCH-1007'],
  notificationsEnabled: true,
  emailReceiptsEnabled: true,
};
