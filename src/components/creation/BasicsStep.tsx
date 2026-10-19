import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Sparkles, ChevronDown, Check, X, Mic, Lock } from 'lucide-react-native';
import { DraftCampaign } from '../../types';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../theme';
import { CATEGORIES } from '../../constants';
import { Button } from '../common/Button';
import { AIDraftingService } from '../../services/aiDraftingService';
import { useReachie } from '../../context/ReachieContext';

interface BasicsStepProps {
  draft: DraftCampaign;
  onChangeDraft: (updated: Partial<DraftCampaign>) => void;
  onContinue: () => void;
  onSaveDraft: () => void;
  onOpenVoiceModal?: () => void;
}

export const BasicsStep: React.FC<BasicsStepProps> = ({
  draft,
  onChangeDraft,
  onContinue,
  onSaveDraft,
}) => {
  const { colors, themeId } = useTheme();
  const { openReachie } = useReachie();
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth >= 600;

  const [aiPrompt, setAiPrompt] = useState('');
  const [generateCoverImage, setGenerateCoverImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Progressive field completion checks
  const isTitleFilled = Boolean(
    draft.title && draft.title.trim().length >= 2 && draft.title.length <= 60
  );
  const isCategoryFilled = Boolean(draft.category && draft.category.trim().length > 0);
  const isBasicsComplete = Boolean(isTitleFilled && isCategoryFilled);

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      setErrors((prev) => ({
        ...prev,
        aiPrompt: 'Please describe what your campaign is about before generating.',
      }));
      return;
    }

    setIsGenerating(true);
    setAiSuccessMessage(null);
    setErrors((prev) => ({ ...prev, aiPrompt: '' }));

    try {
      const result = await AIDraftingService.generateCampaignFromPrompt(
        aiPrompt,
        generateCoverImage
      );

      onChangeDraft({
        title: result.title,
        category: result.category,
        creatorName: result.creatorName || draft.creatorName || 'The Community Project',
        summary: result.summary,
        whatItIsAbout: result.whatItIsAbout,
        intendedAudience: result.intendedAudience,
        whyItMatters: result.whyItMatters,
        initialEvidence: result.initialEvidence,
        headline: result.title,
        adHeadline: result.adHeadline,
        adDescription: result.adDescription,
        callToAction: result.callToAction,
        coverImage:
          result.coverImage ||
          draft.coverImage ||
          'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80',
        sections: [
          {
            id: 'sec_1',
            title: 'Why This Message Matters',
            content: result.whatItIsAbout || result.summary,
          },
        ],
        fundingGoal: result.fundingGoal || draft.fundingGoal || 25000,
        confirmedPolicies: true,
        hasImagePermission: true,
      });

      setAiSuccessMessage('✨ Campaign fields populated across all steps! You can review or edit.');
      setTimeout(() => setAiSuccessMessage(null), 5000);
    } catch (e: any) {
      setErrors((prev) => ({
        ...prev,
        aiPrompt: e?.message || 'Failed to generate campaign. Please try again.',
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!draft.title || !draft.title.trim()) {
      newErrors.title = 'Campaign title is required.';
    } else if (draft.title.length > 60) {
      newErrors.title = 'Title must be 60 characters or less.';
    }

    if (!draft.category) {
      newErrors.category = 'Please select a campaign category.';
    }

    if (!draft.creatorName || !draft.creatorName.trim()) {
      onChangeDraft({ creatorName: 'The Community Project' });
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
      {/* 1. Generate Your Campaign With AI Card */}
      <View
        style={[
          styles.aiCard,
          {
            backgroundColor:
              themeId === 'glassmorphism'
                ? 'rgba(255, 255, 255, 0.08)'
                : colors.surfaceSubtle,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: themeId === 'aurora' ? 24 : Radii.md,
          },
        ]}
      >
        {/* Title Row */}
        <View style={styles.aiHeaderRow}>
          <Sparkles size={18} color={colors.primary} />
          <Text style={[styles.aiTitle, { color: colors.textPrimary }]}>
            Generate your campaign with AI
          </Text>
        </View>

        {/* Subtitle Description */}
        <Text style={[styles.aiSubtitle, { color: colors.textSecondary }]}>
          Describe your campaign in depth and we'll fill out every step for you - you can still edit
          anything afterward. Your funding goal stays yours to set on Step 5.
        </Text>

        {/* Multiline Prompt Box */}
        <TextInput
          style={[
            styles.aiInput,
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
            errors.aiPrompt && styles.inputError,
          ]}
          multiline
          numberOfLines={4}
          placeholder="Tell us what your campaign is about, who it helps, why it matters, and what backers get in return. The more detail you give, the better we can fill out the rest..."
          placeholderTextColor={colors.textMuted}
          value={aiPrompt}
          onChangeText={(val) => {
            setAiPrompt(val);
            if (errors.aiPrompt) setErrors((prev) => ({ ...prev, aiPrompt: '' }));
          }}
          textAlignVertical="top"
        />
        {errors.aiPrompt ? (
          <Text style={styles.errorText}>{errors.aiPrompt}</Text>
        ) : null}

        {/* Checkbox: Also generate a cover image */}
        <TouchableOpacity
          style={styles.checkboxRow}
          activeOpacity={0.8}
          onPress={() => setGenerateCoverImage(!generateCoverImage)}
        >
          <View
            style={[
              styles.checkboxBox,
              { borderColor: colors.border },
              generateCoverImage && [
                styles.checkboxBoxChecked,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ],
            ]}
          >
            {generateCoverImage && (
              <Check size={12} color={colors.textInverse} strokeWidth={3} />
            )}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>
            Also generate a cover image
          </Text>
        </TouchableOpacity>

        {/* Action Button */}
        <View style={styles.aiBtnRow}>
          <Button
            title={isGenerating ? 'Generating campaign...' : 'Generate with AI'}
            onPress={handleGenerateWithAI}
            variant="primary"
            size="sm"
            loading={isGenerating}
            leftIcon={
              !isGenerating ? (
                <Sparkles size={15} color={colors.textInverse} />
              ) : undefined
            }
          />
        </View>

        {/* Success message banner */}
        {aiSuccessMessage && (
          <View style={styles.aiSuccessBanner}>
            <Text style={styles.aiSuccessText}>{aiSuccessMessage}</Text>
          </View>
        )}
      </View>

      {/* 2. Campaign Basics Section Heading */}
      <View
        style={[
          styles.sectionHeaderWrap,
          {
            borderBottomColor: colors.borderLight,
            borderBottomWidth: 1,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Campaign basics</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          What is your campaign about?
        </Text>
      </View>

      {/* 3. Campaign Title Field */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
            Campaign title <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <Text
            style={[
              styles.charCounter,
              { color: colors.textMuted },
              draft.title.length > 60 && styles.charCounterOver,
            ]}
          >
            {draft.title.length}/60
          </Text>
        </View>

        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor:
                themeId === 'glassmorphism'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : colors.surface,
              borderColor: isTitleFilled ? colors.primary : colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 18 : Radii.md,
              color: colors.textPrimary,
            },
            errors.title && styles.inputError,
          ]}
          placeholder="e.g. Help save pets from being put down"
          placeholderTextColor={colors.textMuted}
          value={draft.title}
          maxLength={60}
          onChangeText={(val) => {
            onChangeDraft({ title: val });
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
        />

        {errors.title ? (
          <Text style={styles.errorText}>{errors.title}</Text>
        ) : !isTitleFilled ? (
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Enter at least 2 characters to unlock the next field (Category).
          </Text>
        ) : (
          <View style={styles.helperRow}>
            <Check size={12} color={colors.success} strokeWidth={2.5} />
            <Text style={[styles.helperUnlockedText, { color: colors.success }]}>
              Title entered · Category is now unlocked below!
            </Text>
          </View>
        )}
      </View>

      {/* 4. Category Dropdown Field */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
            Category <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          {!isTitleFilled && (
            <View style={styles.badgeLocked}>
              <Lock size={10} color={colors.textMuted} strokeWidth={2.2} />
              <Text style={[styles.badgeLockedText, { color: colors.textMuted }]}>Locked</Text>
            </View>
          )}
          {isTitleFilled && (
            <View style={[styles.badgeUnlocked, { backgroundColor: colors.successMuted }]}>
              <Check size={10} color={colors.success} strokeWidth={2.5} />
              <Text style={[styles.badgeUnlockedText, { color: colors.success }]}>
                {isCategoryFilled ? 'Completed' : 'Ready'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            {
              backgroundColor:
                !isTitleFilled
                  ? (themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.03)' : colors.surfaceSubtle)
                  : themeId === 'glassmorphism'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : colors.surface,
              borderColor: !isTitleFilled
                ? colors.borderLight
                : isCategoryFilled
                ? colors.primary
                : colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 18 : Radii.md,
              opacity: !isTitleFilled ? 0.55 : 1,
            },
            errors.category && styles.inputError,
          ]}
          disabled={!isTitleFilled}
          onPress={() => setCategoryModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.dropdownTriggerText,
              { color: colors.textPrimary },
              !draft.category && {
                color: colors.textMuted,
              },
            ]}
            numberOfLines={1}
          >
            {draft.category || (isTitleFilled ? 'Select a category' : 'Enter title first to select category')}
          </Text>
          {isTitleFilled ? (
            <ChevronDown size={18} color={colors.textSecondary} />
          ) : (
            <Lock size={16} color={colors.textMuted} strokeWidth={2.2} />
          )}
        </TouchableOpacity>

        {errors.category ? (
          <Text style={styles.errorText}>{errors.category}</Text>
        ) : !isTitleFilled ? (
          <View style={styles.helperRow}>
            <Lock size={12} color={colors.warning} />
            <Text style={[styles.helperLockedText, { color: colors.warning }]}>
              Fill in campaign title above to enable category selection
            </Text>
          </View>
        ) : (
          <View style={styles.helperRow}>
            <Check size={12} color={colors.success} strokeWidth={2.5} />
            <Text style={[styles.helperUnlockedText, { color: colors.success }]}>
              {draft.category ? `Category: ${draft.category}` : 'Tap above to select a category'}
            </Text>
          </View>
        )}
      </View>

      {/* 5. Navigation Actions */}
      <View
        style={[
          styles.footerActions,
          {
            borderTopColor: colors.borderLight,
            borderTopWidth: 1,
          },
        ]}
      >
        <Button
          title="Save as Draft"
          onPress={onSaveDraft}
          variant="secondary"
          size="md"
          style={styles.saveDraftBtn}
        />
        <Button
          title={isBasicsComplete ? 'Continue to Story →' : 'Continue to Story'}
          onPress={handleContinue}
          variant="primary"
          size="md"
          disabled={!isBasicsComplete}
          style={styles.continueBtn}
        />
      </View>

      {!isBasicsComplete && (
        <View style={styles.progressionFooterNotice}>
          <Text style={[styles.progressionFooterNoticeText, { color: colors.textMuted }]}>
            {!isTitleFilled
              ? '🔒 Step 1 of 2: Fill campaign title to enable category'
              : '🔒 Step 2 of 2: Select a category to unlock Story page'}
          </Text>
        </View>
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <TouchableOpacity
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  themeId === 'glassmorphism' ? '#1C1E26' : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select a Category</Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.categoryList}
              showsVerticalScrollIndicator={false}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = draft.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      isSelected && { backgroundColor: colors.primaryMuted },
                    ]}
                    onPress={() => {
                      onChangeDraft({ category: cat });
                      if (errors.category)
                        setErrors((prev) => ({ ...prev, category: '' }));
                      setCategoryModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        { color: isSelected ? colors.primary : colors.textPrimary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {cat}
                    </Text>
                    {isSelected && <Check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  // 1. AI Generator Card
  aiCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    ...Shadows.subtle,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  aiSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  aiInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.textPrimary,
    minHeight: 88,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    gap: 10,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: Radii.xs,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  aiBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiSuccessBanner: {
    marginTop: Spacing.md,
    padding: Spacing.sm + 2,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  aiSuccessText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  // 2. Section Header
  sectionHeaderWrap: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Form Fields
  fieldGroup: {
    marginBottom: Spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: Colors.danger,
    fontWeight: '700',
  },
  charCounter: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  charCounterOver: {
    color: Colors.danger,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    height: 48,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerMuted,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },

  // Two columns row
  columnsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  columnsRowStack: {
    flexDirection: 'column',
    gap: Spacing.xl,
  },
  columnItem: {
    flex: 1,
  },
  columnItemFull: {
    flex: 0,
    width: '100%',
  },

  // Dropdown selector
  dropdownTrigger: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    height: 48,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  dropdownPlaceholderText: {
    color: Colors.textMuted,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 18, 21, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '75%',
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
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoryList: {
    maxHeight: 340,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primaryMuted,
  },
  categoryOptionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  categoryOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Footer navigation actions
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  saveDraftBtn: {
    flex: 1,
  },
  continueBtn: {
    flex: 1.5,
  },
  badgeLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeLockedText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  badgeUnlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.xs,
  },
  badgeUnlockedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  helperLockedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  helperUnlockedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressionFooterNotice: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 4,
  },
  progressionFooterNoticeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});


