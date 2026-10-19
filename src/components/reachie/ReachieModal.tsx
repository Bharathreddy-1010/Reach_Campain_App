import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {
  X,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Check,
  TrendingUp,
  Square,
} from 'lucide-react-native';
import { useReachie } from '../../context/ReachieContext';
import { useTheme } from '../../theme/ThemeContext';
import { CategoryBadge } from '../common/Badge';
import { Radii, Shadows, Spacing } from '../../theme';
import { ReachieMessage, ReachieActionSuggestion } from '../../types/reachie';
import { useRouter } from 'expo-router';

export const ReachieModal: React.FC = () => {
  const router = useRouter();
  const {
    isOpen,
    closeReachie,
    messages,
    sendMessage,
    isListening,
    isProcessing,
    isSpeaking,
    isMuted,
    toggleMute,
    startVoiceInput,
    stopVoiceInput,
    stopSpeaking,
    repeatLastResponse,
    clearChat,
    pendingAction,
    confirmAction,
  } = useReachie();

  const { colors, themeId } = useTheme();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  // Audio wave animation
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.6)).current;
  const waveAnim3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isListening || isSpeaking) {
      const createWave = (anim: Animated.Value, duration: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const a1 = createWave(waveAnim1, 450);
      const a2 = createWave(waveAnim2, 600);
      const a3 = createWave(waveAnim3, 500);

      a1.start();
      a2.start();
      a3.start();

      return () => {
        a1.stop();
        a2.stop();
        a3.stop();
      };
    }
  }, [isListening, isSpeaking, waveAnim1, waveAnim2, waveAnim3]);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, isListening, isSpeaking]);

  if (!isOpen) return null;

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    sendMessage(text);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  const handleSelectSuggestion = (suggestion: ReachieActionSuggestion) => {
    sendMessage(suggestion.query);
  };

  const getStatusText = () => {
    if (isListening) return 'Listening to you...';
    if (isProcessing) return 'Thinking...';
    if (isSpeaking) return 'Speaking...';
    return 'Online · Voice & Chat Ready';
  };

  const getStatusColor = () => {
    if (isListening) return '#10B981';
    if (isProcessing) return '#F59E0B';
    if (isSpeaking) return colors.primary;
    return colors.textSecondary;
  };

  // Render text with lightweight formatting
  const renderFormattedText = (text: string, isUser: boolean) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (!line) return <View key={idx} style={{ height: 6 }} />;

      // Headings
      if (line.startsWith('### ') || line.startsWith('## ')) {
        const hText = line.replace(/^#{1,3}\s+/, '');
        return (
          <Text
            key={idx}
            style={[
              styles.headingText,
              { color: isUser ? colors.textInverse : colors.textPrimary },
            ]}
          >
            {hText}
          </Text>
        );
      }

      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const bulletText = line.slice(2);
        return (
          <View key={idx} style={styles.bulletRow}>
            <Text
              style={[
                styles.bulletDot,
                { color: isUser ? colors.textInverse : colors.primary },
              ]}
            >
              •
            </Text>
            <Text
              style={[
                styles.bulletText,
                { color: isUser ? colors.textInverse : colors.textPrimary },
              ]}
            >
              {bulletText.replace(/\*\*(.*?)\*\*/g, '$1')}
            </Text>
          </View>
        );
      }

      // Normal paragraph
      return (
        <Text
          key={idx}
          style={[
            styles.paragraphText,
            { color: isUser ? colors.textInverse : colors.textPrimary },
          ]}
        >
          {line.replace(/\*\*(.*?)\*\*/g, '$1')}
        </Text>
      );
    });
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={closeReachie}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor:
                themeId === 'glassmorphism'
                  ? '#161922'
                  : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' ? 28 : 24,
              ...(Platform.OS === 'web'
                ? ({
                    boxShadow:
                      themeId === 'aurora'
                        ? '0 -10px 40px rgba(158, 126, 103, 0.20)'
                        : '0 -10px 40px rgba(0, 0, 0, 0.4)',
                  } as any)
                : {}),
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.headerRow,
              {
                borderBottomColor: colors.borderLight,
                borderBottomWidth: 1,
              },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.reachieAvatar,
                  {
                    backgroundColor:
                      themeId === 'glassmorphism'
                        ? 'rgba(14, 165, 233, 0.2)'
                        : colors.primaryMuted,
                  },
                ]}
              >
                <Sparkles
                  size={18}
                  color={
                    themeId === 'glassmorphism'
                      ? '#0EA5E9'
                      : colors.primary
                  }
                />
              </View>
              <View>
                <Text style={[styles.assistantTitle, { color: colors.textPrimary }]}>
                  Reachie
                </Text>
                <Text style={[styles.assistantStatus, { color: getStatusColor() }]}>
                  {getStatusText()}
                </Text>
              </View>
            </View>

            <View style={styles.headerControls}>
              {isSpeaking && (
                <TouchableOpacity onPress={stopSpeaking} style={styles.iconBtn}>
                  <Square size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={toggleMute} style={styles.iconBtn}>
                {isMuted ? (
                  <VolumeX size={18} color={colors.textMuted} />
                ) : (
                  <Volume2 size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={clearChat} style={styles.iconBtn}>
                <RotateCcw size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={closeReachie} style={styles.closeBtn}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Voice Wave Visualizer when Active */}
          {(isListening || isSpeaking) && (
            <View
              style={[
                styles.voiceWaveBar,
                {
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}
            >
              <Text style={[styles.voiceStateLabel, { color: getStatusColor() }]}>
                {isListening ? 'Listening to speech...' : 'Speaking reply...'}
              </Text>
              <View style={styles.waveBarsRow}>
                <Animated.View
                  style={[
                    styles.waveBar,
                    {
                      backgroundColor: getStatusColor(),
                      transform: [{ scaleY: waveAnim1 }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.waveBar,
                    {
                      backgroundColor: getStatusColor(),
                      transform: [{ scaleY: waveAnim2 }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.waveBar,
                    {
                      backgroundColor: getStatusColor(),
                      transform: [{ scaleY: waveAnim3 }],
                    },
                  ]}
                />
              </View>
              {isSpeaking && (
                <TouchableOpacity onPress={stopSpeaking} style={styles.stopSpeechBtn}>
                  <Text style={[styles.stopSpeechText, { color: colors.textPrimary }]}>Stop</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Messages Scroll View */}
          <ScrollView
            ref={scrollRef}
            style={styles.messageScroll}
            contentContainerStyle={styles.messageContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.userMessageRow : styles.assistantMessageRow,
                  ]}
                >
                  {!isUser && (
                    <View
                      style={[
                        styles.miniAvatar,
                        {
                          backgroundColor:
                            themeId === 'glassmorphism'
                              ? 'rgba(14, 165, 233, 0.25)'
                              : colors.surfaceSubtle,
                        },
                      ]}
                    >
                      <Sparkles
                        size={12}
                        color={colors.primary}
                      />
                    </View>
                  )}

                  <View style={styles.messageBubbleCol}>
                    <View
                      style={[
                        styles.bubble,
                        isUser
                          ? [
                              styles.userBubble,
                              {
                                backgroundColor:
                                  themeId === 'glassmorphism'
                                    ? '#0EA5E9'
                                    : colors.primary,
                              },
                            ]
                          : [
                              styles.assistantBubble,
                              {
                                backgroundColor:
                                  themeId === 'glassmorphism'
                                    ? 'rgba(255, 255, 255, 0.07)'
                                    : colors.surfaceSubtle,
                                borderColor: colors.border,
                                borderWidth: 1,
                              },
                            ],
                      ]}
                    >
                      {renderFormattedText(msg.content, isUser)}
                    </View>

                    {/* Draft Preview Card Widget */}
                    {msg.draftPreview && msg.draftPreview.title ? (
                      <View
                        style={[
                          styles.draftWidgetCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            borderWidth: 1,
                            borderRadius: themeId === 'aurora' ? 22 : Radii.md,
                          },
                        ]}
                      >
                        <View style={styles.draftWidgetHeader}>
                          {msg.draftPreview.category && (
                            <CategoryBadge category={msg.draftPreview.category} size="sm" />
                          )}
                          <Text style={[styles.draftWidgetGoal, { color: colors.primary }]}>
                            ₹{(msg.draftPreview.fundingGoal || 25000).toLocaleString('en-IN')} Goal
                          </Text>
                        </View>
                        <Text style={[styles.draftWidgetTitle, { color: colors.textPrimary }]}>
                          {msg.draftPreview.title}
                        </Text>
                        <Text style={[styles.draftWidgetSub, { color: colors.textSecondary }]}>
                          {msg.draftPreview.summary}
                        </Text>
                        <View style={styles.draftMetaRow}>
                          <Text style={[styles.draftMetaText, { color: colors.textMuted }]}>
                            Target: {msg.draftPreview.intendedAudience || 'General Public'}
                          </Text>
                        </View>

                        <View style={styles.draftWidgetActions}>
                          <TouchableOpacity
                            onPress={() => {
                              closeReachie();
                              router.push('/create');
                            }}
                            style={[
                              styles.widgetBtn,
                              {
                                backgroundColor: colors.surfaceSubtle,
                                borderColor: colors.border,
                                borderWidth: 1,
                                borderRadius: themeId === 'aurora' ? 18 : Radii.sm,
                              },
                            ]}
                          >
                            <Eye size={14} color={colors.textPrimary} />
                            <Text style={[styles.widgetBtnText, { color: colors.textPrimary }]}>
                              Edit in Form
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              sendMessage('Submit this campaign for review');
                            }}
                            style={[
                              styles.widgetBtn,
                              styles.widgetSubmitBtn,
                              {
                                backgroundColor: colors.primary,
                                borderRadius: themeId === 'aurora' ? 18 : Radii.sm,
                              },
                            ]}
                          >
                            <Check size={14} color="#FFFFFF" />
                            <Text style={styles.widgetSubmitText}>Submit Now</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}

                    {/* Consequential Action Confirmation Box (only on latest assistant message requiring confirmation) */}
                    {pendingAction && pendingAction.id && pendingAction.requiresConfirmation && !isUser && index === messages.length - 1 && (
                      <View
                        style={[
                          styles.confirmBox,
                          {
                            backgroundColor:
                              themeId === 'glassmorphism'
                                ? 'rgba(14, 165, 233, 0.14)'
                                : colors.surface,
                            borderColor:
                              themeId === 'glassmorphism'
                                ? '#0EA5E9'
                                : colors.warning,
                            borderRadius: themeId === 'aurora' ? 22 : Radii.md,
                          },
                        ]}
                      >
                        <View style={styles.confirmHeader}>
                          <AlertTriangle
                            size={18}
                            color={themeId === 'glassmorphism' ? '#0EA5E9' : colors.warning}
                          />
                          <Text
                            style={[
                              styles.confirmTitle,
                              { color: colors.textPrimary },
                            ]}
                          >
                            {pendingAction.confirmationTitle || 'Confirmation Required'}
                          </Text>
                        </View>
                        <Text style={[styles.confirmMsg, { color: colors.textSecondary }]}>
                          {pendingAction.confirmationMessage ||
                            'Are you sure you want to proceed with this consequential action?'}
                        </Text>
                        <View style={styles.confirmActionsRow}>
                          <TouchableOpacity
                            onPress={() => confirmAction(pendingAction.id, false)}
                            style={[
                              styles.cancelBtn,
                              {
                                borderColor: themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.25)' : colors.border,
                                backgroundColor: themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                borderRadius: themeId === 'aurora' ? 20 : Radii.sm,
                              },
                            ]}
                          >
                            <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => confirmAction(pendingAction.id, true)}
                            style={[
                              styles.confirmBtn,
                              {
                                backgroundColor:
                                  themeId === 'glassmorphism'
                                    ? '#0EA5E9'
                                    : colors.primary,
                                borderRadius: themeId === 'aurora' ? 20 : Radii.sm,
                              },
                            ]}
                          >
                            <Text style={[styles.confirmBtnText, { color: '#FFFFFF' }]}>Confirm & Submit</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Suggested Action Pills */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <View style={styles.suggestedActionsWrap}>
                        {msg.suggestedActions.map((sug) => (
                          <TouchableOpacity
                            key={sug.id}
                            onPress={() => handleSelectSuggestion(sug)}
                            style={[
                              styles.suggestionChip,
                              {
                                backgroundColor:
                                  themeId === 'glassmorphism'
                                    ? 'rgba(255, 255, 255, 0.12)'
                                    : themeId === 'aurora'
                                    ? colors.surfaceSubtle
                                    : colors.surface,
                                borderColor: colors.border,
                                borderWidth: 1,
                                borderRadius: themeId === 'aurora' ? 20 : 16,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.suggestionChipText,
                                {
                                  color:
                                    themeId === 'glassmorphism'
                                      ? '#38BDF8'
                                      : colors.primary,
                                },
                              ]}
                            >
                              {sug.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer Input Bar */}
          <View
            style={[
              styles.footerBar,
              {
                borderTopColor: colors.borderLight,
                borderTopWidth: 1,
                backgroundColor:
                  themeId === 'glassmorphism'
                    ? 'rgba(20, 21, 25, 0.95)'
                    : colors.surface,
              },
            ]}
          >
            {/* Mic Toggle Button */}
            <TouchableOpacity
              onPress={handleMicToggle}
              style={[
                styles.micBtn,
                {
                  backgroundColor: isListening
                    ? '#EF4444'
                    : themeId === 'glassmorphism'
                    ? '#0EA5E9'
                    : colors.primary,
                  borderRadius: themeId === 'aurora' ? 22 : 18,
                },
              ]}
              activeOpacity={0.8}
            >
              {isListening ? (
                <MicOff size={20} color="#FFFFFF" strokeWidth={2.4} />
              ) : (
                <Mic size={20} color="#FFFFFF" strokeWidth={2.4} />
              )}
            </TouchableOpacity>

            {/* Text Input */}
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor:
                    themeId === 'glassmorphism'
                      ? 'rgba(255, 255, 255, 0.10)'
                      : colors.surfaceSubtle,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: themeId === 'aurora' ? 22 : 16,
                },
              ]}
              placeholder="Ask Reachie or describe your campaign..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isProcessing}
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    inputText.trim() && !isProcessing
                      ? themeId === 'glassmorphism'
                        ? '#0EA5E9'
                        : colors.primary
                      : themeId === 'glassmorphism'
                      ? 'rgba(255, 255, 255, 0.12)'
                      : colors.surfaceHighlight,
                  borderRadius: themeId === 'aurora' ? 22 : 16,
                },
              ]}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send
                  size={16}
                  color={inputText.trim() ? '#FFFFFF' : themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.4)' : colors.textMuted}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '84%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reachieAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  assistantStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
  },
  closeBtn: {
    padding: 6,
  },

  // Voice wave
  voiceWaveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
  },
  voiceStateLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  waveBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 20,
  },
  waveBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  stopSpeechBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  stopSpeechText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Messages
  messageScroll: {
    flex: 1,
  },
  messageContent: {
    padding: Spacing.lg,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: '100%',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  messageBubbleCol: {
    maxWidth: '85%',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  paragraphText: {
    fontSize: 13,
    lineHeight: 19,
  },
  headingText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginVertical: 2,
  },
  bulletDot: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  // Draft Widget Card
  draftWidgetCard: {
    marginTop: 10,
    borderRadius: 18,
    padding: 14,
    ...Shadows.subtle,
  },
  draftWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  draftWidgetGoal: {
    fontSize: 12,
    fontWeight: '700',
  },
  draftWidgetTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  draftWidgetSub: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  draftMetaRow: {
    marginBottom: 10,
  },
  draftMetaText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  draftWidgetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  widgetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  widgetBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  widgetSubmitBtn: {},
  widgetSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Confirmation Box
  confirmBox: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  confirmTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  confirmMsg: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  confirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Suggested actions
  suggestedActionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Footer input bar
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
