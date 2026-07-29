import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { mmkv } from '../store'; // Import mmkv directly from your store file
import light from '../constants/light';
import dark from '../constants/dark';
import Strings from '../constants/textConfig';

export type ThemePreference = 'system' | 'light' | 'dark';
type ActiveThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: typeof light;
  colors: typeof light.colors;
  strings: typeof Strings;
  themePreference: ThemePreference; // The user setting ('system' | 'light' | 'dark')
  mode: ActiveThemeMode; // Active rendered mode ('light' | 'dark')
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

const STORAGE_KEY = 'user_theme_preference';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useColorScheme(); // 'light' | 'dark' | null / undefined

  // Read saved preference synchronously from MMKV on startup
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    () => {
      const saved = mmkv.getString(STORAGE_KEY);
      return (saved as ThemePreference) || 'system';
    },
  );

  // Handler to set state and update MMKV storage synchronously
  const setThemePreference = (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    mmkv.set(STORAGE_KEY, preference);
  };

  // Determine actual mode based on system preference or explicit user choice
  const mode: ActiveThemeMode = useMemo(() => {
    if (themePreference === 'system') {
      return deviceColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, deviceColorScheme]);

  const value = useMemo(() => {
    const theme = mode === 'light' ? light : dark;
    return {
      theme,
      colors: theme.colors,
      strings: Strings,
      themePreference,
      mode,
      setThemePreference,
    };
  }, [mode, themePreference]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
