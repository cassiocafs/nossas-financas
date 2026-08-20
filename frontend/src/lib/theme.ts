export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const mq = window.matchMedia("(prefers-color-scheme: dark)");

function apply(theme: Theme) {
  const dark = theme === "system" ? mq.matches : theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
}

export function getTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  apply(theme);
}

export function initTheme() {
  apply(getTheme());
  mq.addEventListener("change", () => {
    if (getTheme() === "system") apply("system");
  });
}
