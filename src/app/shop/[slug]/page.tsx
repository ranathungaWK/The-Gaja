import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/components/Photo";
import { ProductCard, ProductGrid } from "@/components/ProductCard";
import { getProduct, getProducts } from "@/lib/data";
import { lkr } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { Accordion, BuyBox, Gallery } from "./ProductClient";
import styles from "./product.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

const SIZE_CHART: [string, number][] = [
  ["S", 48],
  ["M", 51],
  ["L", 54],
  ["XL", 57],
  ["XXL", 60],
];

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const [{ t, locale }, product, all] = await Promise.all([getT(), getProduct(slug), getProducts()]);
  if (!product) notFound();

  const name = (locale === "si" && product.name_si) || product.name;
  const description = (locale === "si" && product.description_si) || product.description;
  const others = all.filter((p) => p.id !== product.id);

  return (
    <>
      <div className="container">
        <p className={`t-crumb ${styles.crumb}`}>
          <Link href="/">{t.common.home}</Link>
          {"  /  "}
          <Link href="/shop">{t.shop.crumb}</Link>
          {"  /  "}
          {name}
        </p>
      </div>

      <section className="section">
        <div className={`container ${styles.main}`}>
          <Gallery images={product.imageUrls} alts={product.image_alts} name={name} fundTag={t.common.fundTag} />

          <div className={styles.info}>
            <span className="pill">{fill(t.product.dropMade, { drop: product.drop_label, run: product.run_size })}</span>
            <h1 className={styles.title}>{name}</h1>
            <p className={styles.price}>{lkr(product.price)}</p>
            <p className={styles.desc}>{description}</p>

            <div className={styles.callout}>
              <span className={styles.calloutBadge}>{product.fund_amount >= 1000 ? `${product.fund_amount / 1000}K` : product.fund_amount}</span>
              <div>
                <p className={styles.calloutTitle}>{fill(t.product.calloutTitle, { amount: product.fund_amount.toLocaleString("en-US") })}</p>
                <p className={styles.calloutBody}>{t.product.calloutBody}</p>
              </div>
            </div>

            <BuyBox
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                colourName: product.colour_name,
                price: product.price,
                fundAmount: product.fund_amount,
                sizes: product.sizes,
                stock: product.stock,
                image: product.imageUrls[0] ?? null,
              }}
              swatches={all.map((p) => ({ slug: p.slug, name: p.colour_name, hex: p.colour_hex, current: p.id === product.id }))}
            />

            <ul className={styles.perks}>
              <li>{t.product.perk1}</li>
              <li>{t.product.perk2}</li>
              <li>{t.product.perk3}</li>
            </ul>

            <div className={styles.accordions}>
              <Accordion title={t.product.details}>
                <p>{t.product.detailsBody}</p>
              </Accordion>
              <Accordion title={t.product.deliveryReturns}>
                <p>{t.product.deliveryReturnsBody}</p>
              </Accordion>
              <Accordion title={t.product.whereMoney}>
                <p>
                  {t.product.whereMoneyBody} <Link href="/fund">{t.nav.fund} →</Link>
                </p>
              </Accordion>
              <Accordion id="size-guide" title={t.product.sizeGuide}>
                <p>{t.product.sizeGuideTitle}</p>
                <table className={styles.sizeTable}>
                  <tbody>
                    <tr>
                      {SIZE_CHART.map(([s]) => (
                        <th key={s} scope="col">
                          {s}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {SIZE_CHART.map(([s, cm]) => (
                        <td key={s}>{cm}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {product.story_title && (
        <section className="section bg-mist">
          <div className={`container ${styles.story}`}>
            <Photo
              className={styles.storyPhoto}
              src={product.imageUrls[4] ?? null}
              alt={product.story_title}
              caption="A village path at night with a lantern in the distance. 640 x 460"
              photoLabel={t.common.photo}
            />
            <div className={styles.storyCopy}>
              <span className="pill">{t.product.storyPill}</span>
              <h2 className="t-h3">{product.story_title}</h2>
              <p className="t-lead" style={{ fontSize: "clamp(16px, 1.25vw, 18px)", lineHeight: "28px" }}>
                {product.story_body}
              </p>
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section">
          <div className={`container ${styles.related}`}>
            <h2 className={styles.relatedTitle}>{t.product.alsoLike}</h2>
            <ProductGrid>
              {others.slice(0, 3).map((p) => (
                <ProductCard key={p.id} product={p} t={t} locale={locale} />
              ))}
            </ProductGrid>
          </div>
        </section>
      )}
    </>
  );
}
