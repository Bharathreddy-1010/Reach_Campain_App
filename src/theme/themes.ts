export type ThemeId = 'editorial' | 'aurora' | 'glassmorphism';

export interface CategoryPalette {
  bg: string;
  text: string;
  border: string;
}

export interface ThemeColors {
  // Background & Surfaces
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceHighlight: string;

  // Borders
  border: string;
  borderLight: string;
  borderDark: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Brand / Actions
  primary: string;
  primaryLight: string;
  primaryMuted: string;
  accent: string;
  accentMuted: string;

  // Status
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  danger: string;
  dangerMuted: string;
  info: string;
  infoMuted: string;

  // Categories
  category: {
    Environment: CategoryPalette;
    Health: CategoryPalette;
    Science: CategoryPalette;
    Education: CategoryPalette;
    'Public Policy': CategoryPalette;
    'Economic Policy': CategoryPalette;
    Community: CategoryPalette;
    'Arts & Culture': CategoryPalette;
    Business: CategoryPalette;
    Other: CategoryPalette;
  };

  // Navigation
  nav: {
    tabBarBg: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
  };

  // Card specific
  card: {
    bg: string;
    border: string;
    shadow: string;
  };

  // Visual effects
  glassBorder: string;
  gradientColors: [string, string, ...string[]];
}

export interface ThemeTokens {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  isDark: boolean;
  statusBarStyle: 'dark-content' | 'light-content';
  colors: ThemeColors;
}

export const THEMES: Record<ThemeId, ThemeTokens> = {
  // 1. Classic Editorial (Current Default)
  editorial: {
    id: 'editorial',
    name: 'Classic Editorial',
    tagline: 'Clean & high-contrast editorial',
    description: 'Warm ivory canvas with deep navy typography, crisp borders, and refined editorial styling.',
    isDark: false,
    statusBarStyle: 'dark-content',
    colors: {
      background: '#FAF9F6',
      surface: '#FFFFFF',
      surfaceSubtle: '#F4F3EE',
      surfaceHighlight: '#EDECE6',
      border: '#E6E4DD',
      borderLight: '#F0EFEA',
      borderDark: '#D4D1C7',
      textPrimary: '#111215',
      textSecondary: '#5A5D64',
      textMuted: '#8E919A',
      textInverse: '#FFFFFF',
      primary: '#1D3557',
      primaryLight: '#2A4A7B',
      primaryMuted: '#EBF1F9',
      accent: '#1D3557',
      accentMuted: '#EBF1F9',
      success: '#15803D',
      successMuted: '#DCFCE7',
      warning: '#B45309',
      warningMuted: '#FEF3C7',
      danger: '#B91C1C',
      dangerMuted: '#FEE2E2',
      info: '#1D4ED8',
      infoMuted: '#DBEAFE',
      category: {
        Environment: { bg: '#E8F5E9', text: '#166534', border: '#BBF7D0' },
        Health: { bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3' },
        Science: { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
        Education: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
        'Public Policy': { bg: '#E0F2FE', text: '#075985', border: '#BAE6FD' },
        'Economic Policy': { bg: '#CCFBF1', text: '#115E59', border: '#99F6E4' },
        Community: { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' },
        'Arts & Culture': { bg: '#FDF4FF', text: '#86198F', border: '#F5D0FE' },
        Business: { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1' },
        Other: { bg: '#F4F4F5', text: '#52525B', border: '#E4E4E7' },
      },
      nav: {
        tabBarBg: '#FFFFFF',
        tabBarBorder: '#F0EFEA',
        tabBarActive: '#1D3557',
        tabBarInactive: '#8E919A',
      },
      card: {
        bg: '#FFFFFF',
        border: '#E6E4DD',
        shadow: 'rgba(0, 0, 0, 0.05)',
      },
      glassBorder: '#E6E4DD',
      gradientColors: ['#1D3557', '#2A4A7B'],
    },
  },

  // 2. Dark Chocolate (Rich dark roasted cocoa & warm amber)
  aurora: {
    id: 'aurora',
    name: 'Dark Chocolate',
    tagline: 'Rich cocoa & warm amber',
    description:
      'Velvety dark cocoa canvas with rich chocolate pillowed cards, creamy vanilla typography, and warm sunlit amber accents.',
    isDark: true,
    statusBarStyle: 'light-content',
    colors: {
      background: '#1F1510', // Deep roasted dark cocoa canvas
      surface: '#2D1F18', // Rich velvety chocolate card surface
      surfaceSubtle: '#382820', // Warm subtle chocolate contour
      surfaceHighlight: '#443228', // Elevated chocolate highlight
      border: '#433026', // Delicate warm cacao hairline border
      borderLight: '#523D32', // Subtle separator
      borderDark: '#261A14', // Deep cocoa contour
      textPrimary: '#FBF6EE', // Creamy warm vanilla ivory text
      textSecondary: '#D1BEB0', // Warm cafe-au-lait / oat tone
      textMuted: '#9B8577', // Soft roasted cocoa gray-brown
      textInverse: '#1F1510', // Dark cocoa on light elements
      primary: '#B8734A', // Warm golden roasted caramel / milk chocolate
      primaryLight: '#C9855B', // Lighter caramel
      primaryMuted: 'rgba(184, 115, 74, 0.18)', // Warm caramel wash
      accent: '#FF9E4A', // Sunlit amber / golden honeycomb
      accentMuted: 'rgba(255, 158, 74, 0.18)', // Amber wash
      success: '#4EA367',
      successMuted: 'rgba(78, 163, 103, 0.18)',
      warning: '#E89038',
      warningMuted: 'rgba(232, 144, 56, 0.18)',
      danger: '#E5534B',
      dangerMuted: 'rgba(229, 83, 75, 0.18)',
      info: '#5B92B5',
      infoMuted: 'rgba(91, 146, 181, 0.18)',
      category: {
        Environment: { bg: '#25352A', text: '#7BD196', border: '#3A5240' },
        Health: { bg: '#392220', text: '#F48E87', border: '#593431' },
        Science: { bg: '#23323D', text: '#81BBDC', border: '#354D5E' },
        Education: { bg: '#3D2C1E', text: '#FFB876', border: '#5C412C' },
        'Public Policy': { bg: '#342B24', text: '#D1BEB0', border: '#4E3F34' },
        'Economic Policy': { bg: '#203632', text: '#6ED5C4', border: '#30524B' },
        Community: { bg: '#3A281E', text: '#FFA76B', border: '#573B2C' },
        'Arts & Culture': { bg: '#392434', text: '#E58ED8', border: '#57374F' },
        Business: { bg: '#332922', text: '#C7B9AD', border: '#4D3E33' },
        Other: { bg: '#2E241E', text: '#B8A89C', border: '#45362D' },
      },
      nav: {
        tabBarBg: '#1C130E',
        tabBarBorder: '#382820',
        tabBarActive: '#FF9E4A',
        tabBarInactive: '#9B8577',
      },
      card: {
        bg: '#2D1F18',
        border: '#433026',
        shadow: 'rgba(0, 0, 0, 0.40)',
      },
      glassBorder: '#433026',
      gradientColors: ['#443228', '#2D1F18', '#1F1510'],
    },
  },

  // 3. Frosted Glass (Inspired by User Reference - Smoky Glassmorphic Style)
  glassmorphism: {
    id: 'glassmorphism',
    name: 'Frosted Glass',
    tagline: 'Smoky glass & luminous contours',
    description:
      'Smoky dark graphite canvas with frosted translucent glass cards, crisp white typography, and luminous hairline borders.',
    isDark: true,
    statusBarStyle: 'light-content',
    colors: {
      background: '#141519', // Deep moody graphite/obsidian matching reference
      surface: 'rgba(255, 255, 255, 0.08)', // Translucent frosted smoky glass
      surfaceSubtle: 'rgba(255, 255, 255, 0.05)',
      surfaceHighlight: 'rgba(255, 255, 255, 0.14)',
      border: 'rgba(255, 255, 255, 0.18)', // Crisp hairline rim light
      borderLight: 'rgba(255, 255, 255, 0.10)',
      borderDark: 'rgba(255, 255, 255, 0.28)',
      textPrimary: '#FFFFFF', // 100% crisp white heading
      textSecondary: 'rgba(255, 255, 255, 0.65)', // Misty warm silver
      textMuted: 'rgba(255, 255, 255, 0.40)',
      textInverse: '#141519',
      primary: '#F4F4F5', // Luminous frosted pill / highlight
      primaryLight: '#FFFFFF',
      primaryMuted: 'rgba(255, 255, 255, 0.14)',
      accent: '#E4E4E7',
      accentMuted: 'rgba(255, 255, 255, 0.10)',
      success: '#34D399',
      successMuted: 'rgba(52, 211, 153, 0.15)',
      warning: '#FBBF24',
      warningMuted: 'rgba(251, 191, 36, 0.15)',
      danger: '#F87171',
      dangerMuted: 'rgba(248, 113, 113, 0.15)',
      info: '#93C5FD',
      infoMuted: 'rgba(147, 197, 253, 0.15)',
      category: {
        Environment: { bg: 'rgba(52, 211, 153, 0.12)', text: '#A7F3D0', border: 'rgba(52, 211, 153, 0.25)' },
        Health: { bg: 'rgba(244, 114, 182, 0.12)', text: '#FBCFE8', border: 'rgba(244, 114, 182, 0.25)' },
        Science: { bg: 'rgba(147, 197, 253, 0.12)', text: '#BFDBFE', border: 'rgba(147, 197, 253, 0.25)' },
        Education: { bg: 'rgba(251, 191, 36, 0.12)', text: '#FDE68A', border: 'rgba(251, 191, 36, 0.25)' },
        'Public Policy': { bg: 'rgba(56, 189, 248, 0.12)', text: '#BAE6FD', border: 'rgba(56, 189, 248, 0.25)' },
        'Economic Policy': { bg: 'rgba(45, 212, 191, 0.12)', text: '#99F6E4', border: 'rgba(45, 212, 191, 0.25)' },
        Community: { bg: 'rgba(192, 132, 252, 0.12)', text: '#E9D5FF', border: 'rgba(192, 132, 252, 0.25)' },
        'Arts & Culture': { bg: 'rgba(244, 114, 182, 0.12)', text: '#FCE7F3', border: 'rgba(244, 114, 182, 0.25)' },
        Business: { bg: 'rgba(148, 163, 184, 0.12)', text: '#E2E8F0', border: 'rgba(148, 163, 184, 0.25)' },
        Other: { bg: 'rgba(161, 161, 170, 0.12)', text: '#E4E4E7', border: 'rgba(161, 161, 170, 0.25)' },
      },
      nav: {
        tabBarBg: 'rgba(18, 19, 24, 0.94)',
        tabBarBorder: 'rgba(255, 255, 255, 0.10)',
        tabBarActive: '#FFFFFF',
        tabBarInactive: 'rgba(255, 255, 255, 0.42)',
      },
      card: {
        bg: 'rgba(28, 30, 38, 0.82)',
        border: 'rgba(255, 255, 255, 0.28)',
        shadow: 'rgba(129, 140, 248, 0.28)',
      },
      glassBorder: 'rgba(255, 255, 255, 0.32)',
      gradientColors: ['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.08)'],
    },
  },
};
