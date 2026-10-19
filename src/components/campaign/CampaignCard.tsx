import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bookmark, Share2, Eye, ShieldCheck } from 'lucide-react-native';
import { Campaign } from '../../types';
import { Radii, Shadows, Spacing, Typography, useTheme } from '../../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
import { CategoryBadge, StatusPill } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { ReachCalculator } from '../../services/reachCalculator';

interface CampaignCardProps {
  campaign: Campaign;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  showBackAction?: boolean;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  isSaved = false,
  onToggleSave,
  showBackAction = true,
}) => {
  const router = useRouter();
  const { colors, themeId } = useTheme();
  const isGlass = themeId === 'glassmorphism';

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isGlass) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2600,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2600,
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isGlass]);

  const animatedBorderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.60)'],
  });

  const animatedShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.42],
  });

  const animatedSpecularOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  const handleCardPress = () => {
    router.push({
      pathname: '/campaign/[id]',
      params: { id: campaign.id },
    });
  };

  const handleBackPress = (e: any) => {
    e.stopPropagation();
    router.push({
      pathname: '/contribution/[id]',
      params: { id: campaign.id },
    });
  };

  const handleShare = async (e: any) => {
    e.stopPropagation();
    try {
      await Share.share({
        title: campaign.title,
        message: `Amplify this campaign on Reach: "${campaign.title}". Contributions fund message distribution and advertising reach: https://reach.app/c/${campaign.id}`,
      });
    } catch {
      // User dismissed share
    }
  };

  const estimatedImpressionsAtGoal = Math.floor(
    (campaign.funding.goal / 100) *
      campaign.reachSettings.estimatedImpressionsPer100INR
  );

  return (
    <AnimatedTouchable
      activeOpacity={0.92}
      onPress={handleCardPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card.bg,
          borderColor: isGlass ? (animatedBorderColor as any) : colors.card.border,
          shadowColor: isGlass ? '#818CF8' : colors.card.shadow,
          shadowRadius: isGlass ? 18 : (Shadows.card as any).shadowRadius,
          borderRadius: isGlass ? 24 : themeId === 'aurora' ? 22 : Radii.lg,
          borderWidth: isGlass ? 1.5 : themeId === 'aurora' ? 0 : 1,
          shadowOpacity:
            themeId === 'aurora'
              ? 0.08
              : isGlass
              ? (animatedShadowOpacity as any)
              : (Shadows.card as any).shadowOpacity,
          ...(Platform.OS === 'web' && isGlass
            ? ({
                backdropFilter: 'blur(24px) saturate(140%)',
                WebkitBackdropFilter: 'blur(24px) saturate(140%)',
                boxShadow:
                  '0 12px 36px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
              } as any)
            : Platform.OS === 'web' && themeId === 'aurora'
            ? ({
                boxShadow: '0 8px 24px 0 rgba(20, 5, 60, 0.20)',
              } as any)
            : {}),
        },
      ]}
    >
      {isGlass && (
        <Animated.View
          style={[
            styles.specularHighlight,
            { opacity: animatedSpecularOpacity },
          ]}
          pointerEvents="none"
        />
      )}
      <View
        style={[
          styles.imageContainer,
          {
            backgroundColor: colors.surfaceHighlight,
            borderTopLeftRadius: isGlass ? 23 : themeId === 'aurora' ? 22 : Radii.lg - 1,
            borderTopRightRadius: isGlass ? 23 : themeId === 'aurora' ? 22 : Radii.lg - 1,
          },
        ]}
      >
        <Image
          source={{ uri: campaign.coverImage }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.badgeOverlay}>
          <CategoryBadge category={campaign.category} size="sm" />
          <StatusPill status={campaign.status} size="sm" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {campaign.title}
        </Text>

        <View style={styles.creatorRow}>
          <Image
            source={{ uri: campaign.creator.avatar }}
            style={[styles.creatorAvatar, { backgroundColor: colors.surfaceHighlight }]}
          />
          <View style={styles.creatorTextCol}>
            <View style={styles.nameRow}>
              <Text style={[styles.creatorName, { color: colors.textPrimary }]} numberOfLines={1}>
                {campaign.creator.name}
              </Text>
              {campaign.creator.verifiedIdentity && (
                <ShieldCheck size={13} color={colors.accent} />
              )}
            </View>
            {campaign.creator.organization && (
              <Text style={[styles.creatorOrg, { color: colors.textMuted }]} numberOfLines={1}>
                {campaign.creator.organization}
              </Text>
            )}
          </View>
        </View>

        <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
          {campaign.summary}
        </Text>

        <View style={styles.fundingSection}>
          <ProgressBar
            current={campaign.funding.raised}
            target={campaign.funding.goal}
            barHeight={5}
            tintColor={colors.primary}
          />
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.reachPill, { backgroundColor: colors.surfaceSubtle }]}>
            <Eye size={13} color={colors.textSecondary} />
            <Text style={[styles.reachText, { color: colors.textSecondary }]}>
              Goal Reach: ~{ReachCalculator.formatNumber(estimatedImpressionsAtGoal)} views
            </Text>
          </View>
          <Text style={[styles.daysText, { color: colors.textMuted }]}>
            {campaign.funding.deadlineDaysRemaining > 0
              ? `${campaign.funding.deadlineDaysRemaining}d remaining`
              : 'Goal reached'}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {showBackAction && (
            <Button
              title="Back This Campaign"
              onPress={handleBackPress as any}
              variant={campaign.status === 'funding' ? 'primary' : 'secondary'}
              size="sm"
              style={styles.backButton}
              disabled={campaign.status !== 'funding'}
            />
          )}

          <View style={styles.iconButtons}>
            {onToggleSave && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleSave(campaign.id);
                }}
                style={styles.iconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Bookmark
                  size={18}
                  color={isSaved ? colors.primary : colors.textSecondary}
                  fill={isSaved ? colors.primary : 'transparent'}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleShare}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Share2 size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  creatorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  creatorTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 12,
    fontWeight: '600',
  },
  creatorOrg: {
    fontSize: 11,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  fundingSection: {
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reachPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.xs,
  },
  reachText: {
    fontSize: 11,
    fontWeight: '600',
  },
  daysText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  backButton: {
    flex: 1,
  },
  iconButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  specularHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 1,
    zIndex: 20,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
        } as any)
      : {}),
  },
});
