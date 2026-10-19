import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../src/services/supabase';
import { CampaignRepository, GUEST_USER_ID } from '../src/repositories/campaignRepository';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VideoSplashScreen() {
  const insets = useSafeAreaInsets();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasNavigatedRef = useRef<boolean>(false);
  const authPromiseRef = useRef<Promise<boolean> | null>(null);
  const isLoggedInRef = useRef<boolean>(false);

  // Background check for user session while the video plays immediately
  useEffect(() => {
    // 1. Handle OAuth redirect tokens in URL if returning from web browser auth
    if (typeof window !== 'undefined' && window.location) {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('access_token') || search.includes('code=')) {
        hasNavigatedRef.current = true;
        router.replace(('/auth/callback' + search + hash) as any);
        return;
      }
    }

    // 2. Asynchronously verify whether the user is already authenticated
    const checkAuth = async (): Promise<boolean> => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const user = data.session.user;
          await CampaignRepository.setActiveUser({
            id: user.id,
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'User',
            email: user.email || '',
            avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          });
          isLoggedInRef.current = true;
          return true;
        }
      } catch (e) {
        // continue to check local storage
      }

      try {
        const activeUserId = await CampaignRepository.getCurrentUserId();
        if (
          activeUserId &&
          activeUserId !== GUEST_USER_ID &&
          activeUserId !== 'usr_guest' &&
          activeUserId !== 'guest-session'
        ) {
          isLoggedInRef.current = true;
          return true;
        }
      } catch (e) {
        // ignore
      }

      isLoggedInRef.current = false;
      return false;
    };

    authPromiseRef.current = checkAuth();
  }, []);

  const navigateToNext = async () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    let loggedIn = isLoggedInRef.current;
    if (authPromiseRef.current) {
      try {
        loggedIn = await authPromiseRef.current;
      } catch (e) {
        loggedIn = isLoggedInRef.current;
      }
    }

    // If user is already logged in (didn't click logout), take them straight to Home
    // If opening for the first time or logged out, prompt login
    if (loggedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/get-started');
    }
  };

  // For Web video handling
  useEffect(() => {
    if (Platform.OS === 'web') {
      const vid = videoRef.current;
      if (vid) {
        vid.muted = false;
        vid.volume = 1.0;
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If browser blocks unmuted autoplay without prior interaction,
            // play muted, then unmute on first tap
            vid.muted = true;
            vid.play();
          });
        }

        const handleEnded = () => {
          navigateToNext();
        };

        vid.addEventListener('ended', handleEnded);

        return () => {
          vid.removeEventListener('ended', handleEnded);
        };
      }
    }
  }, []);

  // Safety fallback timer matching the 10-second video duration
  useEffect(() => {
    const timer = setTimeout(() => {
      navigateToNext();
    }, 10400);

    return () => clearTimeout(timer);
  }, []);

  const handleScreenPress = () => {
    // If on web and video was muted by browser policy, first tap unmutes; second tap / skip proceeds
    if (Platform.OS === 'web' && videoRef.current && videoRef.current.muted) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
    } else {
      navigateToNext();
    }
  };

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 16
  );

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleScreenPress}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen video container with zoom to eliminate any corner watermarks */}
      <View style={styles.videoWrapper}>
        {Platform.OS === 'web' ? (
          React.createElement('video', {
            ref: videoRef,
            src: '/hero-video.mp4',
            autoPlay: true,
            playsInline: true,
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scale(1.18)',
              transformOrigin: 'center 20%',
              display: 'block',
            },
          })
        ) : (
          <NativeVideoPlayer onEnded={navigateToNext} />
        )}
      </View>

      {/* Top bar with quick Skip button */}
      <View style={[styles.topBar, { top: topInset + 8 }]} pointerEvents="box-none">
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.skipButton}
          onPress={navigateToNext}
          activeOpacity={0.75}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipButtonText}>Skip →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Native subcomponent using expo-video
function NativeVideoPlayer({ onEnded }: { onEnded: () => void }) {
  try {
    const { useVideoPlayer, VideoView } = require('expo-video');
    const assetSource = require('../assets/hero-video.mp4');

    const player = useVideoPlayer(assetSource, (p: any) => {
      p.loop = false;
      p.muted = false;
      p.volume = 1.0;
      p.play();
    });

    useEffect(() => {
      const sub = player.addListener('playToEnd', () => {
        onEnded();
      });
      return () => {
        if (sub && sub.remove) sub.remove();
      };
    }, [player]);

    return (
      <View style={styles.nativeZoomContainer}>
        <VideoView
          style={styles.nativeVideo}
          player={player}
          nativeControls={false}
          contentFit="cover"
        />
      </View>
    );
  } catch (err) {
    useEffect(() => {
      const t = setTimeout(onEnded, 1500);
      return () => clearTimeout(t);
    }, []);

    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Reach</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5', // Matches the video cream background
    position: 'relative',
    overflow: 'hidden',
  },
  videoWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeZoomContainer: {
    width: '100%',
    height: '100%',
    // Zoom & vertical offset to keep content centered while pushing corner watermarks offscreen
    transform: [{ scale: 1.15 }, { translateY: -10 }],
  },
  nativeVideo: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F1510',
    letterSpacing: -0.1,
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '800',
  },
});
