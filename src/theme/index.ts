import { THEMES, ThemeId, ThemeTokens, ThemeColors } from './themes';

export * from './themes';
export * from './ThemeContext';

// Mutable Colors singleton starting with Classic Editorial (Default)
export const Colors: ThemeColors = {
  ...THEMES.editorial.colors,
  category: { ...THEMES.editorial.colors.category },
  nav: { ...THEMES.editorial.colors.nav },
  card: { ...THEMES.editorial.colors.card },
};

export const setActiveTheme = (id: ThemeId) => {
  const chosen = THEMES[id];
  if (chosen) {
    Object.assign(Colors, chosen.colors);
    Colors.category = { ...chosen.colors.category };
    Colors.nav = { ...chosen.colors.nav };
    Colors.card = { ...chosen.colors.card };
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Typography = {
  displayTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: Colors.textPrimary,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 23,
    letterSpacing: -0.2,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  bodyRegular: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  micro: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.3,
    color: Colors.textMuted,
  },
};

export const Shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
};
