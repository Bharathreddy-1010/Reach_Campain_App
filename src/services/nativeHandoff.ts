import { Platform } from 'react-native';
import { supabase } from './supabase';

export interface NativeLaunchUrls {
  expoUrl: string;
  apkUrl: string;
  expoDirect: string;
  apkDirect: string;
  tokens: string;
  host: string;
}

/**
 * Generates reliable deep links and Android Intent URIs for Expo Go and Reach APK
 */
export async function getNativeLaunchUrls(customTokens?: string): Promise<NativeLaunchUrls> {
  let tokens = customTokens || '';
  if (!tokens) {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session?.access_token && session?.refresh_token) {
        tokens = `#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer`;
      }
    } catch {
      // ignore
    }
  }

  let host = '192.168.29.164:8081';
  let isAndroid = false;
  let fallbackOrigin = 'http://192.168.29.164:8081';

  if (typeof window !== 'undefined') {
    host = window.location.host || host;
    fallbackOrigin = window.location.origin || fallbackOrigin;
    const ua = navigator.userAgent || '';
    isAndroid = /Android/i.test(ua);
  }

  const fallbackUrl = encodeURIComponent(`${fallbackOrigin}/(tabs)`);

  // Direct scheme URLs (iOS, simulators, fallback)
  const expoDirect = `exp://${host}/--/auth/callback${tokens}`;
  const apkDirect = `reach://auth/callback${tokens}`;

  // Android Chrome Intent URIs (targets installed app packages directly without scheme errors)
  const expoIntent = `intent://${host}/--/auth/callback${tokens}#Intent;scheme=exp;package=host.exp.exponent;S.browser_fallback_url=${fallbackUrl};end;`;
  const apkIntent = `intent://auth/callback${tokens}#Intent;scheme=reach;package=com.reach.amplification;S.browser_fallback_url=${fallbackUrl};end;`;

  const expoUrl = isAndroid ? expoIntent : expoDirect;
  const apkUrl = isAndroid ? apkIntent : apkDirect;

  return {
    expoUrl,
    apkUrl,
    expoDirect,
    apkDirect,
    tokens,
    host,
  };
}

/**
 * Triggers launch into Expo Go or standalone Reach APK
 */
export async function launchNativeApp(target: 'expo' | 'apk', customTokens?: string) {
  if (typeof window === 'undefined') return;
  try {
    const urls = await getNativeLaunchUrls(customTokens);
    const targetUrl = target === 'expo' ? urls.expoUrl : urls.apkUrl;
    window.location.href = targetUrl;
  } catch (err) {
    console.warn('Native app launch error:', err);
  }
}
