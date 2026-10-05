"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";
import type { DeliveryMethod } from "@/lib/format";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

export async function subscribe(email: string): Promise<ActionResult> {
  const value = clean(email, 254).toLowerCase();
  if (!EMAIL_RE.test(value)) return { ok: false, error: "invalid_email" };
  const { error } = await db().from("newsletter_subscribers").upsert({ email: value }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return { ok: false, error: "server" };
  return { ok: true };
}

export async function sendContact(input: { name: string; email: string; topic: string; message: string }): Promise<ActionResult> {
  const name = clean(input.name, 120);
  const email = clean(input.email, 254).toLowerCase();
  const topic = clean(input.topic, 40);
  const message = clean(input.message, 5000);
  if (!name || !topic || !message) return { ok: false, error: "required" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalid_email" };
  const { error } = await db().from("contact_messages").insert({ name, email, topic, message });
  if (error) return { ok: false, error: "server" };
  return { ok: true };
}

export type PlaceOrderInput = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: "card" | "bank" | "cod";
  extraDonation: number;
  items: { productId: string; size: string; quantity: number }[];
};

export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  const fields = {
    email: clean(input.email, 254).toLowerCase(),
    phone: clean(input.phone, 30),
    firstName: clean(input.firstName, 80),
    lastName: clean(input.lastName, 80),
    address: clean(input.address, 300),
    city: clean(input.city, 80),
    postalCode: clean(input.postalCode, 12),
  };
  if (Object.values(fields).some((v) => !v)) return { ok: false, error: "required" };
  if (!EMAIL_RE.test(fields.email)) return { ok: false, error: "invalid_email" };
  if (!/^\+?[\d\s()-]{9,20}$/.test(fields.phone)) return { ok: false, error: "invalid_phone" };
  if (!["standard", "express"].includes(input.deliveryMethod)) return { ok: false, error: "required" };
  if (!["card", "bank", "cod"].includes(input.paymentMethod)) return { ok: false, error: "required" };

  const extra = Math.round(Number(input.extraDonation) || 0);
  const items = (Array.isArray(input.items) ? input.items : []).slice(0, 50).map((i) => ({
    product_id: String(i.productId),
    size: String(i.size),
    quantity: Math.round(Number(i.quantity)),
  }));

  const { data, error } = await db().rpc("place_order", {
    p_email: fields.email,
    p_phone: fields.phone,
    p_first_name: fields.firstName,
    p_last_name: fields.lastName,
    p_address: fields.address,
    p_city: fields.city,
    p_postal_code: fields.postalCode,
    p_delivery_method: input.deliveryMethod,
    p_payment_method: input.paymentMethod,
    p_extra_donation: extra,
    p_items: items,
  });

  if (error) {
    // Messages raised inside place_order are written for customers (stock, availability).
    const friendly = /bag is empty|no longer available|Only \d+ left|Invalid (size|quantity|donation)/.test(error.message);
    return { ok: false, error: friendly ? error.message : "server" };
  }
  const row = Array.isArray(data) ? data[0] : data;
  revalidatePath("/", "layout");
  return { ok: true, data: { orderId: row.order_id, orderNumber: row.order_number } };
}

export async function pledgeDonation(input: {
  amount: number;
  frequency: "one_time" | "monthly";
  email: string;
  name?: string;
}): Promise<ActionResult> {
  const amount = Math.round(Number(input.amount));
  if (!Number.isFinite(amount) || amount < 100 || amount > 10_000_000) return { ok: false, error: "min_amount" };
  const email = clean(input.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalid_email" };
  const frequency = input.frequency === "monthly" ? "monthly" : "one_time";
  const { error } = await db()
    .from("donations")
    .insert({ amount, frequency, email, name: clean(input.name, 120) || null, status: "pledged" });
  if (error) return { ok: false, error: "server" };
  return { ok: true };
}
