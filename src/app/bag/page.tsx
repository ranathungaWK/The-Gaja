import type { Metadata } from "next";
import { BagView } from "./BagView";

export const metadata: Metadata = { title: "Bag", robots: { index: false } };

export default function BagPage() {
  return (
    <section className="section">
      <BagView />
    </section>
  );
}
