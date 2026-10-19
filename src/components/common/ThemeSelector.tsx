import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Check, Sparkles, Droplets, BookOpen, Layers, Music } from 'lucide-react-native';
import { useTheme, ThemeId, ThemeTokens } from '../../theme';
import { Radii, Shadows, Spacing } from '../../theme';

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  compact = false,
}) => {
  const { themeId, setThemeId, availableThemes, colors } = useTheme();

  const handleSelectTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  const getThemeIcon = (id: ThemeId, isActive: boolean) => {
    const iconColor = isActive ? colors.primary : colors.textSecondary;
    switch (id) {
      case 'editorial':
        return <BookOpen size={18} color={iconColor} />;
      case 'aurora':
        return <Droplets size={18} color={iconColor} />;
      case 'glassmorphism':
        return <Layers size={18} color={iconColor} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextCol}>
          <View style={styles.titleWithIcon}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Appearance & Themes
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Select your preferred visual style. Applied consistently across all screens.
          </Text>
        </View>
      </View>

      <View style={styles.themesGrid}>
        {availableThemes.map((item: ThemeTokens) => {
          const isSelected = item.id === themeId;
          const previewColors = item.colors;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => handleSelectTheme(item.id)}
              style={[
                styles.themeCard,
                {
                  backgroundColor: isSelected ? colors.surfaceSubtle : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  borderRadius: item.id === 'aurora' ? 22 : Radii.md,
                },
                isSelected && styles.themeCardActive,
              ]}
            >
              {/* Mini Preview Box */}
              <View
                style={[
                  styles.previewBox,
                  {
                    backgroundColor: previewColors.background,
                    borderColor: previewColors.border,
                    borderWidth: 1,
                    borderRadius: item.id === 'aurora' ? 14 : Radii.sm,
                  },
                ]}
              >
                {/* Mini Ambient Glow for Glassmorphism Preview */}
                {item.id === 'glassmorphism' && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: 'rgba(129, 140, 248, 0.40)',
                    }}
                  />
                )}
                {/* Mini Mockup Header */}
                <View style={styles.miniMockupHeader}>
                  <View
                    style={[
                      styles.miniMockupLogo,
                      { backgroundColor: previewColors.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.miniMockupNavDot,
                      { backgroundColor: previewColors.accent || previewColors.textMuted },
                    ]}
                  />
                </View>

                {/* Mini Mockup Card */}
                <View
                  style={[
                    styles.miniMockupCard,
                    {
                      backgroundColor:
                        item.id === 'glassmorphism'
                          ? 'rgba(28, 30, 38, 0.90)'
                          : previewColors.surface,
                      borderColor:
                        item.id === 'glassmorphism'
                          ? 'rgba(255, 255, 255, 0.45)'
                          : previewColors.border,
                      borderRadius: item.id === 'aurora' ? 10 : item.id === 'editorial' ? 3 : 8,
                      borderWidth: item.id === 'glassmorphism' ? 1.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.miniLineTitle,
                      { backgroundColor: previewColors.textPrimary },
                    ]}
                  />
                  <View
                    style={[
                      styles.miniLineSub,
                      { backgroundColor: previewColors.textSecondary },
                    ]}
                  />
                  <View
                    style={[
                      styles.miniButton,
                      {
                        backgroundColor: previewColors.primary,
                        borderRadius: item.id === 'editorial' ? 3 : 9999,
                      },
                    ]}
                  />
                </View>

                {/* Swatch dots */}
                <View style={styles.swatchRow}>
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: previewColors.background },
                    ]}
                  />
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: previewColors.surface },
                    ]}
                  />
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: previewColors.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: previewColors.accent },
                    ]}
                  />
                </View>
              </View>

              {/* Theme Meta Info */}
              <View style={styles.themeInfoCol}>
                <View style={styles.themeTitleRow}>
                  <View style={styles.themeNameGroup}>
                    {getThemeIcon(item.id, isSelected)}
                    <Text
                      style={[
                        styles.themeName,
                        { color: colors.textPrimary },
                        isSelected && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>

                  {/* Active Indicator or Default Badge */}
                  {isSelected ? (
                    <View
                      style={[
                        styles.activeBadge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  ) : item.id === 'editorial' ? (
                    <View
                      style={[
                        styles.defaultBadge,
                        { borderColor: colors.borderDark },
                      ]}
                    >
                      <Text style={[styles.defaultBadgeText, { color: colors.textMuted }]}>
                        Default
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text
                  style={[styles.themeTagline, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.tagline}
                </Text>

                <Text
                  style={[styles.themeDescription, { color: colors.textMuted }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    ...Shadows.subtle,
  },
  headerRow: {
    marginBottom: Spacing.md,
  },
  headerTextCol: {
    flex: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  themesGrid: {
    gap: 12,
  },
  themeCard: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    alignItems: Platform.select({ web: 'center', default: 'stretch' }),
    borderRadius: Radii.md,
    borderWidth: 1.5,
    padding: 12,
    gap: 12,
  },
  themeCardActive: {
    borderWidth: 2,
  },
  previewBox: {
    width: Platform.OS === 'web' ? 110 : '100%',
    height: 84,
    borderRadius: Radii.sm,
    borderWidth: 1,
    padding: 6,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  miniMockupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniMockupLogo: {
    width: 14,
    height: 5,
    borderRadius: 2,
  },
  miniMockupNavDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  miniMockupCard: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    gap: 3,
  },
  miniLineTitle: {
    width: '65%',
    height: 4,
    borderRadius: 2,
  },
  miniLineSub: {
    width: '85%',
    height: 3,
    borderRadius: 1.5,
  },
  miniButton: {
    width: 28,
    height: 6,
    borderRadius: 2,
    marginTop: 2,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 4,
  },
  swatchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  themeInfoCol: {
    flex: 1,
  },
  themeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  themeNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  defaultBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.xs,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  themeTagline: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: 11,
    lineHeight: 15,
  },
});
