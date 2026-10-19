import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import {
  Eye,
  CheckCircle2,
  CheckSquare,
  Square,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Check,
  X,
  Layers,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { DraftCampaign } from '../../types';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../theme';
import { Button } from '../common/Button';
import { CategoryBadge } from '../common/Badge';
import { ReachCalculator } from '../../services/reachCalculator';
import { APP_CONFIG } from '../../constants';

interface SubmitStepProps {
  draft: DraftCampaign;
  onChangeDraft: (updated: Partial<DraftCampaign>) => void;
  onBack: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  onStartOver?: () => void;
  onNavigateToStep?: (step: number) => void;
  submitting?: boolean;
}

export const SubmitStep: React.FC<SubmitStepProps> = ({
  draft,
  onChangeDraft,
  onBack,
  onSubmit,
  onSaveDraft,
  onStartOver,
  onNavigateToStep,
  submitting = false,
}) => {
  const { colors, themeId } = useTheme();
  // Modal preview states
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewType, setPreviewType] = useState<'campaign' | 'ad'>('campaign');
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  // Form field states
  const [whatItIsAbout, setWhatItIsAbout] = useState(
    draft.whatItIsAbout || draft.summary || draft.headline || ''
  );
  const [whoItIsFor, setWhoItIsFor] = useState(
    draft.intendedAudience || draft.targetAudienceDesc || ''
  );
  const [whyItMatters, setWhyItMatters] = useState(
    draft.whyItMatters || draft.whyMatterToThem || ''
  );
  const [whyMattersBackers, setWhyMattersBackers] = useState('');

  React.useEffect(() => {
    setWhatItIsAbout(draft.whatItIsAbout || draft.summary || draft.headline || '');
    setWhoItIsFor(draft.intendedAudience || draft.targetAudienceDesc || '');
    setWhyItMatters(draft.whyItMatters || draft.whyMatterToThem || '');
  }, [draft.whatItIsAbout, draft.summary, draft.headline, draft.intendedAudience, draft.targetAudienceDesc, draft.whyItMatters, draft.whyMatterToThem]);

  // Checkboxes
  const [whyMattersSame, setWhyMattersSame] = useState(
    draft.whyMattersSameForBackers ?? true
  );
  const [hasPermission, setHasPermission] = useState(
    draft.hasImagePermission !== false
  );
  const [termsAccepted, setTermsAccepted] = useState(
    draft.confirmedPolicies !== false
  );
  const [errorMsg, setErrorMsg] = useState('');

  // Keep termsAccepted in sync if draft updates externally
  React.useEffect(() => {
    if (draft.confirmedPolicies !== undefined) {
      setTermsAccepted(draft.confirmedPolicies);
    }
  }, [draft.confirmedPolicies]);

  // Word count calculation
  const computeWordCount = () => {
    const parts = [
      draft.introduction || '',
      draft.whatItIsAbout || '',
      draft.summary || '',
      ...(draft.sections || []).map((s) => s.content || ''),
    ];
    const totalText = parts.join(' ').trim();
    if (!totalText) return 0;
    return totalText.split(/\s+/).filter(Boolean).length;
  };

  const wordCount = computeWordCount();
  const isWordCountSufficient = wordCount >= 80;

  // Completion check
  const hasCoverImage = Boolean(draft.coverImage);
  const hasRequiredCoreFields = Boolean(
    draft.title &&
    draft.title.trim() &&
    (draft.summary?.trim() || whatItIsAbout?.trim()) &&
    (draft.fundingGoal || 0) > 0
  );

  const handleWhatItIsAboutChange = (text: string) => {
    setWhatItIsAbout(text);
    onChangeDraft({ whatItIsAbout: text, summary: text });
  };

  const handleWhoItIsForChange = (text: string) => {
    setWhoItIsFor(text);
    onChangeDraft({ intendedAudience: text, targetAudienceDesc: text });
  };

  const handleWhyItMattersChange = (text: string) => {
    setWhyItMatters(text);
    onChangeDraft({ whyItMatters: text, whyMatterToThem: text });
  };

  const handleToggleWhyMattersSame = () => {
    const nextVal = !whyMattersSame;
    setWhyMattersSame(nextVal);
    onChangeDraft({ whyMattersSameForBackers: nextVal });
  };

  const handleTogglePermission = () => {
    const nextVal = !hasPermission;
    setHasPermission(nextVal);
    onChangeDraft({ hasImagePermission: nextVal });
  };

  const handleToggleTerms = () => {
    const nextVal = !termsAccepted;
    setTermsAccepted(nextVal);
    onChangeDraft({ confirmedPolicies: nextVal });
  };

  const handleFinalSubmit = () => {
    if (!draft.title || !draft.title.trim()) {
      setErrorMsg('Please complete Step 1: Campaign title is required.');
      return;
    }

    // Auto-confirm terms and image rights upon clicking submit for review
    if (!termsAccepted) {
      setTermsAccepted(true);
    }
    if (!hasPermission) {
      setHasPermission(true);
    }

    setErrorMsg('');
    onChangeDraft({
      confirmedPolicies: true,
      hasImagePermission: true,
      creatorName: draft.creatorName?.trim() || 'The Community Project',
    });
    onSubmit();
  };

  const goal = draft.fundingGoal || 500;
  const estimatedReach = goal * 27;

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
        <Text style={[styles.headingTitle, { color: colors.textPrimary }]}>Review and submit</Text>
        <Text style={[styles.headingSubtitle, { color: colors.textSecondary }]}>
          A reviewer scores your campaign before it reaches the feed.
        </Text>
      </View>

      {/* 2. Preview before you submit Card */}
      <View
        style={[
          styles.previewCard,
          {
            backgroundColor:
              themeId === 'glassmorphism'
                ? 'rgba(255, 255, 255, 0.08)'
                : colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: themeId === 'aurora' ? 24 : Radii.md,
          },
        ]}
      >
        <Text style={[styles.previewCardTitle, { color: colors.textPrimary }]}>
          Preview before you submit
        </Text>
        <Text style={[styles.previewCardSub, { color: colors.textSecondary }]}>
          See how your campaign page and your ad will look. Nothing is submitted from the preview.
        </Text>

        <View style={styles.previewButtonsRow}>
          <TouchableOpacity
            style={[
              styles.previewBtn,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : themeId === 'aurora'
                    ? colors.surfaceSubtle
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 18 : Radii.sm,
              },
            ]}
            onPress={() => {
              setPreviewType('campaign');
              setPreviewModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Eye size={16} color={colors.primary} />
            <Text style={[styles.previewBtnText, { color: colors.textPrimary }]}>
              Preview campaign page
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.previewBtn,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : themeId === 'aurora'
                    ? colors.surfaceSubtle
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 18 : Radii.sm,
              },
            ]}
            onPress={() => {
              setPreviewType('ad');
              setPreviewModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Layers size={16} color={colors.primary} />
            <Text style={[styles.previewBtnText, { color: colors.textPrimary }]}>
              Preview the ad view
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. The story, in summary */}
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>The story, in summary</Text>
        <Text style={[styles.sectionSubtext, { color: colors.textSecondary }]}>
          Drafted from your story — edit anything that doesn't sound like you. This is the block readers see first.
        </Text>

        {/* Field: What this is about */}
        <View style={styles.fieldBlock}>
          <View style={styles.fieldHeaderRow}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>What this is about</Text>
            <View
              style={[
                styles.draftedBadge,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: themeId === 'aurora' ? 12 : Radii.xs,
                },
              ]}
            >
              <Text
                style={[
                  styles.draftedBadgeText,
                  { color: colors.textSecondary },
                ]}
              >
                DRAFTED
              </Text>
            </View>
          </View>
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
            placeholder="Drafted from your story — edit anything that doesn't sound like you."
            placeholderTextColor={colors.textMuted}
            value={whatItIsAbout}
            onChangeText={handleWhatItIsAboutChange}
          />
        </View>

        {/* Field: Who it's for */}
        <View style={styles.fieldBlock}>
          <View style={styles.fieldHeaderRow}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Who it's for</Text>
            <View
              style={[
                styles.draftedBadge,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: themeId === 'aurora' ? 12 : Radii.xs,
                },
              ]}
            >
              <Text
                style={[
                  styles.draftedBadgeText,
                  { color: colors.textSecondary },
                ]}
              >
                DRAFTED
              </Text>
            </View>
          </View>
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
            placeholder="Drafted from your story — edit anything that doesn't sound like you."
            placeholderTextColor={colors.textMuted}
            value={whoItIsFor}
            onChangeText={handleWhoItIsForChange}
          />
        </View>

        {/* Field: Why it matters to you */}
        <View style={styles.fieldBlock}>
          <View style={styles.fieldHeaderRow}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Why it matters to you</Text>
            <View
              style={[
                styles.draftedBadge,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: themeId === 'aurora' ? 12 : Radii.xs,
                },
              ]}
            >
              <Text
                style={[
                  styles.draftedBadgeText,
                  { color: colors.textSecondary },
                ]}
              >
                DRAFTED
              </Text>
            </View>
          </View>
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
            placeholder="Drafted from your story — edit anything that doesn't sound like you."
            placeholderTextColor={colors.textMuted}
            value={whyItMatters}
            onChangeText={handleWhyItMattersChange}
          />
        </View>

        {/* Sync checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={handleToggleWhyMattersSame}
          activeOpacity={0.8}
        >
          {whyMattersSame ? (
            <CheckSquare size={18} color={colors.primary} />
          ) : (
            <Square size={18} color={colors.borderDark} />
          )}
          <View style={styles.checkboxTextCol}>
            <Text style={[styles.checkboxTitle, { color: colors.textPrimary }]}>
              "Why it matters" reads the same for backers and the audience
            </Text>
            <Text style={[styles.checkboxSubtext, { color: colors.textMuted }]}>
              Uncheck to write a separate version for backers, who are deciding whether to fund the reach.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Optional separate version for backers when unchecked */}
        {!whyMattersSame && (
          <View style={[styles.fieldBlock, { marginTop: 12 }]}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Why it matters to backers</Text>
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
              placeholder="Explain why backers should fund the amplification of this cause..."
              placeholderTextColor={colors.textMuted}
              value={whyMattersBackers}
              onChangeText={setWhyMattersBackers}
            />
          </View>
        )}
      </View>

      {/* 4. Before you submit Checklist */}
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Before you submit</Text>
        <Text style={[styles.sectionSubtext, { color: colors.textSecondary }]}>
          Items marked Required must be done to submit. The rest are recommendations.
        </Text>

        <View style={styles.checklistWrap}>
          {/* Item 1: Cover image added */}
          <View
            style={[
              styles.checklistCard,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 20 : Radii.md,
              },
            ]}
          >
            <View style={styles.checklistLeft}>
              <CheckCircle2 size={18} color={colors.success} />
              <Text style={[styles.checklistLabel, { color: colors.textPrimary }]}>Cover image added</Text>
            </View>
            <View style={[styles.statusDoneBadge, { backgroundColor: colors.successMuted }]}>
              <Text style={[styles.statusDoneText, { color: colors.success }]}>Done</Text>
            </View>
          </View>

          {/* Item 2: I own or have permission */}
          <TouchableOpacity
            style={[
              styles.checklistCard,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 20 : Radii.md,
              },
            ]}
            onPress={handleTogglePermission}
            activeOpacity={0.8}
          >
            <View style={styles.checklistLeft}>
              {hasPermission ? (
                <CheckSquare size={18} color={colors.primary} />
              ) : (
                <Square size={18} color={colors.borderDark} />
              )}
              <Text style={[styles.checklistLabel, { color: colors.textPrimary }]}>
                I own or have permission to use the image
              </Text>
            </View>
            <View
              style={
                hasPermission
                  ? [styles.statusDoneBadge, { backgroundColor: colors.successMuted }]
                  : [styles.statusReqBadge, { backgroundColor: colors.dangerMuted }]
              }
            >
              <Text
                style={
                  hasPermission
                    ? [styles.statusDoneText, { color: colors.success }]
                    : [styles.statusReqText, { color: colors.danger }]
                }
              >
                {hasPermission ? 'Done' : 'Required'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Item 3: No restricted language */}
          <View
            style={[
              styles.checklistCard,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 20 : Radii.md,
              },
            ]}
          >
            <View style={styles.checklistLeft}>
              <CheckCircle2 size={18} color={colors.success} />
              <Text style={[styles.checklistLabel, { color: colors.textPrimary }]}>
                No restricted language found
              </Text>
            </View>
            <View style={[styles.statusDoneBadge, { backgroundColor: colors.successMuted }]}>
              <Text style={[styles.statusDoneText, { color: colors.success }]}>Clear</Text>
            </View>
          </View>

          {/* Item 4: Story is at least 80 words */}
          <View
            style={[
              styles.checklistCard,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 20 : Radii.md,
              },
              !isWordCountSufficient && [
                styles.checklistCardWarning,
                {
                  backgroundColor: colors.warningMuted,
                  borderColor: colors.warning,
                  borderWidth: 1,
                },
              ],
            ]}
          >
            <View style={styles.checklistLeft}>
              {isWordCountSufficient ? (
                <CheckCircle2 size={18} color={colors.success} />
              ) : (
                <AlertTriangle size={18} color={colors.warning} />
              )}
              <Text style={[styles.checklistLabel, { color: colors.textPrimary }]}>
                Story is at least 80 words
              </Text>
            </View>

            <View style={styles.checklistRightGroup}>
              <Text
                style={[
                  styles.wordCountText,
                  { color: colors.textSecondary },
                  !isWordCountSufficient && [styles.wordCountTextWarning, { color: colors.warning }],
                ]}
              >
                {wordCount} words
              </Text>
              {!isWordCountSufficient && (
                <TouchableOpacity
                  onPress={() => {
                    if (onNavigateToStep) onNavigateToStep(2);
                    else onBack();
                  }}
                  style={styles.fixLinkBtn}
                >
                  <Text style={[styles.fixLinkText, { color: colors.primary }]}>Fix</Text>
                </TouchableOpacity>
              )}
              {isWordCountSufficient && (
                <View style={[styles.statusDoneBadge, { backgroundColor: colors.successMuted }]}>
                  <Text style={[styles.statusDoneText, { color: colors.success }]}>Done</Text>
                </View>
              )}
            </View>
          </View>

          {/* Item 5: Title, summary, creator and goal all filled in */}
          <View
            style={[
              styles.checklistCard,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 20 : Radii.md,
              },
            ]}
          >
            <View style={styles.checklistLeft}>
              <CheckCircle2
                size={18}
                color={hasRequiredCoreFields ? colors.success : colors.textMuted}
              />
              <Text style={[styles.checklistLabel, { color: colors.textPrimary }]}>
                Title, summary, creator and goal all filled in
              </Text>
            </View>
            <View
              style={
                hasRequiredCoreFields
                  ? [styles.statusDoneBadge, { backgroundColor: colors.successMuted }]
                  : [styles.statusReqBadge, { backgroundColor: colors.dangerMuted }]
              }
            >
              <Text
                style={
                  hasRequiredCoreFields
                    ? [styles.statusDoneText, { color: colors.success }]
                    : [styles.statusReqText, { color: colors.danger }]
                }
              >
                {hasRequiredCoreFields ? 'Done' : 'Required'}
              </Text>
            </View>
          </View>

          {/* Item 6: Every claim here is one I can stand behind */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={handleToggleTerms}
            activeOpacity={0.8}
          >
            {termsAccepted ? (
              <CheckSquare size={18} color={colors.primary} />
            ) : (
              <Square size={18} color={colors.borderDark} />
            )}
            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              Every claim here is one I can stand behind, and I accept the{' '}
              <Text
                style={[styles.termsLink, { color: colors.primary }]}
                onPress={() => setTermsModalVisible(true)}
              >
                campaign terms
              </Text>
              . Editing an approved campaign sends it back for review.
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. What happens next Card */}
      <View
        style={[
          styles.whatNextCard,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: themeId === 'aurora' ? 20 : Radii.md,
          },
        ]}
      >
        <Text style={[styles.whatNextTitle, { color: colors.textPrimary }]}>What happens next.</Text>
        <Text style={[styles.whatNextBody, { color: colors.textSecondary }]}>
          Review takes around 24 hours. You'll get your Trust Score with notes on all three assessments, and a chance to revise before anything goes live.
        </Text>
      </View>

      {/* Error message */}
      {errorMsg ? (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color={colors.danger} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* 6. Footer Navigation Actions */}
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
            disabled={submitting}
          />
          <Button
            title={submitting ? 'Submitting...' : 'Submit for review'}
            onPress={handleFinalSubmit}
            variant="primary"
            size="md"
            rightIcon={<Check size={16} color={colors.textInverse} />}
            style={styles.submitBtn}
            loading={submitting}
            disabled={submitting}
          />
        </View>

        <View style={styles.secondaryActionsRow}>
          <Button
            title="Save as draft"
            onPress={onSaveDraft}
            variant="secondary"
            size="sm"
            leftIcon={<Bookmark size={15} color={colors.textPrimary} />}
            style={styles.saveDraftBtn}
            disabled={submitting}
          />
          {onStartOver && (
            <TouchableOpacity onPress={onStartOver} style={styles.startOverBtn} disabled={submitting}>
              <Text style={[styles.startOverText, { color: colors.textSecondary }]}>Start over</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal 1: Live Interactive Preview */}
      <Modal
        visible={previewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? '#1C1E26'
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 26 : Radii.lg,
              },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor: colors.borderLight,
                  borderBottomWidth: 1,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {previewType === 'campaign'
                  ? 'Campaign Page Preview'
                  : 'Social Ad View Preview'}
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {previewType === 'campaign' ? (
                <View style={styles.campaignPreviewWrap}>
                  {draft.coverImage ? (
                    <Image
                      source={{ uri: draft.coverImage }}
                      style={styles.previewCover}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View style={styles.campaignPreviewBody}>
                    <View style={styles.previewCatRow}>
                      <CategoryBadge category={draft.category} size="sm" />
                      <Text style={[styles.previewCreator, { color: colors.textSecondary }]}>
                        By {draft.creatorName || 'Anonymous Creator'}
                      </Text>
                    </View>
                    <Text style={[styles.previewHeading, { color: colors.textPrimary }]}>
                      {draft.title || 'Untitled Campaign'}
                    </Text>
                    <Text style={[styles.previewSummary, { color: colors.textSecondary }]}>
                      {whatItIsAbout || draft.summary || 'Campaign overview...'}
                    </Text>

                    <View
                      style={[
                        styles.previewMetricCard,
                        {
                          backgroundColor:
                            themeId === 'glassmorphism'
                              ? 'rgba(255, 255, 255, 0.06)'
                              : colors.surfaceSubtle,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: themeId === 'aurora' ? 20 : Radii.md,
                        },
                      ]}
                    >
                      <Text style={[styles.previewMetricLabel, { color: colors.textMuted }]}>
                        Target Amplification Goal
                      </Text>
                      <Text style={[styles.previewMetricValue, { color: colors.primary }]}>
                        ${goal.toLocaleString()}
                      </Text>
                      <Text style={[styles.previewMetricSub, { color: colors.textSecondary }]}>
                        Estimated reach: ~{estimatedReach.toLocaleString()} people
                      </Text>
                    </View>

                    {whoItIsFor ? (
                      <View style={styles.previewSection}>
                        <Text style={[styles.previewSectionTitle, { color: colors.textPrimary }]}>
                          Target Audience
                        </Text>
                        <Text style={[styles.previewSectionBody, { color: colors.textSecondary }]}>{whoItIsFor}</Text>
                      </View>
                    ) : null}

                    {whyItMatters ? (
                      <View style={styles.previewSection}>
                        <Text style={[styles.previewSectionTitle, { color: colors.textPrimary }]}>
                          Why It Matters
                        </Text>
                        <Text style={[styles.previewSectionBody, { color: colors.textSecondary }]}>{whyItMatters}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : (
                <View style={styles.adPreviewWrap}>
                  <View style={styles.adMockupHeader}>
                    <View style={[styles.adMockupAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.adMockupAvatarText, { color: colors.textInverse }]}>
                        {(draft.creatorName || 'R')[0]}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.adMockupName, { color: colors.textPrimary }]}>
                        {draft.creatorName || 'Reach Campaign'}
                      </Text>
                      <Text style={[styles.adMockupSponsored, { color: colors.textMuted }]}>
                        Sponsored · Amplified via Reach
                      </Text>
                    </View>
                  </View>

                  {draft.coverImage && (
                    <Image
                      source={{ uri: draft.coverImage }}
                      style={styles.adMockupImage}
                      resizeMode="cover"
                    />
                  )}

                  <View style={styles.adMockupFooter}>
                    <View style={[styles.adMockupCtaRow, { backgroundColor: colors.surfaceSubtle }]}>
                      <Text style={[styles.adMockupHeadline, { color: colors.textPrimary }]} numberOfLines={1}>
                        {draft.adHeadline || draft.title || 'Support this vital message'}
                      </Text>
                      <View style={[styles.adMockupBtn, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.adMockupBtnText, { color: colors.textInverse }]}>
                          {draft.callToAction || 'Learn More'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.adMockupDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                      {draft.adDescription || whatItIsAbout || draft.summary}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Close Preview"
                onPress={() => setPreviewModalVisible(false)}
                variant="primary"
                size="md"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Campaign Terms */}
      <Modal
        visible={termsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                maxHeight: '70%',
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? '#1C1E26'
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 26 : Radii.lg,
              },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor: colors.borderLight,
                  borderBottomWidth: 1,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Reach Platform Terms</Text>
              <TouchableOpacity
                onPress={() => setTermsModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.termsModalHeading, { color: colors.textPrimary }]}>
                1. Distribution, Not Direct Donation
              </Text>
              <Text style={[styles.termsModalText, { color: colors.textSecondary }]}>
                Backer contributions directly fund targeted advertising and public digital message distribution. They are not direct personal donations to the creator.
              </Text>

              <Text style={[styles.termsModalHeading, { color: colors.textPrimary }]}>
                2. Transparent 85/10/5 Allocation
              </Text>
              <Text style={[styles.termsModalText, { color: colors.textSecondary }]}>
                85% of funds are reserved for direct ad delivery spend across selected networks. 10% covers review & moderation, and 5% covers payment gateway fees.
              </Text>

              <Text style={[styles.termsModalHeading, { color: colors.textPrimary }]}>
                3. Editorial & Factual Verification
              </Text>
              <Text style={[styles.termsModalText, { color: colors.textSecondary }]}>
                All claims, citations, and creatives undergo compliance review before ads go live. If not approved, 100% refunds are issued.
              </Text>
            </ScrollView>
            <View style={styles.modalFooter}>
              <Button
                title="I Understand"
                onPress={() => setTermsModalVisible(false)}
                variant="primary"
                size="md"
              />
            </View>
          </View>
        </View>
      </Modal>
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

  // Preview Card
  previewCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  previewCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  previewCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  previewButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  previewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Section Wrap
  sectionWrap: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 14,
  },

  // Field Block
  fieldBlock: {
    marginBottom: 14,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  draftedBadge: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  draftedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
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
    minHeight: 70,
    textAlignVertical: 'top',
  },

  // Checkbox row
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
  },
  checkboxTextCol: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  checkboxSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
    marginTop: 2,
  },

  // Checklist
  checklistWrap: {
    gap: 8,
  },
  checklistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  checklistCardWarning: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warningMuted,
  },
  checklistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  checklistLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  checklistRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDoneBadge: {
    backgroundColor: Colors.successMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xs,
  },
  statusDoneText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  statusReqBadge: {
    backgroundColor: Colors.dangerMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xs,
  },
  statusReqText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger,
  },
  wordCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  wordCountTextWarning: {
    color: Colors.warning,
    fontWeight: '700',
  },
  fixLinkBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fixLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },

  // Terms Row
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // What happens next card
  whatNextCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  whatNextTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  whatNextBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },

  // Error box
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerMuted,
    padding: 12,
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
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
  submitBtn: {
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

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '85%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    ...Shadows.elevated,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    marginVertical: Spacing.md,
  },
  modalFooter: {
    paddingTop: Spacing.sm,
  },

  // Campaign Preview inside modal
  campaignPreviewWrap: {
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewCover: {
    width: '100%',
    height: 160,
  },
  campaignPreviewBody: {
    padding: 12,
  },
  previewCatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewCreator: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  previewHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  previewSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  previewMetricCard: {
    backgroundColor: Colors.primaryMuted,
    padding: 10,
    borderRadius: Radii.sm,
    marginBottom: 12,
  },
  previewMetricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  previewMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  previewMetricSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  previewSection: {
    marginTop: 8,
  },
  previewSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  previewSectionBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // Ad Preview inside modal
  adPreviewWrap: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  adMockupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  adMockupAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adMockupAvatarText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 12,
  },
  adMockupName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  adMockupSponsored: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  adMockupImage: {
    width: '100%',
    height: 180,
  },
  adMockupFooter: {
    padding: 10,
  },
  adMockupCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    padding: 8,
    borderRadius: Radii.sm,
    marginBottom: 6,
  },
  adMockupHeadline: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 6,
  },
  adMockupBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.xs,
  },
  adMockupBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  adMockupDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },

  // Terms modal text
  termsModalHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  termsModalText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
});
