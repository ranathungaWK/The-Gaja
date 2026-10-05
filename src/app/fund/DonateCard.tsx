"use client";

import { useState, useTransition } from "react";
import { pledgeDonation } from "@/app/actions";
import { useI18n } from "@/components/Providers";
import { lkr } from "@/lib/format";
import { fill } from "@/lib/i18n";
import styles from "./fund.module.css";

const PRESETS = [500, 1000, 2500];

export function DonateCard() {
  const { t } = useI18n();
  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time");
  const [preset, setPreset] = useState<number | "custom">(1000);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const amount = preset === "custom" ? Math.round(Number(custom.replace(/[^\d]/g, "")) || 0) : preset;
  const label = frequency === "monthly" ? t.fund.donateMonthly : t.fund.donate;

  if (done) {
    return (
      <div className={`scope-light ${styles.donate}`} id="give">
        <p className={styles.donateTitle}>{t.fund.give}</p>
        <p className="form-success" role="status">
          {done}
        </p>
      </div>
    );
  }

  return (
    <form
      id="give"
      className={`scope-light ${styles.donate}`}
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (amount < 100) {
          setError(t.fund.minAmount);
          return;
        }
        startTransition(async () => {
          const res = await pledgeDonation({ amount, frequency, email, name });
          if (res.ok) setDone(fill(t.fund.pledged, { email, amount: lkr(amount) }));
          else setError(res.error === "invalid_email" ? t.checkout.invalidEmail : res.error === "min_amount" ? t.fund.minAmount : t.common.somethingWrong);
        });
      }}
    >
      <p className={styles.donateTitle}>{t.fund.give}</p>
      <div className={styles.donateChips} role="radiogroup" aria-label={t.fund.give}>
        {(["one_time", "monthly"] as const).map((f) => (
          <button key={f} type="button" role="radio" aria-checked={frequency === f} className={styles.dChip} onClick={() => setFrequency(f)}>
            {f === "one_time" ? t.fund.oneTime : t.fund.monthly}
          </button>
        ))}
      </div>
      <p className={styles.donateLabel}>{t.fund.choose}</p>
      <div className={styles.donateChips} role="radiogroup" aria-label={t.fund.choose}>
        {PRESETS.map((p) => (
          <button key={p} type="button" role="radio" aria-checked={preset === p} className={styles.dChip} onClick={() => setPreset(p)}>
            {lkr(p)}
          </button>
        ))}
        <button type="button" role="radio" aria-checked={preset === "custom"} className={styles.dChip} onClick={() => setPreset("custom")}>
          {t.fund.custom}
        </button>
      </div>
      {preset === "custom" ? (
        <label className={styles.amountBox}>
          <span>LKR</span>
          <input
            autoFocus
            inputMode="numeric"
            placeholder={t.fund.customPh}
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^\d,]/g, ""))}
            aria-label={t.fund.customPh}
          />
        </label>
      ) : (
        <div className={styles.amountBox} aria-live="polite">
          {lkr(amount)}
        </div>
      )}
      <div className="form-row" style={{ width: "100%" }}>
        <input className="input" type="email" required placeholder={t.fund.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-label={t.fund.emailPh} />
        <input className="input" placeholder={t.fund.namePh} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-label={t.fund.namePh} />
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--primary btn--block" disabled={pending}>
        {pending ? t.common.sending : fill(label, { amount: lkr(Math.max(amount, 0)) })}
      </button>
      <p className={styles.donateNote}>{t.fund.note}</p>
    </form>
  );
}
