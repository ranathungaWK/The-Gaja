"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { deliveryFee, EXTRA_DONATION_OPTIONS, lkr, type DeliveryMethod } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { useCart, useI18n } from "./Providers";
import styles from "./OrderSummary.module.css";

export function FundAddOn() {
  const { t } = useI18n();
  const { extraDonation, setExtraDonation } = useCart();
  return (
    <div className={styles.addOn}>
      <p className={styles.addOnTitle}>{t.bag.addFund}</p>
      <p className={styles.addOnBody}>{t.bag.addFundBody}</p>
      <div className={styles.addOnChips} role="radiogroup" aria-label={t.bag.addFund}>
        {EXTRA_DONATION_OPTIONS.map((amount) => (
          <button
            key={amount}
            type="button"
            role="radio"
            aria-checked={extraDonation === amount}
            className="chip chip--sm"
            onClick={() => setExtraDonation(amount)}
          >
            {amount === 0 ? t.common.none : lkr(amount)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OrderSummary({
  method = "standard",
  showItems = false,
  children,
}: {
  method?: DeliveryMethod;
  showItems?: boolean;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const { items, subtotal, shirtsFund, extraDonation } = useCart();
  const fee = deliveryFee(subtotal, method);
  const total = subtotal + fee + extraDonation;
  const fundTotal = shirtsFund + extraDonation;

  return (
    <aside className={styles.summary}>
      <h2 className={styles.title}>{t.common.orderSummary}</h2>

      {showItems &&
        items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className={styles.line}>
            <div className={`photo photo--compact ${styles.lineThumb}`}>
              {item.image ? <Image className="photo__img" src={item.image} alt="" fill sizes="64px" /> : <span className="photo__icon" aria-hidden="true" />}
            </div>
            <div className={styles.lineText}>
              <Link href={`/shop/${item.slug}`}>{item.name}</Link>
              <p>{fill(t.common.sizeQty, { size: item.size, qty: item.quantity })}</p>
            </div>
            <p className={styles.linePrice}>{lkr(item.price * item.quantity)}</p>
          </div>
        ))}
      {showItems && <hr className="divider" />}

      <div className="sum-row">
        <span>{t.common.subtotal}</span>
        <span>{lkr(subtotal)}</span>
      </div>
      <div className="sum-row">
        <Link href="/contact#faq-delivery">{t.common.delivery}</Link>
        <span>{fee === 0 ? t.common.free : lkr(fee)}</span>
      </div>

      <FundAddOn />

      <div className="sum-row sum-row--leaf">
        <span>{t.common.extraForFund}</span>
        <span>{lkr(extraDonation)}</span>
      </div>
      <hr className="divider" />
      <div className="sum-row sum-row--total">
        <span>{t.common.total}</span>
        <span>{lkr(total)}</span>
      </div>
      <p className={styles.impact}>
        {extraDonation > 0
          ? fill(t.bag.impact, { total: lkr(fundTotal), shirts: lkr(shirtsFund), extra: lkr(extraDonation) })
          : fill(t.bag.impactNoExtra, { total: lkr(fundTotal) })}
      </p>
      {children}
    </aside>
  );
}
