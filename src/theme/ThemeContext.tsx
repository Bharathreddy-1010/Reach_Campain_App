import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeId, ThemeTokens, ThemeColors, THEMES } from './themes';

export const THEME_STORAGE_KEY = '@reach:theme_id';

interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeTokens;
  colors: ThemeColors;
  isDark: boolean;
  statusBarStyle: 'dark-content' | 'light-content';
  setThemeId: (id: ThemeId) => Promise<void>;
  availableThemes: ThemeTokens[];
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'editorial',
  theme: THEMES.editorial,
  colors: THEMES.editorial.colors,
  isDark: false,
  statusBarStyle: 'dark-content',
  setThemeId: async () => {},
  availableThemes: Object.values(THEMES),
});

interface ThemeProviderProps {
  children: React.ReactNode;
  onThemeChanged?: (themeId: ThemeId) => void;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  onThemeChanged,
}) => {
  const [themeId, setThemeIdState] = useState<ThemeId>('editorial');

  // Load saved theme on mount
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && (saved === 'editorial' || saved === 'aurora' || saved === 'glassmorphism')) {
          setThemeIdState(saved as ThemeId);
          if (onThemeChanged) onThemeChanged(saved as ThemeId);
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      }
    };
    loadSavedTheme();
  }, [onThemeChanged]);

  const setThemeId = async (id: ThemeId) => {
    if (!THEMES[id]) return;
    setThemeIdState(id);
    if (onThemeChanged) onThemeChanged(id);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, id);
    } catch (e) {
      console.warn('Failed to persist theme preference:', e);
    }
  };

  const currentTheme = THEMES[themeId] || THEMES.editorial;

  const value: ThemeContextValue = {
    themeId,
    theme: currentTheme,
    colors: currentTheme.colors,
    isDark: currentTheme.isDark,
    statusBarStyle: currentTheme.statusBarStyle,
    setThemeId,
    availableThemes: [THEMES.editorial, THEMES.aurora, THEMES.glassmorphism],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      themeId: 'editorial',
      theme: THEMES.editorial,
      colors: THEMES.editorial.colors,
      isDark: false,
      statusBarStyle: 'dark-content',
      setThemeId: async () => {},
      availableThemes: Object.values(THEMES),
    };
  }
  return ctx;
};
