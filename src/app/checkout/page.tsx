import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { CheckoutForm } from "./CheckoutForm";
import styles from "./checkout.module.css";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const { t } = await getT();
  return (
    <section className="section">
      <div className={`container ${styles.main}`}>
        <ol className={styles.steps}>
          <li data-state="done">
            <span>1</span>
            <Link href="/bag">{t.checkout.stepBag}</Link>
          </li>
          <li aria-hidden="true" className={styles.stepRule} />
          <li data-state="current" aria-current="step">
            <span>2</span>
            {t.checkout.stepDetails}
          </li>
          <li aria-hidden="true" className={styles.stepRule} />
          <li data-state="next">
            <span>3</span>
            {t.checkout.stepPayment}
          </li>
        </ol>
        <h1 className={styles.title}>{t.checkout.title}</h1>
        <CheckoutForm />
      </div>
    </section>
  );
}
