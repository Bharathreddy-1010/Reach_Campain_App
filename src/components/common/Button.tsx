import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import { Radii, Shadows, useTheme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const { colors, themeId } = useTheme();

  const getContainerStyle = (): StyleProp<ViewStyle> => {
    const list: (StyleProp<ViewStyle> | undefined)[] = [styles.base];

    // Size
    if (size === 'sm') list.push(styles.sizeSm);
    else if (size === 'lg') list.push(styles.sizeLg);
    else list.push(styles.sizeMd);

    // Dynamic Variant Styles
    switch (variant) {
      case 'primary':
      case 'accent':
        list.push({
          backgroundColor: colors.primary,
          shadowColor: themeId === 'glassmorphism' ? '#000000' : colors.primary,
          shadowOffset: { width: 0, height: themeId === 'editorial' ? 2 : 4 },
          shadowOpacity: themeId === 'editorial' ? 0.08 : 0.35,
          shadowRadius: themeId === 'editorial' ? 4 : 10,
          elevation: themeId === 'editorial' ? 2 : 4,
          borderColor: themeId === 'glassmorphism' ? 'rgba(255, 255, 255, 0.40)' : 'transparent',
          borderWidth: themeId === 'glassmorphism' ? 1 : 0,
        });
        break;
      case 'secondary':
        list.push({
          backgroundColor:
            themeId === 'glassmorphism'
              ? 'rgba(255, 255, 255, 0.12)'
              : colors.surfaceSubtle,
          borderWidth: 1,
          borderColor:
            themeId === 'glassmorphism'
              ? 'rgba(255, 255, 255, 0.22)'
              : colors.border,
        });
        break;
      case 'outline':
        list.push({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor:
            themeId === 'glassmorphism'
              ? 'rgba(255, 255, 255, 0.25)'
              : colors.borderDark,
        });
        break;
      case 'ghost':
        list.push({
          backgroundColor: 'transparent',
        });
        break;
      case 'danger':
        list.push({
          backgroundColor: colors.danger,
        });
        break;
    }

    if (themeId === 'glassmorphism' || themeId === 'aurora') {
      list.push({ borderRadius: Radii.full });
    }

    if (disabled || loading) {
      list.push(styles.disabled);
    }

    if (style) list.push(style);

    return list;
  };

  const getTextColor = (): string => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'accent':
        return themeId === 'glassmorphism' ? colors.textInverse : '#FFFFFF';
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
      case 'outline':
        return themeId === 'glassmorphism' ? '#FFFFFF' : colors.textPrimary;
      case 'ghost':
        return themeId === 'glassmorphism' ? colors.primary : colors.primary;
      default:
        return colors.textPrimary;
    }
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const list: (StyleProp<TextStyle> | undefined)[] = [
      styles.baseText,
      { color: getTextColor() },
    ];

    if (size === 'sm') list.push(styles.textSm);
    else if (size === 'lg') list.push(styles.textLg);
    else list.push(styles.textMd);

    if (textStyle) list.push(textStyle);

    return list;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={getContainerStyle()}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  sizeSm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 34,
  },
  sizeMd: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 46,
  },
  sizeLg: {
    paddingHorizontal: 24,
    paddingVertical: 15,
    minHeight: 52,
  },
  disabled: {
    opacity: 0.5,
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 16,
  },
});
