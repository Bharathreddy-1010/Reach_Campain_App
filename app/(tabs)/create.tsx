import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Check, CheckCircle2, Clock, Sparkles, RefreshCw, ArrowRight } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { StepIndicator } from '../../src/components/creation/StepIndicator';
import { BasicsStep } from '../../src/components/creation/BasicsStep';
import { StoryStep } from '../../src/components/creation/StoryStep';
import { VisualsStep } from '../../src/components/creation/VisualsStep';
import { ReachStep } from '../../src/components/creation/ReachStep';
import { SubmitStep } from '../../src/components/creation/SubmitStep';
import { VoiceDraftModal } from '../../src/components/creation/VoiceDraftModal';
import { Button } from '../../src/components/common/Button';
import { CampaignRepository } from '../../src/repositories/campaignRepository';
import { DraftCampaign, CreationStep, Campaign } from '../../src/types';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../src/theme';
import { AISuggestionResult } from '../../src/services/aiDraftingService';
import { useReachie } from '../../src/context/ReachieContext';

const DEFAULT_DRAFT: DraftCampaign = {
  currentStep: 1,
  lastSavedAt: new Date().toISOString(),
  title: '',
  category: '' as any,
  creatorName: 'The Community Project',
  creatorOrg: '',
  summary: '',
  coverImage:
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80',
  whatItIsAbout: '',
  intendedAudience: '',
  whyItMatters: '',
  initialEvidence: '',
  headline: '',
  introduction: '',
  sections: [
    {
      id: 'sec_1',
      title: 'Background & Evidence',
      content: '',
    },
  ],
  statistics: [],
  sources: [],
  audienceActions: [],
  adHeadline: '',
  adDescription: '',
  callToAction: 'Learn More',
  adImages: [],
  adPlacements: ['instagram_feed', 'facebook_feed'],
  targetLocations: ['Pan-India'],
  targetInterests: ['Public Health', 'Civic Action'],
  channels: ['Instagram', 'Facebook'],
  durationDays: 21,
  fundingGoal: 25000,
  hasImagePermission: true,
  confirmedPolicies: true,
};

export default function CreateScreen() {
  const router = useRouter();
  const { colors, themeId } = useTheme();
  const { activeDraft } = useReachie();
  const [draft, setDraft] = useState<DraftCampaign>(DEFAULT_DRAFT);
  const [hasExistingDraft, setHasExistingDraft] = useState(false);
  const [isSavedIndicator, setIsSavedIndicator] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [submittedCampaign, setSubmittedCampaign] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync draft live when Reachie updates or generates fields
  useEffect(() => {
    if (activeDraft) {
      setDraft((prev) => ({
        ...prev,
        ...activeDraft,
        currentStep: activeDraft.currentStep !== undefined ? activeDraft.currentStep : prev.currentStep,
      }));
      setHasExistingDraft(false);
    }
  }, [activeDraft]);

  // Load existing draft
  const checkExistingDraft = async () => {
    const saved = await CampaignRepository.getDraft();
    if (saved && saved.title) {
      setHasExistingDraft(true);
    } else {
      setHasExistingDraft(false);
      setDraft(DEFAULT_DRAFT);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkExistingDraft();
    }, [])
  );

  const handleResumeDraft = async () => {
    const saved = await CampaignRepository.getDraft();
    if (saved) {
      setDraft(saved);
      setHasExistingDraft(false);
    }
  };

  const handleStartFresh = async () => {
    await CampaignRepository.clearDraft();
    setDraft(DEFAULT_DRAFT);
    setHasExistingDraft(false);
  };

  // Autosave with debounce
  const updateDraft = (updates: Partial<DraftCampaign>) => {
    setDraft((prev) => {
      const updated = {
        ...prev,
        ...updates,
        lastSavedAt: new Date().toISOString(),
      };

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        await CampaignRepository.saveDraft(updated);
        setIsSavedIndicator(true);
        setTimeout(() => setIsSavedIndicator(false), 2000);
      }, 700);

      return updated;
    });
  };

  const handleManualSave = async () => {
    await CampaignRepository.saveDraft(draft);
    setIsSavedIndicator(true);
    setTimeout(() => setIsSavedIndicator(false), 2000);
    Alert.alert('Draft Saved', 'Your campaign draft has been securely saved to this device.');
  };

  const handleVoiceApply = (result: AISuggestionResult) => {
    updateDraft({
      title: result.title,
      category: result.category,
      summary: result.summary,
      whatItIsAbout: result.whatItIsAbout,
      intendedAudience: result.intendedAudience,
      whyItMatters: result.whyItMatters,
      initialEvidence: result.initialEvidence,
      headline: result.title,
      adHeadline: result.adHeadline,
      adDescription: result.adDescription,
      callToAction: result.callToAction,
    });
  };

  const handleStepSubmit = async () => {
    setIsSubmitting(true);
    try {
      const draftToSubmit: DraftCampaign = {
        ...draft,
        confirmedPolicies: true,
        hasImagePermission: true,
        creatorName: draft.creatorName?.trim() || 'The Community Project',
      };
      const created = await CampaignRepository.submitCampaign(draftToSubmit);
      setSubmittedCampaign(created);
      setDraft(DEFAULT_DRAFT);
      await CampaignRepository.clearDraft();
    } catch (e: any) {
      Alert.alert('Submission Error', e?.message || 'Could not submit campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progressive step completion validation
  const isBasicsComplete = Boolean(
    draft.title &&
    draft.title.trim().length >= 2 &&
    draft.title.length <= 60 &&
    draft.category &&
    draft.category.trim().length > 0
  );

  const fullDescriptionContent =
    draft.whatItIsAbout ||
    draft.introduction ||
    (draft.sections && draft.sections[0] ? draft.sections[0].content : '');

  const isStoryComplete = Boolean(
    isBasicsComplete &&
    draft.summary &&
    draft.summary.trim().length >= 10 &&
    draft.summary.trim().length <= 150 &&
    fullDescriptionContent &&
    fullDescriptionContent.trim().length >= 15
  );

  const isVisualsComplete = Boolean(
    isStoryComplete &&
    draft.coverImage &&
    draft.coverImage.trim().length > 0
  );

  const isReachComplete = Boolean(
    isVisualsComplete &&
    draft.fundingGoal &&
    draft.fundingGoal >= 100
  );

  // Maximum step user can navigate to based on prerequisite fields
  let maxAccessibleStep: CreationStep = 1;
  if (isBasicsComplete) maxAccessibleStep = 2;
  if (isStoryComplete) maxAccessibleStep = 3;
  if (isVisualsComplete) maxAccessibleStep = 4;
  if (isReachComplete) maxAccessibleStep = 5;

  // Active step is strictly constrained by maxAccessibleStep
  const activeStep = Math.min(draft.currentStep, maxAccessibleStep) as CreationStep;

  // Sync draft currentStep if it was loaded or set ahead of completed prerequisites
  useEffect(() => {
    if (draft.currentStep > maxAccessibleStep) {
      setDraft((prev) => ({ ...prev, currentStep: maxAccessibleStep }));
    }
  }, [draft.currentStep, maxAccessibleStep]);

  const handleSelectStep = (step: number) => {
    if (step <= maxAccessibleStep) {
      updateDraft({ currentStep: step as CreationStep });
    }
  };

  // If submitted, show success state
  if (submittedCampaign) {
    return (
      <ScreenWrapper scrollable={true}>
        <View style={styles.successContainer}>
          <View style={[styles.successIconBox, { backgroundColor: colors.successMuted }]}>
            <CheckCircle2 size={48} color={colors.success} />
          </View>

          <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Campaign Submitted!</Text>
          <Text style={[styles.successSub, { color: colors.textSecondary }]}>
            Your campaign has entered the platform review queue.
          </Text>

          <View
            style={[
              styles.successCard,
              {
                backgroundColor: themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.08)' : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.idRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.idLabel, { color: colors.textMuted }]}>Campaign ID:</Text>
              <Text style={[styles.idValue, { color: colors.primary }]}>{submittedCampaign.id}</Text>
            </View>
            <Text style={[styles.campaignTitle, { color: colors.textPrimary }]}>{submittedCampaign.title}</Text>
            <Text style={[styles.reviewNotice, { color: colors.textSecondary }]}>
              Our editorial compliance team will review your primary source citations and ad creatives within 24-48 hours.
            </Text>

            {/* Timeline View */}
            <View style={[styles.timeline, { borderTopColor: colors.borderLight }]}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.dotDone, { backgroundColor: colors.success }]}>
                  <Check size={10} color={colors.textInverse} />
                </View>
                <View style={styles.timelineTextCol}>
                  <Text style={[styles.timelineTitle, { color: colors.textPrimary }]}>Submitted</Text>
                  <Text style={[styles.timelineTime, { color: colors.textMuted }]}>Just now</Text>
                </View>
              </View>

              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.dotActive]} />
                <View style={styles.timelineTextCol}>
                  <Text style={[styles.timelineTitle, { color: colors.warning }]}>
                    Under Review
                  </Text>
                  <Text style={[styles.timelineTime, { color: colors.textMuted }]}>Verifying citations</Text>
                </View>
              </View>

              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.dotPending, { backgroundColor: colors.border }]} />
                <View style={styles.timelineTextCol}>
                  <Text style={[styles.timelineTitlePending, { color: colors.textMuted }]}>
                    Approved for Funding
                  </Text>
                  <Text style={[styles.timelineTime, { color: colors.textMuted }]}>Open to community backers</Text>
                </View>
              </View>

              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.dotPending, { backgroundColor: colors.border }]} />
                <View style={styles.timelineTextCol}>
                  <Text style={[styles.timelineTitlePending, { color: colors.textMuted }]}>
                    Active Distribution
                  </Text>
                  <Text style={[styles.timelineTime, { color: colors.textMuted }]}>Sponsored ad feeds live</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.successActions}>
            <Button
              title="Go to Creator Dashboard"
              onPress={() => {
                setSubmittedCampaign(null);
                setDraft(DEFAULT_DRAFT);
                router.push('/creator');
              }}
              variant="primary"
              size="lg"
              style={styles.actionBtn}
            />
            <Button
              title="View in Activity Feed"
              onPress={() => {
                setSubmittedCampaign(null);
                setDraft(DEFAULT_DRAFT);
                router.push('/activity');
              }}
              variant="secondary"
              size="md"
              style={styles.actionBtn}
            />
            <Button
              title="Start Another Campaign"
              onPress={() => {
                setSubmittedCampaign(null);
                setDraft(DEFAULT_DRAFT);
              }}
              variant="ghost"
              size="md"
              style={styles.actionBtn}
            />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={true}>
      {/* Top Creation Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor:
              themeId === 'glassmorphism'
                ? 'rgba(255, 255, 255, 0.05)'
                : colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <Text style={[styles.screenHeading, { color: colors.textPrimary }]}>Create Campaign</Text>
          {isSavedIndicator && (
            <View style={[styles.savedBadge, { backgroundColor: colors.successMuted }]}>
              <Check size={12} color={colors.success} />
              <Text style={[styles.savedText, { color: colors.success }]}>Draft Saved</Text>
            </View>
          )}
        </View>
        <Text style={[styles.screenSub, { color: colors.textSecondary }]}>
          5-Step Amplification Builder: Basics → Story → Visuals → Reach → Submit
        </Text>
      </View>

      {/* Resume Incomplete Draft Banner */}
      {hasExistingDraft && (
        <View
          style={[
            styles.resumeBanner,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 22 : Radii.md,
            },
          ]}
        >
          <View style={styles.resumeLeft}>
            <Clock size={18} color={colors.primary} />
            <View>
              <Text style={[styles.resumeTitle, { color: colors.textPrimary }]}>Incomplete Draft Found</Text>
              <Text style={[styles.resumeSub, { color: colors.textSecondary }]}>
                Would you like to resume where you left off?
              </Text>
            </View>
          </View>
          <View style={styles.resumeActions}>
            <TouchableOpacity
              onPress={handleResumeDraft}
              style={[styles.resumeBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.resumeBtnText, { color: colors.textInverse }]}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStartFresh} style={styles.discardBtn}>
              <Text style={[styles.discardBtnText, { color: colors.textMuted }]}>Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Persistent 5-Step Indicator */}
      <StepIndicator
        currentStep={activeStep}
        maxAccessibleStep={maxAccessibleStep}
        onSelectStep={handleSelectStep}
      />

      {/* Step Components */}
      {activeStep === 1 && (
        <BasicsStep
          draft={draft}
          onChangeDraft={updateDraft}
          onContinue={() => updateDraft({ currentStep: 2 })}
          onSaveDraft={handleManualSave}
          onOpenVoiceModal={() => setVoiceModalVisible(true)}
        />
      )}

      {activeStep === 2 && (
        <StoryStep
          draft={draft}
          onChangeDraft={updateDraft}
          onBack={() => updateDraft({ currentStep: 1 })}
          onContinue={() => updateDraft({ currentStep: 3 })}
          onSaveDraft={handleManualSave}
          onStartOver={handleStartFresh}
        />
      )}

      {activeStep === 3 && (
        <VisualsStep
          draft={draft}
          onChangeDraft={updateDraft}
          onBack={() => updateDraft({ currentStep: 2 })}
          onContinue={() => updateDraft({ currentStep: 4 })}
          onSaveDraft={handleManualSave}
          onStartOver={handleStartFresh}
        />
      )}

      {activeStep === 4 && (
        <ReachStep
          draft={draft}
          onChangeDraft={updateDraft}
          onBack={() => updateDraft({ currentStep: 3 })}
          onContinue={() => updateDraft({ currentStep: 5 })}
          onSaveDraft={handleManualSave}
          onStartOver={handleStartFresh}
        />
      )}

      {activeStep === 5 && (
        <SubmitStep
          draft={draft}
          onChangeDraft={updateDraft}
          onBack={() => updateDraft({ currentStep: 4 })}
          onSubmit={handleStepSubmit}
          onSaveDraft={handleManualSave}
          onStartOver={handleStartFresh}
          onNavigateToStep={handleSelectStep}
          submitting={isSubmitting}
        />
      )}

      {/* Voice Assistant Modal */}
      <VoiceDraftModal
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onApplyDraft={handleVoiceApply}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: Colors.surface,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenHeading: {
    ...Typography.screenTitle,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  savedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
  },
  screenSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    marginHorizontal: Spacing.lg,
    marginVertical: 10,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resumeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  resumeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resumeSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  resumeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resumeBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.xs,
  },
  resumeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  discardBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  discardBtnText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  successContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    paddingTop: 40,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    ...Typography.displayTitle,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  successSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  successCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: 24,
    ...Shadows.card,
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  idLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  idValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: 22,
  },
  reviewNotice: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 16,
  },
  timeline: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dotDone: {
    backgroundColor: Colors.success,
  },
  dotActive: {
    backgroundColor: Colors.warning,
    borderWidth: 3,
    borderColor: '#FEF3C7',
  },
  dotPending: {
    backgroundColor: Colors.border,
  },
  timelineTextCol: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timelineTitlePending: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  timelineTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 8,
    marginVertical: 2,
  },
  successActions: {
    width: '100%',
    gap: 10,
  },
  actionBtn: {
    width: '100%',
  },
});
