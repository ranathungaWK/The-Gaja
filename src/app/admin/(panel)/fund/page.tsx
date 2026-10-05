import { getGallery, getLatestUpdate, getMilestones, getReceipts } from "@/lib/data";
import { lkr, shortDate } from "@/lib/format";
import { db } from "@/lib/supabase";
import { addMilestone, addReceipt, addUpdate, deleteRow, saveFundSettings, saveGalleryItem, setDonationStatus } from "../../actions";
import styles from "../admin.module.css";

function DeleteButton({ table, id }: { table: string; id: string }) {
  return (
    <form action={deleteRow}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button className={`btn btn--secondary ${styles.small}`}>Delete</button>
    </form>
  );
}

export default async function AdminFund() {
  const [{ data: settings }, milestones, receipts, update, gallery, { data: donations }] = await Promise.all([
    db().from("fund_settings").select("*").eq("id", 1).single(),
    getMilestones(),
    getReceipts(100),
    getLatestUpdate(),
    getGallery(),
    db().from("donations").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  return (
    <>
      <form action={saveFundSettings} className={styles.card}>
        <h2 className={styles.cardTitle}>Fund settings</h2>
        <p className={styles.muted}>
          “Raised” on the site = offline amount + fund share of every non-cancelled order + donations marked paid.
        </p>
        <div className={styles.grid3}>
          <label className="field">
            <span className="t-label">Goal (LKR)</span>
            <input className="input" name="goal" type="number" min={0} defaultValue={settings?.goal} />
          </label>
          <label className="field">
            <span className="t-label">Raised outside the site (LKR)</span>
            <input className="input" name="offline_raised" type="number" min={0} defaultValue={settings?.offline_raised} />
          </label>
          <label className="field">
            <span className="t-label">Shirts sold outside the site</span>
            <input className="input" name="offline_shirts" type="number" min={0} defaultValue={settings?.offline_shirts} />
          </label>
          <label className="field">
            <span className="t-label">Drop name</span>
            <input className="input" name="drop_name" defaultValue={settings?.drop_name} />
          </label>
          <label className="field">
            <span className="t-label">Drop ends on</span>
            <input className="input" name="drop_ends_at" type="date" defaultValue={settings?.drop_ends_at?.slice(0, 10)} />
          </label>
          <label className="field">
            <span className="t-label">Shirts in the first run</span>
            <input className="input" name="first_run" type="number" min={0} defaultValue={settings?.first_run} />
          </label>
        </div>
        <button className="btn btn--primary" style={{ alignSelf: "flex-start" }}>
          Save settings
        </button>
      </form>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Direct donations</h2>
        <p className={styles.muted}>Pledges from the “Give directly” card. Mark a pledge as paid once the money arrives; it then counts towards the fund.</p>
        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Donor</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(donations ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.muted}>
                    No donations yet.
                  </td>
                </tr>
              )}
              {(donations ?? []).map((d) => (
                <tr key={d.id}>
                  <td>{new Date(d.created_at).toLocaleDateString("en-GB")}</td>
                  <td>
                    <strong>{d.name || "—"}</strong>
                    <br />
                    <a href={`mailto:${d.email}`}>{d.email}</a>
                  </td>
                  <td>
                    <strong>{lkr(d.amount)}</strong>
                    <br />
                    <span className={styles.muted}>{d.frequency === "monthly" ? "Monthly" : "One time"}</span>
                  </td>
                  <td>
                    <form key={d.status} action={setDonationStatus} className={styles.inline}>
                      <input type="hidden" name="id" value={d.id} />
                      <select name="status" defaultValue={d.status} className={styles.select}>
                        <option value="pledged">pledged</option>
                        <option value="paid">paid</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                      <button className={`btn btn--primary ${styles.small}`}>Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Receipts</h2>
          {receipts.map((r) => (
            <div key={r.id} className={styles.cardHead}>
              <div>
                <strong>{r.title}</strong>
                <p className={styles.muted}>
                  {shortDate(r.spent_on)} · {lkr(r.amount)}
                  {r.fileUrl && (
                    <>
                      {" · "}
                      <a href={r.fileUrl} target="_blank" rel="noreferrer" className="c-leaf">
                        file
                      </a>
                    </>
                  )}
                </p>
              </div>
              <DeleteButton table="receipts" id={r.id} />
            </div>
          ))}
          <form action={addReceipt} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input" name="title" placeholder="What was paid for" required />
            <div className="form-row">
              <input className="input" name="spent_on" type="date" required />
              <input className="input" name="amount" type="number" min={0} placeholder="Amount (LKR)" required />
            </div>
            <label className="field">
              <span className="t-label">Receipt photo or PDF (optional)</span>
              <input name="file" type="file" accept="image/*,application/pdf" />
            </label>
            <button className="btn btn--primary" style={{ alignSelf: "flex-start" }}>
              Add receipt
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Milestones</h2>
          {milestones.map((m) => (
            <div key={m.id} className={styles.cardHead}>
              <div>
                <strong>
                  {lkr(m.amount)} · {m.title}
                </strong>
                <p className={styles.muted}>{m.description}</p>
              </div>
              <DeleteButton table="milestones" id={m.id} />
            </div>
          ))}
          <form action={addMilestone} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="form-row">
              <input className="input" name="amount" type="number" min={0} placeholder="Amount (LKR)" required />
              <input className="input" name="title" placeholder="Title" required />
            </div>
            <input className="input" name="description" placeholder="One line description" required />
            <button className="btn btn--primary" style={{ alignSelf: "flex-start" }}>
              Add milestone
            </button>
          </form>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Latest update</h2>
          {update && (
            <div className={styles.cardHead}>
              <div>
                <strong>{update.title}</strong>
                <p className={styles.muted}>{update.body}</p>
              </div>
              <DeleteButton table="fund_updates" id={update.id} />
            </div>
          )}
          <form action={addUpdate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input" name="title" placeholder="Headline" required />
            <textarea className="input" name="body" placeholder="What happened" required style={{ minHeight: 100 }} />
            <label className="field">
              <span className="t-label">Photo (optional)</span>
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />
            </label>
            <button className="btn btn--primary" style={{ alignSelf: "flex-start" }}>
              Publish update
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>“What the money built” gallery</h2>
          {gallery.map((g, i) => (
            <form key={g.id} action={saveGalleryItem} className={styles.inline} style={{ alignItems: "flex-end" }}>
              <input type="hidden" name="id" value={g.id} />
              {g.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.imageUrl} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10 }} />
              )}
              <label className="field" style={{ flex: "1 1 180px" }}>
                <span className="t-label">Photo {i + 1}</span>
                <input className="input" name="caption" defaultValue={g.caption} />
              </label>
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ maxWidth: 200 }} />
              <button className={`btn btn--primary ${styles.small}`}>Save</button>
            </form>
          ))}
        </div>
      </div>
    </>
  );
}
