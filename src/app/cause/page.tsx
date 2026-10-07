import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { getT } from "@/lib/i18n/server";
import styles from "./cause.module.css";

export const metadata: Metadata = {
  title: "The Cause",
  description: "In Sri Lanka, elephants and farming families share the same land. GAJA funds fences, warning lights and harvest support.",
};

export default async function CausePage() {
  const { t } = await getT();
  const c = t.cause;

  const numbers = [
    { value: "3,484", label: c.n1Label, sub: c.n1Sub },
    { value: "1,195", label: c.n2Label, sub: c.n2Sub },
    { value: "397", label: c.n3Label, sub: c.n3Sub },
  ];
  const reasons = [
    { title: c.w1, body: c.w1b, photo: c.w1p, src: "/images/cause-forest-edge.jpg", position: undefined },
    { title: c.w2, body: c.w2b, photo: c.w2p, src: "/images/cause-damaged-paddy.jpg", position: undefined },
    { title: c.w3, body: c.w3b, photo: c.w3p, src: "/images/cause-watch-hut.jpg", position: "center 22%" },
  ];
  const helps = [
    { title: c.h1, body: c.h1b },
    { title: c.h2, body: c.h2b },
    { title: c.h3, body: c.h3b },
  ];

  return (
    <>
      <section className="section">
        <div className={`container ${styles.split}`} style={{ paddingBlock: 88 }}>
          <div className={styles.copy}>
            <span className="pill" style={{ letterSpacing: 0 }}>
              {c.pill}
            </span>
            <h1 className={styles.heroTitle}>{c.title}</h1>
            <p className="t-lead" style={{ fontSize: "clamp(16px, 1.32vw, 19px)", lineHeight: "30px" }}>
              {c.lead}
            </p>
            <div className={styles.ctas}>
              <Link href="/shop" className="btn btn--primary">
                {t.common.shopTheShirts}
              </Link>
              <Link href="/fund" className="btn btn--secondary">
                {c.seeFund}
              </Link>
            </div>
          </div>
          <Photo className={`${styles.photoV} ${styles.heroPhoto}`} src="/images/cause-paddy-elephants.jpg" alt={c.heroPhoto} sizes="(max-width: 900px) 100vw, 640px" position="55% center" priority />
        </div>
      </section>

      <section className="section bg-band">
        <div className={`container ${styles.stack}`} style={{ paddingBlock: 96 }}>
          <div className={styles.head}>
            <span className="pill pill--deep">{c.numbersPill}</span>
            <h2 className={styles.h2}>{c.numbersTitle}</h2>
          </div>
          <div className={styles.grid3}>
            {numbers.map((n) => (
              <div key={n.label + n.sub} className={styles.number}>
                <p className={styles.numberValue}>{n.value}</p>
                <p className={styles.numberLabel}>{n.label}</p>
                <p className={styles.numberSub}>{n.sub}</p>
              </div>
            ))}
          </div>
          <p className={styles.sources}>{c.sources}</p>
        </div>
      </section>

      <section className="section bg-mist">
        <div className={`container ${styles.stack}`}>
          <div className={styles.head}>
            <span className="pill" style={{ letterSpacing: 0 }}>
              {c.whyPill}
            </span>
            <h2 className={`${styles.h2} c-forest`}>{c.whyTitle}</h2>
          </div>
          <div className={styles.grid3}>
            {reasons.map((r) => (
              <article key={r.title} className={styles.reason}>
                <Photo className={`${styles.photoV} ${styles.reasonPhoto}`} src={r.src} alt={r.photo} caption={`${r.photo} 400 x 240`} photoLabel={t.common.photo} sizes="(max-width: 900px) 100vw, 400px" position={r.position} />
                <div className={styles.reasonBody}>
                  <h3 className={styles.h3}>{r.title}</h3>
                  <p className="t-body" style={{ fontSize: 16, lineHeight: "25px" }}>
                    {r.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.split}`} style={{ paddingBlock: 104 }}>
          <Photo className={`${styles.photoV} ${styles.helpsPhoto}`} src="/images/steps/solar-fence.jpg" alt={c.helpsPhoto} sizes="(max-width: 900px) 100vw, 560px" position="45% center" />
          <div className={styles.copy}>
            <span className="pill" style={{ letterSpacing: 0 }}>
              {c.helpsPill}
            </span>
            <h2 className={`t-h3 c-forest`}>{c.helpsTitle}</h2>
            <ol className={styles.helps}>
              {helps.map((h, i) => (
                <li key={h.title}>
                  <span>{i + 1}</span>
                  <div>
                    <p className={styles.helpTitle}>{h.title}</p>
                    <p className="t-body" style={{ fontSize: 16, lineHeight: "25px" }}>
                      {h.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section bg-mint">
        <div className={`container ${styles.cta}`}>
          <h2 className={styles.ctaTitle}>{c.ctaTitle}</h2>
          <p className="t-lead" style={{ maxWidth: 640, fontSize: "clamp(16px, 1.32vw, 19px)", lineHeight: "30px" }}>
            {c.ctaBody}
          </p>
          <div className={styles.ctas} style={{ justifyContent: "center" }}>
            <Link href="/shop" className="btn btn--primary">
              {t.common.shopTheShirts}
            </Link>
            <Link href="/fund#give" className="btn btn--secondary">
              {t.common.donateDirectly}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
