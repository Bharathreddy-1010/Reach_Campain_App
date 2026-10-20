import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Campaign,
  CampaignStatus,
  ContributionRecord,
  DraftCampaign,
  ActivityNotification,
  UserProfile,
  PaymentMethod,
} from '../types';
import { SEED_CAMPAIGNS } from '../data/seedCampaigns';
import { INITIAL_USER_PROFILE, APP_CONFIG } from '../constants';
import { ReachCalculator } from '../services/reachCalculator';
import { supabase } from '../services/supabase';

import { ThemeId } from '../theme/themes';

export const DEMO_USER_ID = 'usr_demo_882';
export const DEMO_USER_EMAIL = 'maya.sen@publichealth.org';
export const GUEST_USER_ID = 'usr_guest';

export const isDemoUser = (userId?: string | null, email?: string | null): boolean => {
  if (!userId && !email) return false;
  if (userId === DEMO_USER_ID) return true;
  const lowerEmail = (email || '').toLowerCase().trim();
  return (
    lowerEmail === DEMO_USER_EMAIL.toLowerCase() ||
    lowerEmail === 'maya.sen@reach-impact.org'
  );
};

const STORAGE_KEYS = {
  CAMPAIGNS: '@reach:campaigns_v1',
  SEEDED_FLAG: '@reach:seeded_flag_v4',
  ACTIVE_USER_ID: '@reach:active_user_id',
  THEME_ID: '@reach:theme_id',
};

export const getUserStorageKey = (prefix: string, userId: string): string => {
  const safeId = encodeURIComponent((userId || GUEST_USER_ID).toLowerCase());
  return `@reach:v4_${prefix}_${safeId}`;
};

const INITIAL_NOTIFICATIONS: ActivityNotification[] = [
  {
    id: 'notif_1',
    type: 'contribution_success',
    title: 'Contribution Confirmed: ₹500',
    message: 'Your amplification support for "Clean Water Arsenic & Fluoride Testing" is active.',
    campaignId: 'RCH-1001',
    timestamp: '2026-10-14T11:20:00Z',
    read: false,
  },
  {
    id: 'notif_2',
    type: 'funding_milestone',
    title: 'Goal Reached: Antibiotic Misuse Fact-Check',
    message: 'The campaign reached 100% of its ₹45,000 amplification goal! Reviewing ad assets.',
    campaignId: 'RCH-1002',
    timestamp: '2026-10-13T09:15:00Z',
    read: false,
  },
  {
    id: 'notif_3',
    type: 'promotion_begun',
    title: 'Active Distribution: Urban Heat Island Plan',
    message: 'Ad sets are live on Meta platforms across Chennai, Ahmedabad, and Nagpur.',
    campaignId: 'RCH-1003',
    timestamp: '2026-10-10T16:45:00Z',
    read: true,
  },
  {
    id: 'notif_4',
    type: 'report_available',
    title: 'Final Report: Elder Digital Scam Defense',
    message: 'Campaign concluded with 426.8k impressions and 14.2k guide downloads.',
    campaignId: 'RCH-1004',
    timestamp: '2026-10-05T14:30:00Z',
    read: true,
  },
];

export const CampaignRepository = {
  async getCurrentUserId(): Promise<string> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        return data.session.user.id;
      }
    } catch {}

    const localActive = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (localActive) {
      return localActive;
    }

    return GUEST_USER_ID;
  },

  async setActiveUser(
    user: { id: string; email?: string; name?: string; avatarUrl?: string } | null
  ): Promise<void> {
    if (!user) {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, user.id);

    const profileKey = getUserStorageKey('profile', user.id);
    const existing = await AsyncStorage.getItem(profileKey);

    if (isDemoUser(user.id, user.email)) {
      // Demo Account is strictly pre-seeded with Dr. Maya Sen's portfolio
      await AsyncStorage.setItem(profileKey, JSON.stringify(INITIAL_USER_PROFILE));
    } else {
      if (!existing) {
        // Any real user or guest starts with a clean slate: 0 backed, 0 saved, 0 created
        const freshProfile: UserProfile = {
          id: user.id,
          name: user.name || user.email?.split('@')[0] || 'Reach User',
          role: 'Community Backer',
          email: user.email || '',
          avatar:
            user.avatarUrl ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          backedCampaignIds: [],
          savedCampaignIds: [],
          createdCampaignIds: [],
          notificationsEnabled: true,
          emailReceiptsEnabled: true,
        };
        await AsyncStorage.setItem(profileKey, JSON.stringify(freshProfile));
      } else {
        // Sanitize any existing cached profile so demo IDs never leak into real accounts
        try {
          const parsed: UserProfile = JSON.parse(existing);
          let modified = false;
          if (parsed.createdCampaignIds?.includes('RCH-1007')) {
            parsed.createdCampaignIds = parsed.createdCampaignIds.filter(
              (id) => id !== 'RCH-1007'
            );
            modified = true;
          }
          if (
            parsed.backedCampaignIds?.length === 2 &&
            parsed.backedCampaignIds.includes('RCH-1001') &&
            parsed.backedCampaignIds.includes('RCH-1003')
          ) {
            parsed.backedCampaignIds = [];
            modified = true;
          }
          if (
            parsed.savedCampaignIds?.length === 2 &&
            parsed.savedCampaignIds.includes('RCH-1002') &&
            parsed.savedCampaignIds.includes('RCH-1004')
          ) {
            parsed.savedCampaignIds = [];
            modified = true;
          }
          if (user.name) parsed.name = user.name;
          if (user.email) parsed.email = user.email;
          if (user.avatarUrl) parsed.avatar = user.avatarUrl;
          if (modified || user.name || user.email) {
            await AsyncStorage.setItem(profileKey, JSON.stringify(parsed));
          }
        } catch {}
      }
    }
  },

  async init(): Promise<void> {
    try {
      const seeded = await AsyncStorage.getItem(STORAGE_KEYS.SEEDED_FLAG);
      if (!seeded) {
        // Shared public campaigns
        await AsyncStorage.setItem(
          STORAGE_KEYS.CAMPAIGNS,
          JSON.stringify(SEED_CAMPAIGNS)
        );

        // Seed Demo Account specifically under DEMO_USER_ID only
        await AsyncStorage.setItem(
          getUserStorageKey('profile', DEMO_USER_ID),
          JSON.stringify(INITIAL_USER_PROFILE)
        );
        await AsyncStorage.setItem(
          getUserStorageKey('notifications', DEMO_USER_ID),
          JSON.stringify(INITIAL_NOTIFICATIONS)
        );
        await AsyncStorage.setItem(
          getUserStorageKey('contributions', DEMO_USER_ID),
          JSON.stringify([
            {
              id: 'cnt_init_1',
              campaignId: 'RCH-1001',
              campaignTitle: 'Clean Water Arsenic & Fluoride Testing in Rural Aquifers',
              amount: 500,
              platformFee: 50,
              totalPaid: 550,
              estimatedImpressions: 5000,
              estimatedPeopleReached: 3750,
              timestamp: '2026-10-14T11:20:00Z',
              receiptNumber: 'REC-RCH-8921-X',
              paymentMethod: 'upi',
              status: 'success',
            },
          ])
        );

        // Clear all legacy and un-scoped keys so they never leak into any account
        const legacyKeys = [
          '@reach:user_profile_v1',
          '@reach:contributions_v1',
          '@reach:notifications_v1',
          '@reach:draft_v1',
          '@reach:seeded_flag_v1',
          '@reach:seeded_flag_v2',
          '@reach:seeded_flag_v3',
        ];
        await AsyncStorage.multiRemove(legacyKeys);

        await AsyncStorage.setItem(STORAGE_KEYS.SEEDED_FLAG, 'true');
      }
    } catch (e) {
      console.error('Failed to initialize local repository:', e);
    }
  },

  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      await this.init();
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (raw) {
        return JSON.parse(raw);
      }
      return SEED_CAMPAIGNS;
    } catch {
      return SEED_CAMPAIGNS;
    }
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    const list = await this.getAllCampaigns();
    return list.find((c) => c.id === id) || null;
  },

  async updateCampaign(campaign: Campaign): Promise<void> {
    const list = await this.getAllCampaigns();
    const index = list.findIndex((c) => c.id === campaign.id);
    if (index >= 0) {
      list[index] = campaign;
    } else {
      list.unshift(campaign);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(list));
  },

  async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const list = await this.getAllCampaigns();
      const updatedList = list.filter((c) => c.id !== campaignId);
      await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(updatedList));

      // Remove from user profile created/backed/saved arrays
      const profile = await this.getUserProfile();
      let modified = false;

      if (profile.createdCampaignIds && profile.createdCampaignIds.includes(campaignId)) {
        profile.createdCampaignIds = profile.createdCampaignIds.filter((id) => id !== campaignId);
        modified = true;
      }
      if (profile.backedCampaignIds && profile.backedCampaignIds.includes(campaignId)) {
        profile.backedCampaignIds = profile.backedCampaignIds.filter((id) => id !== campaignId);
        modified = true;
      }
      if (profile.savedCampaignIds && profile.savedCampaignIds.includes(campaignId)) {
        profile.savedCampaignIds = profile.savedCampaignIds.filter((id) => id !== campaignId);
        modified = true;
      }

      if (modified) {
        await this.updateUserProfile(profile);
      }

      return true;
    } catch (e) {
      console.warn('Failed to delete campaign:', e);
      return false;
    }
  },

  async getUserProfile(): Promise<UserProfile> {
    try {
      await this.init();

      let supabaseUser: any = null;
      try {
        const { data } = await supabase.auth.getSession();
        supabaseUser = data?.session?.user || null;
      } catch {}

      const localActive = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
      const activeUserId = supabaseUser?.id || localActive || GUEST_USER_ID;

      // If active user is the Demo user, return seeded demo profile
      if (isDemoUser(activeUserId, supabaseUser?.email)) {
        const demoKey = getUserStorageKey('profile', DEMO_USER_ID);
        const demoRaw = await AsyncStorage.getItem(demoKey);
        if (demoRaw) {
          return JSON.parse(demoRaw);
        }
        await AsyncStorage.setItem(demoKey, JSON.stringify(INITIAL_USER_PROFILE));
        return INITIAL_USER_PROFILE;
      }

      const profileKey = getUserStorageKey('profile', activeUserId);
      const raw = await AsyncStorage.getItem(profileKey);

      if (raw) {
        const parsed: UserProfile = JSON.parse(raw);
        let modified = false;

        // Guarantee sanitization: non-demo users MUST NEVER have Dr. Maya Sen's demo IDs
        if (parsed.createdCampaignIds?.includes('RCH-1007')) {
          parsed.createdCampaignIds = parsed.createdCampaignIds.filter(
            (id) => id !== 'RCH-1007'
          );
          modified = true;
        }
        if (
          parsed.backedCampaignIds?.length === 2 &&
          parsed.backedCampaignIds.includes('RCH-1001') &&
          parsed.backedCampaignIds.includes('RCH-1003')
        ) {
          parsed.backedCampaignIds = [];
          modified = true;
        }
        if (
          parsed.savedCampaignIds?.length === 2 &&
          parsed.savedCampaignIds.includes('RCH-1002') &&
          parsed.savedCampaignIds.includes('RCH-1004')
        ) {
          parsed.savedCampaignIds = [];
          modified = true;
        }

        if (supabaseUser) {
          const googleName =
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.user_metadata?.name ||
            supabaseUser.email?.split('@')[0];
          const googleAvatar =
            supabaseUser.user_metadata?.avatar_url ||
            supabaseUser.user_metadata?.picture;

          const updated: UserProfile = {
            ...parsed,
            id: supabaseUser.id,
            email: supabaseUser.email || parsed.email,
            name: googleName || parsed.name,
            avatar: googleAvatar || parsed.avatar,
          };
          if (modified) {
            await AsyncStorage.setItem(profileKey, JSON.stringify(updated));
          }
          return updated;
        }

        if (modified) {
          await AsyncStorage.setItem(profileKey, JSON.stringify(parsed));
        }
        return parsed;
      }

      // Clean profile for any new user account (0 backed, 0 created, 0 saved)
      const freshProfile: UserProfile = {
        id: activeUserId,
        name:
          supabaseUser?.user_metadata?.full_name ||
          supabaseUser?.user_metadata?.name ||
          supabaseUser?.email?.split('@')[0] ||
          (activeUserId === GUEST_USER_ID ? 'Guest User' : 'Reach User'),
        role: 'Community Backer',
        email: supabaseUser?.email || '',
        avatar:
          supabaseUser?.user_metadata?.avatar_url ||
          supabaseUser?.user_metadata?.picture ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        backedCampaignIds: [],
        savedCampaignIds: [],
        createdCampaignIds: [],
        notificationsEnabled: true,
        emailReceiptsEnabled: true,
      };

      await AsyncStorage.setItem(profileKey, JSON.stringify(freshProfile));
      return freshProfile;
    } catch {
      return {
        id: GUEST_USER_ID,
        name: 'Reach User',
        role: 'Community Backer',
        email: '',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        backedCampaignIds: [],
        savedCampaignIds: [],
        createdCampaignIds: [],
        notificationsEnabled: true,
        emailReceiptsEnabled: true,
      };
    }
  },

  async updateUserProfile(profile: UserProfile): Promise<void> {
    const activeUserId = profile.id || (await this.getCurrentUserId());
    const profileKey = getUserStorageKey('profile', activeUserId);
    await AsyncStorage.setItem(profileKey, JSON.stringify(profile));
  },

  async toggleSaveCampaign(campaignId: string): Promise<boolean> {
    const profile = await this.getUserProfile();
    const isSaved = profile.savedCampaignIds.includes(campaignId);
    let newSaved: string[];
    if (isSaved) {
      newSaved = profile.savedCampaignIds.filter((id) => id !== campaignId);
    } else {
      newSaved = [...profile.savedCampaignIds, campaignId];
    }
    profile.savedCampaignIds = newSaved;
    await this.updateUserProfile(profile);
    return !isSaved;
  },

  async getContributions(): Promise<ContributionRecord[]> {
    try {
      const activeUserId = await this.getCurrentUserId();
      const contKey = getUserStorageKey('contributions', activeUserId);
      const raw = await AsyncStorage.getItem(contKey);
      if (raw) {
        return JSON.parse(raw);
      }

      if (isDemoUser(activeUserId)) {
        const demoContributions: ContributionRecord[] = [
          {
            id: 'cnt_init_1',
            campaignId: 'RCH-1001',
            campaignTitle: 'Clean Water Arsenic & Fluoride Testing in Rural Aquifers',
            amount: 500,
            platformFee: 50,
            totalPaid: 550,
            estimatedImpressions: 5000,
            estimatedPeopleReached: 3750,
            timestamp: '2026-10-14T11:20:00Z',
            receiptNumber: 'REC-RCH-8921-X',
            paymentMethod: 'upi',
            status: 'success',
          },
        ];
        await AsyncStorage.setItem(contKey, JSON.stringify(demoContributions));
        return demoContributions;
      }

      return [];
    } catch {
      return [];
    }
  },

  async contribute(
    campaignId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    forceStatus: 'success' | 'failed' | 'cancelled' = 'success'
  ): Promise<{ success: boolean; record: ContributionRecord; campaign?: Campaign }> {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const metrics = ReachCalculator.calculate(
      amount,
      campaign.reachSettings.estimatedImpressionsPer100INR,
      campaign.reachSettings.uniqueReachRatio
    );

    const receiptNumber = `REC-${campaign.id}-${Date.now().toString().slice(-6)}`;
    const record: ContributionRecord = {
      id: `cnt_${Date.now()}`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      amount,
      platformFee: metrics.platformFee + metrics.processingFee,
      totalPaid: amount + metrics.platformFee + metrics.processingFee,
      estimatedImpressions: metrics.impressions,
      estimatedPeopleReached: metrics.uniquePeople,
      timestamp: new Date().toISOString(),
      receiptNumber,
      paymentMethod,
      status: forceStatus,
    };

    const activeUserId = await this.getCurrentUserId();
    const contKey = getUserStorageKey('contributions', activeUserId);
    const contributions = await this.getContributions();
    contributions.unshift(record);
    await AsyncStorage.setItem(contKey, JSON.stringify(contributions));

    if (forceStatus === 'success') {
      // Update campaign funding
      const newRaised = campaign.funding.raised + amount;
      const isGoalReached = newRaised >= campaign.funding.goal;
      const updatedCampaign: Campaign = {
        ...campaign,
        funding: {
          ...campaign.funding,
          raised: newRaised,
          contributionsCount: campaign.funding.contributionsCount + 1,
        },
        status: isGoalReached && campaign.status === 'funding'
          ? 'funding_reached'
          : campaign.status,
      };

      await this.updateCampaign(updatedCampaign);

      // Update User Profile backed list
      const profile = await this.getUserProfile();
      if (!profile.backedCampaignIds.includes(campaign.id)) {
        profile.backedCampaignIds.push(campaign.id);
        await this.updateUserProfile(profile);
      }

      // Add Notification
      await this.addNotification({
        id: `notif_${Date.now()}`,
        type: 'contribution_success',
        title: `Contribution Confirmed: ₹${amount.toLocaleString('en-IN')}`,
        message: `Your amplification support for "${campaign.title}" is active.`,
        campaignId: campaign.id,
        timestamp: new Date().toISOString(),
        read: false,
      });

      return { success: true, record, campaign: updatedCampaign };
    } else {
      // Failed or cancelled - DO NOT UPDATE FUNDING
      await this.addNotification({
        id: `notif_${Date.now()}`,
        type: 'contribution_failed',
        title: `Contribution ${forceStatus === 'failed' ? 'Failed' : 'Cancelled'}`,
        message: `Your payment of ₹${amount.toLocaleString('en-IN')} was not processed. No funds were debited.`,
        campaignId: campaign.id,
        timestamp: new Date().toISOString(),
        read: false,
      });

      return { success: false, record, campaign };
    }
  },

  // Draft Management
  async getDraft(): Promise<DraftCampaign | null> {
    try {
      const activeUserId = await this.getCurrentUserId();
      const draftKey = getUserStorageKey('draft', activeUserId);
      const raw = await AsyncStorage.getItem(draftKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async saveDraft(draft: DraftCampaign): Promise<void> {
    try {
      const activeUserId = await this.getCurrentUserId();
      const draftKey = getUserStorageKey('draft', activeUserId);
      await AsyncStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  },

  async clearDraft(): Promise<void> {
    const activeUserId = await this.getCurrentUserId();
    const draftKey = getUserStorageKey('draft', activeUserId);
    await AsyncStorage.removeItem(draftKey);
  },

  async submitCampaign(draft: DraftCampaign): Promise<Campaign> {
    const campaignId = `RCH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCampaign: Campaign = {
      id: campaignId,
      title: draft.title || 'Untitled Campaign',
      category: draft.category || 'General',
      creator: {
        id: 'cr_current_user',
        name: draft.creatorName || 'Community Creator',
        title: 'Campaign Creator',
        organization: draft.creatorOrg || undefined,
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verifiedIdentity: false,
      },
      summary: draft.summary || draft.whatItIsAbout || '',
      coverImage:
        draft.coverImage ||
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
      story: {
        headline: draft.headline || draft.title || 'Campaign Story',
        introduction: draft.introduction || draft.whatItIsAbout || draft.summary || '',
        sections:
          Array.isArray(draft.sections) && draft.sections.length > 0
            ? draft.sections
            : [
                {
                  id: 'sec_default_1',
                  title: 'Why This Message Matters',
                  content: draft.whyItMatters || draft.whatItIsAbout || draft.summary || '',
                },
              ],
        statistics: Array.isArray(draft.statistics) ? draft.statistics : [],
        sources: Array.isArray(draft.sources) ? draft.sources : [],
        audienceActions:
          Array.isArray(draft.audienceActions) && draft.audienceActions.length > 0
            ? draft.audienceActions
            : ['Learn more and share this verified campaign message with others.'],
      },
      visuals: {
        adHeadline: draft.adHeadline || draft.title || 'Campaign Headline',
        adDescription: draft.adDescription || draft.summary || '',
        callToAction: draft.callToAction || 'Learn More',
        adImages:
          Array.isArray(draft.adImages) && draft.adImages.length > 0
            ? draft.adImages
            : [
                draft.coverImage ||
                  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
              ],
        adPlacements:
          Array.isArray(draft.adPlacements) && draft.adPlacements.length > 0
            ? draft.adPlacements
            : ['instagram_feed', 'facebook_feed'],
      },
      reachSettings: {
        targetLocations:
          Array.isArray(draft.targetLocations) && draft.targetLocations.length > 0
            ? draft.targetLocations
            : ['Pan-India'],
        targetInterests:
          Array.isArray(draft.targetInterests) && draft.targetInterests.length > 0
            ? draft.targetInterests
            : ['Public Interest', 'Education', 'Civic Action'],
        channels:
          Array.isArray(draft.channels) && draft.channels.length > 0
            ? draft.channels
            : ['Instagram', 'Facebook'],
        budgetAllocation: {
          directAdSpendPct: 85,
          reviewAndOpsPct: 10,
          processingFeePct: 5,
        },
        estimatedImpressionsPer100INR: 1000,
        uniqueReachRatio: 0.75,
      },
      funding: {
        goal: Math.max(1000, draft.fundingGoal || 20000),
        raised: 0,
        contributionsCount: 0,
        deadlineDaysRemaining: draft.durationDays || 21,
        currency: '₹',
      },
      status: 'submitted',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      reviewNotes:
        'Submitted for review. Awaiting standard factual verification and ad creative compliance.',
    };

    await this.updateCampaign(newCampaign);

    // Update user profile created campaigns
    const profile = await this.getUserProfile();
    if (!profile.createdCampaignIds) {
      profile.createdCampaignIds = [];
    }
    profile.createdCampaignIds.unshift(newCampaign.id);
    await this.updateUserProfile(profile);

    // Clear draft
    await this.clearDraft();

    // Add notification
    await this.addNotification({
      id: `notif_${Date.now()}`,
      type: 'submission_received',
      title: 'Campaign Submitted for Review',
      message: `"${newCampaign.title}" has been submitted. Status: Under Review.`,
      campaignId: newCampaign.id,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return newCampaign;
  },

  // Deterministic Demo Review Actions for Creator Dashboard
  async devSimulateStatus(
    campaignId: string,
    newStatus: CampaignStatus,
    reviewNotes?: string
  ): Promise<Campaign | null> {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) return null;

    let updated: Campaign = {
      ...campaign,
      status: newStatus,
      reviewNotes: reviewNotes || campaign.reviewNotes,
    };

    if (newStatus === 'approved') {
      updated.approvedAt = new Date().toISOString();
      updated.status = 'funding'; // Once approved, becomes available for funding
      await this.addNotification({
        id: `notif_${Date.now()}`,
        type: 'campaign_approved',
        title: 'Campaign Approved for Funding',
        message: `"${campaign.title}" cleared review and is now open for backer amplification!`,
        campaignId: campaign.id,
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (newStatus === 'changes_requested') {
      await this.addNotification({
        id: `notif_${Date.now()}`,
        type: 'changes_requested',
        title: 'Review Feedback: Changes Requested',
        message: reviewNotes || 'Please update your primary source reference link.',
        campaignId: campaign.id,
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (newStatus === 'funding_reached') {
      updated.funding.raised = updated.funding.goal;
      await this.addNotification({
        id: `notif_${Date.now()}`,
        type: 'funding_milestone',
        title: 'Funding Goal Achieved!',
        message: `"${campaign.title}" has reached 100% of its funding goal and is ready for live distribution!`,
        campaignId: campaign.id,
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (newStatus === 'promoting') {
      await this.addNotification({
        id: `notif_${Date.now()}`,
        type: 'promotion_begun',
        title: 'Ad Placements Live!',
        message: `Targeted distribution for "${campaign.title}" has begun on configured networks.`,
        campaignId: campaign.id,
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (newStatus === 'completed') {
      updated.report = {
        generatedDate: new Date().toISOString().split('T')[0],
        status: 'completed',
        fundsRaised: updated.funding.raised,
        adBudgetAllocated: Math.round(updated.funding.raised * 0.85),
        adSpendActual: Math.round(updated.funding.raised * 0.85),
        platformOpsActual: Math.round(updated.funding.raised * 0.1),
        paymentProcessingActual: Math.round(updated.funding.raised * 0.05),
        impressionsDelivered: Math.round((updated.funding.raised / 100) * 1000),
        uniquePeopleReached: Math.round((updated.funding.raised / 100) * 750),
        clickThroughs: Math.round((updated.funding.raised / 100) * 32),
        avgCostPerImpression: '₹0.10',
        campaignDurationDays: 21,
        channelsSummary: [
          {
            channel: 'Instagram Feed & Stories',
            impressions: Math.round((updated.funding.raised / 100) * 600),
            spend: Math.round(updated.funding.raised * 0.51),
          },
          {
            channel: 'Facebook Placements',
            impressions: Math.round((updated.funding.raised / 100) * 400),
            spend: Math.round(updated.funding.raised * 0.34),
          },
        ],
        moderationNotes: 'Campaign fully delivered with complete post-campaign audit verification.',
      };
      await this.addNotification({
        id: `notif_${Date.now()}`,
        type: 'campaign_completed',
        title: 'Distribution Complete & Report Ready',
        message: `Final amplification report for "${campaign.title}" is now available.`,
        campaignId: campaign.id,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    await this.updateCampaign(updated);
    return updated;
  },

  // Notifications
  async getNotifications(): Promise<ActivityNotification[]> {
    try {
      const activeUserId = await this.getCurrentUserId();
      const notifKey = getUserStorageKey('notifications', activeUserId);
      const raw = await AsyncStorage.getItem(notifKey);
      if (raw) {
        return JSON.parse(raw);
      }

      if (isDemoUser(activeUserId)) {
        await AsyncStorage.setItem(notifKey, JSON.stringify(INITIAL_NOTIFICATIONS));
        return INITIAL_NOTIFICATIONS;
      }

      const welcomeNotif: ActivityNotification[] = [
        {
          id: `notif_welcome_${Date.now()}`,
          type: 'contribution_success',
          title: 'Welcome to Reach!',
          message: 'Explore verified community campaigns and amplify messages that matter.',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ];
      await AsyncStorage.setItem(notifKey, JSON.stringify(welcomeNotif));
      return welcomeNotif;
    } catch {
      return [];
    }
  },

  async addNotification(notif: ActivityNotification): Promise<void> {
    const activeUserId = await this.getCurrentUserId();
    const notifKey = getUserStorageKey('notifications', activeUserId);
    const list = await this.getNotifications();
    list.unshift(notif);
    await AsyncStorage.setItem(notifKey, JSON.stringify(list));
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const activeUserId = await this.getCurrentUserId();
    const notifKey = getUserStorageKey('notifications', activeUserId);
    const list = await this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      await AsyncStorage.setItem(notifKey, JSON.stringify(list));
    }
  },

  async markAllNotificationsAsRead(): Promise<void> {
    const activeUserId = await this.getCurrentUserId();
    const notifKey = getUserStorageKey('notifications', activeUserId);
    const list = await this.getNotifications();
    list.forEach((n) => (n.read = true));
    await AsyncStorage.setItem(notifKey, JSON.stringify(list));
  },

  async getThemePreference(): Promise<ThemeId> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME_ID);
      if (saved === 'editorial' || saved === 'aurora' || saved === 'glassmorphism') {
        return saved as ThemeId;
      }
    } catch (e) {
      console.warn('Failed to get theme preference:', e);
    }
    return 'editorial';
  },

  async saveThemePreference(themeId: ThemeId): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_ID, themeId);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  },

  async resetToDefaults(): Promise<void> {
    await AsyncStorage.clear();
    await this.init();
  },
};
