import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react-native';
import { Colors, Radii, Spacing, useTheme } from '../../theme';

interface BannerProps {
  title?: string;
  message: string;
  variant?: 'info' | 'warning' | 'success' | 'neutral';
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const Banner: React.FC<BannerProps> = ({
  title,
  message,
  variant = 'neutral',
  action,
  style,
}) => {
  const { colors, themeId } = useTheme();

  let bg = colors.surfaceSubtle;
  let border = colors.border;
  let text = colors.textPrimary;
  let messageColor = colors.textSecondary;
  let icon = <Info size={16} color={colors.textSecondary} />;

  if (themeId === 'glassmorphism') {
    bg = 'rgba(255, 255, 255, 0.08)';
    border = 'rgba(255, 255, 255, 0.16)';
    text = '#FFFFFF';
    messageColor = 'rgba(255, 255, 255, 0.70)';
    switch (variant) {
      case 'info':
        icon = <Info size={16} color={colors.info} />;
        break;
      case 'warning':
        icon = <AlertTriangle size={16} color={colors.warning} />;
        break;
      case 'success':
        icon = <CheckCircle size={16} color={colors.success} />;
        break;
      case 'neutral':
      default:
        icon = <AlertCircle size={16} color={colors.textSecondary} />;
        break;
    }
  } else {
    switch (variant) {
      case 'info':
        bg = colors.infoMuted;
        border = '#BFDBFE';
        text = colors.info;
        icon = <Info size={16} color={colors.info} />;
        break;
      case 'warning':
        bg = colors.warningMuted;
        border = '#FDE68A';
        text = colors.warning;
        icon = <AlertTriangle size={16} color={colors.warning} />;
        break;
      case 'success':
        bg = colors.successMuted;
        border = '#BBF7D0';
        text = colors.success;
        icon = <CheckCircle size={16} color={colors.success} />;
        break;
      case 'neutral':
      default:
        bg = colors.surfaceHighlight;
        border = colors.border;
        text = colors.textPrimary;
        icon = <AlertCircle size={16} color={colors.textSecondary} />;
        break;
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: themeId === 'aurora' ? 18 : Radii.md,
        },
        style,
      ]}
    >
      <View style={styles.iconCol}>{icon}</View>
      <View style={styles.contentCol}>
        {title && <Text style={[styles.title, { color: text }]}>{title}</Text>}
        <Text style={[styles.message, { color: messageColor }]}>{message}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress} style={styles.actionBtn}>
            <Text
              style={[
                styles.actionText,
                { color: colors.primary },
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 10,
  },
  iconCol: {
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  actionBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
