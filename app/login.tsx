import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { ScreenWrapper } from '../src/components/common/ScreenWrapper';
import { Button } from '../src/components/common/Button';
import { Colors, Spacing, Typography, Radii } from '../src/theme';
import { APP_NAME } from '../src/constants';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  CheckCircle2,
  UserPlus,
} from 'lucide-react-native';
import { CampaignRepository } from '../src/repositories/campaignRepository';
import { signInWithGoogle, isSupabaseConfigured, supabase } from '../src/services/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Auto-detect session on mount (essential when redirected back from Google OAuth on web or deep link)
  useEffect(() => {
    let mounted = true;

    const syncSession = async (user: any) => {
      if (!user || !mounted) return;
      try {
        await CampaignRepository.setActiveUser({
          id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Google User',
          email: user.email || 'user@gmail.com',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        });
        router.replace('/(tabs)');
      } catch (err) {
        console.warn('Profile sync error:', err);
      }
    };

    // Only auto-redirect if actively returning from a Google OAuth redirect callback
    const isOAuthRedirect =
      typeof window !== 'undefined' &&
      window.location != null &&
      (window.location.hash?.includes('access_token') ||
        window.location.search?.includes('code='));

    if (isOAuthRedirect) {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      router.replace(('/auth/callback' + search + hash) as any);
      return;
    }

    // Listen for auth state change — only redirect on explicit SIGNED_IN event
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && event === 'SIGNED_IN') {
        syncSession(session.user);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 1-Tap Quick Demo Login as Dr. Maya Sen
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    await CampaignRepository.setActiveUser({
      id: 'usr_demo_882',
      name: 'Dr. Maya Sen',
      email: 'maya.sen@publichealth.org',
      avatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });
    router.replace('/(tabs)');
  };

  // Google Authentication via Supabase OAuth
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        if (result.user) {
          await CampaignRepository.setActiveUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            avatarUrl: result.user.avatarUrl,
          });
        }
        // Navigate straight to main experience
        router.replace('/(tabs)');
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Validate email format
  const validateEmail = (emailStr: string): boolean => {
    return EMAIL_REGEX.test(emailStr.trim());
  };

  // Sign In with email + password via Supabase
  const handleSignIn = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Direct demo account sign-in bypass
      if (trimmedEmail.toLowerCase() === 'maya.sen@publichealth.org') {
        await CampaignRepository.setActiveUser({
          id: 'usr_demo_882',
          name: 'Dr. Maya Sen',
          email: 'maya.sen@publichealth.org',
          avatarUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        });
        router.replace('/(tabs)');
        return;
      }

      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

        if (authError) {
          // Map common Supabase auth errors to user-friendly messages
          if (authError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (authError.message.includes('Email not confirmed')) {
            setError('Please verify your email address. Check your inbox for a confirmation link.');
          } else {
            setError(authError.message);
          }
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          await CampaignRepository.setActiveUser({
            id: data.user.id,
            name:
              data.user.user_metadata?.full_name ||
              data.user.email?.split('@')[0] ||
              'User',
            email: data.user.email || trimmedEmail,
            avatarUrl: data.user.user_metadata?.avatar_url,
          });
          router.replace('/(tabs)');
        }
      } else {
        // Fallback offline mode when Supabase is not reachable
        const userId = `usr_${trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await CampaignRepository.setActiveUser({
          id: userId,
          email: trimmedEmail,
          name: trimmedEmail.split('@')[0],
        });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err?.message || 'Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up with email + password via Supabase
  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (isSupabaseConfigured) {
        // Direct email confirmation link to active Reach server instead of localhost
        let emailRedirectTo = 'http://192.168.29.164:8081/auth/callback';
        if (typeof window !== 'undefined' && window.location && window.location.origin) {
          emailRedirectTo = `${window.location.origin}/auth/callback`;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
          options: {
            emailRedirectTo,
          },
        });

        if (authError) {
          if (authError.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(authError.message);
          }
          setIsLoading(false);
          return;
        }

        // Supabase may auto-confirm or require email verification
        if (data?.user?.identities?.length === 0) {
          setError('This email is already registered. Please sign in instead.');
          setIsLoading(false);
          return;
        }

        if (data?.session && data.user) {
          // Auto-confirmed — go straight to app
          await CampaignRepository.setActiveUser({
            id: data.user.id,
            name: trimmedEmail.split('@')[0],
            email: trimmedEmail,
          });
          router.replace('/(tabs)');
        } else {
          // Email verification required
          setSuccessMessage('Account created! Check your email inbox for a verification link, then sign in.');
          setIsSignUp(false);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        // Fallback offline mode
        const userId = `usr_${trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await CampaignRepository.setActiveUser({
          id: userId,
          email: trimmedEmail,
          name: trimmedEmail.split('@')[0],
        });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err?.message || 'Sign-up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    await CampaignRepository.setActiveUser({
      id: 'usr_guest',
      name: 'Guest User',
      email: 'guest@reach-app.org',
    });
    router.replace('/(tabs)');
  };

  // Toggle between sign in and sign up
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccessMessage(null);
    setConfirmPassword('');
  };

  return (
    <ScreenWrapper withTopInset={true} disableAmbient={true} style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>
              {isSignUp ? 'Create Account' : 'Account Access'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Heading */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              {isSignUp ? (
                <UserPlus size={24} color="#1D3557" />
              ) : (
                <Shield size={24} color="#1D3557" />
              )}
            </View>
            <Text style={styles.title}>
              {isSignUp ? `Join ${APP_NAME}` : `Welcome to ${APP_NAME}`}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Create your account to start campaigns, back distribution, and track live reach.'
                : 'One unified account backed by Supabase & Postgres to create campaigns, back distribution, and track live reach.'}
            </Text>
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
            activeOpacity={0.85}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#1D3557" />
            ) : (
              <>
                <View style={styles.googleIconWrap}>
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <Path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <Path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <Path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </Svg>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* 1-Tap Fast Demo Sign-In Card — only in sign-in mode */}
          {!isSignUp && (
            <TouchableOpacity
              style={styles.demoCard}
              onPress={handleQuickDemoLogin}
              activeOpacity={0.8}
            >
              <View style={styles.demoCardHeader}>
                <View style={styles.demoBadge}>
                  <Sparkles size={13} color="#FFFFFF" />
                  <Text style={styles.demoBadgeText}>Fast Demo Sign-In</Text>
                </View>
                <Text style={styles.demoTapPrompt}>Tap to auto-fill</Text>
              </View>
              <Text style={styles.demoProfileName}>Dr. Maya Sen</Text>
              <Text style={styles.demoProfileDetail}>
                Public Health Researcher • Creator of 1 active campaign • Backer of 3 campaigns
              </Text>
              <View style={styles.demoSelectRow}>
                <CheckCircle2 size={14} color={Colors.accent} />
                <Text style={styles.demoSelectText}>
                  {email === 'maya.sen@publichealth.org' ? 'Credentials Loaded' : 'Use this demo profile'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {isSignUp ? 'or sign up with email' : 'or sign in with email'}
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Success Message */}
          {successMessage ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={16} color="#059669" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputWrap, error && email && !validateEmail(email.trim()) && styles.inputWrapError]}>
                <Mail size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                {!isSignUp && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Reset Password',
                        'For this hackathon prototype, use the demo autofill or create a new account with Sign Up!'
                      )
                    }
                  >
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputWrap}>
                <Lock size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={isSignUp ? 'Min 6 characters' : '••••••••••••'}
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  textContentType={isSignUp ? 'newPassword' : 'password'}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
              {isSignUp && password.length > 0 && password.length < MIN_PASSWORD_LENGTH && (
                <Text style={styles.fieldHint}>
                  {MIN_PASSWORD_LENGTH - password.length} more character{MIN_PASSWORD_LENGTH - password.length !== 1 ? 's' : ''} needed
                </Text>
              )}
            </View>

            {/* Confirm Password — only in signup mode */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={[
                  styles.inputWrap,
                  confirmPassword.length > 0 && password !== confirmPassword && styles.inputWrapError,
                ]}>
                  <Lock size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Re-enter password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      setError(null);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color="#64748B" />
                    ) : (
                      <Eye size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={styles.fieldHintError}>Passwords don't match</Text>
                )}
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <Text style={styles.fieldHintSuccess}>✓ Passwords match</Text>
                )}
              </View>
            )}

            {/* Sign In / Sign Up Button */}
            <Button
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              size="lg"
              variant="primary"
              loading={isLoading}
              style={styles.signInButton}
            />

            {/* Toggle Sign In / Sign Up */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleButtonText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <Text style={styles.toggleButtonAction}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Guest Action */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleContinueAsGuest}
              activeOpacity={0.7}
            >
              <Text style={styles.guestButtonText}>
                Skip & Continue as Guest →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Guidelines */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by Supabase & PostgreSQL. Contributions fund digital advertising reach and are NOT direct charitable donations.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FAF9F6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? Spacing.sm : Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2F6',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  googleButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  googleIconWrap: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  demoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: Spacing.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  demoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1D3557',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.full,
  },
  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  demoTapPrompt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D3557',
  },
  demoProfileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  demoProfileDetail: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  demoSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  demoSelectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D3557',
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 12,
    color: '#1D3557',
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputWrapError: {
    borderColor: '#FCA5A5',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#0F172A',
    fontSize: 15,
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
  fieldHint: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  fieldHintError: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },
  fieldHintSuccess: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  signInButton: {
    marginTop: Spacing.sm,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  toggleButtonAction: {
    color: '#1D3557',
    fontWeight: '700',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  footer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
