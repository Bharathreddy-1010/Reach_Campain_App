import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  Eye,
  UploadCloud,
  Check,
  Megaphone,
  Images,
  Smartphone,
  ExternalLink,
} from 'lucide-react-native';
import { DraftCampaign } from '../../types';
import { Colors, Radii, Shadows, Spacing, useTheme } from '../../theme';
import { Button } from '../common/Button';

interface VisualsStepProps {
  draft: DraftCampaign;
  onChangeDraft: (updated: Partial<DraftCampaign>) => void;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
  onStartOver?: () => void;
}

const COVER_PRESETS = [
  {
    id: 'cov_1',
    label: 'Education Classroom',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_2',
    label: 'Children & Books',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_3',
    label: 'Youth Science Lab',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_4',
    label: 'Students Learning',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_5',
    label: 'Library & Reading',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_6',
    label: 'Clean Water & Aquifer',
    url: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_7',
    label: 'Solar Clean Energy',
    url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_8',
    label: 'Urban Green Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_9',
    label: 'Animal Shelter Foster',
    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_10',
    label: 'Community Market',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_11',
    label: 'Youth Community Team',
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov_12',
    label: 'Sustainable Agriculture',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=80',
  },
];

const CTA_OPTIONS = [
  'Learn More',
  'Read Report',
  'View Safety Guide',
  'Inspect Heat Map',
  'Download Guide',
];

export const VisualsStep: React.FC<VisualsStepProps> = ({
  draft,
  onChangeDraft,
  onBack,
  onContinue,
  onSaveDraft,
  onStartOver,
}) => {
  const { colors, themeId } = useTheme();
  const [activePreviewTab, setActivePreviewTab] = useState<'instagram' | 'facebook'>('instagram');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const currentCover =
    draft.coverImage ||
    COVER_PRESETS[0].url;

  const handleSelectPreset = (url: string) => {
    onChangeDraft({ coverImage: url });
    if (errors.coverImage) setErrors((prev) => ({ ...prev, coverImage: '' }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!draft.coverImage) {
      newErrors.coverImage = 'A campaign cover image is required.';
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
      <View style={styles.sectionHeaderWrap}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Campaign visuals</Text>
      </View>

      {/* Info Banner */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor: colors.primaryMuted,
            borderRadius: themeId === 'aurora' ? 18 : Radii.md,
            borderWidth: 0,
          },
        ]}
      >
        <Eye size={16} color={colors.primary} />
        <Text style={[styles.bannerText, { color: colors.primary }]}>
          These visuals appear on your campaign page — this is what backers see.
        </Text>
      </View>

      {/* 2. Campaign cover image */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
          Campaign cover image <Text style={styles.requiredAsterisk}>*</Text>
        </Text>

        {/* Upload / Drag & Drop Box */}
        <TouchableOpacity
          style={[
            styles.uploadBox,
            {
              backgroundColor:
                themeId === 'glassmorphism'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 22 : Radii.lg,
            },
            errors.coverImage && styles.uploadBoxError,
          ]}
          activeOpacity={0.8}
          onPress={() => {
            // Cycle through presets as a simulation of upload
            const nextIdx = (COVER_PRESETS.findIndex((p) => p.url === currentCover) + 1) % COVER_PRESETS.length;
            handleSelectPreset(COVER_PRESETS[nextIdx].url);
          }}
        >
          {currentCover ? (
            <View style={styles.uploadedPreviewWrap}>
              <Image source={{ uri: currentCover }} style={styles.uploadedImagePreview} resizeMode="cover" />
              <View style={styles.uploadOverlayHint}>
                <UploadCloud size={20} color={colors.textInverse} />
                <Text style={styles.uploadOverlayText}>Tap to change cover photo</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <UploadCloud size={32} color={colors.primary} />
              <Text style={[styles.uploadMainText, { color: colors.textPrimary }]}>
                Click to upload or drag and drop
              </Text>
              <Text style={[styles.uploadSubText, { color: colors.textMuted }]}>
                JPG, PNG or WebP · max 3MB
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {errors.coverImage ? (
          <Text style={styles.errorText}>{errors.coverImage}</Text>
        ) : null}

        {/* Status indicator */}
        <View style={styles.coverStatusRow}>
          <Check size={14} color={colors.success} strokeWidth={2.5} />
          <Text style={[styles.coverStatusText, { color: colors.textSecondary }]}>
            Cover generated. Upload your own to replace it — one generation per campaign.
          </Text>
        </View>

        {/* Preset Thumbnails Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.presetScroll}
          contentContainerStyle={styles.presetContent}
        >
          {COVER_PRESETS.map((preset) => {
            const isSelected = currentCover === preset.url;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => handleSelectPreset(preset.url)}
                style={[
                  styles.presetThumb,
                  { borderColor: colors.border },
                  isSelected && [styles.presetThumbSelected, { borderColor: colors.primary }],
                ]}
                activeOpacity={0.8}
              >
                <Image source={{ uri: preset.url }} style={styles.presetImg} />
                {isSelected && (
                  <View style={[styles.presetBadge, { backgroundColor: colors.primary }]}>
                    <Check size={10} color={colors.textInverse} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
          Your image is used as uploaded. Landscape works best on the campaign page.
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      {/* 3. Campaign slideshow */}
      <View style={styles.fieldGroup}>
        <View style={styles.featureHeader}>
          <View style={[styles.featureIconBox, { backgroundColor: colors.primaryMuted }]}>
            <Images size={18} color={colors.primary} />
          </View>
          <View style={styles.featureTextCol}>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Campaign slideshow</Text>
            <Text style={[styles.featureSub, { color: colors.textSecondary }]}>
              Show a carousel at the top of your campaign page instead of a single image.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkboxCard,
            {
              backgroundColor:
                themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.08)' : colors.surface,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.8}
          onPress={() =>
            onChangeDraft({ hasSlideshow: !draft.hasSlideshow })
          }
        >
          <View
            style={[
              styles.checkboxBox,
              { borderColor: colors.border },
              draft.hasSlideshow && [
                styles.checkboxBoxChecked,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ],
            ]}
          >
            {draft.hasSlideshow && (
              <Check size={12} color={colors.textInverse} strokeWidth={3} />
            )}
          </View>
          <View style={styles.checkboxTextCol}>
            <Text style={[styles.checkboxTitle, { color: colors.textPrimary }]}>
              Add a campaign slideshow
            </Text>
            <Text style={[styles.checkboxSub, { color: colors.textSecondary }]}>Slide 1 is your cover image.</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      {/* 4. Ad visuals */}
      <View style={styles.fieldGroup}>
        <View style={styles.featureHeader}>
          <View style={[styles.featureIconBox, { backgroundColor: colors.primaryMuted }]}>
            <Megaphone size={18} color={colors.primary} />
          </View>
          <View style={styles.featureTextCol}>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Ad visuals</Text>
            <Text style={[styles.featureSub, { color: colors.textSecondary }]}>
              Your ad — and the page it opens — reuses the campaign image and text above. Only change it below if the ad needs its own.
            </Text>
          </View>
        </View>

        {/* Ad Info Banner */}
        <View style={[styles.banner, { backgroundColor: colors.primaryMuted }]}>
          <Megaphone size={15} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.primary }]}>
            These are what people see in the ad and on the page it opens.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkboxCard,
            {
              backgroundColor:
                themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.08)' : colors.surface,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.8}
          onPress={() =>
            onChangeDraft({ customAdVisuals: !draft.customAdVisuals })
          }
        >
          <View
            style={[
              styles.checkboxBox,
              { borderColor: colors.border },
              draft.customAdVisuals && [
                styles.checkboxBoxChecked,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ],
            ]}
          >
            {draft.customAdVisuals && (
              <Check size={12} color={colors.textInverse} strokeWidth={3} />
            )}
          </View>
          <View style={styles.checkboxTextCol}>
            <Text style={[styles.checkboxTitle, { color: colors.textPrimary }]}>
              Give the ad its own image and text
            </Text>
            <Text style={[styles.checkboxSub, { color: colors.textSecondary }]}>
              Add a separate headline, primary text, image and slideshow for the ad. Left off, the ad reuses your campaign visuals.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Conditional Ad customization fields if checked */}
        {draft.customAdVisuals && (
          <View style={[styles.adCustomForm, { borderTopColor: colors.borderLight }]}>
            <View style={styles.subFieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Ad headline</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor:
                      themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.08)' : colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder={draft.title || 'Ad Headline'}
                placeholderTextColor={colors.textMuted}
                value={draft.adHeadline}
                maxLength={60}
                onChangeText={(val) => onChangeDraft({ adHeadline: val })}
              />
            </View>

            <View style={styles.subFieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Ad primary text</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    backgroundColor:
                      themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.08)' : colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                multiline
                numberOfLines={3}
                placeholder={draft.summary || 'Short engaging ad text...'}
                placeholderTextColor={colors.textMuted}
                value={draft.adDescription}
                onChangeText={(val) => onChangeDraft({ adDescription: val })}
              />
            </View>

            <View style={styles.subFieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Call to Action (CTA) Button</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ctaRow}>
                {CTA_OPTIONS.map((opt) => {
                  const isSelected = (draft.callToAction || 'Learn More') === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => onChangeDraft({ callToAction: opt })}
                      style={[
                        styles.ctaChip,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : themeId === 'glassmorphism'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.ctaText,
                          { color: isSelected ? colors.textInverse : colors.textSecondary },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Live Ad Placement Mockup */}
            <View style={styles.mockupSection}>
              <View style={styles.mockupHeaderRow}>
                <View style={styles.previewTitleRow}>
                  <Smartphone size={16} color={colors.primary} />
                  <Text style={[styles.previewTitle, { color: colors.textPrimary }]}>
                    Live Ad Placement Mockup
                  </Text>
                </View>

                <View
                  style={[
                    styles.tabToggle,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => setActivePreviewTab('instagram')}
                    style={[
                      styles.tabBtn,
                      activePreviewTab === 'instagram' && [styles.tabBtnActive, { backgroundColor: colors.surface }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBtnText,
                        { color: colors.textMuted },
                        activePreviewTab === 'instagram' && { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      Instagram
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActivePreviewTab('facebook')}
                    style={[
                      styles.tabBtn,
                      activePreviewTab === 'facebook' && [styles.tabBtnActive, { backgroundColor: colors.surface }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBtnText,
                        { color: colors.textMuted },
                        activePreviewTab === 'facebook' && { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      Facebook
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={[
                  styles.mockupCard,
                  {
                    backgroundColor:
                      themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.08)' : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.mockupHeader}>
                  <View style={[styles.mockupAvatar, { backgroundColor: colors.primary }]} />
                  <View>
                    <Text style={[styles.mockupHandle, { color: colors.textPrimary }]}>
                      {draft.creatorOrg || draft.creatorName || 'Campaign Creator'}
                    </Text>
                    <Text style={[styles.mockupSponsored, { color: colors.textMuted }]}>
                      Sponsored • Verified by Reach
                    </Text>
                  </View>
                </View>
                <Image source={{ uri: currentCover }} style={styles.mockupImage} resizeMode="cover" />
                <View style={styles.mockupFooter}>
                  <View style={[styles.mockupCtaBar, { backgroundColor: colors.surfaceSubtle }]}>
                    <Text style={[styles.mockupHeadline, { color: colors.textPrimary }]} numberOfLines={1}>
                      {draft.adHeadline || draft.title || 'Campaign Headline'}
                    </Text>
                    <View style={[styles.mockupCtaButton, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.mockupCtaButtonText, { color: colors.textInverse }]}>
                        {draft.callToAction || 'Learn More'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.mockupCaption, { color: colors.textSecondary }]} numberOfLines={2}>
                    <Text style={[styles.mockupHandle, { color: colors.textPrimary }]}>
                      {draft.creatorName || 'Creator'}:{' '}
                    </Text>
                    {draft.adDescription || draft.summary || 'Campaign description for social ad feeds.'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Ad review disclaimer note */}
        <View
          style={[
            styles.adDisclaimerCard,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 18 : Radii.md,
            },
          ]}
        >
          <Text style={[styles.adDisclaimerText, { color: colors.textSecondary }]}>
            The ad always links to your campaign page on campaign.example.com, and it only runs after review.
          </Text>
        </View>
      </View>

      {/* Footer Actions */}
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
            title={Boolean(draft.coverImage) ? "Continue to Reach →" : "Continue"}
            onPress={handleContinue}
            variant="primary"
            size="md"
            disabled={!draft.coverImage}
            style={styles.continueBtn}
          />
        </View>

        {!draft.coverImage && (
          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500' }}>
              🔒 Select or upload a cover image above to unlock Reach & Budget
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
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // Info Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radii.md,
    gap: 8,
    marginBottom: Spacing.xl,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 17,
    fontWeight: '500',
  },

  // Field Groups
  fieldGroup: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: Colors.danger,
    fontWeight: '700',
  },

  // Upload Box
  uploadBox: {
    height: 180,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderDark,
    backgroundColor: Colors.surfaceSubtle,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBoxError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerMuted,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  uploadMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  uploadSubText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  uploadedPreviewWrap: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  uploadedImagePreview: {
    width: '100%',
    height: '100%',
  },
  uploadOverlayHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 18, 21, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  uploadOverlayText: {
    fontSize: 12,
    color: Colors.textInverse,
    fontWeight: '600',
  },

  // Status Row
  coverStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  coverStatusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },

  // Presets
  presetScroll: {
    marginTop: 10,
    marginHorizontal: -Spacing.lg,
  },
  presetContent: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  presetThumb: {
    width: 72,
    height: 52,
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  presetThumbSelected: {
    borderColor: Colors.primary,
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  presetBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: Colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xl,
  },

  // Feature Section Header
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: Spacing.md,
  },
  featureIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },

  // Checkbox Card
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: 12,
    ...Shadows.subtle,
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
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxTextCol: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  checkboxSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // Custom Ad Fields
  adCustomForm: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  subFieldGroup: {
    marginBottom: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 84,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  ctaRow: {
    gap: 8,
    paddingVertical: 4,
  },
  ctaChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ctaChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  ctaTextSelected: {
    color: Colors.textInverse,
  },

  // Mockup Section
  mockupSection: {
    marginTop: Spacing.lg,
  },
  mockupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radii.sm,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xs,
  },
  tabBtnActive: {
    backgroundColor: Colors.surface,
    ...Shadows.subtle,
  },
  tabBtnText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabBtnTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  mockupCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  mockupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  mockupAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
  },
  mockupHandle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mockupSponsored: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  mockupImage: {
    width: '100%',
    height: 180,
  },
  mockupFooter: {
    padding: 10,
  },
  mockupCtaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    padding: 8,
    borderRadius: Radii.sm,
    marginBottom: 6,
  },
  mockupHeadline: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 6,
  },
  mockupCtaButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.xs,
  },
  mockupCtaButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  mockupCaption: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },

  // Ad Disclaimer Box
  adDisclaimerCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  adDisclaimerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
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

