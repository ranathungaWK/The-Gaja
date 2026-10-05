"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder, type PlaceOrderInput } from "@/app/actions";
import { OrderSummary } from "@/components/OrderSummary";
import { useCart, useI18n } from "@/components/Providers";
import { DELIVERY_FEES, deliveryFee, lkr, type DeliveryMethod } from "@/lib/format";
import styles from "./checkout.module.css";

type Payment = PlaceOrderInput["paymentMethod"];

export function CheckoutForm() {
  const { t } = useI18n();
  const cart = useCart();
  const router = useRouter();
  const [method, setMethod] = useState<DeliveryMethod>("standard");
  const [payment, setPayment] = useState<Payment>("card");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [placed, setPlaced] = useState(false);

  if (!cart.ready) return <div className={styles.skeleton} aria-busy="true" />;

  if (cart.items.length === 0 && !placed) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{t.bag.empty}</p>
        <Link href="/shop" className="btn btn--primary">
          {t.common.shopTheShirts}
        </Link>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const input: PlaceOrderInput = {
      email: get("email"),
      phone: get("phone"),
      firstName: get("firstName"),
      lastName: get("lastName"),
      address: get("address"),
      city: get("city"),
      postalCode: get("postalCode"),
      deliveryMethod: method,
      paymentMethod: payment,
      extraDonation: cart.extraDonation,
      items: cart.items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
    };
    startTransition(async () => {
      const res = await placeOrder(input);
      if (!res.ok) {
        const map: Record<string, string> = {
          required: t.checkout.required,
          invalid_email: t.checkout.invalidEmail,
          invalid_phone: t.checkout.invalidPhone,
          server: t.common.somethingWrong,
        };
        setError(map[res.error] ?? res.error);
        return;
      }
      setPlaced(true);
      cart.clear();
      router.push(`/order/${res.data!.orderId}`);
    });
  };

  return (
    <form id="checkout" className={styles.columns} onSubmit={onSubmit} noValidate={false}>
      <div className={styles.form}>
        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>{t.checkout.contact}</legend>
          <div className="form-row">
            <label className="field">
              <span className="t-label">{t.checkout.email}</span>
              <input className="input" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            </label>
            <label className="field">
              <span className="t-label">{t.checkout.phone}</span>
              <input className="input" name="phone" type="tel" required autoComplete="tel" placeholder="+94 7_ ___ ____" />
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>{t.checkout.address}</legend>
          <div className="form-row">
            <label className="field">
              <span className="t-label">{t.checkout.firstName}</span>
              <input className="input" name="firstName" required autoComplete="given-name" placeholder="Nimal" />
            </label>
            <label className="field">
              <span className="t-label">{t.checkout.lastName}</span>
              <input className="input" name="lastName" required autoComplete="family-name" placeholder="Perera" />
            </label>
          </div>
          <label className="field">
            <span className="t-label">{t.checkout.street}</span>
            <input className="input" name="address" required autoComplete="street-address" placeholder={t.checkout.streetPh} />
          </label>
          <div className="form-row">
            <label className="field">
              <span className="t-label">{t.checkout.city}</span>
              <input className="input" name="city" required autoComplete="address-level2" placeholder="Colombo" />
            </label>
            <label className="field">
              <span className="t-label">{t.checkout.postal}</span>
              <input className="input" name="postalCode" required autoComplete="postal-code" inputMode="numeric" placeholder="00100" />
            </label>
          </div>
        </fieldset>

        <fieldset className={`${styles.group} ${styles.groupTight}`}>
          <legend className={styles.groupTitle}>{t.checkout.method}</legend>
          {(["standard", "express"] as const).map((m) => {
            const fee = m === "standard" ? deliveryFee(cart.subtotal, "standard") : DELIVERY_FEES.express;
            return (
              <label key={m} className="radio-card">
                <input type="radio" name="delivery" value={m} checked={method === m} onChange={() => setMethod(m)} />
                <span className="radio-card__text">
                  <span className="radio-card__title">{m === "standard" ? t.checkout.standard : t.checkout.express}</span>
                  <span className="radio-card__sub">{m === "standard" ? t.checkout.standardTime : t.checkout.expressTime}</span>
                </span>
                <span className="radio-card__price">{fee === 0 ? t.common.free : lkr(fee)}</span>
              </label>
            );
          })}
        </fieldset>

        <fieldset className={`${styles.group} ${styles.groupTight}`}>
          <legend className={styles.groupTitle}>{t.checkout.payment}</legend>
          {(
            [
              ["card", t.checkout.card, t.checkout.cardSub],
              ["bank", t.checkout.bank, t.checkout.bankSub],
              ["cod", t.checkout.cod, null],
            ] as const
          ).map(([value, title, sub]) => (
            <label key={value} className="radio-card">
              <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} />
              <span className="radio-card__text">
                <span className="radio-card__title">{title}</span>
                {sub && <span className="radio-card__sub">{sub}</span>}
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <OrderSummary method={method} showItems>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--block" disabled={pending}>
          {pending ? t.checkout.placing : t.checkout.placeOrder}
        </button>
      </OrderSummary>
    </form>
  );
}
