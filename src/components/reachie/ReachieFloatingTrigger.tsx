import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { usePathname, useSegments } from 'expo-router';
import { Sparkles, Mic } from 'lucide-react-native';
import { useReachie } from '../../context/ReachieContext';
import { useTheme } from '../../theme/ThemeContext';
import { Radii, Shadows, Spacing } from '../../theme';

export const ReachieFloatingTrigger: React.FC = () => {
  const pathname = usePathname();
  const segments = useSegments();
  const { openReachie, isOpen, isVoiceActive, startVoiceControl, isListening, isSpeaking } = useReachie();
  const { colors, themeId } = useTheme();

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: isListening || isSpeaking ? 1200 : 2800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: isListening || isSpeaking ? 1200 : 2800,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim, isListening, isSpeaking]);

  // Only show floating button when the user has actually entered the main application.
  // Strictly hide during the intro video splash screen, get-started, and login screens.
  const isInsideApp =
    segments.length > 0 &&
    (segments[0] === '(tabs)' ||
      segments[0] === 'campaign' ||
      segments[0] === 'creator' ||
      segments[0] === 'contribution' ||
      segments[0] === 'settings');

  if (isOpen || isVoiceActive || !isInsideApp) return null;

  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  const getButtonBg = () => {
    if (themeId === 'glassmorphism') return '#0EA5E9';
    return colors.primary;
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      {/* Subtle glowing halo animation */}
      <Animated.View
        style={[
          styles.halo,
          {
            backgroundColor: getButtonBg(),
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Main trigger button */}
      <TouchableOpacity
        style={[
          styles.triggerBtn,
          {
            backgroundColor: getButtonBg(),
            borderColor: themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.4)' : colors.borderLight,
            borderWidth: 1,
            ...(Platform.OS === 'web'
              ? ({
                  boxShadow:
                    themeId === 'aurora'
                      ? '0 6px 20px rgba(158, 126, 103, 0.35)'
                      : themeId === 'glassmorphism'
                      ? '0 8px 24px rgba(14, 165, 233, 0.45)'
                      : '0 6px 18px rgba(29, 53, 87, 0.35)',
                } as any)
              : {}),
          },
        ]}
        activeOpacity={0.85}
        onPress={() => openReachie()}
      >
        <Sparkles size={16} color="#FFFFFF" strokeWidth={2.4} />
        <Text style={styles.btnLabel}>Ask Reachie</Text>
        <TouchableOpacity
          style={styles.micBadge}
          onPress={(e) => {
            e.stopPropagation?.();
            startVoiceControl();
          }}
          activeOpacity={0.7}
        >
          <Mic size={11} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 96 : 76,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    ...Shadows.elevated,
  },
  btnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  micBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
