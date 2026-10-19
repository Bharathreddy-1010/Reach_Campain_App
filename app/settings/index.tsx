import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  FileText,
  HelpCircle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { AppHeader } from '../../src/components/common/AppHeader';
import { Button } from '../../src/components/common/Button';
import { ThemeSelector } from '../../src/components/common/ThemeSelector';
import { CampaignRepository } from '../../src/repositories/campaignRepository';
import { UserProfile } from '../../src/types';
import { Radii, Shadows, Spacing, Typography, useTheme } from '../../src/theme';
import { APP_CONFIG } from '../../src/constants';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    CampaignRepository.getUserProfile().then(setProfile);
  }, []);

  const toggleNotifications = async () => {
    if (!profile) return;
    const updated = {
      ...profile,
      notificationsEnabled: !profile.notificationsEnabled,
    };
    setProfile(updated);
    await CampaignRepository.updateUserProfile(updated);
  };

  const toggleEmailReceipts = async () => {
    if (!profile) return;
    const updated = {
      ...profile,
      emailReceiptsEnabled: !profile.emailReceiptsEnabled,
    };
    setProfile(updated);
    await CampaignRepository.updateUserProfile(updated);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Demo Data',
      'This will reset all campaigns, draft states, and contribution receipts back to the initial seeded catalog.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await CampaignRepository.resetToDefaults();
            const p = await CampaignRepository.getUserProfile();
            setProfile(p);
            Alert.alert('Reset Complete', 'Demo database restored to default state.');
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper scrollable={true}>
      <AppHeader showBack={true} title="Settings & Policies" />

      <View style={styles.container}>
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{profile?.name}</Text>
          <Text style={[styles.userRole, { color: colors.textSecondary }]}>{profile?.role}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{profile?.email}</Text>
        </View>

        {/* Theme & Style Selector */}
        <ThemeSelector />

        {/* Notifications & Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>Notifications & Alerts</Text>

          <View style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>In-App Activity Notifications</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Milestone updates, review status, and distribution notices
              </Text>
            </View>
            <Switch
              value={profile?.notificationsEnabled || false}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Email Receipts & Reports</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Receive digital contribution receipts and post-campaign transparency audits
              </Text>
            </View>
            <Switch
              value={profile?.emailReceiptsEnabled || false}
              onValueChange={toggleEmailReceipts}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Platform Business Rules & Policies */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>Platform Policies & Disclosures</Text>

          <TouchableOpacity
            style={[styles.policyRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() =>
              Alert.alert(
                'Distribution, Not Donation Rule',
                APP_CONFIG.disclaimers.distributionNotDonation
              )
            }
          >
            <Shield size={18} color={colors.textSecondary} />
            <Text style={[styles.policyText, { color: colors.textPrimary }]}>Message Distribution vs Donation Distinction</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.policyRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() =>
              Alert.alert(
                'Reach Estimation Model',
                APP_CONFIG.disclaimers.estimateNotGuarantee
              )
            }
          >
            <HelpCircle size={18} color={colors.textSecondary} />
            <Text style={[styles.policyText, { color: colors.textPrimary }]}>Reach Modeling Assumptions & Disclaimers</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.policyRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() =>
              Alert.alert(
                'Fee & Allocation Structure',
                '85% Direct Ad Spend, 10% Review & Ad Operations, 5% Payment Processing & GST.'
              )
            }
          >
            <FileText size={18} color={colors.textSecondary} />
            <Text style={[styles.policyText, { color: colors.textPrimary }]}>Fee Structure & Use of Funds</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.policyRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() =>
              Alert.alert(
                'Refund & Cancellation Policy',
                APP_CONFIG.disclaimers.refundPolicy
              )
            }
          >
            <RotateCcw size={18} color={colors.textSecondary} />
            <Text style={[styles.policyText, { color: colors.textPrimary }]}>Unspent Funds & Refund Guarantee</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* About App */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>About Reach</Text>
          <View style={[styles.aboutBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
            <Text style={[styles.aboutVersion, { color: colors.textPrimary }]}>Reach v1.0.0 (Production Build)</Text>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              Built with Expo React Native. Transparent community amplification platform.
            </Text>
          </View>
        </View>

        {/* Danger Zone: Reset Data */}
        <View style={styles.dangerSection}>
          <Button
            title="Reset All Demo Data"
            onPress={handleResetData}
            variant="outline"
            size="md"
            style={[styles.dangerBtn, { borderColor: colors.danger }]}
            textStyle={{ color: colors.danger }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  userCard: {
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userRole: {
    fontSize: 13,
    marginTop: 2,
  },
  userEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  policyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  aboutBox: {
    padding: 14,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  aboutVersion: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 11,
    lineHeight: 16,
  },
  dangerSection: {
    marginTop: 10,
  },
  dangerBtn: {
    borderWidth: 1,
  },
});
