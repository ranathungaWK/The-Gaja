import Link from "next/link";
import type { Product } from "@/lib/data";
import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { lkr } from "@/lib/format";
import { Photo } from "./Photo";
import styles from "./ProductCard.module.css";

export function ProductGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function ProductCard({ product, t, locale }: { product: Product; t: Dictionary; locale: Locale }) {
  const name = (locale === "si" && product.name_si) || product.name;
  const soldOut = product.stock <= 0;
  return (
    <Link href={`/shop/${product.slug}`} className={styles.card}>
      <Photo
        className={styles.photo}
        src={product.imageUrls[0]}
        alt={product.image_alts[0] ?? name}
        caption={`${product.image_alts[0] ?? product.colour_name}. 416 x 500`}
        photoLabel={t.common.photo}
        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 33vw, 416px"
      >
        <span className="fund-tag">{soldOut ? t.shop.soldOut : t.common.fundTag}</span>
      </Photo>
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        <p className={styles.price}>{lkr(product.price)}</p>
      </div>
      <p className={styles.meta}>{product.summary}</p>
    </Link>
  );
}
