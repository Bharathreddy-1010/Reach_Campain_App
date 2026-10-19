import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Radii, useTheme } from '../../theme';
import { Category, CampaignStatus } from '../../types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  style,
}) => {
  const { colors } = useTheme();
  const scheme = colors.category[category] || colors.category.Other;
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
        },
        isSm ? styles.smBadge : styles.mdBadge,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: scheme.text },
          isSm ? styles.smText : styles.mdText,
        ]}
      >
        {category}
      </Text>
    </View>
  );
};

interface StatusPillProps {
  status: CampaignStatus;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  style,
}) => {
  const { colors } = useTheme();

  let label = 'Draft';
  let bg = colors.surfaceHighlight;
  let text = colors.textSecondary;
  let border = colors.border;

  switch (status) {
    case 'draft':
      label = 'Draft';
      bg = colors.surfaceSubtle;
      text = colors.textSecondary;
      border = colors.border;
      break;
    case 'submitted':
      label = 'Under Review';
      bg = colors.warningMuted;
      text = colors.warning;
      border = colors.warning;
      break;
    case 'approved':
      label = 'Approved';
      bg = colors.successMuted;
      text = colors.success;
      border = colors.success;
      break;
    case 'changes_requested':
      label = 'Changes Requested';
      bg = colors.dangerMuted;
      text = colors.danger;
      border = colors.danger;
      break;
    case 'funding':
      label = 'Funding';
      bg = colors.primaryMuted;
      text = colors.primary;
      border = colors.primary;
      break;
    case 'funding_reached':
      label = '100% Funded';
      bg = colors.successMuted;
      text = colors.success;
      border = colors.success;
      break;
    case 'prep_distribution':
      label = 'Ad Prep';
      bg = colors.surfaceSubtle;
      text = colors.primary;
      border = colors.borderDark;
      break;
    case 'promoting':
      label = 'Promoting';
      bg = colors.successMuted;
      text = colors.success;
      border = colors.success;
      break;
    case 'completed':
      label = 'Completed';
      bg = colors.surfaceHighlight;
      text = colors.textPrimary;
      border = colors.borderDark;
      break;
    case 'rejected':
      label = 'Rejected';
      bg = colors.dangerMuted;
      text = colors.danger;
      border = colors.danger;
      break;
    case 'cancelled':
      label = 'Cancelled';
      bg = colors.surfaceHighlight;
      text = colors.textMuted;
      border = colors.border;
      break;
  }

  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        isSm ? styles.smBadge : styles.mdBadge,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: text },
          isSm ? styles.smText : styles.mdText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '600',
  },
  smText: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  mdText: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
