import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import light from '../constants/light';
import dark from '../constants/dark';
import Strings from '../constants/textConfig';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: typeof light;
  colors: typeof light.colors;
  strings: typeof Strings;
  mode: ThemeMode;
  setMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
}

const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType,
);

export const ThemeProvider = ({children,}: {children: React.ReactNode}) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  const value = useMemo(() => {
    const theme = mode === 'light' ? light : dark;
    return { theme, colors: theme.colors, strings: Strings, mode, setMode };
  }, [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () =>
  useContext(ThemeContext);