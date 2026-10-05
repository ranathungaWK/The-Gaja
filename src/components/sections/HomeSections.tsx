import Link from "next/link";
import type { FundStats, Product } from "@/lib/data";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import { lkr, percent } from "@/lib/format";
import { NewsletterForm } from "../NewsletterForm";
import { Photo } from "../Photo";
import { ProductCard, ProductGrid } from "../ProductCard";
import styles from "./HomeSections.module.css";

type T = { t: Dictionary };

export function Hero({ t, stats }: T & { stats: FundStats }) {
  const p = percent(stats.raised, stats.goal);
  return (
    <section className="section">
      <div className={`container ${styles.hero}`}>
        <div className={styles.heroCopy}>
          <span className="pill">{t.home.pill}</span>
          <h1 className="t-display">
            <span className="c-pine">{t.home.h1a}</span>
            <br />
            <span className="c-leaf">{t.home.h1b}</span>
          </h1>
          <p className={`t-lead ${styles.heroLead}`}>{t.home.lead}</p>
          <div className={styles.ctas}>
            <Link href="/shop" className="btn btn--primary">
              {t.common.shopTheShirts}
            </Link>
            <Link href="/fund" className="btn btn--secondary">
              {t.home.ctaMoney}
            </Link>
          </div>
          <ul className={styles.trust}>
            <li>{t.home.trust1}</li>
            <li>{t.home.trust2}</li>
            <li>{t.home.trust3}</li>
          </ul>
        </div>
        <div className={styles.heroMedia}>
          <Photo className={styles.heroPhoto} alt={t.home.heroPhoto} caption={`${t.home.heroPhoto} 600 x 660`} photoLabel={t.common.photo} priority />
          <Link href="/fund" className={styles.fundCard}>
            <p className={styles.fundCardLabel}>{t.common.raisedSoFar}</p>
            <p className={styles.fundCardValue}>{lkr(stats.raised)}</p>
            <div className="progress">
              <div className="progress__bar" style={{ width: `${p}%` }} />
            </div>
            <p className={styles.fundCardNote}>{fill(t.common.ofTheGoal, { p, goal: lkr(stats.goal) })}</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TwoSides({ t }: T) {
  return (
    <section className="section bg-mist">
      <div className={`container ${styles.twoSides}`}>
        <header className={styles.centerHead}>
          <span className="pill">{t.home.storyPill}</span>
          <h2 className="t-h2">{t.home.storyTitle}</h2>
          <p className={`t-lead ${styles.centerLead}`}>{t.home.storyLead}</p>
        </header>
        <div className={styles.sidesRow}>
          <article className={styles.side}>
            <Photo className={styles.sidePhoto} alt={t.home.farmerPhoto} caption={`${t.home.farmerPhoto} 648 x 440`} photoLabel={t.common.photo} />
            <p className="t-eyebrow">{t.home.sideOne}</p>
            <h3 className={styles.sideTitle}>{t.home.farmer}</h3>
            <p className="t-body">{t.home.farmerBody}</p>
          </article>
          <article className={styles.side}>
            <Photo className={styles.sidePhoto} alt={t.home.elephantPhoto} caption={`${t.home.elephantPhoto} 648 x 440`} photoLabel={t.common.photo} />
            <p className="t-eyebrow">{t.home.sideTwo}</p>
            <h3 className={styles.sideTitle}>{t.home.elephant}</h3>
            <p className="t-body">{t.home.elephantBody}</p>
          </article>
          <span className={styles.vs} aria-hidden="true">
            {t.home.vs}
          </span>
        </div>
      </div>
    </section>
  );
}

export function Shirts({ t, products, locale }: T & { products: Product[]; locale: Locale }) {
  return (
    <section className="section">
      <div className={`container ${styles.block}`}>
        <div className={styles.rowHead}>
          <div className={styles.stackHead}>
            <span className="pill">{t.home.shirtsPill}</span>
            <h2 className="t-h2">{t.home.shirtsTitle}</h2>
          </div>
          <Link href="/shop" className="btn btn--soft">
            {t.home.viewAll}
          </Link>
        </div>
        <ProductGrid>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} t={t} locale={locale} />
          ))}
        </ProductGrid>
      </div>
    </section>
  );
}

export function FundBand({ t, stats }: T & { stats: FundStats }) {
  const p = percent(stats.raised, stats.goal);
  return (
    <section className="section bg-band">
      <div className={`container ${styles.fundBand}`}>
        <div className={styles.fundCopy}>
          <span className="pill pill--band">{fill(t.home.fundPill, { drop: stats.drop_name })}</span>
          <h2 className={styles.fundTitle}>
            {t.home.fundTitleA}
            <br />
            {t.home.fundTitleB}
          </h2>
          <p className={styles.fundBody}>{t.home.fundBody}</p>
          <Link href="/fund#give" className="btn btn--light">
            {t.common.donateDirectly}
          </Link>
        </div>
        <div className={`scope-light ${styles.progressCard}`}>
          <p className={styles.pcLabel}>{t.common.raisedSoFar}</p>
          <p className={styles.pcValue}>{lkr(stats.raised)}</p>
          <div className="progress" style={{ height: 14 }}>
            <div className="progress__bar" style={{ width: `${p}%` }} />
          </div>
          <div className={styles.pcRow}>
            <span>{fill(t.common.ofGoal, { p })}</span>
            <span>{fill(t.common.goal, { goal: lkr(stats.goal) })}</span>
          </div>
          <hr className="divider" />
          <dl className={styles.pcStats}>
            <div>
              <dt>{t.common.shirtsSold}</dt>
              <dd>{stats.shirts_sold.toLocaleString("en-US")}</dd>
            </div>
            <div>
              <dt>{t.common.designs}</dt>
              <dd>{stats.designs}</dd>
            </div>
            <div>
              <dt>{t.common.daysLeft}</dt>
              <dd>{stats.days_left}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function MoneySteps({ t }: T) {
  const steps = [
    { title: t.home.step1, body: t.home.step1Body, photo: t.home.step1Photo },
    { title: t.home.step2, body: t.home.step2Body, photo: t.home.step2Photo },
    { title: t.home.step3, body: t.home.step3Body, photo: t.home.step3Photo },
  ];
  return (
    <section className="section bg-mist">
      <div className={`container ${styles.block} ${styles.blockLg}`}>
        <div className={styles.stackHead}>
          <span className="pill">{t.home.moneyPill}</span>
          <h2 className="t-h2">{t.home.moneyTitle}</h2>
        </div>
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <article key={s.title} className={styles.step}>
              <Photo className={styles.stepPhoto} alt={s.photo} caption={`${s.photo} 420 x 260`} photoLabel={t.common.photo} />
              <div className={styles.stepBody}>
                <p className="t-eyebrow" style={{ letterSpacing: "0.1em", textTransform: "none" }}>
                  {fill(t.home.step, { n: String(i + 1).padStart(2, "0") })}
                </p>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className="t-body" style={{ fontSize: 16, lineHeight: "25px" }}>
                  {s.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Creator({ t, showButton = true }: T & { showButton?: boolean }) {
  return (
    <section className="section" id="story">
      <div className={`container ${styles.creator}`}>
        <Photo className={styles.creatorPhoto} alt={t.home.creatorPhoto} caption={`${t.home.creatorPhoto} 560 x 600`} photoLabel={t.common.photo} />
        <div className={styles.creatorCopy}>
          <span className="pill">{t.home.creatorPill}</span>
          <h2 className={styles.creatorTitle}>
            {t.home.creatorA}
            <br />
            {t.home.creatorB}
          </h2>
          <p className="t-lead">{t.home.creatorBody}</p>
          {showButton && (
            <Link href="/story" className="btn btn--secondary">
              {t.home.readStory}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function Newsletter({ t }: T) {
  return (
    <section className="section bg-mint" id="newsletter">
      <div className={`container ${styles.newsletter}`}>
        <h2 className={styles.newsTitle}>{t.home.newsTitle}</h2>
        <p className={styles.newsBody}>{t.home.newsBody}</p>
        <NewsletterForm />
      </div>
    </section>
  );
}
