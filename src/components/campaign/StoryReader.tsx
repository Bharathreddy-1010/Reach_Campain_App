import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {
  ExternalLink,
  CheckCircle2,
  FileText,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from 'lucide-react-native';
import { CampaignStory } from '../../types';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../theme';

interface StoryReaderProps {
  story: CampaignStory;
  campaignTitle: string;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  campaignTitle,
}) => {
  const { colors } = useTheme();
  const [feedback, setFeedback] = useState<'yes' | 'somewhat' | 'no' | null>(null);

  const handleOpenSource = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Source Reference', `Reference URL: ${url}`);
      }
    } catch {
      Alert.alert('Source Reference', `Reference URL: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Editorial Headline & Intro */}
      <View style={styles.introBlock}>
        <Text style={[styles.headline, { color: colors.textPrimary }]}>{story.headline}</Text>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>{story.introduction}</Text>
      </View>

      {/* Key Statistics Callout */}
      {story.statistics && story.statistics.length > 0 && (
        <View style={styles.statsGrid}>
          {story.statistics.map((stat) => (
            <View key={stat.id} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textPrimary }]}>{stat.label}</Text>
              <Text style={[styles.statSource, { color: colors.textMuted }]}>Source: {stat.sourceTitle}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Narrative Sections */}
      {story.sections.map((section) => (
        <View key={section.id} style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{section.title}</Text>
          <Text style={[styles.sectionParagraph, { color: colors.textSecondary }]}>{section.content}</Text>

          {section.imageUrl && (
            <View style={styles.imageBlock}>
              <Image
                source={{ uri: section.imageUrl }}
                style={styles.sectionImage}
                resizeMode="cover"
              />
              {(section.imageCaption || section.imageCredit) && (
                <View style={[styles.captionBox, { backgroundColor: colors.surface }]}>
                  {section.imageCaption && (
                    <Text style={[styles.captionText, { color: colors.textSecondary }]}>{section.imageCaption}</Text>
                  )}
                  {section.imageCredit && (
                    <Text style={[styles.creditText, { color: colors.textMuted }]}>Credit: {section.imageCredit}</Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {/* Verified Supporting Sources */}
      {story.sources && story.sources.length > 0 && (
        <View style={[styles.sourcesContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sourcesHeader}>
            <FileText size={18} color={colors.primary} />
            <Text style={[styles.sourcesTitle, { color: colors.textPrimary }]}>Primary Sources & References</Text>
          </View>
          <Text style={[styles.sourcesDisclaimer, { color: colors.textSecondary }]}>
            These external references were submitted by the creator and reviewed for verifiable methodology.
          </Text>

          {story.sources.map((src) => (
            <TouchableOpacity
              key={src.id}
              activeOpacity={0.7}
              onPress={() => handleOpenSource(src.url)}
              style={[styles.sourceCard, { borderTopColor: colors.borderLight }]}
            >
              <View style={styles.sourceTextCol}>
                <Text style={[styles.sourceItemTitle, { color: colors.accent }]}>{src.title}</Text>
                <Text style={[styles.sourceItemMeta, { color: colors.textMuted }]}>
                  {src.publisher} • {src.date}
                </Text>
              </View>
              <ExternalLink size={16} color={colors.accent} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Suggested Audience Actions */}
      {story.audienceActions && story.audienceActions.length > 0 && (
        <View style={[styles.actionsContainer, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
          <Text style={[styles.actionsTitle, { color: colors.textPrimary }]}>What You Can Do Right Now</Text>
          {story.audienceActions.map((action, idx) => (
            <View key={idx} style={styles.actionItem}>
              <CheckCircle2 size={16} color={colors.success} style={styles.actionCheck} />
              <Text style={[styles.actionItemText, { color: colors.textSecondary }]}>{action}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Reader Reflection Feedback */}
      <View style={[styles.feedbackCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.feedbackTitle, { color: colors.textPrimary }]}>Reader Feedback</Text>
        <Text style={[styles.feedbackQuestion, { color: colors.textSecondary }]}>
          Did reading this factual message provide new perspective or inspire you to act?
        </Text>
        <View style={styles.feedbackButtons}>
          <TouchableOpacity
            onPress={() => setFeedback('yes')}
            style={[
              styles.fbButton,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
              feedback === 'yes' && [styles.fbButtonSelected, { backgroundColor: colors.accentMuted, borderColor: colors.accent }],
            ]}
          >
            <ThumbsUp
              size={15}
              color={feedback === 'yes' ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.fbText,
                { color: colors.textSecondary },
                feedback === 'yes' && [styles.fbTextSelected, { color: colors.accent }],
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFeedback('somewhat')}
            style={[
              styles.fbButton,
              feedback === 'somewhat' && styles.fbButtonSelected,
            ]}
          >
            <HelpCircle
              size={15}
              color={feedback === 'somewhat' ? Colors.accent : Colors.textSecondary}
            />
            <Text
              style={[
                styles.fbText,
                feedback === 'somewhat' && styles.fbTextSelected,
              ]}
            >
              Somewhat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFeedback('no')}
            style={[
              styles.fbButton,
              feedback === 'no' && styles.fbButtonSelected,
            ]}
          >
            <ThumbsDown
              size={15}
              color={feedback === 'no' ? Colors.accent : Colors.textSecondary}
            />
            <Text
              style={[
                styles.fbText,
                feedback === 'no' && styles.fbTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
        {feedback && (
          <Text style={styles.feedbackThankYou}>
            Thank you. Your feedback informs future editorial amplification.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  introBlock: {
    marginBottom: Spacing.xl,
  },
  headline: {
    ...Typography.sectionTitle,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  intro: {
    ...Typography.bodyLarge,
    lineHeight: 26,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 16,
    marginBottom: 6,
  },
  statSource: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  sectionBlock: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionParagraph: {
    ...Typography.bodyRegular,
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  imageBlock: {
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionImage: {
    width: '100%',
    height: 200,
  },
  captionBox: {
    padding: 10,
    backgroundColor: Colors.surface,
  },
  captionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  creditText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sourcesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  sourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sourcesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sourcesDisclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 14,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  sourceTextCol: {
    flex: 1,
    marginRight: 12,
  },
  sourceItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
    lineHeight: 18,
    marginBottom: 2,
  },
  sourceItemMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  actionsContainer: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  actionCheck: {
    marginTop: 2,
  },
  actionItemText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  feedbackCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  feedbackQuestion: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  fbButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
  },
  fbButtonSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  fbText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  fbTextSelected: {
    color: Colors.accent,
  },
  feedbackThankYou: {
    fontSize: 11,
    color: Colors.success,
    marginTop: 8,
    textAlign: 'center',
  },
});
