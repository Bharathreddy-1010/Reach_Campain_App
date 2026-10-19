import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import {
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  TrendingUp,
  RotateCcw,
} from 'lucide-react-native';
import { DraftCampaign } from '../../types';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../theme';
import { Button } from '../common/Button';
import { ReachCalculator } from '../../services/reachCalculator';
import { APP_CONFIG } from '../../constants';

interface ReachStepProps {
  draft: DraftCampaign;
  onChangeDraft: (updated: Partial<DraftCampaign>) => void;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
  onStartOver?: () => void;
}

interface NetworkItem {
  id: string;
  name: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeTextColor: string;
}

const NETWORKS: NetworkItem[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Ads are created paused for a human to review and activate in Meta Ads Manager.',
    badgeBg: '#1877F2',
    badgeText: 'f',
    badgeTextColor: '#FFFFFF',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Feed and Explore. Created paused for a human to review and activate in Meta Ads Manager.',
    badgeBg: '#E4405F',
    badgeText: '📷',
    badgeTextColor: '#FFFFFF',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Image ads in the YouTube feed and Shorts. Created paused for a human to activate in Google Ads.',
    badgeBg: '#FF0000',
    badgeText: '▶',
    badgeTextColor: '#FFFFFF',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    description: 'Ads are created paused for a human to review and activate in Reddit Ads Manager.',
    badgeBg: '#FF4500',
    badgeText: '👾',
    badgeTextColor: '#FFFFFF',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Ads are created as drafts for a human to review and activate in Campaign Manager.',
    badgeBg: '#0A66C2',
    badgeText: 'in',
    badgeTextColor: '#FFFFFF',
  },
  {
    id: 'x',
    name: 'X',
    description: 'Ads are created paused for a human to review and activate in X Ads Manager.',
    badgeBg: '#000000',
    badgeText: '𝕏',
    badgeTextColor: '#FFFFFF',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Ads are created paused for a human to review and activate in TikTok Ads Manager.',
    badgeBg: '#010101',
    badgeText: '♪',
    badgeTextColor: '#25F4EE',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Ads are created paused for a human to review and activate in Pinterest Ads Manager.',
    badgeBg: '#BD081C',
    badgeText: 'P',
    badgeTextColor: '#FFFFFF',
  },
];

const DURATION_OPTIONS = [14, 21, 30, 60];

export const ReachStep: React.FC<ReachStepProps> = ({
  draft,
  onChangeDraft,
  onBack,
  onContinue,
  onSaveDraft,
  onStartOver,
}) => {
  const { colors, themeId } = useTheme();
  const [goalText, setGoalText] = useState(
    draft.fundingGoal ? draft.fundingGoal.toString() : '500'
  );
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    if (draft.fundingGoal !== undefined && draft.fundingGoal !== null) {
      setGoalText(draft.fundingGoal.toString());
    }
  }, [draft.fundingGoal]);

  const numericGoal = parseInt(goalText, 10) || 0;
  const currentDuration = draft.durationDays || 30;

  // Selected networks list (default to Facebook & Instagram enabled)
  const selectedNetworks = draft.selectedNetworks || ['facebook', 'instagram'];

  const handleGoalChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setGoalText(cleaned);
    const parsed = parseInt(cleaned, 10) || 0;
    onChangeDraft({ fundingGoal: parsed });
    if (errors.goal && parsed >= 100) {
      setErrors((prev) => ({ ...prev, goal: '' }));
    }
  };

  const handleSelectDuration = (days: number) => {
    onChangeDraft({ durationDays: days });
    setShowDurationPicker(false);
  };

  const toggleNetwork = (id: string) => {
    const exists = selectedNetworks.includes(id);
    let updated: string[];
    if (exists) {
      if (selectedNetworks.length === 1) {
        return; // Keep at least one network selected
      }
      updated = selectedNetworks.filter((n) => n !== id);
    } else {
      updated = [...selectedNetworks, id];
    }
    onChangeDraft({
      selectedNetworks: updated,
      channels: updated.map((net) => {
        if (net === 'instagram') return 'Instagram';
        if (net === 'facebook') return 'Facebook';
        return 'Local Web';
      }) as any,
    });
  };

  // Estimated reach calculation: $1 buys about 27 people reached
  const estimatedReach = numericGoal > 0 ? numericGoal * 27 : 0;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (numericGoal < 100) {
      newErrors.goal = 'Minimum funding goal is $100.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onContinue();
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <View
        style={[
          styles.headerWrap,
          {
            borderBottomColor: colors.borderLight,
            borderBottomWidth: 1,
          },
        ]}
      >
        <Text style={[styles.headingTitle, { color: colors.textPrimary }]}>Reach and funding</Text>
        <Text style={[styles.headingSubtitle, { color: colors.textSecondary }]}>
          How much you're raising, and who the message should reach.
        </Text>
      </View>

      {/* 2. Funding goal & Funding window (Row) */}
      <View style={styles.goalWindowRow}>
        {/* Funding Goal */}
        <View style={styles.goalCol}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
            Funding goal <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View
            style={[
              styles.inputWithPrefix,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 18 : Radii.md,
              },
              errors.goal && styles.inputError,
            ]}
          >
            <Text style={[styles.currencyPrefix, { color: colors.textMuted }]}>$</Text>
            <TextInput
              style={[styles.numericInput, { color: colors.textPrimary }]}
              keyboardType="numeric"
              value={goalText}
              onChangeText={handleGoalChange}
              placeholder="500"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          {errors.goal ? (
            <Text style={styles.fieldErrorText}>{errors.goal}</Text>
          ) : null}
          <Text style={[styles.fieldHelperText, { color: colors.textSecondary }]}>
            $100 minimum. This is a starting point — our team reviews every campaign and confirms the final goal based on your reach and impact. You keep whatever is raised by the deadline.
          </Text>
        </View>

        {/* Funding Window Dropdown */}
        <View style={styles.windowCol}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Funding window</Text>
          <TouchableOpacity
            style={[
              styles.dropdownBtn,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 18 : Radii.md,
              },
            ]}
            onPress={() => setShowDurationPicker(!showDurationPicker)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownValue, { color: colors.textPrimary }]}>{currentDuration} days</Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {showDurationPicker && (
            <View
              style={[
                styles.dropdownMenu,
                {
                  backgroundColor:
                    themeId === 'glassmorphism' ? '#1C1E26' : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {DURATION_OPTIONS.map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.dropdownOption,
                    currentDuration === days && [
                      styles.dropdownOptionActive,
                      { backgroundColor: colors.primaryMuted },
                    ],
                  ]}
                  onPress={() => handleSelectDuration(days)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      { color: colors.textPrimary },
                      currentDuration === days && [
                        styles.dropdownOptionTextActive,
                        { color: colors.primary },
                      ],
                    ]}
                  >
                    {days} days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.fieldHelperText, { color: colors.textSecondary }]}>
            Starts the day your campaign is approved.
          </Text>
        </View>
      </View>

      {/* 3. Estimated Reach At Goal Card */}
      <View
        style={[
          styles.estimateCard,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: themeId === 'aurora' ? 24 : Radii.md,
          },
        ]}
      >
        <View style={styles.estimateHeaderRow}>
          <Text style={[styles.estimateBadge, { color: colors.textMuted }]}>ESTIMATED REACH AT GOAL</Text>
        </View>
        <Text style={[styles.estimateMainNumber, { color: colors.textPrimary }]}>
          {numericGoal > 0
            ? `~${estimatedReach.toLocaleString()} people reached`
            : 'Set a goal to see the estimate'}
        </Text>
        <Text style={[styles.estimateRateNotice, { color: colors.textPrimary }]}>
          $1 buys about 27 people reached.
        </Text>
        <Text style={[styles.estimateDisclaimer, { color: colors.textSecondary }]}>
          Estimate only — based on the current platform rate, after the 20% platform fee and payment processing. Actual delivery varies with your audience and the ad auction.
        </Text>
      </View>

      {/* 4. Who is the target audience? */}
      <View style={styles.fieldSection}>
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Who is the target audience?</Text>
        <Text style={[styles.sectionSubtext, { color: colors.textSecondary }]}>
          Describe them in your own words. Our team translates this into the ad targeting before the campaign runs.
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor:
                themeId === 'glassmorphism'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 18 : Radii.md,
              color: colors.textPrimary,
            },
          ]}
          multiline
          numberOfLines={3}
          placeholder="I want to target people in the East Coast over the age 25"
          placeholderTextColor={colors.textMuted}
          value={draft.targetAudienceDesc || draft.intendedAudience || ''}
          onChangeText={(val) =>
            onChangeDraft({
              targetAudienceDesc: val,
              intendedAudience: val,
            })
          }
        />
        <Text style={[styles.fieldHelperText, { color: colors.textSecondary }]}>
          Targeting uses broad location and interest only — never personal data about the people who see it.
        </Text>
      </View>

      {/* 5. Why would it matter to them? */}
      <View style={styles.fieldSection}>
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Why would it matter to them?</Text>
        <Text style={[styles.sectionSubtext, { color: colors.textSecondary }]}>
          Write it for someone who has never heard of your cause. This becomes "Why it matters to you" in the summary block on the audience page.
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor:
                themeId === 'glassmorphism'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 18 : Radii.md,
              color: colors.textPrimary,
            },
          ]}
          multiline
          numberOfLines={3}
          placeholder="e.g. The gap between 'I'd love a pet' and 'I actually adopted one' is almost always information, not intention."
          placeholderTextColor={colors.textMuted}
          value={draft.whyMatterToThem || draft.whyItMatters || ''}
          onChangeText={(val) =>
            onChangeDraft({
              whyMatterToThem: val,
              whyItMatters: val,
            })
          }
        />
      </View>

      {/* 6. Where should the ad run? */}
      <View style={styles.fieldSection}>
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Where should the ad run?</Text>
        <Text style={[styles.sectionSubtext, { color: colors.textSecondary }]}>
          Pick the networks your campaign should be promoted on.
        </Text>

        <View style={styles.networksList}>
          {NETWORKS.map((net) => {
            const isEnabled = selectedNetworks.includes(net.id);
            return (
              <TouchableOpacity
                key={net.id}
                style={[
                  styles.networkRow,
                  {
                    backgroundColor:
                      themeId === 'glassmorphism'
                        ? isEnabled
                          ? 'rgba(255, 255, 255, 0.14)'
                          : 'rgba(255, 255, 255, 0.06)'
                        : themeId === 'aurora'
                        ? isEnabled
                          ? colors.surfaceHighlight
                          : colors.surface
                        : isEnabled
                        ? '#FFF6EE'
                        : colors.surface,
                    borderColor: isEnabled
                      ? themeId === 'aurora'
                        ? colors.accent
                        : colors.primary
                      : colors.border,
                    borderWidth: 1,
                    borderRadius: themeId === 'aurora' ? 20 : Radii.md,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => toggleNetwork(net.id)}
              >
                <View style={[styles.networkIconBadge, { backgroundColor: net.badgeBg }]}>
                  <Text style={[styles.networkIconChar, { color: net.badgeTextColor }]}>
                    {net.badgeText}
                  </Text>
                </View>

                <View style={styles.networkInfoCol}>
                  <Text style={[styles.networkName, { color: colors.textPrimary }]}>{net.name}</Text>
                  <Text style={[styles.networkDesc, { color: colors.textSecondary }]}>{net.description}</Text>
                </View>

                <Switch
                  value={isEnabled}
                  onValueChange={() => toggleNetwork(net.id)}
                  trackColor={{
                    false: colors.borderDark,
                    true: themeId === 'aurora' ? colors.accent : colors.primary,
                  }}
                  thumbColor={isEnabled ? '#FFFFFF' : colors.textMuted}
                  ios_backgroundColor={colors.border}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 7. Footer Navigation Actions */}
      <View
        style={[
          styles.footerActions,
          {
            borderTopColor: colors.borderLight,
            borderTopWidth: 1,
          },
        ]}
      >
        <View style={styles.primaryActionsRow}>
          <Button
            title="Back"
            onPress={onBack}
            variant="outline"
            size="md"
            leftIcon={<ArrowLeft size={16} color={colors.textPrimary} />}
            style={styles.backBtn}
          />
          <Button
            title={numericGoal >= 100 ? "Continue to Submit" : "Continue"}
            onPress={handleContinue}
            variant="primary"
            size="md"
            disabled={numericGoal < 100}
            rightIcon={numericGoal >= 100 ? <ArrowRight size={16} color={colors.textInverse} /> : undefined}
            style={styles.continueBtn}
          />
        </View>

        {numericGoal < 100 && (
          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500' }}>
              🔒 Enter a valid funding goal (min $100) to unlock Review & Submit
            </Text>
          </View>
        )}

        <View style={styles.secondaryActionsRow}>
          <Button
            title="Save as draft"
            onPress={onSaveDraft}
            variant="secondary"
            size="sm"
            leftIcon={<Bookmark size={15} color={colors.textPrimary} />}
            style={styles.saveDraftBtn}
          />
          {onStartOver && (
            <TouchableOpacity onPress={onStartOver} style={styles.startOverBtn}>
              <Text style={[styles.startOverText, { color: colors.textSecondary }]}>Start over</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  headerWrap: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headingSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  goalWindowRow: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  goalCol: {
    flex: 1,
  },
  windowCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: Colors.danger,
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginRight: 6,
  },
  numericInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: 10,
  },
  fieldErrorText: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 4,
  },
  fieldHelperText: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: 6,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  dropdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dropdownMenu: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    marginTop: 4,
    ...Shadows.subtle,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownOptionActive: {
    backgroundColor: Colors.primaryMuted,
  },
  dropdownOptionText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  dropdownOptionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Estimate Card
  estimateCard: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  estimateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  estimateBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: Colors.primary,
  },
  estimateMainNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  estimateRateNotice: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  estimateDisclaimer: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // Field Section
  fieldSection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    minHeight: 74,
    textAlignVertical: 'top',
  },

  // Networks List
  networksList: {
    gap: 8,
    marginTop: 4,
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: 12,
  },
  networkRowActive: {
    borderColor: Colors.borderDark,
  },
  networkIconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  networkIconChar: {
    fontSize: 15,
    fontWeight: '800',
  },
  networkInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  networkName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  networkDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },

  // Footer Actions
  footerActions: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  primaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  backBtn: {
    flex: 1,
  },
  continueBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    width: '100%',
  },
  saveDraftBtn: {
    flex: 0,
    paddingHorizontal: 16,
  },
  startOverBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  startOverText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
