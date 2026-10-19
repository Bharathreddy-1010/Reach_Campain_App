import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import {
  ChevronLeft,
  Bookmark,
  Share2,
  ShieldCheck,
  Calendar,
  Eye,
  Megaphone,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { AppHeader } from '../../src/components/common/AppHeader';
import { CategoryBadge, StatusPill } from '../../src/components/common/Badge';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { ReachMeter } from '../../src/components/common/ReachMeter';
import { StoryReader } from '../../src/components/campaign/StoryReader';
import { UseOfFundsBreakdown } from '../../src/components/campaign/UseOfFundsBreakdown';
import { ReportViewer } from '../../src/components/campaign/ReportViewer';
import { Button } from '../../src/components/common/Button';
import { CampaignRepository } from '../../src/repositories/campaignRepository';
import { Campaign, UserProfile } from '../../src/types';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../src/theme';
import { ReachCalculator } from '../../src/services/reachCalculator';

export default function CampaignDetailScreen() {
  const { colors, themeId } = useTheme();
  const isGlass = themeId === 'glassmorphism';
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCampaign = async () => {
    if (!id) return;
    const data = await CampaignRepository.getCampaignById(id);
    const profile = await CampaignRepository.getUserProfile();
    setCampaign(data);
    setUserProfile(profile);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadCampaign();
    }, [id])
  );

  const handleToggleSave = async () => {
    if (!campaign) return;
    await CampaignRepository.toggleSaveCampaign(campaign.id);
    const profile = await CampaignRepository.getUserProfile();
    setUserProfile(profile);
  };

  const handleShare = async () => {
    if (!campaign) return;
    try {
      await Share.share({
        title: campaign.title,
        message: `Amplify this verified campaign on Reach: "${campaign.title}". Contributions fund message distribution and advertising reach: https://reach.app/c/${campaign.id}`,
      });
    } catch {
      // dismissed
    }
  };

  if (loading) {
    return (
      <ScreenWrapper scrollable={false}>
        <AppHeader showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading campaign details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!campaign) {
    return (
      <ScreenWrapper scrollable={false}>
        <AppHeader showBack={true} />
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundTitle}>Campaign Not Found</Text>
          <Text style={styles.notFoundSub}>
            The requested campaign does not exist or may have been removed.
          </Text>
          <Button
            title="Browse Explore"
            onPress={() => router.push('/explore')}
            variant="primary"
            style={styles.browseBtn}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const isSaved = userProfile?.savedCampaignIds.includes(campaign.id) || false;
  const isEligibleForFunding = campaign.status === 'funding';

  return (
    <ScreenWrapper scrollable={false}>
      {/* Navigation Header */}
      <AppHeader
        showBack={true}
        title={campaign.category}
        rightAction={
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={handleToggleSave} style={styles.headerIconBtn}>
              <Bookmark
                size={20}
                color={isSaved ? colors.primary : colors.textSecondary}
                fill={isSaved ? colors.primary : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerIconBtn}>
              <Share2 size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image & Category / Status Pill */}
        <View style={styles.imageBlock}>
          <Image source={{ uri: campaign.coverImage }} style={styles.coverImage} />
          <View style={styles.badgeRow}>
            <CategoryBadge category={campaign.category} />
            <StatusPill status={campaign.status} />
          </View>
        </View>

        <View style={styles.body}>
          {/* Campaign Title & Creator */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{campaign.title}</Text>

          <View style={[styles.creatorRow, { borderBottomColor: colors.borderLight }]}>
            <Image
              source={{ uri: campaign.creator.avatar }}
              style={styles.creatorAvatar}
            />
            <View style={styles.creatorTextCol}>
              <View style={styles.creatorNameRow}>
                <Text style={[styles.creatorName, { color: colors.textPrimary }]}>{campaign.creator.name}</Text>
                {campaign.creator.verifiedIdentity && (
                  <ShieldCheck size={14} color={colors.accent} />
                )}
              </View>
              <Text style={[styles.creatorTitle, { color: colors.textSecondary }]}>
                {campaign.creator.title}
                {campaign.creator.organization ? ` • ${campaign.creator.organization}` : ''}
              </Text>
            </View>
          </View>

          {/* Funding Progress Card */}
          <View
            style={[
              styles.progressCard,
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
            <ProgressBar
              current={campaign.funding.raised}
              target={campaign.funding.goal}
              barHeight={8}
            />

            <View style={[styles.progressMetaRow, { borderTopColor: isGlass ? 'rgba(255, 255, 255, 0.12)' : colors.borderLight }]}>
              <View style={styles.metaCol}>
                <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                  {campaign.funding.contributionsCount}
                </Text>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Backers</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: isGlass ? 'rgba(255, 255, 255, 0.15)' : colors.border }]} />
              <View style={styles.metaCol}>
                <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                  {campaign.funding.deadlineDaysRemaining > 0
                    ? `${campaign.funding.deadlineDaysRemaining}d`
                    : 'Concluded'}
                </Text>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Remaining</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: isGlass ? 'rgba(255, 255, 255, 0.15)' : colors.border }]} />
              <View style={styles.metaCol}>
                <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                  ~{ReachCalculator.formatNumber(Math.floor((campaign.funding.goal / 100) * campaign.reachSettings.estimatedImpressionsPer100INR))}
                </Text>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Target Views</Text>
              </View>
            </View>
          </View>

          {/* Full Editorial Story */}
          <StoryReader story={campaign.story} campaignTitle={campaign.title} />

          {/* Transparent Use of Funds */}
          <UseOfFundsBreakdown goalAmount={campaign.funding.goal} />

          {/* Post-Distribution Transparency Report if available */}
          {campaign.report && (
            <ReportViewer report={campaign.report} campaignTitle={campaign.title} />
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isGlass ? 'rgba(20, 22, 28, 0.92)' : colors.surface,
            borderTopColor: isGlass ? 'rgba(255, 255, 255, 0.18)' : colors.border,
            ...(Platform.OS === 'web' && isGlass
              ? ({
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 -8px 24px 0 rgba(0, 0, 0, 0.35)',
                } as any)
              : {}),
          },
        ]}
      >
        <View style={styles.bottomPriceCol}>
          <Text style={[styles.bottomRaised, { color: colors.textPrimary }]}>
            {ReachCalculator.formatCurrency(campaign.funding.raised)}
          </Text>
          <Text style={[styles.bottomGoal, { color: colors.textSecondary }]}>
            of {ReachCalculator.formatCurrency(campaign.funding.goal)} goal
          </Text>
        </View>

        <Button
          title={
            isEligibleForFunding
              ? 'Back This Campaign'
              : campaign.status === 'funding_reached'
              ? 'Goal Reached'
              : campaign.status === 'promoting'
              ? 'Promoting Now'
              : 'Under Review'
          }
          onPress={() =>
            router.push({
              pathname: '/contribution/[id]',
              params: { id: campaign.id },
            })
          }
          variant={isEligibleForFunding ? 'primary' : 'secondary'}
          size="md"
          disabled={!isEligibleForFunding}
          style={styles.backCtaBtn}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  notFoundTitle: {
    ...Typography.sectionTitle,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  browseBtn: {
    minWidth: 160,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  imageBlock: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.surfaceHighlight,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    padding: Spacing.lg,
  },
  title: {
    ...Typography.screenTitle,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceHighlight,
  },
  creatorTextCol: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  creatorTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metaCol: {
    flex: 1,
    alignItems: 'center',
  },
  metaVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.elevated,
  },
  bottomPriceCol: {
    flex: 1,
    marginRight: 14,
  },
  bottomRaised: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bottomGoal: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  backCtaBtn: {
    minWidth: 180,
  },
});
