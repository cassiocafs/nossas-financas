import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ColorSchemeOverride = 'system' | 'light' | 'dark';

interface PreferencesContextValue {
  colorSchemeOverride: ColorSchemeOverride;
  setColorSchemeOverride: (value: ColorSchemeOverride) => void;
  hideValues: boolean;
  setHideValues: (value: boolean) => void;
  toggleHideValues: () => void;
}

const STORAGE_KEY = '@nossas-financas/preferencias';

const defaultValue: PreferencesContextValue = {
  colorSchemeOverride: 'system',
  setColorSchemeOverride: () => {},
  hideValues: false,
  setHideValues: () => {},
  toggleHideValues: () => {},
};

const PreferencesContext = createContext<PreferencesContextValue>(defaultValue);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [colorSchemeOverride, setColorSchemeOverrideState] = useState<ColorSchemeOverride>('system');
  const [hideValues, setHideValuesState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const salvo = JSON.parse(raw) as Partial<{ colorSchemeOverride: ColorSchemeOverride; hideValues: boolean }>;
        if (salvo.colorSchemeOverride) setColorSchemeOverrideState(salvo.colorSchemeOverride);
        if (typeof salvo.hideValues === 'boolean') setHideValuesState(salvo.hideValues);
      })
      .catch(() => {});
  }, []);

  function persistir(next: { colorSchemeOverride: ColorSchemeOverride; hideValues: boolean }) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }

  function setColorSchemeOverride(value: ColorSchemeOverride) {
    setColorSchemeOverrideState(value);
    persistir({ colorSchemeOverride: value, hideValues });
  }

  function setHideValues(value: boolean) {
    setHideValuesState(value);
    persistir({ colorSchemeOverride, hideValues: value });
  }

  function toggleHideValues() {
    setHideValues(!hideValues);
  }

  return (
    <PreferencesContext.Provider
      value={{ colorSchemeOverride, setColorSchemeOverride, hideValues, setHideValues, toggleHideValues }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
