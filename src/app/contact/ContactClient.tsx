"use client";

import { useEffect, useState, useTransition } from "react";
import { sendContact } from "@/app/actions";
import { useI18n } from "@/components/Providers";
import styles from "./contact.module.css";

export function ContactForm() {
  const { t } = useI18n();
  const topics = [t.contact.t1, t.contact.t2, t.contact.t3, t.contact.t4];
  const [topic, setTopic] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className={styles.form}>
        <p className="form-success" role="status">
          {t.contact.sent}
        </p>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const f = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await sendContact({
            name: String(f.get("name") ?? ""),
            email: String(f.get("email") ?? ""),
            message: String(f.get("message") ?? ""),
            topic: ["order", "donations", "press", "other"][topic],
          });
          if (res.ok) setSent(true);
          else setError(res.error === "invalid_email" ? t.checkout.invalidEmail : res.error === "required" ? t.checkout.required : t.common.somethingWrong);
        });
      }}
    >
      <div className="form-row">
        <label className="field">
          <span className="t-label">{t.contact.name}</span>
          <input className="input" name="name" required autoComplete="name" placeholder={t.contact.namePh} />
        </label>
        <label className="field">
          <span className="t-label">{t.contact.email}</span>
          <input className="input" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </label>
      </div>
      <p className="t-label" id="topic-label">
        {t.contact.topic}
      </p>
      <div className={styles.topics} role="radiogroup" aria-labelledby="topic-label">
        {topics.map((label, i) => (
          <button key={label} type="button" role="radio" aria-checked={topic === i} className={`chip ${styles.topic}`} onClick={() => setTopic(i)}>
            {label}
          </button>
        ))}
      </div>
      <label className="field" style={{ width: "100%" }}>
        <span className="t-label">{t.contact.message}</span>
        <textarea className="input" name="message" required placeholder={t.contact.messagePh} maxLength={5000} />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? t.common.sending : t.contact.send}
      </button>
    </form>
  );
}

export function Faq({ items }: { items: { id: string; q: string; a: string }[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (items.some((i) => i.id === id)) setOpen(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [items]);

  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];

  return (
    <div className={styles.faqGrid}>
      {columns.map((col, ci) => (
        <div key={ci} className={styles.faqCol}>
          {col.map((item) => {
            const isOpen = open === item.id;
            return (
              <div key={item.id} id={item.id} className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ""}`}>
                <button type="button" className={styles.faqQ} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : item.id)}>
                  <span>{item.q}</span>
                  <span aria-hidden="true">{isOpen ? "-" : "+"}</span>
                </button>
                {isOpen && <p className={styles.faqA}>{item.a}</p>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
