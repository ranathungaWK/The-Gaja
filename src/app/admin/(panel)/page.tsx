import { getFundStats, type Order } from "@/lib/data";
import { lkr } from "@/lib/format";
import { db } from "@/lib/supabase";
import { updateOrderStatus } from "../actions";
import styles from "./admin.module.css";

const STATUSES = ["pending", "paid", "printing", "shipped", "delivered", "cancelled"];
const PAYMENT = { card: "Card", bank: "Bank transfer", cod: "Cash on delivery" } as const;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  let q = db().from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(200);
  if (status && STATUSES.includes(status)) q = q.eq("status", status);
  const [{ data, error }, stats] = await Promise.all([q, getFundStats()]);
  if (error) throw error;
  const orders = (data ?? []) as Order[];
  const open = orders.filter((o) => ["pending", "paid", "printing"].includes(o.status)).length;
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0);

  return (
    <>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <p>Raised for the fund</p>
          <p>{lkr(stats.raised)}</p>
        </div>
        <div className={styles.stat}>
          <p>Shirts sold</p>
          <p>{stats.shirts_sold}</p>
        </div>
        <div className={styles.stat}>
          <p>Open orders (shown)</p>
          <p>{open}</p>
        </div>
        <div className={styles.stat}>
          <p>Order revenue (shown)</p>
          <p>{lkr(revenue)}</p>
        </div>
      </div>

      <nav className={styles.inline} aria-label="Filter orders">
        <a href="/admin" className="chip chip--sm" aria-current={!status ? "true" : undefined}>
          All
        </a>
        {STATUSES.map((s) => (
          <a key={s} href={`/admin?status=${s}`} className="chip chip--sm" aria-current={status === s ? "true" : undefined}>
            {s}
          </a>
        ))}
      </nav>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.muted}>
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <strong>{o.order_number}</strong>
                  <br />
                  <span className={styles.muted}>{new Date(o.created_at).toLocaleString("en-GB", { timeZone: "Asia/Colombo" })}</span>
                  <br />
                  <a href={`/order/${o.id}`} target="_blank" rel="noreferrer" className="c-leaf" style={{ fontWeight: 700 }}>
                    Receipt page
                  </a>
                </td>
                <td>
                  <strong>
                    {o.first_name} {o.last_name}
                  </strong>
                  <br />
                  <a href={`mailto:${o.email}`}>{o.email}</a>
                  <br />
                  <a href={`tel:${o.phone}`}>{o.phone}</a>
                  <br />
                  <span className={styles.muted}>
                    {o.address}, {o.city} {o.postal_code}
                  </span>
                </td>
                <td>
                  {o.order_items.map((i) => (
                    <div key={i.id}>
                      {i.quantity} × {i.product_name} ({i.size})
                    </div>
                  ))}
                  <span className={styles.muted}>{o.delivery_method === "express" ? "Express" : "Standard"} delivery</span>
                </td>
                <td>
                  <strong>{lkr(o.total)}</strong>
                  <br />
                  <span className={styles.muted}>Fund {lkr(o.fund_contribution)}</span>
                </td>
                <td>{PAYMENT[o.payment_method]}</td>
                <td>
                  <form key={o.status} action={updateOrderStatus} className={styles.inline}>
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status} className={styles.select}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button className={`btn btn--primary ${styles.small}`}>Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
