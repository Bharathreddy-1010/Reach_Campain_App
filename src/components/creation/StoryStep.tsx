import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Bold,
  Italic,
  Underline,
  List,
  Image as ImageIcon,
  Video,
  Smile,
  Type,
  Lock,
  Check,
} from 'lucide-react-native';
import { DraftCampaign, StorySource } from '../../types';
import { Colors, Radii, Shadows, Spacing, useTheme } from '../../theme';
import { Button } from '../common/Button';

interface StoryStepProps {
  draft: DraftCampaign;
  onChangeDraft: (updated: Partial<DraftCampaign>) => void;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
  onStartOver?: () => void;
}

export const StoryStep: React.FC<StoryStepProps> = ({
  draft,
  onChangeDraft,
  onBack,
  onContinue,
  onSaveDraft,
  onStartOver,
}) => {
  const { colors, themeId } = useTheme();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Full description is mapped to whatItIsAbout / introduction / first section
  const fullDescription =
    draft.whatItIsAbout ||
    draft.introduction ||
    (draft.sections && draft.sections[0] ? draft.sections[0].content : '');

  // Sources text (one per line)
  const initialSourcesText =
    draft.initialEvidence ||
    (draft.sources && draft.sources.length > 0
      ? draft.sources
          .map((s) => (s.url ? (s.title && s.title !== s.url ? `${s.title}: ${s.url}` : s.url) : s.title))
          .join('\n')
      : '');
  const [sourcesText, setSourcesText] = useState(initialSourcesText);

  React.useEffect(() => {
    if (draft.initialEvidence !== undefined) {
      setSourcesText(draft.initialEvidence);
    }
  }, [draft.initialEvidence]);

  // Formatting helpers for rich text toolbars
  const handleInsertFormatting = (
    field: 'fullDescription' | 'whyItMatters',
    prefix: string,
    suffix: string = '',
    placeholder: string = ''
  ) => {
    const snippet = `${prefix}${placeholder}${suffix}`;
    if (field === 'fullDescription') {
      const current = fullDescription || '';
      const updated = current ? `${current}\n${snippet}` : snippet;
      handleUpdateFullDescription(updated);
    } else {
      const current = draft.whyItMatters || '';
      const updated = current ? `${current}\n${snippet}` : snippet;
      onChangeDraft({ whyItMatters: updated });
    }
  };

  const handleUpdateFullDescription = (text: string) => {
    const updatedSections =
      draft.sections && draft.sections.length > 0
        ? [{ ...draft.sections[0], content: text }, ...draft.sections.slice(1)]
        : [{ id: 'sec_1', title: 'Campaign Story', content: text }];

    onChangeDraft({
      whatItIsAbout: text,
      introduction: text,
      headline: draft.headline || draft.title,
      sections: updatedSections,
    });
    if (errors.fullDescription) {
      setErrors((prev) => ({ ...prev, fullDescription: '' }));
    }
  };

  const handleUpdateSources = (text: string) => {
    setSourcesText(text);
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedSources: StorySource[] = lines.map((line, idx) => {
      const isUrl = line.startsWith('http://') || line.startsWith('https://');
      return {
        id: `src_${idx + 1}`,
        title: line,
        url: isUrl ? line : '',
        publisher: 'Primary Source',
        date: '2024',
        isPeerReviewedOrOfficial: true,
      };
    });

    onChangeDraft({
      initialEvidence: text,
      sources: parsedSources,
    });
  };

  // Progressive field completion checks
  const isSummaryFilled = Boolean(
    draft.summary && draft.summary.trim().length >= 10 && draft.summary.length <= 150
  );
  const isDescriptionFilled = Boolean(fullDescription && fullDescription.trim().length >= 15);
  const isStoryComplete = Boolean(isSummaryFilled && isDescriptionFilled);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!draft.summary || !draft.summary.trim()) {
      newErrors.summary = 'Short description is required.';
    } else if (draft.summary.length > 150) {
      newErrors.summary = 'Short description must be 150 characters or less.';
    }

    if (!fullDescription || !fullDescription.trim()) {
      newErrors.fullDescription = 'Full campaign description is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onContinue();
    }
  };

  // Reusable rich text toolbar component
  const renderToolbar = (field: 'fullDescription' | 'whyItMatters', showImage: boolean) => {
    const toolbarIconColor =
      themeId === 'glassmorphism'
        ? 'rgba(255, 255, 255, 0.85)'
        : colors.textSecondary;

    return (
      <View
        style={[
          styles.toolbar,
          {
            backgroundColor:
              themeId === 'glassmorphism'
                ? 'rgba(255, 255, 255, 0.05)'
                : colors.surfaceSubtle,
            borderBottomColor:
              themeId === 'glassmorphism'
                ? 'rgba(255, 255, 255, 0.12)'
                : colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleInsertFormatting(field, '**', '**', 'bold text')}
          style={styles.toolBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Bold size={15} color={toolbarIconColor} strokeWidth={2.4} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleInsertFormatting(field, '*', '*', 'italic text')}
          style={styles.toolBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Italic size={15} color={toolbarIconColor} strokeWidth={2.4} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleInsertFormatting(field, '_', '_', 'underlined text')}
          style={styles.toolBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Underline size={15} color={toolbarIconColor} strokeWidth={2.4} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleInsertFormatting(field, '• ', '', 'List item')}
          style={styles.toolBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <List size={15} color={toolbarIconColor} strokeWidth={2.4} />
        </TouchableOpacity>

        {showImage && (
          <TouchableOpacity
            onPress={() =>
              handleInsertFormatting(
                field,
                '![Campaign Photo](',
                ')',
                'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800'
              )
            }
            style={styles.toolBtn}
            activeOpacity={0.6}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <ImageIcon size={15} color={toolbarIconColor} strokeWidth={2.2} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() =>
            handleInsertFormatting(field, '[Video: ', ']', 'https://youtube.com/watch?v=...')
          }
          style={styles.toolBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Video size={15} color={toolbarIconColor} strokeWidth={2.2} />
        </TouchableOpacity>

        <View
          style={[
            styles.toolbarDivider,
            {
              backgroundColor:
                themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.2)' : colors.borderDark,
            },
          ]}
        />

        <TouchableOpacity
          onPress={() => handleInsertFormatting(field, '### ', '', 'Heading 3')}
          style={[
            styles.fontSizePill,
            {
              backgroundColor:
                themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.12)' : colors.surface,
              borderColor:
                themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.25)' : colors.borderDark,
            },
          ]}
          activeOpacity={0.6}
        >
          <Type size={11} color={colors.textPrimary} />
          <Text style={[styles.fontSizeText, { color: colors.textPrimary }]}>H3</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleInsertFormatting(field, '<mark>', '</mark>', 'highlighted text')}
          style={styles.colorPill}
          activeOpacity={0.6}
        >
          <Text style={[styles.colorText, { color: colors.textPrimary }]}>A</Text>
          <View
            style={[
              styles.colorUnderline,
              { backgroundColor: themeId === 'glassmorphism' ? '#0EA5E9' : colors.primary },
            ]}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.toolbarDivider,
            {
              backgroundColor:
                themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.2)' : colors.borderDark,
            },
          ]}
        />

        <TouchableOpacity
          onPress={() => handleInsertFormatting(field, ' 😊 ', '')}
          style={styles.toolBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Smile size={15} color={toolbarIconColor} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.sectionHeaderWrap,
          {
            borderBottomColor: colors.borderLight,
            borderBottomWidth: 1,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tell your story</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Pitch your message to the world.
        </Text>
      </View>

      {/* 1. Short description */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
            Short description <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <Text
            style={[
              styles.charCounter,
              { color: colors.textMuted },
              (draft.summary?.length || 0) > 150 && styles.charCounterOver,
            ]}
          >
            {draft.summary?.length || 0}/150
          </Text>
        </View>

        <TextInput
          style={[
            styles.textInput,
            styles.shortDescInput,
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
            errors.summary && styles.inputError,
          ]}
          multiline
          numberOfLines={3}
          maxLength={150}
          placeholder="A brief summary that appears on the campaign card..."
          placeholderTextColor={colors.textMuted}
          value={draft.summary}
          onChangeText={(val) => {
            onChangeDraft({ summary: val });
            if (errors.summary) setErrors((prev) => ({ ...prev, summary: '' }));
          }}
          textAlignVertical="top"
        />

        {errors.summary ? (
          <Text style={styles.errorText}>{errors.summary}</Text>
        ) : (
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            This shows as the summary at the top of your campaign page, and as your ad's main text unless you customize the ad.
          </Text>
        )}
      </View>

      {/* 2. Full campaign description */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
            Full campaign description <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          {!isSummaryFilled && (
            <View style={styles.badgeLocked}>
              <Lock size={10} color={colors.textMuted} strokeWidth={2.2} />
              <Text style={[styles.badgeLockedText, { color: colors.textMuted }]}>Locked</Text>
            </View>
          )}
          {isSummaryFilled && (
            <View style={[styles.badgeUnlocked, { backgroundColor: colors.successMuted }]}>
              <Check size={10} color={colors.success} strokeWidth={2.5} />
              <Text style={[styles.badgeUnlockedText, { color: colors.success }]}>
                {isDescriptionFilled ? 'Completed' : 'Ready'}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.editorCard,
            {
              backgroundColor:
                !isSummaryFilled
                  ? (themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.03)' : colors.surfaceSubtle)
                  : themeId === 'glassmorphism'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : colors.surface,
              borderColor: !isSummaryFilled
                ? colors.borderLight
                : isDescriptionFilled
                ? colors.primary
                : colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 22 : Radii.md,
              opacity: !isSummaryFilled ? 0.55 : 1,
            },
            errors.fullDescription && styles.editorCardError,
          ]}
        >
          {renderToolbar('fullDescription', true)}
          <TextInput
            style={[
              styles.editorTextInput,
              {
                backgroundColor: 'transparent',
                color: colors.textPrimary,
              },
            ]}
            editable={isSummaryFilled}
            multiline
            numberOfLines={6}
            placeholder={
              !isSummaryFilled
                ? '🔒 Complete short description (min 10 characters) above to unlock the full story editor...'
                : 'Every year, about 6.5 million dogs and cats enter shelters...'
            }
            placeholderTextColor={
              themeId === 'glassmorphism'
                ? 'rgba(255, 255, 255, 0.45)'
                : colors.textMuted
            }
            value={fullDescription}
            onChangeText={handleUpdateFullDescription}
            textAlignVertical="top"
          />
        </View>

        {errors.fullDescription ? (
          <Text style={styles.errorText}>{errors.fullDescription}</Text>
        ) : !isSummaryFilled ? (
          <View style={styles.helperRow}>
            <Lock size={12} color={colors.warning} />
            <Text style={[styles.helperLockedText, { color: colors.warning }]}>
              Fill in short description above (min 10 characters) to unlock the full story editor
            </Text>
          </View>
        ) : (
          <View style={styles.helperRow}>
            <Check size={12} color={colors.success} strokeWidth={2.5} />
            <Text style={[styles.helperUnlockedText, { color: colors.success }]}>
              {isDescriptionFilled
                ? 'Campaign story saved · Visuals are now unlocked!'
                : 'Short description ready · Write your full story (at least 15 characters)'}
            </Text>
          </View>
        )}
      </View>

      {/* 3. Sources */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Sources</Text>
          {!isDescriptionFilled && (
            <View style={styles.badgeLocked}>
              <Lock size={10} color={colors.textMuted} strokeWidth={2.2} />
              <Text style={[styles.badgeLockedText, { color: colors.textMuted }]}>Locked</Text>
            </View>
          )}
        </View>
        <Text style={[styles.fieldSubLabel, { color: colors.textSecondary }]}>
          List URLs or citations that support your campaign (one per line). These appear under Sources on your campaign page and will be reviewed to get the Trust Score.
        </Text>

        <View
          style={[
            styles.sourcesContainer,
            {
              backgroundColor:
                !isDescriptionFilled
                  ? (themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.03)' : colors.surfaceSubtle)
                  : themeId === 'glassmorphism'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 18 : Radii.md,
              opacity: !isDescriptionFilled ? 0.55 : 1,
            },
          ]}
        >
          <TextInput
            style={[
              styles.sourcesTextInput,
              {
                backgroundColor: 'transparent',
                color: colors.textPrimary,
              },
            ]}
            editable={isDescriptionFilled}
            multiline
            numberOfLines={4}
            placeholder={
              !isDescriptionFilled
                ? '🔒 Write campaign description above to enable sources...'
                : 'https://example.com/report\nStudy: Annual Report 2024, p. 12'
            }
            placeholderTextColor={
              themeId === 'glassmorphism'
                ? 'rgba(255, 255, 255, 0.45)'
                : colors.textMuted
            }
            value={sourcesText}
            onChangeText={handleUpdateSources}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {/* Subtle resize grip corner hint */}
          <View style={styles.resizeGripHint}>
            <View
              style={[
                styles.gripLine1,
                {
                  backgroundColor: colors.borderDark,
                },
              ]}
            />
            <View
              style={[
                styles.gripLine2,
                {
                  backgroundColor: colors.borderDark,
                },
              ]}
            />
          </View>
        </View>
        {!isDescriptionFilled && (
          <View style={styles.helperRow}>
            <Lock size={12} color={colors.textMuted} />
            <Text style={[styles.helperLockedText, { color: colors.textMuted }]}>
              Add campaign story above to enable sources & citations
            </Text>
          </View>
        )}
      </View>

      {/* 4. Why should backers care? */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Why should backers care?</Text>
          {!isDescriptionFilled && (
            <View style={styles.badgeLocked}>
              <Lock size={10} color={colors.textMuted} strokeWidth={2.2} />
              <Text style={[styles.badgeLockedText, { color: colors.textMuted }]}>Locked</Text>
            </View>
          )}
        </View>
        <Text style={[styles.fieldSubLabel, { color: colors.textSecondary }]}>
          Help backers understand the impact of supporting your campaign. Appears as "Why should I back this?" in the backer view.
        </Text>

        <View
          style={[
            styles.editorCard,
            {
              backgroundColor:
                !isDescriptionFilled
                  ? (themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.03)' : colors.surfaceSubtle)
                  : themeId === 'glassmorphism'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 22 : Radii.md,
              opacity: !isDescriptionFilled ? 0.55 : 1,
            },
          ]}
        >
          {renderToolbar('whyItMatters', false)}
          <TextInput
            style={[
              styles.editorTextInput,
              {
                minHeight: 110,
                backgroundColor: 'transparent',
                color: colors.textPrimary,
              },
            ]}
            editable={isDescriptionFilled}
            multiline
            numberOfLines={4}
            placeholder={
              !isDescriptionFilled
                ? '🔒 Write campaign description above to enable impact details...'
                : "Shelters already know what works. What they don't have is the budget to tell anyone..."
            }
            placeholderTextColor={
              themeId === 'glassmorphism'
                ? 'rgba(255, 255, 255, 0.45)'
                : colors.textMuted
            }
            value={draft.whyItMatters}
            onChangeText={(val) => onChangeDraft({ whyItMatters: val })}
            textAlignVertical="top"
          />
        </View>
        {!isDescriptionFilled && (
          <View style={styles.helperRow}>
            <Lock size={12} color={colors.textMuted} />
            <Text style={[styles.helperLockedText, { color: colors.textMuted }]}>
              Add campaign story above to enable impact details
            </Text>
          </View>
        )}
      </View>

      {/* Footer Navigation Actions */}
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
            style={styles.backBtn}
          />
          <Button
            title={isStoryComplete ? 'Continue to Visuals →' : 'Continue to Visuals'}
            onPress={handleContinue}
            variant="primary"
            size="md"
            disabled={!isStoryComplete}
            style={styles.continueBtn}
          />
        </View>

        {!isStoryComplete && (
          <View style={styles.progressionFooterNotice}>
            <Text style={[styles.progressionFooterNoticeText, { color: colors.textMuted }]}>
              {!isSummaryFilled
                ? '🔒 Step 1 of 2: Fill short description (min 10 chars) to unlock story editor'
                : '🔒 Step 2 of 2: Write campaign description (min 15 chars) to unlock Visuals'}
            </Text>
          </View>
        )}

        <View style={styles.secondaryActionsRow}>
          <Button
            title="Save as draft"
            onPress={onSaveDraft}
            variant="secondary"
            size="sm"
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

  // Header
  sectionHeaderWrap: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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

  // Field Groups
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  fieldSubLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
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

  // Short description TextInput
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  shortDescInput: {
    minHeight: 88,
    paddingTop: 12,
    paddingBottom: 12,
    lineHeight: 20,
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerMuted,
  },

  // Rich Text Editor Box
  editorCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  editorCardError: {
    borderColor: Colors.danger,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceSubtle,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toolBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.borderDark,
    marginHorizontal: 2,
  },
  fontSizePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.surface,
  },
  fontSizeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  colorPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  colorText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 14,
  },
  colorUnderline: {
    width: 12,
    height: 2,
    backgroundColor: Colors.textPrimary,
    marginTop: 1,
  },
  editorTextInput: {
    backgroundColor: 'transparent',
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 140,
    lineHeight: 21,
  },

  // Sources Monospace Box
  sourcesContainer: {
    position: 'relative',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  sourcesTextInput: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 13,
    color: Colors.textPrimary,
    padding: Spacing.md,
    minHeight: 96,
    lineHeight: 19,
  },
  resizeGripHint: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 10,
    height: 10,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  gripLine1: {
    width: 8,
    height: 1.5,
    backgroundColor: Colors.borderDark,
    transform: [{ rotate: '-45deg' }],
    marginBottom: 2,
  },
  gripLine2: {
    width: 4,
    height: 1.5,
    backgroundColor: Colors.borderDark,
    transform: [{ rotate: '-45deg' }],
  },

  // Helper & Error Texts
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

  // Footer Navigation Actions
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
    marginTop: 6,
    paddingVertical: 2,
  },
  progressionFooterNoticeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

