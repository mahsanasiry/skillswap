"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Theme = "light" | "dark";

const KEY = "skillswap:theme";
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

/** The inline script in layout.tsx has already set data-theme before first paint. */
function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // storage blocked: the theme still changes, it just will not be remembered
    }
    setTheme(next);
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
