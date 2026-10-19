import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { CheckCircle2, Sparkles, Smartphone, Globe, ArrowRight } from 'lucide-react-native';
import { supabase } from '../../src/services/supabase';
import { CampaignRepository } from '../../src/repositories/campaignRepository';
import { launchNativeApp, getNativeLaunchUrls } from '../../src/services/nativeHandoff';
import { Colors, Radii, Shadows, Spacing } from '../../src/theme';

/**
 * Universal OAuth Callback Handler
 * Handles Google OAuth responses across:
 * 1. Native standalone APK (custom scheme: reach://auth/callback)
 * 2. Expo Go (scheme: exp://<host>/--/auth/callback)
 * 3. Mobile Chrome / Web browser
 */
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);
  const [tokens, setTokens] = useState<string>('');

  useEffect(() => {
    handleCallback();

    // Listen for incoming deep links if app was in background
    const sub = Linking.addEventListener('url', (event) => {
      if (event.url) {
        handleCallback(event.url);
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  const handleCallback = async (incomingUrl?: string) => {
    try {
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let code: string | null = null;

      // 0. Extract from incomingUrl if provided via Linking event
      if (incomingUrl) {
        accessToken = incomingUrl.match(/[#&]access_token=([^&#]+)/)?.[1] || null;
        refreshToken = incomingUrl.match(/[#&]refresh_token=([^&#]+)/)?.[1] || null;
        code = incomingUrl.match(/[?&]code=([^&#]+)/)?.[1] || null;
      }

      // 1. Extract from route search params (Expo Router)
      if (!accessToken && params.access_token) accessToken = String(params.access_token);
      if (!refreshToken && params.refresh_token) refreshToken = String(params.refresh_token);
      if (!code && params.code) code = String(params.code);

      // 2. Extract from window.location on Web / Chrome
      let rawHash = '';
      let rawSearch = '';
      if (typeof window !== 'undefined' && window.location) {
        rawHash = window.location.hash || '';
        rawSearch = window.location.search || '';

        if (rawHash) {
          const hashParams = new URLSearchParams(
            rawHash.startsWith('#') ? rawHash.slice(1) : rawHash
          );
          if (!accessToken) accessToken = hashParams.get('access_token');
          if (!refreshToken) refreshToken = hashParams.get('refresh_token');
        }

        if (rawSearch) {
          const searchParams = new URLSearchParams(rawSearch);
          if (!code) code = searchParams.get('code');
        }
      }

      // 3. Extract from initial URL on Native
      if (!accessToken && !code) {
        try {
          const initialUrl = await Linking.getInitialURL();
          if (initialUrl) {
            accessToken = initialUrl.match(/[#&]access_token=([^&#]+)/)?.[1] || null;
            refreshToken = initialUrl.match(/[#&]refresh_token=([^&#]+)/)?.[1] || null;
            code = initialUrl.match(/[?&]code=([^&#]+)/)?.[1] || null;
          }
        } catch {
          // ignore
        }
      }

      // 4. Authenticate session with Supabase
      let user: any = null;

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        user = data?.user;
      } else if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        user = data?.user;
      } else {
        const { data } = await supabase.auth.getSession();
        user = data?.session?.user;
      }

      if (!user) {
        // Fallback: check session once more
        const { data: retryData } = await supabase.auth.getUser();
        user = retryData?.user;
      }

      if (user) {
        const profile = {
          id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Google User',
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        };

        // Sync to active local user storage
        await CampaignRepository.setActiveUser(profile);
        setUserProfile(profile);

        // Extract session tokens for deep linking to Expo Go / APK
        const { data: sessionData } = await supabase.auth.getSession();
        const activeSession = sessionData?.session;
        let tokenFragment = rawHash || rawSearch || '';
        if (!tokenFragment && activeSession?.access_token && activeSession?.refresh_token) {
          tokenFragment = `#access_token=${activeSession.access_token}&refresh_token=${activeSession.refresh_token}&token_type=bearer`;
        }
        setTokens(tokenFragment);
        setStatus('success');

        // A. If already running inside Native App (APK or Expo Go):
        if (Platform.OS !== 'web') {
          router.replace('/(tabs)');
          return;
        }

        // B. If running on Mobile Web, attempt to hand off to Expo Go
        const isMobile =
          typeof navigator !== 'undefined' &&
          /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

        if (isMobile) {
          try {
            const urls = await getNativeLaunchUrls(tokenFragment);
            window.location.href = urls.expoUrl;
          } catch (e) {
            console.warn('Auto handoff error:', e);
          }
        }
      } else {
        // No user found — redirect to login
        router.replace('/login');
      }
    } catch (err: any) {
      console.error('Auth callback error:', err);
      setStatus('error');
      setErrorMsg(err?.message || 'Authentication failed. Please try again.');
      setTimeout(() => router.replace('/login'), 2500);
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.errorTitle}>Authentication Error</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Text style={styles.subText}>Redirecting back to login…</Text>
        </View>
      </View>
    );
  }

  if (status === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={36} color={Colors.success} strokeWidth={2.5} />
          </View>

          <Text style={styles.title}>Signed In Successfully!</Text>
          <Text style={styles.welcomeText}>
            Welcome back, <Text style={styles.boldText}>{userProfile?.name}</Text>
          </Text>

          <Text style={styles.instructionsText}>
            Tap below to switch into your installed Expo Go or Reach APK:
          </Text>

          {/* Button 1: Open in Expo Go */}
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: '#2563EB' }]}
            activeOpacity={0.85}
            onPress={() => launchNativeApp('expo', tokens)}
          >
            <Sparkles size={20} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.primaryActionText}>Open in Expo Go 📱</Text>
          </TouchableOpacity>

          {/* Button 2: Open in Reach APK */}
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            activeOpacity={0.85}
            onPress={() => launchNativeApp('apk', tokens)}
          >
            <Smartphone size={18} color="#0F172A" strokeWidth={2.2} />
            <Text style={styles.secondaryActionText}>Open in Reach APK 🚀</Text>
          </TouchableOpacity>

          {/* Fallback Option: Continue in Browser */}
          <TouchableOpacity
            style={styles.webFallbackBtn}
            activeOpacity={0.7}
            onPress={handleContinue}
          >
            <Globe size={15} color="#64748B" />
            <Text style={styles.webFallbackText}>Or continue here in web browser</Text>
            <ArrowRight size={13} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Signing you in with Google…</Text>
      <Text style={styles.loadingSub}>Verifying credentials with Reach</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E4DD',
    ...Shadows.elevated,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111215',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  welcomeText: {
    fontSize: 15,
    color: '#5A5D64',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  boldText: {
    fontWeight: '700',
    color: '#111215',
  },
  instructionsText: {
    fontSize: 13,
    color: '#8E919A',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  primaryActionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryActionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAF9F6',
    marginBottom: Spacing.md,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  webFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  webFallbackText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111215',
    marginTop: Spacing.lg,
  },
  loadingSub: {
    fontSize: 13,
    color: '#8E919A',
    marginTop: 4,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5A5D64',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subText: {
    fontSize: 12,
    color: '#8E919A',
  },
});
