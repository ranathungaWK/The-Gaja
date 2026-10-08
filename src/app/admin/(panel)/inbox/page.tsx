import { db } from "@/lib/supabase";
import { deleteRow, toggleHandled } from "../../actions";
import styles from "../admin.module.css";

const TOPICS: Record<string, string> = { order: "My order", donations: "Donations", press: "Press", other: "Something else" };

export default async function AdminInbox() {
  const [{ data: messages }, { data: subscribers, count }] = await Promise.all([
    db().from("contact_messages").select("*").order("handled").order("created_at", { ascending: false }).limit(200),
    db().from("newsletter_subscribers").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(500),
  ]);

  return (
    <>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Messages</h2>
        {(messages ?? []).length === 0 && <p className={styles.muted}>No messages yet.</p>}
        {(messages ?? []).map((m) => (
          <div key={m.id} className={styles.card} style={{ background: "var(--white)", opacity: m.handled ? 0.6 : 1 }}>
            <div className={styles.cardHead}>
              <div>
                <strong>{m.name}</strong> · <a href={`mailto:${m.email}?subject=Re: your message to Ali Mankadin Eha`}>{m.email}</a>
                <p className={styles.muted}>
                  <span className={styles.badge}>{TOPICS[m.topic] ?? m.topic}</span> {new Date(m.created_at).toLocaleString("en-GB", { timeZone: "Asia/Colombo" })}
                </p>
              </div>
              <div className={styles.inline}>
                <form action={toggleHandled}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="handled" value={String(!m.handled)} />
                  <button className={`btn btn--soft ${styles.small}`}>{m.handled ? "Mark as open" : "Mark as handled"}</button>
                </form>
                <form action={deleteRow}>
                  <input type="hidden" name="table" value="contact_messages" />
                  <input type="hidden" name="id" value={m.id} />
                  <button className={`btn btn--secondary ${styles.small}`}>Delete</button>
                </form>
              </div>
            </div>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{m.message}</p>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Newsletter · {count ?? 0} subscribers</h2>
        </div>
        <textarea
          className="input"
          readOnly
          value={(subscribers ?? []).map((s) => s.email).join(", ")}
          aria-label="Subscriber emails"
          style={{ minHeight: 120, fontSize: 14 }}
        />
      </div>
    </>
  );
}
