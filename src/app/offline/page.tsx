import type { Metadata } from "next";
import { RetryButton } from "./RetryButton";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

// Pre-cached by the service worker and served when a page cannot be fetched.
// Static on purpose: it must render without the network or the database.
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <section className="section">
      <div className="container" style={{ paddingBlock: "120px", display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
        <span className="pill">Offline</span>
        <h1 className="t-h1">You are offline.</h1>
        <p className="t-lead">Check your connection and try again. Your bag is saved on this device.</p>
        <RetryButton />
      </div>
    </section>
  );
}
