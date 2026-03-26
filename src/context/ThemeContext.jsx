import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(undefined);

export const THEMES = {
  DARK_CLASSIC: 'dark-classic',
  DARK_MIDNIGHT: 'dark-midnight',
  LIGHT_MODERN: 'light-modern',
  LIGHT_PROFESSIONAL: 'light-professional',
};

export const THEME_LABELS = {
  [THEMES.DARK_CLASSIC]: 'Dark Classic',
  [THEMES.DARK_MIDNIGHT]: 'Dark Midnight',
  [THEMES.LIGHT_MODERN]: 'Light Modern',
  [THEMES.LIGHT_PROFESSIONAL]: 'Light Professional',
};

export const THEME_ICONS = {
  [THEMES.DARK_CLASSIC]: '🌙',
  [THEMES.DARK_MIDNIGHT]: '🌌',
  [THEMES.LIGHT_MODERN]: '☀️',
  [THEMES.LIGHT_PROFESSIONAL]: '💼',
};

const STORAGE_KEY = 'crimepanel-theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && Object.values(THEMES).includes(saved)) {
      return saved;
    }
    return THEMES.DARK_CLASSIC;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const isDark = theme.startsWith('dark-');
  const isLight = theme.startsWith('light-');

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: changeTheme,
        isDropdownOpen,
        toggleDropdown,
        closeDropdown,
        isDark,
        isLight,
        themes: THEMES,
        themeLabels: THEME_LABELS,
        themeIcons: THEME_ICONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
