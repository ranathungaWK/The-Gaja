"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/Providers";
import styles from "./shop.module.css";

export function SortSelect({ value }: { value: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className={styles.sort}>
      <span>{t.shop.sort}</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          const qs = next.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
      >
        <option value="featured">{t.shop.featured}</option>
        <option value="price-asc">{t.shop.priceAsc}</option>
        <option value="price-desc">{t.shop.priceDesc}</option>
        <option value="name">{t.shop.nameSort}</option>
      </select>
    </label>
  );
}
