import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  LayoutDashboard,
  Plus,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Eye,
  Megaphone,
  FileText,
  ChevronRight,
  TrendingUp,
  Trash2,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { AppHeader } from '../../src/components/common/AppHeader';
import { Button } from '../../src/components/common/Button';
import { StatusPill } from '../../src/components/common/Badge';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { CampaignRepository, isDemoUser } from '../../src/repositories/campaignRepository';
import { Campaign, CampaignStatus, UserProfile } from '../../src/types';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../src/theme';
import { ReachCalculator } from '../../src/services/reachCalculator';

type CreatorTab =
  | 'all'
  | 'under_review'
  | 'funding'
  | 'promoting'
  | 'completed'
  | 'requires_action';

export default function CreatorDashboardScreen() {
  const { colors, theme, themeId } = useTheme();
  const isGlass = themeId === 'glassmorphism';
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<CreatorTab>('all');

  const loadData = async () => {
    const list = await CampaignRepository.getAllCampaigns();
    const p = await CampaignRepository.getUserProfile();
    setCampaigns(list);
    setProfile(p);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Deterministic Demo Review Actions for Testing
  const handleSimulateStatus = async (
    campaignId: string,
    newStatus: CampaignStatus,
    notes?: string
  ) => {
    await CampaignRepository.devSimulateStatus(campaignId, newStatus, notes);
    await CampaignRepository.clearDraft(); // Ensure draft is reset for clean creation
    await loadData();
    Alert.alert(
      'Demo Workflow Simulated',
      `Campaign state updated to "${newStatus.replace('_', ' ').toUpperCase()}". Corresponding notifications dispatched.`
    );
  };

  const handleDeleteCampaign = (campaignId: string, title: string) => {
    const doDelete = async () => {
      await CampaignRepository.deleteCampaign(campaignId);
      await loadData();
      Alert.alert('Campaign Deleted', `"${title}" has been deleted.`);
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Campaign',
        `Are you sure you want to delete "${title}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const isDemo = isDemoUser(profile?.id, profile?.email);

  // For the demo account (Dr. Maya Sen), display the full demo portfolio so workflow lifecycle stages can be simulated.
  // For any other real user account, display strictly the campaigns created by that user.
  const relevantCampaigns = isDemo
    ? campaigns
    : campaigns.filter((c) => profile?.createdCampaignIds?.includes(c.id));

  const filteredCampaigns = relevantCampaigns.filter((c) => {
    switch (activeTab) {
      case 'under_review':
        return c.status === 'submitted';
      case 'funding':
        return c.status === 'funding' || c.status === 'funding_reached';
      case 'promoting':
        return c.status === 'promoting' || c.status === 'prep_distribution';
      case 'completed':
        return c.status === 'completed';
      case 'requires_action':
        return c.status === 'changes_requested' || c.status === 'rejected';
      default:
        return true;
    }
  });

  // Calculate Creator Analytics
  const totalRaised = relevantCampaigns.reduce((sum, c) => sum + c.funding.raised, 0);
  const totalBackers = relevantCampaigns.reduce(
    (sum, c) => sum + c.funding.contributionsCount,
    0
  );
  const totalImpressionsProjected = relevantCampaigns.reduce(
    (sum, c) =>
      sum +
      Math.floor((c.funding.raised / 100) * c.reachSettings.estimatedImpressionsPer100INR),
    0
  );

  return (
    <ScreenWrapper scrollable={true}>
      <AppHeader
        showBack={true}
        title="Creator Dashboard"
        subtitle="Campaign management & workflow states"
        rightAction={
          <Button
            title="New"
            onPress={() => router.push('/create')}
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} color={Colors.textInverse} />}
          />
        }
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Creator Performance Metrics Bar */}
        <View
          style={[
            styles.metricsCard,
            {
              backgroundColor: isGlass ? colors.card.bg : colors.surface,
              borderColor: isGlass ? colors.card.border : colors.border,
              borderRadius: isGlass ? 24 : Radii.lg,
              borderWidth: isGlass ? 1.5 : 1,
              shadowColor: isGlass ? '#818CF8' : Shadows.subtle.shadowColor,
              shadowOpacity: isGlass ? 0.28 : (Shadows.subtle as any).shadowOpacity,
              shadowRadius: isGlass ? 18 : (Shadows.subtle as any).shadowRadius,
              ...(Platform.OS === 'web' && isGlass
                ? ({
                    backdropFilter: 'blur(24px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(140%)',
                    boxShadow:
                      '0 12px 36px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
                  } as any)
                : {}),
            },
          ]}
        >
          <Text style={[styles.metricsHeading, { color: colors.textSecondary }]}>
            {isDemo
              ? 'Platform Amplification Portfolio (Demo Mode)'
              : 'My Campaign Amplification Portfolio'}
          </Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {ReachCalculator.formatCurrency(totalRaised)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total Funds Raised</Text>
            </View>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{totalBackers}</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Community Backers</Text>
            </View>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                ~{ReachCalculator.formatNumber(totalImpressionsProjected)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Est. Total Views</Text>
            </View>
          </View>
        </View>

        {/* Status Lifecycle Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            style={[
              styles.tabChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeTab === 'all' && [styles.tabChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: colors.textSecondary },
                activeTab === 'all' && [styles.tabChipTextActive, { color: colors.textInverse }],
              ]}
            >
              All ({relevantCampaigns.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('under_review')}
            style={[
              styles.tabChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeTab === 'under_review' && [styles.tabChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: colors.textSecondary },
                activeTab === 'under_review' && [styles.tabChipTextActive, { color: colors.textInverse }],
              ]}
            >
              Under Review ({relevantCampaigns.filter((c) => c.status === 'submitted').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('funding')}
            style={[
              styles.tabChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeTab === 'funding' && [styles.tabChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: colors.textSecondary },
                activeTab === 'funding' && [styles.tabChipTextActive, { color: colors.textInverse }],
              ]}
            >
              Funding (
              {
                relevantCampaigns.filter(
                  (c) => c.status === 'funding' || c.status === 'funding_reached'
                ).length
              }
              )
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('promoting')}
            style={[
              styles.tabChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeTab === 'promoting' && [styles.tabChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: colors.textSecondary },
                activeTab === 'promoting' && [styles.tabChipTextActive, { color: colors.textInverse }],
              ]}
            >
              Promoting ({relevantCampaigns.filter((c) => c.status === 'promoting').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('completed')}
            style={[
              styles.tabChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeTab === 'completed' && [styles.tabChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: colors.textSecondary },
                activeTab === 'completed' && [styles.tabChipTextActive, { color: colors.textInverse }],
              ]}
            >
              Completed ({relevantCampaigns.filter((c) => c.status === 'completed').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('requires_action')}
            style={[
              styles.tabChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeTab === 'requires_action' && [styles.tabChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: colors.textSecondary },
                activeTab === 'requires_action' && [styles.tabChipTextActive, { color: colors.textInverse }],
              ]}
            >
              Requires Action (
              {
                relevantCampaigns.filter(
                  (c) =>
                    c.status === 'changes_requested' || c.status === 'rejected'
                ).length
              }
              )
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Campaign List with Deterministic Demo Workflow Controls */}
        <View style={styles.campaignList}>
          {filteredCampaigns.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Megaphone size={28} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {relevantCampaigns.length === 0
                  ? 'No Campaigns Created Yet'
                  : 'No Campaigns in this Filter'}
              </Text>
              <Text style={styles.emptySub}>
                {relevantCampaigns.length === 0
                  ? 'Launch your first community-amplified message campaign to begin tracking review status, backer contributions, and live impressions.'
                  : 'There are currently no campaigns matching the selected status filter.'}
              </Text>
              {relevantCampaigns.length === 0 && (
                <Button
                  title="Create a Campaign"
                  onPress={() => router.push('/create')}
                  variant="primary"
                  size="md"
                  leftIcon={<Plus size={16} color={Colors.textInverse} />}
                  style={{ marginTop: 16 }}
                />
              )}
            </View>
          ) : null}
          {filteredCampaigns.map((camp) => (
            <View
              key={camp.id}
              style={[
                styles.creatorCard,
                {
                  backgroundColor: isGlass ? colors.card.bg : colors.surface,
                  borderColor: isGlass ? colors.card.border : colors.border,
                  borderRadius: isGlass ? 24 : Radii.lg,
                  borderWidth: isGlass ? 1.5 : 1,
                  shadowColor: isGlass ? '#818CF8' : Shadows.card.shadowColor,
                  shadowOpacity: isGlass ? 0.28 : (Shadows.card as any).shadowOpacity,
                  shadowRadius: isGlass ? 18 : (Shadows.card as any).shadowRadius,
                  ...(Platform.OS === 'web' && isGlass
                    ? ({
                        backdropFilter: 'blur(24px) saturate(140%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
                        boxShadow:
                          '0 12px 36px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
                      } as any)
                    : {}),
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Image source={{ uri: camp.coverImage }} style={styles.thumb} />
                <View style={styles.cardHeaderCol}>
                  <View style={styles.idStatusRow}>
                    <Text style={[styles.campId, { color: colors.textMuted }]}>{camp.id}</Text>
                    <StatusPill status={camp.status} size="sm" />
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {camp.title}
                  </Text>
                  <Text style={[styles.campCategory, { color: colors.textSecondary }]}>{camp.category}</Text>
                </View>
              </View>

              {/* Funding Progress Bar */}
              <View style={styles.progressWrap}>
                <ProgressBar
                  current={camp.funding.raised}
                  target={camp.funding.goal}
                  barHeight={5}
                />
              </View>

              {/* Review notes if changes requested or submitted */}
              {camp.reviewNotes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Compliance & Review Notes:</Text>
                  <Text style={styles.notesText}>{camp.reviewNotes}</Text>
                </View>
              )}

              {/* Primary Actions */}
              <View style={styles.cardActionsRow}>
                <Button
                  title="View Details"
                  onPress={() => router.push(`/campaign/${camp.id}`)}
                  variant="secondary"
                  size="sm"
                  style={styles.cardBtn}
                />

                {camp.status === 'changes_requested' && (
                  <Button
                    title="Respond / Edit"
                    onPress={() => router.push('/create')}
                    variant="primary"
                    size="sm"
                    style={styles.cardBtn}
                  />
                )}

                <TouchableOpacity
                  onPress={() => handleDeleteCampaign(camp.id, camp.title)}
                  style={[
                    styles.deleteBtn,
                    {
                      borderColor: colors.dangerMuted || 'rgba(239, 68, 68, 0.4)',
                      backgroundColor: colors.surfaceSubtle,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Trash2 size={13} color={colors.danger} />
                  <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>

              {/* Deterministic Demo Review Actions */}
              <View style={styles.demoReviewSection}>
                <Text style={styles.demoReviewLabel}>Demo Review Simulator:</Text>
                <View style={styles.demoBtnRow}>
                  {camp.status === 'submitted' && (
                    <>
                      <TouchableOpacity
                        onPress={() =>
                          handleSimulateStatus(camp.id, 'approved', 'Cleared factual verification.')
                        }
                        style={[styles.simBtn, styles.simApprove]}
                      >
                        <CheckCircle size={12} color={Colors.success} />
                        <Text style={styles.simBtnText}>Simulate Approval</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          handleSimulateStatus(
                            camp.id,
                            'changes_requested',
                            'Please provide direct peer-reviewed URL for statistics.'
                          )
                        }
                        style={[styles.simBtn, styles.simChanges]}
                      >
                        <AlertTriangle size={12} color={Colors.warning} />
                        <Text style={styles.simBtnText}>Request Changes</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {camp.status === 'funding_reached' && (
                    <TouchableOpacity
                      onPress={() =>
                        handleSimulateStatus(
                          camp.id,
                          'promoting',
                          'Ad sets deployed across Instagram and Facebook.'
                        )
                      }
                      style={[styles.simBtn, styles.simPromote]}
                    >
                      <Megaphone size={12} color={Colors.primary} />
                      <Text style={styles.simBtnText}>Launch Distribution</Text>
                    </TouchableOpacity>
                  )}

                  {camp.status === 'promoting' && (
                    <TouchableOpacity
                      onPress={() =>
                        handleSimulateStatus(
                          camp.id,
                          'completed',
                          'All impressions delivered. Audit report generated.'
                        )
                      }
                      style={[styles.simBtn, styles.simComplete]}
                    >
                      <FileText size={12} color={Colors.success} />
                      <Text style={styles.simBtnText}>Finalize Report</Text>
                    </TouchableOpacity>
                  )}

                  {camp.status === 'changes_requested' && (
                    <TouchableOpacity
                      onPress={() =>
                        handleSimulateStatus(
                          camp.id,
                          'approved',
                          'Revised citations verified.'
                        )
                      }
                      style={[styles.simBtn, styles.simApprove]}
                    >
                      <CheckCircle size={12} color={Colors.success} />
                      <Text style={styles.simBtnText}>Accept Revisions</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  metricsCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  metricsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.borderLight,
  },
  tabsScroll: {
    marginHorizontal: -Spacing.lg,
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabChipTextActive: {
    color: Colors.textInverse,
  },
  campaignList: {
    gap: 14,
  },
  creatorCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceHighlight,
  },
  cardHeaderCol: {
    flex: 1,
  },
  idStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  campId: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 2,
  },
  campCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  progressWrap: {
    marginVertical: 6,
  },
  notesBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: 8,
    borderRadius: Radii.sm,
    marginVertical: 6,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notesText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  cardBtn: {
    flex: 1,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  demoReviewSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  demoReviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  demoBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radii.xs,
    borderWidth: 1,
  },
  simApprove: {
    backgroundColor: Colors.successMuted,
    borderColor: '#BBF7D0',
  },
  simChanges: {
    backgroundColor: Colors.warningMuted,
    borderColor: '#FDE68A',
  },
  simPromote: {
    backgroundColor: Colors.accentMuted,
    borderColor: '#BFDBFE',
  },
  simComplete: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.borderDark,
  },
  simBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: Spacing.md,
    ...Shadows.subtle,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
