import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Photo } from "@/components/Photo";
import { ProductCard, ProductGrid } from "@/components/ProductCard";
import { getFundStats, getProducts, type Category, type ShopSort } from "@/lib/data";
import { lkr, percent } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { SortSelect } from "./SortSelect";
import styles from "./shop.module.css";

export const metadata: Metadata = { title: "Shop" };

const CATEGORIES: Category[] = ["light", "dark", "green"];
const SORTS: ShopSort[] = ["featured", "price-asc", "price-desc", "name"];

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string; sort?: string }> }) {
  const { c, sort: sortParam } = await searchParams;
  const category = CATEGORIES.find((x) => x === c);
  const sort = SORTS.find((x) => x === sortParam) ?? "featured";
  const { t, locale } = await getT();
  const [stats, products] = await Promise.all([getFundStats(), getProducts({ category, sort })]);
  const p = percent(stats.raised, stats.goal);

  const filterHref = (cat?: Category) => {
    const qs = new URLSearchParams();
    if (cat) qs.set("c", cat);
    if (sort !== "featured") qs.set("sort", sort);
    const s = qs.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <>
      <section className="section">
        <div className={`container ${styles.header}`}>
          <div className={styles.headCopy}>
            <p className="t-crumb">
              <Link href="/">{t.common.home}</Link>
              {"  /  "}
              {t.shop.crumb}
            </p>
            <h1 className="t-h1">{t.shop.title}</h1>
            <p className="t-lead" style={{ fontSize: "clamp(16px, 1.32vw, 19px)", lineHeight: "29px" }}>
              {t.shop.lead}
            </p>
          </div>
          <Link href="/fund" className={styles.fundMini}>
            <span className={styles.fundMiniLabel}>{t.shop.fundMini}</span>
            <span className={styles.fundMiniValue}>{lkr(stats.raised)}</span>
            <span className="progress" style={{ height: 10, background: "var(--white)" }}>
              <span className="progress__bar" style={{ width: `${p}%` }} />
            </span>
            <span className={styles.fundMiniNote}>{fill(t.common.ofTheGoal, { p, goal: lkr(stats.goal) })}</span>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.filters}`}>
          <nav className={styles.chips} aria-label="Filter by colour">
            <Link href={filterHref()} className="chip" aria-current={!category ? "true" : undefined}>
              {t.shop.all}
            </Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat} href={filterHref(cat)} className="chip" aria-current={category === cat ? "true" : undefined}>
                {t.shop[cat]}
              </Link>
            ))}
          </nav>
          <Suspense>
            <SortSelect value={sort} />
          </Suspense>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.gridWrap}`}>
          {products.length ? (
            <ProductGrid>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} t={t} locale={locale} />
              ))}
            </ProductGrid>
          ) : (
            <p className={styles.empty}>{t.shop.empty}</p>
          )}

          <div className={styles.tiles}>
            <div className={styles.nextDrop}>
              <span className="pill">{t.shop.nextDrop}</span>
              <p className={styles.coming}>
                {t.shop.comingA}
                <br />
                {t.shop.comingB}
              </p>
              <Link href="/#newsletter" className="btn btn--primary">
                {t.home.notify}
              </Link>
            </div>
            <div className={`${styles.fundTile} bg-band`}>
              <div className={styles.fundTileCopy}>
                <span className="pill pill--band">{t.shop.impactPill}</span>
                <p className={styles.fundTileTitle}>{t.shop.impactTitle}</p>
                <p className={styles.fundTileBody}>{t.shop.impactBody}</p>
                <Link href="/fund" className="btn btn--light">
                  {t.shop.seeImpact}
                </Link>
              </div>
              <Photo className={styles.fundTilePhoto} src="/images/shop-fence-line.jpg" alt={t.shop.impactPhoto} sizes="(max-width: 1080px) 100vw, 340px" position="65% center" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
