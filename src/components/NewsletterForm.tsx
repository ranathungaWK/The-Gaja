"use client";

import { useState, useTransition } from "react";
import { subscribe } from "@/app/actions";
import { useI18n } from "./Providers";
import styles from "./NewsletterForm.module.css";

export function NewsletterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="form-success" role="status">
        {t.home.newsThanks}
      </p>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await subscribe(email);
          if (res.ok) setDone(true);
          else setError(res.error === "invalid_email" ? t.checkout.invalidEmail : t.common.somethingWrong);
        });
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        {t.home.newsPlaceholder}
      </label>
      <input
        id="newsletter-email"
        className={styles.input}
        type="email"
        required
        autoComplete="email"
        placeholder={t.home.newsPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={!!error}
      />
      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? t.common.sending : t.home.notify}
      </button>
      {error && (
        <p className={`form-error ${styles.error}`} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
