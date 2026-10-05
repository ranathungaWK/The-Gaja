"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/fund", label: "Fund" },
  { href: "/admin/inbox", label: "Inbox" },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }} aria-label="Admin">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className="chip" aria-current={pathname === t.href ? "true" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
