import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeChanger.css';

export default function ThemeChanger() {
  const {
    theme,
    setTheme,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown,
    themes,
    themeLabels,
    themeIcons,
  } = useTheme();

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, closeDropdown]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="theme-changer" ref={dropdownRef}>
      <button
        className="theme-changer-btn"
        onClick={toggleDropdown}
        aria-label="Change theme"
        aria-expanded={isDropdownOpen}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span className="theme-changer-label">{themeIcons[theme]}</span>
      </button>

      {isDropdownOpen && (
        <div className="theme-dropdown animate-scale-in">
          <div className="theme-dropdown-header">
            <span className="theme-dropdown-title">Select Theme</span>
          </div>
          
          <div className="theme-dropdown-items">
            <button
              className={`theme-dropdown-item ${theme === themes.DARK_CLASSIC ? 'active' : ''}`}
              onClick={() => handleThemeChange(themes.DARK_CLASSIC)}
            >
              <span className="theme-icon-preview">{themeIcons[themes.DARK_CLASSIC]}</span>
              <div className="theme-item-info">
                <span className="theme-item-name">{themeLabels[themes.DARK_CLASSIC]}</span>
                <span className="theme-item-desc">Classic dark with blue accents</span>
              </div>
              {theme === themes.DARK_CLASSIC && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="check-icon">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </button>

            <button
              className={`theme-dropdown-item ${theme === themes.DARK_MIDNIGHT ? 'active' : ''}`}
              onClick={() => handleThemeChange(themes.DARK_MIDNIGHT)}
            >
              <span className="theme-icon-preview">{themeIcons[themes.DARK_MIDNIGHT]}</span>
              <div className="theme-item-info">
                <span className="theme-item-name">{themeLabels[themes.DARK_MIDNIGHT]}</span>
                <span className="theme-item-desc">Deep dark with purple accents</span>
              </div>
              {theme === themes.DARK_MIDNIGHT && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="check-icon">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </button>

            <button
              className={`theme-dropdown-item ${theme === themes.LIGHT_MODERN ? 'active' : ''}`}
              onClick={() => handleThemeChange(themes.LIGHT_MODERN)}
            >
              <span className="theme-icon-preview">{themeIcons[themes.LIGHT_MODERN]}</span>
              <div className="theme-item-info">
                <span className="theme-item-name">{themeLabels[themes.LIGHT_MODERN]}</span>
                <span className="theme-item-desc">Clean and airy light theme</span>
              </div>
              {theme === themes.LIGHT_MODERN && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="check-icon">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </button>

            <button
              className={`theme-dropdown-item ${theme === themes.LIGHT_PROFESSIONAL ? 'active' : ''}`}
              onClick={() => handleThemeChange(themes.LIGHT_PROFESSIONAL)}
            >
              <span className="theme-icon-preview">{themeIcons[themes.LIGHT_PROFESSIONAL]}</span>
              <div className="theme-item-info">
                <span className="theme-item-name">{themeLabels[themes.LIGHT_PROFESSIONAL]}</span>
                <span className="theme-item-desc">Corporate high contrast</span>
              </div>
              {theme === themes.LIGHT_PROFESSIONAL && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="check-icon">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
