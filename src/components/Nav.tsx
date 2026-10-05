"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { setLocale } from "@/app/actions";
import { lkr, percent } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { CheckIcon, ChevIcon, GlobeIcon, LogoDot, MoonIcon, SunIcon } from "./Icons";
import { useCart, useI18n, useTheme } from "./Providers";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "/shop", key: "shop" },
  { href: "/cause", key: "cause" },
  { href: "/fund", key: "fund" },
  { href: "/story", key: "story" },
  { href: "/contact", key: "contact" },
] as const;

const LANGS: { code: Locale; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "si", label: "Sinhala", short: "සිං" },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

function LanguageMenu({ mobile }: { mobile?: boolean }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (code: Locale) => {
    setOpen(false);
    if (code === locale) return;
    startTransition(async () => {
      await setLocale(code);
      document.documentElement.lang = code;
      router.refresh();
    });
  };

  const current = LANGS.find((l) => l.code === locale)!;

  return (
    <div className={styles.langWrap} ref={ref}>
      <button
        type="button"
        className={mobile ? styles.iconBtn : styles.langBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.nav.language}
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
      >
        <GlobeIcon />
        {!mobile && (
          <>
            <span>{current.short}</span>
            <ChevIcon className={open ? styles.chevOpen : undefined} />
          </>
        )}
      </button>
      {open && (
        <div className={`${styles.langMenu} ${mobile ? styles.langMenuMobile : ""}`} role="menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitemradio"
              aria-checked={l.code === locale}
              className={styles.langOption}
              onClick={() => choose(l.code)}
            >
              <span>{l.label}</span>
              {l.code === locale && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThemeToggle({ mobile }: { mobile?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  if (mobile) {
    const next = theme === "dark" ? "light" : "dark";
    return (
      <button
        type="button"
        className={styles.iconBtn}
        aria-label={next === "dark" ? t.nav.themeDark : t.nav.themeLight}
        onClick={() => setTheme(next)}
      >
        {theme === "dark" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
      </button>
    );
  }
  return (
    <div className={styles.theme} role="radiogroup" aria-label={`${t.nav.themeLight} / ${t.nav.themeDark}`}>
      <button
        type="button"
        role="radio"
        aria-checked={theme === "light"}
        aria-label={t.nav.themeLight}
        className={styles.themeSlot}
        onClick={() => setTheme("light")}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={theme === "dark"}
        aria-label={t.nav.themeDark}
        className={styles.themeSlot}
        onClick={() => setTheme("dark")}
      >
        <MoonIcon />
      </button>
    </div>
  );
}

export function Nav({ raised, goal }: { raised: number; goal: number }) {
  const { t } = useI18n();
  const { count, ready } = useCart();
  const isActive = useIsActive();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(98);
  const headerRef = useRef<HTMLElement>(null);
  const bagLabel = `${t.nav.bag} (${ready ? count : 0})`;

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (menuOpen && headerRef.current) setMenuTop(Math.round(headerRef.current.getBoundingClientRect().bottom));
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className={styles.nav} ref={headerRef}>
        <div className={styles.inner}>
          <Link href="/" className={styles.logo} aria-label="GAJA home">
            <LogoDot />
            <span>GAJA</span>
          </Link>

          <nav className={styles.links} aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={isActive(l.href) ? styles.active : undefined} aria-current={isActive(l.href) ? "page" : undefined}>
                {t.nav[l.key]}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <LanguageMenu />
            <ThemeToggle />
            <Link href="/bag" className={styles.bag}>
              {bagLabel}
            </Link>
            <Link href="/fund#give" className={styles.donate}>
              {t.nav.donate}
            </Link>
          </div>

          <div className={styles.mobileActions}>
            <LanguageMenu mobile />
            <ThemeToggle mobile />
            <Link href="/bag" className={styles.mBag}>
              {bagLabel}
            </Link>
            <button
              type="button"
              className={styles.menuBtn}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? t.nav.close : t.nav.menu}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div id="mobile-menu" className={styles.menu} style={{ top: menuTop }}>
          <nav className={styles.menuLinks} aria-label="Mobile">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={isActive(l.href) ? styles.menuActive : undefined}>
                <span>{t.nav[l.key]}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
          <div className={styles.menuFund}>
            <p>{t.nav.raised}</p>
            <p>{lkr(raised)}</p>
            <div className="progress" style={{ height: 10 }}>
              <div className="progress__bar" style={{ width: `${percent(raised, goal)}%` }} />
            </div>
          </div>
          <Link href="/fund#give" className="btn btn--primary btn--block">
            {t.nav.donateDirectly}
          </Link>
          <Link href="/bag" className="btn btn--secondary btn--block">
            {bagLabel}
          </Link>
          <div className={`${styles.menuFoot} bg-band`}>
            <p>{t.nav.tagline}</p>
            <p>{t.nav.taglineSub}</p>
          </div>
        </div>
      )}
    </>
  );
}
