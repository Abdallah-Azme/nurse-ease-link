import { useEffect, useState } from "react";

const KEY = "careconnect.role";
const THEME_KEY = "careconnect.theme";

export type RoleSlug = "patient" | "nurse" | "doctor" | "admin";

export function useRole(): [RoleSlug, (r: RoleSlug) => void] {
  const [role, setRole] = useState<RoleSlug>("patient");
  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(KEY)) as RoleSlug | null;
    if (stored) setRole(stored);
  }, []);
  const update = (r: RoleSlug) => {
    setRole(r);
    if (typeof window !== "undefined") localStorage.setItem(KEY, r);
  };
  return [role, update];
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(THEME_KEY)) as
      | "light"
      | "dark"
      | null;
    const initial =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(THEME_KEY, next);
  };
  return { theme, toggle };
}
