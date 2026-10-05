"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

/* ---------------------------------------------------------------- i18n --- */

const I18nContext = createContext<{ t: Dictionary; locale: Locale } | null>(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <Providers>");
  return ctx;
}

/* ---------------------------------------------------------------- cart --- */

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  colourName: string;
  size: string;
  quantity: number;
  price: number;
  fundAmount: number;
  image: string | null;
};

type CartState = { items: CartItem[]; extraDonation: number };

type CartContextValue = CartState & {
  ready: boolean;
  count: number;
  subtotal: number;
  shirtsFund: number;
  add: (item: CartItem) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  remove: (productId: string, size: string) => void;
  setExtraDonation: (amount: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "gaja-bag-v1";
const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

function readStored(): CartState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], extraDonation: 0 };
    const parsed = JSON.parse(raw) as CartState;
    return {
      items: Array.isArray(parsed.items) ? parsed.items.filter((i) => i && i.productId && i.quantity > 0) : [],
      extraDonation: Number.isFinite(parsed.extraDonation) ? parsed.extraDonation : 0,
    };
  } catch {
    return { items: [], extraDonation: 0 };
  }
}

/* --------------------------------------------------------------- theme --- */

export type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <Providers>");
  return ctx;
}

/* ----------------------------------------------------------- providers --- */

export function Providers({ t, locale, children }: { t: Dictionary; locale: Locale; children: ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [], extraDonation: 0 });
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setState(readStored());
    setReady(true);
    setThemeState(document.documentElement.dataset.theme === "dark" ? "dark" : "light");

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — bag lives in memory only */
    }
  }, [state, ready]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#0d1712" : "#1d4b34");
    try {
      window.localStorage.setItem("gaja-theme", next);
    } catch {}
  }, []);

  const cart = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = state.items.reduce((n, i) => n + i.price * i.quantity, 0);
    const shirtsFund = state.items.reduce((n, i) => n + i.fundAmount * i.quantity, 0);
    return {
      ...state,
      ready,
      count,
      subtotal,
      shirtsFund,
      add: (item) =>
        setState((s) => {
          const existing = s.items.find((i) => i.productId === item.productId && i.size === item.size);
          const items = existing
            ? s.items.map((i) => (i === existing ? { ...i, quantity: Math.min(20, i.quantity + item.quantity) } : i))
            : [...s.items, item];
          return { ...s, items };
        }),
      setQuantity: (productId, size, quantity) =>
        setState((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, Math.min(20, quantity)) } : i,
          ),
        })),
      remove: (productId, size) =>
        setState((s) => ({ ...s, items: s.items.filter((i) => !(i.productId === productId && i.size === size)) })),
      setExtraDonation: (amount) => setState((s) => ({ ...s, extraDonation: Math.max(0, amount) })),
      clear: () => setState({ items: [], extraDonation: 0 }),
    };
  }, [state, ready]);

  return (
    <I18nContext.Provider value={{ t, locale }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <CartContext.Provider value={cart}>{children}</CartContext.Provider>
      </ThemeContext.Provider>
    </I18nContext.Provider>
  );
}
