import type { Metadata } from "next";
import { Photo } from "@/components/Photo";
import { getT } from "@/lib/i18n/server";
import { ContactForm, Faq } from "./ContactClient";
import styles from "./contact.module.css";

export const metadata: Metadata = { title: "Contact and FAQ" };

export default async function ContactPage() {
  const { t } = await getT();
  const c = t.contact;
  const faq = [
    { id: "faq-money", q: c.q1, a: c.a1 },
    { id: "faq-donate", q: c.q2, a: c.a2 },
    { id: "faq-delivery", q: c.q3, a: c.a3 },
    { id: "faq-exchange", q: c.q4, a: c.a4 },
    { id: "faq-spent", q: c.q5, a: c.a5 },
    { id: "faq-shipping", q: c.q6, a: c.a6 },
  ];

  return (
    <>
      <section className="section">
        <div className={`container ${styles.header}`}>
          <span className="pill">{c.pill}</span>
          <h1 className={styles.title}>{c.title}</h1>
          <p className="t-lead" style={{ maxWidth: 640, lineHeight: "30px" }}>
            {c.lead}
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.formRow}`}>
          <ContactForm />
          <div className={styles.info}>
            <a className={styles.infoCard} href="mailto:hello@gaja.lk">
              <span>{c.emailL}</span>
              <span>hello@gaja.lk</span>
            </a>
            <a className={styles.infoCard} href="https://instagram.com/gaja.lk" target="_blank" rel="noreferrer">
              <span>{c.instagram}</span>
              <span>@gaja.lk</span>
            </a>
            <div className={styles.infoCard}>
              <span>{c.replyTime}</span>
              <span>{c.replyValue}</span>
            </div>
            <Photo className={styles.studio} alt={c.studioPhoto} caption={`${c.studioPhoto} 480 x 220`} photoLabel={t.common.photo} />
          </div>
        </div>
      </section>

      <section className="section bg-mist" id="faq">
        <div className={`container ${styles.faq}`}>
          <h2 className={styles.faqTitle}>{c.faqTitle}</h2>
          <Faq items={faq} />
        </div>
      </section>
    </>
  );
}
