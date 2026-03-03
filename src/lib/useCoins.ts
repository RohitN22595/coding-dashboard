"use client";

import { useState, useEffect, useCallback } from "react";

const COINS_KEY = "games_coins";

/** Read current coin balance directly from localStorage (sync, no React) */
export function getCoinsRaw(): number {
    if (typeof window === "undefined") return 0;
    const v = parseInt(localStorage.getItem(COINS_KEY) ?? "0", 10);
    return isNaN(v) ? 0 : v;
}

/** Write coin balance directly to localStorage (sync, no React) */
export function setCoinsRaw(amount: number): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(COINS_KEY, String(amount));
    // Notify other hook instances on the same page
    window.dispatchEvent(new CustomEvent("coins-updated", { detail: amount }));
}

/**
 * Shared coin hook.  Multiple components on the same page (or same game)
 * all stay in sync via a custom DOM event.  Different pages (Sudoku vs 2048)
 * read the same localStorage key on mount.
 */
export function useCoins() {
    const [coins, setCoinsState] = useState<number>(0);

    // Hydrate from localStorage once on client
    useEffect(() => {
        setCoinsState(getCoinsRaw());

        const onUpdate = (e: Event) => {
            setCoinsState((e as CustomEvent<number>).detail);
        };

        window.addEventListener("coins-updated", onUpdate);
        // Also sync across tabs
        const onStorage = (e: StorageEvent) => {
            if (e.key === COINS_KEY) {
                const v = parseInt(e.newValue ?? "0", 10);
                setCoinsState(isNaN(v) ? 0 : v);
            }
        };
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener("coins-updated", onUpdate);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const setCoins = useCallback((updater: number | ((prev: number) => number)) => {
        setCoinsState((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            setCoinsRaw(next);
            return next;
        });
    }, []);

    const addCoins = useCallback((amount: number) => {
        setCoins((prev) => Math.max(0, prev + amount));
    }, [setCoins]);

    const spendCoins = useCallback((amount: number): boolean => {
        const curr = getCoinsRaw();
        if (curr < amount) return false;
        setCoins(curr - amount);
        return true;
    }, [setCoins]);

    return { coins, setCoins, addCoins, spendCoins };
}
