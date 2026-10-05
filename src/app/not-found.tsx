import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <section className="section">
      <div className="container" style={{ paddingBlock: "120px", display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
        <span className="pill">404</span>
        <h1 className="t-h1">{t.notFound.title}</h1>
        <p className="t-lead">{t.notFound.body}</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/" className="btn btn--primary">
            {t.common.home}
          </Link>
          <Link href="/shop" className="btn btn--secondary">
            {t.common.shopTheShirts}
          </Link>
        </div>
      </div>
    </section>
  );
}
