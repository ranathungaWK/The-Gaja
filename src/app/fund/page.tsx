import type { Metadata } from "next";
import { Photo } from "@/components/Photo";
import { getFundStats, getGallery, getLatestUpdate, getMilestones, getReceipts } from "@/lib/data";
import { lkr, percent, shortDate } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import cause from "../cause/cause.module.css";
import { DonateCard } from "./DonateCard";
import styles from "./fund.module.css";

export const metadata: Metadata = {
  title: "The Fund",
  description: "Every rupee, in the open. See what has been raised, what it has paid for and what comes next.",
};

export default async function FundPage() {
  const { t } = await getT();
  const [stats, milestones, receipts, update, gallery] = await Promise.all([
    getFundStats(),
    getMilestones(),
    getReceipts(),
    getLatestUpdate(),
    getGallery(),
  ]);
  const p = percent(stats.raised, stats.goal);

  return (
    <>
      <section className="section bg-band">
        <div className={`container ${cause.split} ${styles.hero}`}>
          <div className={cause.copy} style={{ gap: 26 }}>
            <span className="pill pill--deep">{fill(t.fund.pill, { drop: stats.drop_name })}</span>
            <h1 className={styles.heroTitle}>{t.fund.title}</h1>
            <p className={styles.heroLead}>{t.fund.lead}</p>
          </div>
          <DonateCard />
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.progress}`}>
          <div>
            <p className={styles.raisedLabel}>{t.common.raisedSoFar}</p>
            <p className={styles.raised}>{lkr(stats.raised)}</p>
          </div>
          <div className="progress" style={{ height: 18 }} role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress__bar" style={{ width: `${p}%` }} />
          </div>
          <div className={styles.progressRow}>
            <span>{fill(t.common.ofGoal, { p })}</span>
            <span>{fill(t.common.goal, { goal: lkr(stats.goal) })}</span>
          </div>
          <div className={cause.grid3}>
            <div className={styles.stat}>
              <p>{stats.shirts_sold.toLocaleString("en-US")}</p>
              <p>{t.fund.shirtsSoldL}</p>
            </div>
            <div className={styles.stat}>
              <p>{stats.days_left}</p>
              <p>{fill(t.fund.daysLeftDrop, { drop: stats.drop_name })}</p>
            </div>
            <div className={styles.stat}>
              <p>{stats.first_run}</p>
              <p>{t.fund.firstRun}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-mist">
        <div className={`container ${cause.stack}`}>
          <div className={cause.head}>
            <span className="pill" style={{ letterSpacing: 0 }}>
              {t.fund.milestonesPill}
            </span>
            <h2 className={`${cause.h2} c-forest`}>{t.fund.milestonesTitle}</h2>
          </div>
          <div className={styles.milestones}>
            {milestones.map((m) => {
              const reached = stats.raised >= m.amount;
              return (
                <div key={m.id} className={`${styles.milestone} ${reached ? `${styles.reached} bg-band` : ""}`}>
                  <span className={`pill ${reached ? "pill--deep" : ""}`} style={{ letterSpacing: 0 }}>
                    {reached ? t.fund.reached : t.fund.nextUp}
                  </span>
                  <p className={styles.msAmount}>{lkr(m.amount)}</p>
                  <p className={styles.msTitle}>{m.title}</p>
                  <p className={styles.msBody}>{m.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="receipts">
        <div className={`container ${styles.receiptsWrap}`}>
          <div className={styles.col}>
            <h2 className={styles.colTitle}>{t.fund.receipts}</h2>
            {receipts.map((r) => (
              <div key={r.id} className={styles.receipt}>
                <div>
                  <p className={styles.receiptTitle}>{r.title}</p>
                  <p className={styles.receiptDate}>
                    {shortDate(r.spent_on)}
                    {r.fileUrl && (
                      <>
                        {" · "}
                        <a href={r.fileUrl} target="_blank" rel="noreferrer">
                          {t.fund.viewReceipt}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <p className={styles.receiptAmount}>{lkr(r.amount)}</p>
              </div>
            ))}
          </div>
          {update && (
            <div className={styles.col}>
              <h2 className={styles.colTitle}>{t.fund.latest}</h2>
              <Photo
                className={`${cause.photoV} ${styles.updatePhoto}`}
                src={update.imageUrl}
                alt={update.title}
                caption="The newly built fence at the village edge. 640 x 260"
                photoLabel={t.common.photo}
              />
              <h3 className={styles.updateTitle}>{update.title}</h3>
              <p className="t-body" style={{ fontSize: 16, lineHeight: "25px" }}>
                {update.body}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-mint">
        <div className={`container ${cause.stack}`}>
          <div className={cause.head}>
            <span className="pill" style={{ letterSpacing: 0 }}>
              {t.fund.galleryPill}
            </span>
            <h2 className={`${cause.h2} c-forest`}>{t.fund.galleryTitle}</h2>
          </div>
          <div className={styles.gallery}>
            {gallery.map((g) => (
              <Photo
                key={g.id}
                className={`${cause.photoV} ${styles.galleryItem}`}
                src={g.imageUrl}
                alt={g.caption}
                caption={`${g.caption} 320 x 320`}
                photoLabel={t.common.photo}
                sizes="(max-width: 600px) 50vw, 25vw"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
