"use client";

import Image from "next/image";
import Link from "next/link";
import { OrderSummary } from "@/components/OrderSummary";
import { useCart, useI18n } from "@/components/Providers";
import { FREE_DELIVERY_THRESHOLD, lkr, percent } from "@/lib/format";
import { fill } from "@/lib/i18n";
import styles from "./bag.module.css";

export function BagView() {
  const { t } = useI18n();
  const cart = useCart();
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - cart.subtotal);

  return (
    <div className={`container ${styles.main}`}>
      <p className="t-crumb">
        <Link href="/">{t.common.home}</Link>
        {"  /  "}
        {t.bag.crumb}
      </p>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{t.bag.title}</h1>
        {cart.ready && cart.count > 0 && <p className={styles.count}>{cart.count === 1 ? t.bag.item : fill(t.bag.items, { n: cart.count })}</p>}
      </div>

      {!cart.ready ? (
        <div className={styles.skeleton} aria-busy="true" />
      ) : cart.items.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t.bag.empty}</p>
          <p className="t-body">{t.bag.emptyBody}</p>
          <Link href="/shop" className="btn btn--primary">
            {t.common.shopTheShirts}
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.freeBar}>
            <p>{remaining > 0 ? fill(t.bag.freeAway, { amount: lkr(remaining) }) : t.bag.freeReached}</p>
            <div className="progress" style={{ background: "var(--white)" }}>
              <div className="progress__bar" style={{ width: `${percent(cart.subtotal, FREE_DELIVERY_THRESHOLD)}%` }} />
            </div>
          </div>

          <div className={styles.columns}>
            <div className={styles.items}>
              {cart.items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className={styles.item}>
                  <Link href={`/shop/${item.slug}`} className={`photo photo--compact ${styles.itemPhoto}`} aria-label={item.name}>
                    {item.image ? <Image className="photo__img" src={item.image} alt="" fill sizes="150px" /> : <span className="photo__icon" aria-hidden="true" />}
                  </Link>
                  <div className={styles.itemInfo}>
                    <Link href={`/shop/${item.slug}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                    <p className={styles.itemMeta}>{`${item.colourName}  /  ${t.product.size} ${item.size}`}</p>
                    <span className="pill">{t.common.fundTag}</span>
                    <div className={styles.itemActions}>
                      <div className="qty">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => cart.setQuantity(item.productId, item.size, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <output>{item.quantity}</output>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => cart.setQuantity(item.productId, item.size, item.quantity + 1)}
                          disabled={item.quantity >= 20}
                        >
                          +
                        </button>
                      </div>
                      <button type="button" className={styles.remove} onClick={() => cart.remove(item.productId, item.size)}>
                        {t.bag.remove}
                      </button>
                    </div>
                  </div>
                  <p className={styles.itemPrice}>{lkr(item.price * item.quantity)}</p>
                </div>
              ))}
              <Link href="/shop" className={styles.continue}>
                {t.bag.continue}
              </Link>
            </div>

            <OrderSummary>
              <Link href="/checkout" className="btn btn--primary btn--block">
                {t.bag.checkout}
              </Link>
            </OrderSummary>
          </div>
        </>
      )}
    </div>
  );
}
