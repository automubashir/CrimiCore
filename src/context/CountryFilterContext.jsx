import { createContext, useContext, useState, useCallback } from 'react';
import { clearCache } from '../services/api';

const CountryFilterContext = createContext();

const STORAGE_KEY = 'crimicore_country';

export function CountryFilterProvider({ children }) {
  const [country, setCountryState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'All';
    } catch {
      return 'All';
    }
  });

  const setCountry = useCallback((value) => {
    setCountryState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch { /* ignore */ }
    clearCache();
  }, []);

  return (
    <CountryFilterContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryFilterContext.Provider>
  );
}

export function useCountryFilter() {
  const context = useContext(CountryFilterContext);
  if (!context) {
    throw new Error('useCountryFilter must be used within CountryFilterProvider');
  }
  return context;
}
