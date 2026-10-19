import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Mic, MicOff, Sparkles, X, Volume2 } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing, Typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { AIDraftingService, SAMPLE_VOICE_PROMPTS, AISuggestionResult } from '../../services/aiDraftingService';
import { Button } from '../common/Button';

interface VoiceDraftModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyDraft: (draftData: AISuggestionResult) => void;
}

export const VoiceDraftModal: React.FC<VoiceDraftModalProps> = ({
  visible,
  onClose,
  onApplyDraft,
}) => {
  const { colors, themeId } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech recognition capturing text
      setTimeout(() => {
        setTranscript(
          'We want to run an ad campaign warning families about arsenic in domestic borewell water, distributing simple 4-minute testing guides to affected river communities.'
        );
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setTranscript(sampleText);
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    try {
      const result = await AIDraftingService.draftFromVoiceTranscript(transcript);
      onApplyDraft(result);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: themeId === 'glassmorphism' ? '#1C1E26' : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <View style={[styles.sheetHeader, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.titleRow}>
              <Sparkles size={18} color={colors.accent || colors.primary} />
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                Voice-Assisted Campaign Draft
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.disclaimerBox,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.disclaimerTitle, { color: colors.accent || colors.primary }]}>
                {AIDraftingService.getServiceLabel()}
              </Text>
              <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                Describe your message in natural language. We will automatically structure the headline, story summary, and target audience fields.
              </Text>
            </View>

            {/* Mic Button */}
            <View style={styles.micSection}>
              <TouchableOpacity
                onPress={handleToggleRecord}
                style={[
                  styles.micCircle,
                  {
                    backgroundColor: isRecording ? colors.primary : colors.surfaceHighlight,
                    borderColor: isRecording ? colors.primary : colors.borderDark,
                  },
                ]}
                activeOpacity={0.8}
              >
                {isRecording ? (
                  <Mic size={32} color={colors.textInverse} />
                ) : (
                  <Mic size={32} color={colors.primary} />
                )}
              </TouchableOpacity>
              <Text style={[styles.micLabel, { color: colors.textSecondary }]}>
                {isRecording ? 'Listening to voice description...' : 'Tap to simulate speaking'}
              </Text>
            </View>

            {/* Sample Prompts */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              Or choose a sample message:
            </Text>
            <View style={styles.sampleChips}>
              {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => {
                const isSelected = transcript === prompt.transcript;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectSample(prompt.transcript)}
                    style={[
                      styles.sampleChip,
                      {
                        backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Volume2 size={13} color={isSelected ? colors.primary : colors.textSecondary} />
                    <Text
                      style={[
                        styles.sampleChipText,
                        { color: isSelected ? colors.primary : colors.textPrimary },
                      ]}
                    >
                      {prompt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Transcript Input */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              Campaign Description / Transcript:
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor:
                    themeId === 'glassmorphism'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              multiline
              numberOfLines={4}
              placeholder="Speak or type what message you want to amplify to the public..."
              placeholderTextColor={colors.textMuted}
              value={transcript}
              onChangeText={setTranscript}
            />

            <View style={styles.actions}>
              <Button
                title={isProcessing ? 'Structuring Draft...' : 'Convert to Campaign Draft'}
                onPress={handleGenerate}
                loading={isProcessing}
                disabled={!transcript.trim() || isProcessing}
                size="lg"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: '85%',
    paddingBottom: 24,
    ...Shadows.elevated,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    ...Typography.sectionTitle,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  sheetBody: {
    padding: Spacing.lg,
  },
  disclaimerBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  micSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  micCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Shadows.subtle,
  },
  micCircleActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  micLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  sampleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.sm,
  },
  sampleChipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  sampleChipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 90,
    marginBottom: 20,
  },
  actions: {
    marginTop: 8,
    marginBottom: 20,
  },
});
