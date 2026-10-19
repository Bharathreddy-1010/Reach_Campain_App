import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Megaphone,
  FileText,
  Check,
  Clock,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { EmptyState } from '../../src/components/common/EmptyState';
import { CampaignRepository } from '../../src/repositories/campaignRepository';
import { ActivityNotification, NotificationType } from '../../src/types';
import { Radii, Shadows, Spacing, Typography, useTheme } from '../../src/theme';

export default function ActivityScreen() {
  const router = useRouter();
  const { colors, themeId } = useTheme();
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'milestones' | 'contributions'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    const list = await CampaignRepository.getNotifications();
    setNotifications(list);
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await CampaignRepository.markAllNotificationsAsRead();
    await loadNotifications();
  };

  const handleNotificationPress = async (item: ActivityNotification) => {
    await CampaignRepository.markNotificationAsRead(item.id);
    await loadNotifications();
    if (item.campaignId) {
      router.push({
        pathname: '/campaign/[id]',
        params: { id: item.campaignId },
      });
    }
  };

  const filteredList = notifications.filter((item) => {
    if (filterTab === 'milestones') {
      return (
        item.type === 'funding_milestone' ||
        item.type === 'promotion_begun' ||
        item.type === 'campaign_completed' ||
        item.type === 'campaign_approved'
      );
    }
    if (filterTab === 'contributions') {
      return (
        item.type === 'contribution_success' ||
        item.type === 'contribution_failed'
      );
    }
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'contribution_success':
        return <CheckCircle size={18} color={colors.success} />;
      case 'contribution_failed':
        return <AlertCircle size={18} color={colors.danger} />;
      case 'funding_milestone':
        return <TrendingUp size={18} color={colors.accent} />;
      case 'promotion_begun':
        return <Megaphone size={18} color={colors.primary} />;
      case 'report_available':
      case 'campaign_completed':
        return <FileText size={18} color={colors.primary} />;
      case 'changes_requested':
        return <AlertCircle size={18} color={colors.warning} />;
      default:
        return <Bell size={18} color={colors.textSecondary} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ScreenWrapper scrollable={false}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Activity Center</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
              <Check size={12} color={colors.accent} />
              <Text style={[styles.markAllText, { color: colors.accent }]}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Real-time updates on campaign reviews, funding milestones, and ad distributions.
        </Text>

        {/* Filter Pills */}
        <View style={[styles.filterRow, themeId === 'aurora' && { gap: 10, marginTop: 12 }]}>
          <TouchableOpacity
            onPress={() => setFilterTab('all')}
            style={[
              styles.filterChip,
              {
                backgroundColor: filterTab === 'all' ? colors.primary : colors.surface,
                borderColor: filterTab === 'all' ? colors.primary : colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 22 : Radii.sm,
                paddingHorizontal: 16,
                paddingVertical: 8,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: filterTab === 'all' ? colors.textInverse : colors.textSecondary,
                  fontWeight: filterTab === 'all' ? '700' : '500',
                  fontSize: 13,
                },
              ]}
            >
              All Activity ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterTab('milestones')}
            style={[
              styles.filterChip,
              {
                backgroundColor: filterTab === 'milestones' ? colors.primary : colors.surface,
                borderColor: filterTab === 'milestones' ? colors.primary : colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 22 : Radii.sm,
                paddingHorizontal: 16,
                paddingVertical: 8,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: filterTab === 'milestones' ? colors.textInverse : colors.textSecondary,
                  fontWeight: filterTab === 'milestones' ? '700' : '500',
                  fontSize: 13,
                },
              ]}
            >
              Milestones & Ads
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterTab('contributions')}
            style={[
              styles.filterChip,
              {
                backgroundColor: filterTab === 'contributions' ? colors.primary : colors.surface,
                borderColor: filterTab === 'contributions' ? colors.primary : colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 22 : Radii.sm,
                paddingHorizontal: 16,
                paddingVertical: 8,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: filterTab === 'contributions' ? colors.textInverse : colors.textSecondary,
                  fontWeight: filterTab === 'contributions' ? '700' : '500',
                  fontSize: 13,
                },
              ]}
            >
              Contributions
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleNotificationPress(item)}
            style={[
              styles.notificationCard,
              {
                backgroundColor: item.read ? colors.surface : colors.surfaceSubtle,
                borderColor: item.read ? colors.border : colors.primary,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' ? 22 : Radii.md,
              },
            ]}
          >
            <View style={styles.iconCol}>{getNotificationIcon(item.type)}</View>
            <View style={styles.contentCol}>
              <View style={styles.notifTitleRow}>
                <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
              </View>
              <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>{item.message}</Text>
              <View style={styles.notifMetaRow}>
                <Clock size={11} color={colors.textMuted} />
                <Text style={[styles.notifTime, { color: colors.textMuted }]}>
                  {new Date(item.timestamp).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Bell size={32} color={colors.textSecondary} />}
            title="No Activity Yet"
            description="When you back campaigns or submit messages, status updates and milestone notices appear here."
          />
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sub: {
    fontSize: 12,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 48,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
    ...Shadows.subtle,
  },
  iconCol: {
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },
  notifMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifTime: {
    fontSize: 10,
  },
});
