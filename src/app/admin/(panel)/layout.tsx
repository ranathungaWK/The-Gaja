import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../actions";
import { AdminTabs } from "./AdminTabs";
import styles from "./admin.module.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <section className="section">
      <div className={`container ${styles.shell}`}>
        <header className={styles.top}>
          <div>
            <span className="pill">Admin</span>
            <h1 className={styles.heading}>Ali Mankadin Eha store</h1>
          </div>
          <div className={styles.topActions}>
            <Link href="/" className="btn btn--soft">
              View site
            </Link>
            <form action={logout}>
              <button className="btn btn--secondary">Sign out</button>
            </form>
          </div>
        </header>
        <AdminTabs />
        {children}
      </div>
    </section>
  );
}
