"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { fill } from "@/lib/i18n";
import styles from "./Slideshow.module.css";

export type Slide = {
  src: string;
  alt: string;
  /** CSS object-position, e.g. "22% center". */
  position?: string;
};

type SlideshowProps = {
  slides: Slide[];
  /** Accessible name for the whole slideshow. */
  label: string;
  /** Dot button label with an {n} placeholder, e.g. "Show photo {n}". */
  dotLabel: string;
  className?: string;
  sizes?: string;
  /** Milliseconds between slides. */
  interval?: number;
};

/** Cross-fading photo slideshow. Pauses on hover or focus, and stays still for reduced motion. */
export function Slideshow({ slides, label, dotLabel, className, sizes, interval = 5000 }: SlideshowProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Depends on `active` too, so picking a slide restarts the timer.
    const id = window.setTimeout(() => setActive((a) => (a + 1) % slides.length), interval);
    return () => window.clearTimeout(id);
  }, [active, paused, slides.length, interval]);

  return (
    <div
      className={`photo ${className ?? ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <Image
          key={s.src}
          className={`photo__img ${styles.slide}`}
          data-active={i === active}
          aria-hidden={i !== active}
          src={s.src}
          alt={s.alt}
          fill
          sizes={sizes}
          priority={i === 0}
          style={s.position ? { objectPosition: s.position } : undefined}
        />
      ))}
      {slides.length > 1 && (
        <div className={styles.dots}>
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className={styles.dot}
              aria-label={fill(dotLabel, { n: i + 1 })}
              aria-current={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
