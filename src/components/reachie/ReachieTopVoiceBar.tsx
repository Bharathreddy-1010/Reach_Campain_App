import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mic, MicOff, MessageSquare, X, Sparkles, Volume2 } from 'lucide-react-native';
import { useReachie } from '../../context/ReachieContext';
import { useTheme } from '../../theme/ThemeContext';
import { Radii } from '../../theme';

export const ReachieTopVoiceBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    isVoiceActive,
    stopVoiceControl,
    openReachie,
    isListening,
    isProcessing,
    isSpeaking,
    startVoiceInput,
    stopVoiceInput,
    currentSpokenText,
    interimTranscript,
  } = useReachie();
  const { colors, themeId } = useTheme();

  // 7 wave bar animated values
  const wave1 = useRef(new Animated.Value(6)).current;
  const wave2 = useRef(new Animated.Value(14)).current;
  const wave3 = useRef(new Animated.Value(22)).current;
  const wave4 = useRef(new Animated.Value(30)).current;
  const wave5 = useRef(new Animated.Value(20)).current;
  const wave6 = useRef(new Animated.Value(12)).current;
  const wave7 = useRef(new Animated.Value(8)).current;

  // Pulse animation for AI badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVoiceActive) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: isListening ? 600 : isSpeaking ? 800 : 1400,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: isListening ? 600 : isSpeaking ? 800 : 1400,
            useNativeDriver: false,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [isVoiceActive, isListening, isSpeaking, pulseAnim]);

  // Audio wave animation
  useEffect(() => {
    if (!isVoiceActive) return;

    if (isListening || isSpeaking) {
      const createOscillation = (
        val: Animated.Value,
        min: number,
        max: number,
        speed: number
      ) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(val, {
              toValue: max,
              duration: speed,
              useNativeDriver: false,
            }),
            Animated.timing(val, {
              toValue: min,
              duration: speed,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const mult = isListening ? 1.3 : 1.0;
      const a1 = createOscillation(wave1, 6, 22 * mult, 240);
      const a2 = createOscillation(wave2, 10, 32 * mult, 310);
      const a3 = createOscillation(wave3, 8, 36 * mult, 270);
      const a4 = createOscillation(wave4, 14, 40 * mult, 200);
      const a5 = createOscillation(wave5, 8, 34 * mult, 290);
      const a6 = createOscillation(wave6, 10, 30 * mult, 330);
      const a7 = createOscillation(wave7, 6, 20 * mult, 250);

      a1.start();
      a2.start();
      a3.start();
      a4.start();
      a5.start();
      a6.start();
      a7.start();

      return () => {
        a1.stop();
        a2.stop();
        a3.stop();
        a4.stop();
        a5.stop();
        a6.stop();
        a7.stop();
      };
    } else {
      // Idle heights
      Animated.timing(wave1, { toValue: 6, duration: 200, useNativeDriver: false }).start();
      Animated.timing(wave2, { toValue: 10, duration: 200, useNativeDriver: false }).start();
      Animated.timing(wave3, { toValue: 14, duration: 200, useNativeDriver: false }).start();
      Animated.timing(wave4, { toValue: 16, duration: 200, useNativeDriver: false }).start();
      Animated.timing(wave5, { toValue: 14, duration: 200, useNativeDriver: false }).start();
      Animated.timing(wave6, { toValue: 10, duration: 200, useNativeDriver: false }).start();
      Animated.timing(wave7, { toValue: 6, duration: 200, useNativeDriver: false }).start();
    }
  }, [isVoiceActive, isListening, isSpeaking, wave1, wave2, wave3, wave4, wave5, wave6, wave7]);

  if (!isVoiceActive) return null;

  const getPrimaryAccent = () => {
    if (themeId === 'aurora') return '#FF9E4A';
    if (themeId === 'glassmorphism') return '#0EA5E9';
    return '#E63946';
  };

  const accentColor = getPrimaryAccent();

  const getStatusHeadline = () => {
    if (isListening) return 'AI IN CONTROL · LISTENING...';
    if (isProcessing) return 'AI IN CONTROL · THINKING...';
    if (isSpeaking) return 'AI IN CONTROL · REACHIE SPEAKING';
    return 'AI IN CONTROL · VOICE READY';
  };

  const getStatusSubtitle = () => {
    if (interimTranscript) return `You: "${interimTranscript}"`;
    if (isSpeaking && currentSpokenText) return currentSpokenText;
    if (isProcessing) return 'Executing actions & updating fields...';
    if (isListening) {
      if (currentSpokenText) return `Reachie: "${currentSpokenText}" (Listening for answer...)`;
      return 'Listening... Speak a command or answer';
    }
    return 'Tap mic to speak or continue browsing the app';
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  const handleOpenChat = () => {
    openReachie();
  };

  return (
    <View
      style={[
        styles.overlayWrapper,
        {
          top: Platform.OS === 'web' ? 12 : Math.max(insets.top, 12),
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.islandContainer,
          {
            borderColor:
              themeId === 'glassmorphism'
                ? 'rgba(14, 165, 233, 0.45)'
                : themeId === 'aurora'
                ? 'rgba(255, 158, 74, 0.45)'
                : 'rgba(255, 255, 255, 0.18)',
            ...(Platform.OS === 'web'
              ? ({
                  boxShadow:
                    themeId === 'aurora'
                      ? '0 12px 36px rgba(164, 133, 110, 0.35)'
                      : themeId === 'glassmorphism'
                      ? '0 12px 36px rgba(14, 165, 233, 0.35)'
                      : '0 10px 30px rgba(0, 0, 0, 0.55)',
                } as any)
              : {}),
          },
        ]}
      >
        {/* Left: Glowing AI Badge */}
        <Animated.View
          style={[
            styles.avatarBadge,
            {
              backgroundColor: accentColor,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Sparkles size={16} color="#FFFFFF" strokeWidth={2.5} />
        </Animated.View>

        {/* Center: Live Wave & Description */}
        <View style={styles.centerSection}>
          <View style={styles.topRow}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isListening
                      ? '#10B981'
                      : isSpeaking
                      ? accentColor
                      : isProcessing
                      ? '#F59E0B'
                      : '#6B7280',
                  },
                ]}
              />
              <Text style={[styles.badgeText, { color: accentColor }]}>
                {getStatusHeadline()}
              </Text>
            </View>

            {/* Live 7-Bar Audio Wave */}
            <View style={styles.waveBarGroup}>
              <Animated.View style={[styles.waveBar, { height: wave1, backgroundColor: accentColor }]} />
              <Animated.View style={[styles.waveBar, { height: wave2, backgroundColor: accentColor }]} />
              <Animated.View style={[styles.waveBar, { height: wave3, backgroundColor: '#38BDF8' }]} />
              <Animated.View style={[styles.waveBar, { height: wave4, backgroundColor: accentColor }]} />
              <Animated.View style={[styles.waveBar, { height: wave5, backgroundColor: '#38BDF8' }]} />
              <Animated.View style={[styles.waveBar, { height: wave6, backgroundColor: accentColor }]} />
              <Animated.View style={[styles.waveBar, { height: wave7, backgroundColor: accentColor }]} />
            </View>
          </View>

          {/* Subtitle / Live speech transcript */}
          <Text style={styles.subtitleText} numberOfLines={2}>
            {getStatusSubtitle()}
          </Text>
        </View>

        {/* Right: Controls (Mic, Chat, Close) */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              isListening && { backgroundColor: accentColor },
            ]}
            onPress={handleMicToggle}
            activeOpacity={0.7}
          >
            {isListening ? (
              <MicOff size={16} color="#FFFFFF" />
            ) : (
              <Mic size={16} color={accentColor} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleOpenChat}
            activeOpacity={0.7}
          >
            <MessageSquare size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={stopVoiceControl}
            activeOpacity={0.7}
          >
            <X size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 99999,
    alignItems: 'center',
  },
  islandContainer: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: Radii.xl,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
  },
  avatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  waveBarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    gap: 3,
    paddingHorizontal: 6,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
  subtitleText: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 16,
    fontWeight: '500',
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
