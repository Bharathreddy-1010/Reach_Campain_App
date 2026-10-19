import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  User,
  LayoutDashboard,
  Bookmark,
  Receipt,
  Settings,
  HelpCircle,
  Shield,
  FileText,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Sparkles,
  PlayCircle,
  LogOut,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { CampaignCard } from '../../src/components/campaign/CampaignCard';
import { ThemeSelector } from '../../src/components/common/ThemeSelector';
import { CampaignRepository } from '../../src/repositories/campaignRepository';
import { UserProfile, Campaign, ContributionRecord } from '../../src/types';
import { Radii, Shadows, Spacing, Typography, useTheme } from '../../src/theme';
import { ReachCalculator } from '../../src/services/reachCalculator';
import { supabase } from '../../src/services/supabase';

type ProfileSubTab = 'backed' | 'saved' | 'contributions';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, themeId, setThemeId } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileSubTab>('backed');

  const loadData = async () => {
    const p = await CampaignRepository.getUserProfile();
    const c = await CampaignRepository.getAllCampaigns();
    const cnt = await CampaignRepository.getContributions();
    setProfile(p);
    setAllCampaigns(c);
    setContributions(cnt);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const backedCampaigns = allCampaigns.filter((c) =>
    profile?.backedCampaignIds.includes(c.id)
  );

  const savedCampaigns = allCampaigns.filter((c) =>
    profile?.savedCampaignIds.includes(c.id)
  );

  const handleToggleSave = async (campaignId: string) => {
    await CampaignRepository.toggleSaveCampaign(campaignId);
    await loadData();
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    await CampaignRepository.setActiveUser(null);
    try {
      await setThemeId('editorial');
    } catch {}
    router.replace('/login');
  };

  const handleResetDemo = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will reset all campaigns, contributions, and notifications to their initial seeded demo state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await CampaignRepository.resetToDefaults();
            await loadData();
            Alert.alert('Reset Complete', 'Demo data restored to initial state.');
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper scrollable={true}>
      {/* Profile Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.profileRow}>
          <Image
            source={{
              uri:
                profile?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            }}
            style={[styles.avatar, { backgroundColor: colors.surfaceHighlight }]}
          />
          <View style={styles.profileTextCol}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {profile?.name || 'Reach User'}
            </Text>
            <Text style={[styles.userRole, { color: colors.textSecondary }]}>
              {profile?.role || 'Community Backer'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>
              {profile?.email}
            </Text>
          </View>
        </View>

        {/* Quick Summary Metrics */}
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 22 : Radii.md,
            },
          ]}
        >
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.textPrimary }]}>
              {backedCampaigns.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Backed</Text>
          </View>
          <View
            style={[
              styles.statDivider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.textPrimary }]}>
              {profile?.createdCampaignIds.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Created</Text>
          </View>
          <View
            style={[
              styles.statDivider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.textPrimary }]}>
              {savedCampaigns.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
          </View>
        </View>
      </View>

      {/* Creator Dashboard Entry Card */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/creator')}
        style={[
          styles.creatorBanner,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: themeId === 'aurora' ? 22 : Radii.lg,
          },
        ]}
      >
        <View style={styles.creatorBannerLeft}>
          <View style={[styles.creatorIconBox, { backgroundColor: colors.primary }]}>
            <LayoutDashboard size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.creatorBannerTitle, { color: colors.textPrimary }]}>
              Creator Dashboard
            </Text>
            <Text style={[styles.creatorBannerSub, { color: colors.textSecondary }]}>
              Manage drafts, review states, ad distribution & reports
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Activity Sub-tabs */}
      <View
        style={[
          styles.tabsRow,
          {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('backed')}
          style={[
            styles.tabButton,
            activeTab === 'backed' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'backed' ? colors.primary : colors.textMuted },
            ]}
          >
            Backed ({backedCampaigns.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('saved')}
          style={[
            styles.tabButton,
            activeTab === 'saved' && { borderBottomColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'saved' ? colors.primary : colors.textMuted },
            ]}
          >
            Saved ({savedCampaigns.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('contributions')}
          style={[
            styles.tabButton,
            activeTab === 'contributions' && { borderBottomColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'contributions' ? colors.primary : colors.textMuted,
              },
            ]}
          >
            Receipts ({contributions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-tab Content */}
      <View style={styles.tabContentSection}>
        {activeTab === 'backed' && (
          <View>
            {backedCampaigns.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Backed Campaigns Yet</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  When you amplify a message, it appears here with progress tracking and delivery reports.
                </Text>
              </View>
            ) : (
              backedCampaigns.map((camp) => (
                <CampaignCard
                  key={camp.id}
                  campaign={camp}
                  isSaved={profile?.savedCampaignIds.includes(camp.id)}
                  onToggleSave={handleToggleSave}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'saved' && (
          <View>
            {savedCampaigns.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Saved Campaigns</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Bookmark campaigns in Explore to inspect their sources and read updates later.
                </Text>
              </View>
            ) : (
              savedCampaigns.map((camp) => (
                <CampaignCard
                  key={camp.id}
                  campaign={camp}
                  isSaved={true}
                  onToggleSave={handleToggleSave}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'contributions' && (
          <View>
            {contributions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Receipts Found</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Contribution receipts with unique demo identifiers appear here.
                </Text>
              </View>
            ) : (
              contributions.map((rc) => (
                <View
                  key={rc.id}
                  style={[
                    styles.receiptCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.receiptHeader}>
                    <Text style={[styles.receiptNum, { color: colors.textPrimary }]}>
                      {rc.receiptNumber}
                    </Text>
                    <Text
                      style={[
                        styles.receiptStatus,
                        rc.status === 'success'
                          ? { color: colors.success }
                          : { color: colors.danger },
                      ]}
                    >
                      {rc.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[styles.receiptTitle, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {rc.campaignTitle}
                  </Text>
                  <View style={styles.receiptDetails}>
                    <Text style={[styles.receiptAmount, { color: colors.textPrimary }]}>
                      {ReachCalculator.formatCurrency(rc.amount)} (+ ₹{rc.platformFee} fees)
                    </Text>
                    <Text style={[styles.receiptDate, { color: colors.textMuted }]}>
                      {new Date(rc.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text style={[styles.receiptReach, { color: colors.accent }]}>
                    Amplification: ~{ReachCalculator.formatNumber(rc.estimatedImpressions)} views (~{ReachCalculator.formatNumber(rc.estimatedPeopleReached)} unique people)
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Theme Selector Section */}
      <View style={styles.themeSelectorSection}>
        <ThemeSelector />
      </View>

      {/* Account Settings & Platform Policies Links */}
      <View
        style={[
          styles.menuSection,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: themeId === 'aurora' ? 24 : 0,
            marginHorizontal: themeId === 'aurora' ? Spacing.lg : 0,
            marginBottom: themeId === 'aurora' ? 24 : 0,
          },
        ]}
      >
        <Text style={[styles.menuHeader, { color: colors.textMuted }]}>
          Platform & Settings
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
        >
          <View style={styles.menuItemLeft}>
            <Settings size={18} color={colors.textSecondary} />
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
              Preferences & Notifications
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'How Reach Works',
              'Reach is a community-funded message amplification platform. Contributions fund digital advertising reach and are NOT direct charitable donations.'
            )
          }
          style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
        >
          <View style={styles.menuItemLeft}>
            <HelpCircle size={18} color={colors.textSecondary} />
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
              How Amplification Works
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Editorial Guidelines',
              'All campaigns require factual source citations and adherence to advertising compliance rules before public distribution begins.'
            )
          }
          style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
        >
          <View style={styles.menuItemLeft}>
            <Shield size={18} color={colors.textSecondary} />
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
              Editorial & Trust Policies
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/get-started')}
          style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
        >
          <View style={styles.menuItemLeft}>
            <PlayCircle size={18} color={colors.accent} />
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
              Get Started & Animated Video
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
        >
          <View style={styles.menuItemLeft}>
            <LogOut size={18} color={colors.textSecondary} />
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
              Sign Out / Switch Account
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetDemo}
          style={[styles.menuItem, styles.resetMenuItem]}
        >
          <View style={styles.menuItemLeft}>
            <RotateCcw size={18} color={colors.danger} />
            <Text style={[styles.menuItemTitle, { color: colors.danger }]}>
              Reset Demo Data to Initial State
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileTextCol: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userRole: {
    fontSize: 13,
    marginTop: 1,
  },
  userEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: Radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  creatorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginVertical: 14,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    ...Shadows.subtle,
  },
  creatorBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  creatorIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  creatorBannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabContentSection: {
    padding: Spacing.lg,
  },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  receiptCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: 10,
    ...Shadows.subtle,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  receiptStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
  receiptTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  receiptDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  receiptAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  receiptDate: {
    fontSize: 11,
  },
  receiptReach: {
    fontSize: 11,
    fontWeight: '500',
  },
  themeSelectorSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: 8,
  },
  menuSection: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
    paddingBottom: 40,
    marginTop: 10,
  },
  menuHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetMenuItem: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
});
