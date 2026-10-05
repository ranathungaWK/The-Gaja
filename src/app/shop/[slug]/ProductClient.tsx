"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, useI18n } from "@/components/Providers";
import { fill } from "@/lib/i18n";
import styles from "./product.module.css";

type GalleryProps = {
  images: string[];
  alts: string[];
  name: string;
  fundTag: string;
};

const PLACEHOLDER_VIEWS = ["Back view", "Fabric close-up", "Print detail", "Folded"];

export function Gallery({ images, alts, name, fundTag }: GalleryProps) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;
  const labelFor = (i: number) => alts[i] ?? (i === 0 ? `${name}, front view` : PLACEHOLDER_VIEWS[(i - 1) % 4]);
  // Real photos: every image is a thumbnail (when there is more than one).
  // No photos yet: the four placeholder views from the design.
  const thumbs = hasImages ? (images.length > 1 ? images.map((_, i) => i).slice(0, 5) : []) : [1, 2, 3, 4];

  return (
    <div className={styles.gallery}>
      <div className={`photo ${styles.mainPhoto}`}>
        {hasImages ? (
          <Image className="photo__img" src={images[active]} alt={labelFor(active)} fill priority sizes="(max-width: 1080px) 100vw, 680px" />
        ) : (
          <>
            <span className="photo__icon" aria-hidden="true" />
            <span className="photo__label">{t.common.photo}</span>
            <span className="photo__caption">{`${name}, front view on a model in a village setting. 680 x 740`}</span>
          </>
        )}
        <span className={`fund-tag ${styles.mainTag}`}>{fundTag}</span>
      </div>
      <div className={styles.thumbs}>
        {thumbs.map((i) => (
          <button
            key={i}
            type="button"
            className={`photo ${styles.thumb}`}
            aria-current={hasImages ? active === i : i === 1}
            aria-label={labelFor(i)}
            onClick={() => hasImages && setActive(i)}
          >
            {hasImages ? (
              <Image className="photo__img" src={images[i]} alt="" fill sizes="146px" />
            ) : (
              <>
                <span className="photo__icon" aria-hidden="true" />
                <span className="photo__label">{t.common.photo}</span>
                <span className="photo__caption">{labelFor(i)}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

type BuyProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    colourName: string;
    price: number;
    fundAmount: number;
    sizes: string[];
    stock: number;
    image: string | null;
  };
  swatches: { slug: string; name: string; hex: string; current: boolean }[];
};

export function BuyBox({ product, swatches }: BuyProps) {
  const { t } = useI18n();
  const cart = useCart();
  const defaultSize = product.sizes.includes("M") ? "M" : product.sizes[0];
  const [size, setSize] = useState<string | null>(defaultSize ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;
  const maxQty = Math.max(1, Math.min(20, product.stock));

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 2400);
    return () => clearTimeout(id);
  }, [added]);

  const add = () => {
    if (!size || soldOut) return;
    cart.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      colourName: product.colourName,
      size,
      quantity: qty,
      price: product.price,
      fundAmount: product.fundAmount,
      image: product.image,
    });
    setAdded(true);
  };

  return (
    <>
      <p className={styles.optLabel}>{t.product.colour}</p>
      <div className={styles.swatches} role="list">
        {swatches.map((s) => (
          <Link
            key={s.slug}
            role="listitem"
            href={`/shop/${s.slug}`}
            scroll={false}
            className={styles.swatch}
            style={{ background: s.hex }}
            aria-label={s.name}
            aria-current={s.current ? "true" : undefined}
            title={s.name}
          />
        ))}
      </div>

      <div className={styles.sizeHead}>
        <p className={styles.optLabel}>{t.product.size}</p>
        <a href="#size-guide" className={styles.sizeGuideLink}>
          {t.product.sizeGuide}
        </a>
      </div>
      <div className={styles.sizes} role="radiogroup" aria-label={t.product.size}>
        {product.sizes.map((s) => (
          <button key={s} type="button" role="radio" aria-checked={size === s} className="chip" onClick={() => setSize(s)} disabled={soldOut}>
            {s}
          </button>
        ))}
      </div>

      <div className={styles.buyRow}>
        <div className={`qty ${styles.qty}`}>
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1 || soldOut}>
            -
          </button>
          <output aria-live="polite">{qty}</output>
          <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty || soldOut}>
            +
          </button>
        </div>
        <button type="button" className={`btn btn--primary ${styles.addBtn}`} onClick={add} disabled={soldOut || !size}>
          {soldOut ? t.product.soldOut : added ? t.product.added : t.product.addToBag}
        </button>
      </div>
      {added && (
        <p className={styles.addedNote} role="status">
          {t.product.added} · <Link href="/bag">{t.product.viewBag}</Link>
        </p>
      )}
      {!soldOut && product.stock <= 10 && <p className={styles.lowStock}>{fill(t.product.onlyLeft, { n: product.stock })}</p>}
    </>
  );
}

export function Accordion({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const check = () => {
      if (window.location.hash === `#${id}`) setOpen(true);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [id]);

  return (
    <div className={styles.accordion} id={id}>
      <button type="button" className={styles.accHead} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        <span aria-hidden="true">{open ? "-" : "+"}</span>
      </button>
      {open && <div className={styles.accBody}>{children}</div>}
    </div>
  );
}
