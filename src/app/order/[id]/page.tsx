import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckBadge } from "@/components/Icons";
import { Photo } from "@/components/Photo";
import { getOrder } from "@/lib/data";
import { lkr } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { ShareButton } from "./ShareButton";
import styles from "./order.module.css";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ t }, order] = await Promise.all([getT(), getOrder(id)]);
  if (!order) notFound();

  const shirtsFund = order.fund_contribution - order.extra_donation;
  const paymentLabel = { card: t.checkout.card, bank: t.checkout.bank, cod: t.checkout.cod }[order.payment_method];

  return (
    <>
      <section className="section">
        <div className={`container ${styles.thanks}`}>
          <CheckBadge />
          <h1 className="t-h1" style={{ textAlign: "center" }}>
            {t.confirm.title}
          </h1>
          <p className={styles.lead}>{fill(t.confirm.lead, { number: order.order_number, email: order.email })}</p>
          {order.payment_method === "bank" && <p className={styles.note}>{fill(t.confirm.bankNote, { number: order.order_number })}</p>}
          {order.payment_method === "card" && <p className={styles.note}>{t.confirm.cardNote}</p>}
          <div className={styles.ctas}>
            <Link href="/shop" className="btn btn--primary">
              {t.confirm.backToShop}
            </Link>
            <ShareButton />
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.details}`}>
          <div className={styles.orderCard}>
            <h2 className={styles.cardTitle}>{t.confirm.details}</h2>
            {order.order_items.map((item) => (
              <div key={item.id} className={styles.line}>
                <div className={`photo photo--compact ${styles.lineThumb}`}>
                  <span className="photo__icon" aria-hidden="true" />
                </div>
                <div className={styles.lineText}>
                  <p>{item.product_name}</p>
                  <p>{fill(t.common.sizeQty, { size: item.size, qty: item.quantity })}</p>
                </div>
                <p className={styles.linePrice}>{lkr(item.unit_price * item.quantity)}</p>
              </div>
            ))}
            <hr className="divider" />
            <div className="sum-row">
              <span>{t.common.subtotal}</span>
              <span>{lkr(order.subtotal)}</span>
            </div>
            <div className="sum-row">
              <span>{t.common.delivery}</span>
              <span>{order.delivery_fee === 0 ? t.common.free : lkr(order.delivery_fee)}</span>
            </div>
            <div className="sum-row">
              <span>{t.common.extraForFund}</span>
              <span>{lkr(order.extra_donation)}</span>
            </div>
            <hr className="divider" />
            <div className="sum-row sum-row--total" style={{ fontSize: 22 }}>
              <span style={{ color: "var(--moss)" }}>{t.common.total}</span>
              <span>{lkr(order.total)}</span>
            </div>
            <div className={styles.meta}>
              <div>
                <p className={styles.metaLabel}>{t.confirm.deliveringTo}</p>
                <p>
                  {order.first_name} {order.last_name}
                  <br />
                  {order.address}
                  <br />
                  {order.city} {order.postal_code}
                </p>
              </div>
              <div>
                <p className={styles.metaLabel}>{t.confirm.payment}</p>
                <p>
                  {paymentLabel}
                  <br />
                  {order.delivery_method === "express" ? t.confirm.expressLine : t.confirm.standardLine}
                </p>
              </div>
            </div>
          </div>

          <div className={`${styles.impact} bg-band`}>
            <Photo className={styles.impactPhoto} alt={t.confirm.impactPhoto} caption={`${t.confirm.impactPhoto} 660 x 260`} photoLabel={t.common.photo} />
            <div className={styles.impactBody}>
              <span className="pill pill--band">{t.confirm.impactPill}</span>
              <p className={styles.impactValue}>{lkr(order.fund_contribution)}</p>
              <p className={styles.impactText}>
                {order.extra_donation > 0
                  ? fill(t.confirm.impactBody, { shirts: lkr(shirtsFund), extra: lkr(order.extra_donation) })
                  : t.confirm.impactBodyNoExtra}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.next}`}>
          <h2 className={styles.nextTitle}>{t.confirm.next}</h2>
          <ol className={styles.nextSteps}>
            {[
              [t.confirm.n1, t.confirm.n1b],
              [t.confirm.n2, t.confirm.n2b],
              [t.confirm.n3, t.confirm.n3b],
            ].map(([title, body], i) => (
              <li key={title}>
                <span>{i + 1}</span>
                <div>
                  <p>{title}</p>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
