export function lkr(amount: number): string {
  return `LKR ${Math.round(amount).toLocaleString("en-US")}`;
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / whole) * 100)));
}

export const FREE_DELIVERY_THRESHOLD = 8000;
export const DELIVERY_FEES = { standard: 450, express: 900 } as const;
export type DeliveryMethod = keyof typeof DELIVERY_FEES;

/** Mirrors the fee rule inside the place_order database function. */
export function deliveryFee(subtotal: number, method: DeliveryMethod): number {
  if (method === "express") return DELIVERY_FEES.express;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEES.standard;
}

export const EXTRA_DONATION_OPTIONS = [0, 500, 1000, 2500] as const;

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}`;
}
