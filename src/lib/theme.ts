/**
 * theme.ts
 * Shared dark-mode utilities: apply / read the saved preference from localStorage.
 * Call `applyStoredTheme()` on app mount to restore the user's last preference.
 */

/** Read localStorage and apply the `.dark` class to <html> */
export function applyStoredTheme() {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}

/** Toggle dark mode, persist to localStorage, and return the new value */
export function toggleTheme(current: boolean): boolean {
    const next = !current;
    localStorage.setItem("darkMode", String(next));
    if (next) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
    return next;
}

/** Read current theme preference from localStorage */
export function getStoredTheme(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("darkMode") === "true";
}
