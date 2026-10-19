import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Sparkles,
  ArrowRight,
  Eye,
  TrendingUp,
  Smartphone,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { CampaignCard } from '../../src/components/campaign/CampaignCard';
import { Button } from '../../src/components/common/Button';
import { Banner } from '../../src/components/common/Banner';
import { CampaignRepository } from '../../src/repositories/campaignRepository';
import { supabase } from '../../src/services/supabase';
import { launchNativeApp } from '../../src/services/nativeHandoff';
import { Campaign, UserProfile } from '../../src/types';
import { Radii, Shadows, Spacing, Typography, useTheme } from '../../src/theme';
import { APP_CONFIG } from '../../src/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, themeId } = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const list = await CampaignRepository.getAllCampaigns();
    const profile = await CampaignRepository.getUserProfile();
    setCampaigns(list);
    setUserProfile(profile);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleSave = async (campaignId: string) => {
    await CampaignRepository.toggleSaveCampaign(campaignId);
    const updatedProfile = await CampaignRepository.getUserProfile();
    setUserProfile(updatedProfile);
  };

  const featuredCampaign = campaigns.find((c) => c.id === 'RCH-1001') || campaigns[0];
  const feedCampaigns = campaigns.filter((c) => c.id !== featuredCampaign?.id);

  const isAmbient = themeId === 'glassmorphism';
  const isWeb = Platform.OS === 'web';

  return (
    <ScreenWrapper scrollable={false}>
      <ScrollView
        style={[
          styles.scroll,
          { backgroundColor: isAmbient ? 'transparent' : colors.background },
        ]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Switch directly to Expo Go or Reach APK (Visible on Web) */}
        {isWeb && (
          <View style={styles.nativeHandoffCard}>
            <View style={styles.nativeHandoffHeader}>
              <Smartphone size={16} color="#FFFFFF" />
              <Text style={styles.nativeHandoffTitle}>Connected to Reach</Text>
            </View>
            <Text style={styles.nativeHandoffSub}>
              Tap to switch directly to your installed mobile app:
            </Text>
            <View style={styles.nativeHandoffBtnRow}>
              <TouchableOpacity
                style={styles.expoGoBtn}
                onPress={() => launchNativeApp('expo')}
                activeOpacity={0.8}
              >
                <Text style={styles.expoGoBtnText}>Open in Expo Go 📱</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reachApkBtn}
                onPress={() => launchNativeApp('apk')}
                activeOpacity={0.8}
              >
                <Text style={styles.reachApkBtnText}>Open in Reach APK 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Top App Branding Bar */}
        <View
          style={[
            styles.topBrandBar,
            {
              backgroundColor: isAmbient ? 'transparent' : colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            },
          ]}
        >
          <View style={styles.brandTitleRow}>
            <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.brandName, { color: colors.textPrimary }]}>{APP_CONFIG.name}</Text>
          </View>
          <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>{APP_CONFIG.tagline}</Text>
        </View>

        {/* Hero Section */}
        <View
          style={[
            styles.heroSection,
            {
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.heroHeading, { color: colors.textPrimary }]}>
            Amplify important messages beyond existing feeds.
          </Text>
          <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
            A community-funded platform where backers unite to crowdfund targeted advertising and digital distribution for verified research, public health alerts, and civic insights.
          </Text>

          {/* Core Reach Proposition Metric */}
          <View
            style={[
              styles.reachPreviewCard,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 22 : Radii.md,
              },
            ]}
          >
            <View style={styles.reachMetricRow}>
              <View
                style={[
                  styles.reachIconBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderLight,
                    borderWidth: 1,
                  },
                ]}
              >
                <Eye size={20} color={colors.accent} />
              </View>
              <View style={styles.reachTextBox}>
                <Text style={[styles.reachHeadline, { color: colors.textPrimary }]}>
                  ₹100 funds ~1,000 estimated impressions
                </Text>
                <Text style={[styles.reachSub, { color: colors.textMuted }]}>
                  Configurable demo estimate based on standard digital ad rates. Not a commercial guarantee.
                </Text>
              </View>
            </View>
          </View>

          {/* Hero Action CTAs */}
          <View style={styles.heroCtas}>
            <Button
              title="Explore Campaigns"
              onPress={() => router.push('/explore')}
              variant="primary"
              size="md"
              style={styles.heroPrimaryBtn}
              rightIcon={<ArrowRight size={16} color="#FFFFFF" />}
            />
            <Button
              title="Start a Campaign"
              onPress={() => router.push('/create')}
              variant="secondary"
              size="md"
              style={styles.heroSecondaryBtn}
            />
          </View>
        </View>

        {/* Essential Business Rule Banner */}
        <View style={styles.bannerWrap}>
          <Banner
            variant="neutral"
            title="Community-Funded Distribution, Not Direct Donations"
            message={APP_CONFIG.disclaimers.distributionNotDonation}
          />
        </View>

        {/* How It Works Section: CREATE → REVIEW → AMPLIFY */}
        <View
          style={[
            styles.howItWorksCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 24 : Radii.lg,
            },
          ]}
        >
          <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>How Reach Works</Text>
          <Text style={[styles.sectionHeaderSub, { color: colors.textSecondary }]}>
            Transparent, community-governed message amplification in 3 steps:
          </Text>

          <View style={styles.stepsContainer}>
            <View style={styles.howStepItem}>
              <View style={[styles.stepNumPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <View style={styles.stepContentCol}>
                <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>CREATE</Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  A creator outlines a message with verified citations, data sources, and target audience parameters.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.stepConnector,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />

            <View style={styles.howStepItem}>
              <View style={[styles.stepNumPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={styles.stepContentCol}>
                <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>REVIEW</Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  The platform evaluates evidence and ad creative compliance before public funding and distribution begin.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.stepConnector,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />

            <View style={styles.howStepItem}>
              <View style={[styles.stepNumPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <View style={styles.stepContentCol}>
                <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>AMPLIFY</Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  Backers fund advertising costs to run sponsored placements in targeted digital feeds.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Featured Campaign Spotlight */}
        {featuredCampaign && (
          <View style={styles.feedSection}>
            <View style={styles.feedHeaderRow}>
              <View style={styles.feedTitleWrap}>
                <Sparkles size={16} color={colors.accent} />
                <Text style={[styles.feedTitle, { color: colors.textPrimary }]}>Campaign Spotlight</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/explore')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>

            <CampaignCard
              campaign={featuredCampaign}
              isSaved={userProfile?.savedCampaignIds.includes(featuredCampaign.id)}
              onToggleSave={handleToggleSave}
            />
          </View>
        )}

        {/* Main Campaign Feed */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeaderRow}>
            <View style={styles.feedTitleWrap}>
              <TrendingUp size={16} color={colors.primary} />
              <Text style={[styles.feedTitle, { color: colors.textPrimary }]}>Active Amplification Campaigns</Text>
            </View>
          </View>

          {feedCampaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              isSaved={userProfile?.savedCampaignIds.includes(camp.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  topBrandBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  heroSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  heroHeading: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 33,
    marginBottom: 10,
    letterSpacing: -0.6,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  reachPreviewCard: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: 12,
    marginBottom: 18,
  },
  reachMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reachIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  reachTextBox: {
    flex: 1,
  },
  reachHeadline: {
    fontSize: 13,
    fontWeight: '700',
  },
  reachSub: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  heroCtas: {
    flexDirection: 'row',
    gap: 10,
  },
  heroPrimaryBtn: {
    flex: 1.2,
  },
  heroSecondaryBtn: {
    flex: 1,
  },
  bannerWrap: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  howItWorksCard: {
    marginHorizontal: Spacing.lg,
    marginVertical: 10,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    ...Shadows.subtle,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionHeaderSub: {
    fontSize: 12,
    marginBottom: 16,
  },
  stepsContainer: {
    gap: 0,
  },
  howStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContentCol: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  stepConnector: {
    width: 2,
    height: 16,
    marginLeft: 12,
    marginVertical: 4,
  },
  feedSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 20,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  feedTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nativeHandoffCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    backgroundColor: '#1E293B',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
    ...Shadows.elevated,
  },
  nativeHandoffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nativeHandoffTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  nativeHandoffSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: Spacing.sm,
  },
  nativeHandoffBtnRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  expoGoBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#2563EB',
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expoGoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reachApkBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#0F172A',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reachApkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
});
