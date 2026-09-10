import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface PreferencesContextValue {
  hideValues: boolean;
  toggleHideValues: () => void;
}

const STORAGE_KEY = "hideValues";

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function lerHideValuesInicial(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [hideValues, setHideValues] = useState(lerHideValuesInicial);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      hideValues,
      toggleHideValues: () =>
        setHideValues((atual) => {
          const proximo = !atual;
          localStorage.setItem(STORAGE_KEY, String(proximo));
          return proximo;
        }),
    }),
    [hideValues],
  );

  return <PreferencesContext value={value}>{children}</PreferencesContext>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences deve ser usado dentro de PreferencesProvider");
  }
  return context;
}
