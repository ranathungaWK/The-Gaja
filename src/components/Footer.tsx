import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/i18n";
import styles from "./Footer.module.css";

export function Announcement({ t }: { t: Dictionary }) {
  return (
    <div className={`${styles.announcement} bg-band`}>
      <p className={styles.annDesktop}>{t.announcement.desktop}</p>
      <p className={styles.annMobile}>{t.announcement.mobile}</p>
    </div>
  );
}

export function Footer({ t, products }: { t: Dictionary; products: { slug: string; name: string }[] }) {
  return (
    <footer className={`${styles.footer} bg-band`}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <p className={styles.tagline}>
              {t.footer.a}
              <br />
              {t.footer.b}
            </p>
            <p className={styles.body}>{t.footer.body}</p>
          </div>
          <div className={styles.columns}>
            <div className={styles.col}>
              <Link href="/shop" className={styles.head}>
                {t.footer.shop}
              </Link>
              <Link href="/shop">{t.footer.allShirts}</Link>
              {products.map((p) => (
                <Link key={p.slug} href={`/shop/${p.slug}`}>
                  {p.name}
                </Link>
              ))}
            </div>
            <div className={styles.col}>
              <Link href="/cause" className={styles.head}>
                {t.footer.cause}
              </Link>
              <Link href="/cause">{t.nav.cause}</Link>
              <Link href="/fund">{t.nav.fund}</Link>
              <Link href="/story">{t.nav.story}</Link>
              <Link href="/fund#receipts">{t.footer.receipts}</Link>
            </div>
            <div className={styles.col}>
              <p className={styles.head}>{t.footer.help}</p>
              <Link href="/contact#faq-delivery">{t.footer.delivery}</Link>
              <Link href="/contact#faq-exchange">{t.footer.returns}</Link>
              <Link href="/shop/night-watch-tee#size-guide">{t.footer.sizeGuide}</Link>
              <Link href="/contact">{t.footer.contactFaq}</Link>
            </div>
          </div>
        </div>
        <div className={styles.rule} />
        <div className={styles.bottom}>
          <p>{fill(t.footer.copyright, { year: new Date().getFullYear() })}</p>
          <p>{t.footer.fundLine}</p>
        </div>
      </div>
    </footer>
  );
}
