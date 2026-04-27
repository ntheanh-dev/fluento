import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { LOCAL_STORAGE_KEYS } from "@/shared/storage/keys";
import { getLocalStorageItem, setLocalStorageItem } from "@/shared/storage/local-storage";

export type ThemeMode = "light" | "dark";

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = getLocalStorageItem(LOCAL_STORAGE_KEYS.theme);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyDomTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme());

  useEffect(() => {
    applyDomTheme(theme);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    setLocalStorageItem(LOCAL_STORAGE_KEYS.theme, mode);
    applyDomTheme(mode);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
