import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Text } from 'react-native';
import { Colors } from '../../theme';

interface HeroVideoProps {
  style?: any;
  overlayOpacity?: number;
  borderRadius?: number;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({
  style,
  overlayOpacity = 0.35,
  borderRadius = 16,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // For Web: HTML5 Video element via React.createElement
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { borderRadius, overflow: 'hidden' }, style]}>
        {React.createElement('video', {
          src: '/hero-video.mp4',
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          onLoadedData: () => setIsLoaded(true),
          onError: () => setHasError(true),
          style: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            borderRadius,
          },
        })}
        {/* Subtle dark gradient overlay for readable contrast */}
        <View
          style={[
            styles.overlay,
            { backgroundColor: `rgba(29, 53, 87, ${overlayOpacity})` },
          ]}
        />
      </View>
    );
  }

  // Native implementation using expo-video
  return <NativeHeroVideo style={style} borderRadius={borderRadius} overlayOpacity={overlayOpacity} />;
};

// Separate native subcomponent to isolate expo-video imports safely
const NativeHeroVideo: React.FC<HeroVideoProps> = ({
  style,
  borderRadius = 16,
  overlayOpacity = 0.35,
}) => {
  try {
    const { useVideoPlayer, VideoView } = require('expo-video');
    const assetSource = require('../../../assets/hero-video.mp4');

    const player = useVideoPlayer(assetSource, (p: any) => {
      p.loop = true;
      p.muted = true;
      p.play();
    });

    return (
      <View style={[styles.container, { borderRadius, overflow: 'hidden' }, style]}>
        <VideoView
          style={styles.nativeVideo}
          player={player}
          nativeControls={false}
          contentFit="cover"
        />
        <View
          style={[
            styles.overlay,
            { backgroundColor: `rgba(29, 53, 87, ${overlayOpacity})` },
          ]}
        />
      </View>
    );
  } catch (err) {
    // Graceful fallback if native video module is missing
    return (
      <View style={[styles.container, styles.fallbackContainer, { borderRadius }, style]}>
        <View style={styles.fallbackGlow} />
        <Text style={styles.fallbackText}>Reach Video Animation</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  nativeVideo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackContainer: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackGlow: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    backgroundColor: Colors.accent,
    opacity: 0.15,
    borderRadius: 999,
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
