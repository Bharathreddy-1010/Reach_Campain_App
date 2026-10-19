import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withTopInset?: boolean;
  disableAmbient?: boolean;
}

const AmbientGlassGlow: React.FC = () => {
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3800,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const topScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const topOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.32],
  });

  const midScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.12, 0.95],
  });
  const midOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.26, 0.15],
  });

  return (
    <View style={styles.ambientContainer} pointerEvents="none">
      {/* Top right ambient indigo/lavender orb */}
      <Animated.View
        style={[
          styles.ambientOrb,
          styles.topOrb,
          {
            transform: [{ scale: topScale }],
            opacity: topOpacity,
          },
        ]}
      />
      {/* Mid left ambient azure/sky orb */}
      <Animated.View
        style={[
          styles.ambientOrb,
          styles.midOrb,
          {
            transform: [{ scale: midScale }],
            opacity: midOpacity,
          },
        ]}
      />
      {/* Bottom right subtle mauve/violet orb */}
      <Animated.View
        style={[
          styles.ambientOrb,
          styles.bottomOrb,
          {
            opacity: 0.16,
          },
        ]}
      />
    </View>
  );
};

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  withTopInset = true,
  disableAmbient = false,
}) => {
  const { colors, statusBarStyle, themeId } = useTheme();
  const isAmbient = !disableAmbient && themeId === 'glassmorphism';
  const effectiveBg = disableAmbient ? '#FAF9F6' : (isAmbient ? 'transparent' : colors.background);
  const effectiveBar = disableAmbient ? 'dark-content' : statusBarStyle;

  let topInset = 0;
  try {
    const insets = useSafeAreaInsets();
    topInset = withTopInset
      ? Math.max(
          insets?.top || 0,
          Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0
        )
      : 0;
  } catch {
    topInset = withTopInset && Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;
  }

  const content = scrollable ? (
    <ScrollView
      style={[
        styles.scroll,
        { backgroundColor: effectiveBg },
        style,
      ]}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.container,
        { backgroundColor: effectiveBg },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: disableAmbient ? '#FAF9F6' : colors.background,
          paddingTop: topInset,
        },
      ]}
    >
      <StatusBar barStyle={effectiveBar} backgroundColor={disableAmbient ? '#FAF9F6' : colors.background} />
      {isAmbient && <AmbientGlassGlow />}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  ambientContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  ambientOrb: {
    position: 'absolute',
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(75px)',
          WebkitFilter: 'blur(75px)',
        } as any)
      : {}),
  },
  topOrb: {
    top: -40,
    right: -40,
    width: 280,
    height: 280,
    backgroundColor: '#818CF8',
  },
  midOrb: {
    top: 300,
    left: -70,
    width: 290,
    height: 290,
    backgroundColor: '#38BDF8',
  },
  bottomOrb: {
    bottom: 40,
    right: -50,
    width: 250,
    height: 250,
    backgroundColor: '#C084FC',
  },
});
