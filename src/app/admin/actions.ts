"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/admin";
import { db, type Bucket } from "@/lib/supabase";

const ORDER_STATUSES = ["pending", "paid", "printing", "shipped", "delivered", "cancelled"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_UPLOAD = 8 * 1024 * 1024;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => {
  const n = Math.round(Number(str(f, k).replace(/[^\d.-]/g, "")));
  return Number.isFinite(n) ? n : 0;
};

async function upload(bucket: Bucket, folder: string, file: File, allowPdf = false): Promise<string> {
  const allowed = allowPdf ? [...IMAGE_TYPES, "application/pdf"] : IMAGE_TYPES;
  if (!allowed.includes(file.type)) throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  if (file.size > MAX_UPLOAD) throw new Error("File is larger than 8 MB");
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "upload";
  const path = `${folder}/${Date.now()}-${safe}`;
  const { error } = await db().storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

function files(f: FormData, key: string) {
  return f.getAll(key).filter((v): v is File => v instanceof File && v.size > 0);
}

/* ---------------------------------------------------------------- auth --- */

export async function login(_: unknown, form: FormData) {
  if (!checkPassword(str(form, "password"))) return { error: "Wrong password." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* -------------------------------------------------------------- orders --- */

export async function updateOrderStatus(form: FormData) {
  await requireAdmin();
  const status = str(form, "status");
  if (!ORDER_STATUSES.includes(status)) return;
  const { error } = await db().from("orders").update({ status }).eq("id", str(form, "id"));
  if (error) throw error;
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------ products --- */

export async function saveProduct(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const { data: product, error: readError } = await db().from("products").select("slug, images, image_alts").eq("id", id).single();
  if (readError) throw readError;

  const uploads = files(form, "images");
  const newPaths: string[] = [];
  for (const file of uploads) newPaths.push(await upload("product-images", product.slug, file));

  const sizes = str(form, "sizes")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const { error } = await db()
    .from("products")
    .update({
      name: str(form, "name"),
      name_si: str(form, "name_si") || null,
      summary: str(form, "summary"),
      description: str(form, "description"),
      description_si: str(form, "description_si") || null,
      story_title: str(form, "story_title") || null,
      story_body: str(form, "story_body") || null,
      colour_name: str(form, "colour_name"),
      colour_hex: str(form, "colour_hex") || "#10281b",
      price: int(form, "price"),
      fund_amount: int(form, "fund_amount"),
      stock: Math.max(0, int(form, "stock")),
      sizes: sizes.length ? sizes : ["S", "M", "L", "XL", "XXL"],
      sort_order: int(form, "sort_order"),
      active: form.get("active") === "on",
      images: [...product.images, ...newPaths],
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function removeProductImage(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const path = str(form, "path");
  const { data: product, error } = await db().from("products").select("images").eq("id", id).single();
  if (error) throw error;
  // Images under /public ship with the site, so only uploaded ones live in storage.
  if (!path.startsWith("/")) await db().storage.from("product-images").remove([path]);
  await db()
    .from("products")
    .update({ images: product.images.filter((p: string) => p !== path) })
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function moveProductImage(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const path = str(form, "path");
  const { data: product, error } = await db().from("products").select("images").eq("id", id).single();
  if (error) throw error;
  const images: string[] = [path, ...product.images.filter((p: string) => p !== path)];
  await db().from("products").update({ images }).eq("id", id);
  revalidatePath("/", "layout");
}

export async function createProduct(form: FormData) {
  await requireAdmin();
  const name = str(form, "name");
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!name || !slug) return;
  const category = ["light", "dark", "green"].includes(str(form, "category")) ? str(form, "category") : "light";
  const { error } = await db()
    .from("products")
    .insert({ name, slug, category, colour_name: str(form, "colour_name") || "Tee", price: int(form, "price") || 3200, active: false, sort_order: 99 });
  if (error) throw error;
  revalidatePath("/", "layout");
}

/* ---------------------------------------------------------------- fund --- */

export async function saveFundSettings(form: FormData) {
  await requireAdmin();
  const ends = str(form, "drop_ends_at");
  const { error } = await db()
    .from("fund_settings")
    .update({
      goal: int(form, "goal"),
      offline_raised: int(form, "offline_raised"),
      offline_shirts: int(form, "offline_shirts"),
      drop_name: str(form, "drop_name") || "Drop 01",
      first_run: int(form, "first_run"),
      ...(ends ? { drop_ends_at: new Date(`${ends}T23:59:59+05:30`).toISOString() } : {}),
    })
    .eq("id", 1);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function addMilestone(form: FormData) {
  await requireAdmin();
  const { error } = await db()
    .from("milestones")
    .insert({ amount: int(form, "amount"), title: str(form, "title"), description: str(form, "description"), sort_order: int(form, "amount") });
  if (error) throw error;
  revalidatePath("/fund");
}

export async function deleteRow(form: FormData) {
  await requireAdmin();
  const table = str(form, "table");
  if (!["milestones", "receipts", "fund_updates", "gallery_items", "contact_messages"].includes(table)) return;
  const { error } = await db().from(table).delete().eq("id", str(form, "id"));
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function addReceipt(form: FormData) {
  await requireAdmin();
  const [file] = files(form, "file");
  const file_path = file ? await upload("receipts", new Date().getFullYear().toString(), file, true) : null;
  const { error } = await db()
    .from("receipts")
    .insert({ title: str(form, "title"), spent_on: str(form, "spent_on"), amount: int(form, "amount"), file_path });
  if (error) throw error;
  revalidatePath("/fund");
}

export async function addUpdate(form: FormData) {
  await requireAdmin();
  const [file] = files(form, "image");
  const image_path = file ? await upload("site-media", "updates", file) : null;
  const { error } = await db().from("fund_updates").insert({ title: str(form, "title"), body: str(form, "body"), image_path });
  if (error) throw error;
  revalidatePath("/fund");
}

export async function saveGalleryItem(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const [file] = files(form, "image");
  const image_path = file ? await upload("site-media", "gallery", file) : undefined;
  const row = { caption: str(form, "caption"), ...(image_path ? { image_path } : {}) };
  const { error } = id
    ? await db().from("gallery_items").update(row).eq("id", id)
    : await db().from("gallery_items").insert({ ...row, sort_order: int(form, "sort_order") });
  if (error) throw error;
  revalidatePath("/fund");
}

export async function setDonationStatus(form: FormData) {
  await requireAdmin();
  const status = str(form, "status");
  if (!["pledged", "paid", "cancelled"].includes(status)) return;
  const { error } = await db().from("donations").update({ status }).eq("id", str(form, "id"));
  if (error) throw error;
  revalidatePath("/", "layout");
}

/* --------------------------------------------------------------- inbox --- */

export async function toggleHandled(form: FormData) {
  await requireAdmin();
  const { error } = await db()
    .from("contact_messages")
    .update({ handled: form.get("handled") === "true" })
    .eq("id", str(form, "id"));
  if (error) throw error;
  revalidatePath("/admin/inbox");
}
