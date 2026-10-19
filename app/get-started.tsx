import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ArrowRight, RotateCcw } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GetStartedScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0
  );

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleLogIn = () => {
    router.push('/login');
  };

  const handleReplayVideo = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Mountain Landscape Background Image with Expansive Sky */}
      <ImageBackground
        source={
          Platform.OS === 'web'
            ? { uri: '/mountain-hero.jpg' }
            : require('../assets/mountain-hero.jpg')
        }
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.safeArea, { paddingTop: topInset }]}>

          {/* Top Bar with Replay Intro in corner */}
          <View style={styles.topBar}>
            <View style={{ width: 40 }} />
            <TouchableOpacity
              style={styles.replayButton}
              onPress={handleReplayVideo}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <RotateCcw size={14} color="#0F172A" />
              <Text style={styles.replayText}>Replay Intro</Text>
            </TouchableOpacity>
          </View>

          {/* Top Text Block — Compact & Positioned Purely in the Sky */}
          <View style={styles.headerContent}>
            {/* Geometric Delta Logo */}
            <View style={styles.logoContainer}>
              <Svg width={38} height={38} viewBox="0 0 100 100" fill="none">
                <Path
                  d="M50 14 L22 86 L48 68 L50 14 Z"
                  fill="#1F1510"
                />
                <Path
                  d="M50 14 L78 86 L52 68 L50 14 Z"
                  fill="#B8734A"
                />
              </Svg>
            </View>

            {/* Brand Title */}
            <Text style={styles.brandTitle}>Reach</Text>

            {/* Two-Line Headline */}
            <Text style={styles.headline}>Real Messages.</Text>
            <Text style={styles.headline}>Greater Reach.</Text>

            {/* Subtitle Description */}
            <Text style={styles.subtitle}>
              A community-powered platform to amplify the messages that matter.
            </Text>
          </View>

          {/* Spacer to guarantee breathing space over the person */}
          <View style={styles.spacer} />

          {/* Bottom Action Controls matching screenshot */}
          <View style={styles.bottomSection}>
            {/* White Rounded Pill "Get Started →" Button */}
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.88}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
              <ArrowRight size={18} color="#1F1510" strokeWidth={2.5} style={styles.arrowIcon} />
            </TouchableOpacity>

            {/* "Already have an account? Log in" Text Link */}
            <TouchableOpacity
              style={styles.logInLink}
              onPress={handleLogIn}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.logInPrompt}>
                Already have an account? <Text style={styles.logInBold}>Log in</Text>
              </Text>
            </TouchableOpacity>

            {/* Guest browsing shortcut */}
            <TouchableOpacity
              style={styles.guestLink}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.7}
            >
              <Text style={styles.guestLinkText}>Browse campaigns as guest →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1510',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 14 : 6,
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  replayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F1510',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 8 : 4,
  },
  logoContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F1510',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  headline: {
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 29,
    color: '#1F1510',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#382820',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 270,
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'web' ? 32 : 24,
  },
  getStartedButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 14,
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1510',
    letterSpacing: -0.2,
  },
  arrowIcon: {
    marginLeft: 6,
  },
  logInLink: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  logInPrompt: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  logInBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guestLink: {
    paddingVertical: 4,
  },
  guestLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
