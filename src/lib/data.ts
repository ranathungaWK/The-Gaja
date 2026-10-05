import "server-only";
import { db, publicUrl } from "./supabase";

export type Category = "light" | "dark" | "green";

export type Product = {
  id: string;
  slug: string;
  name: string;
  name_si: string | null;
  summary: string;
  description: string;
  description_si: string | null;
  story_title: string | null;
  story_body: string | null;
  colour_name: string;
  colour_hex: string;
  category: Category;
  price: number;
  fund_amount: number;
  sizes: string[];
  stock: number;
  run_size: number;
  drop_label: string;
  images: string[];
  image_alts: string[];
  sort_order: number;
  active: boolean;
  /** Resolved public URLs for `images`. */
  imageUrls: string[];
};

export type FundStats = {
  goal: number;
  drop_name: string;
  drop_ends_at: string;
  first_run: number;
  raised: number;
  shirts_sold: number;
  designs: number;
  days_left: number;
};

export type Milestone = { id: string; amount: number; title: string; description: string };
export type Receipt = { id: string; title: string; spent_on: string; amount: number; fileUrl: string | null };
export type FundUpdate = { id: string; title: string; body: string; imageUrl: string | null; published_at: string };
export type GalleryItem = { id: string; caption: string; imageUrl: string | null };

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  colour_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  fund_amount: number;
};

export type Order = {
  id: string;
  order_number: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  delivery_method: "standard" | "express";
  payment_method: "card" | "bank" | "cod";
  subtotal: number;
  delivery_fee: number;
  extra_donation: number;
  total: number;
  fund_contribution: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

function withImages(p: Omit<Product, "imageUrls">): Product {
  return { ...p, imageUrls: p.images.map((path) => publicUrl("product-images", path)!).filter(Boolean) };
}

export type ShopSort = "featured" | "price-asc" | "price-desc" | "name";

export async function getProducts(opts: { category?: Category; sort?: ShopSort; includeInactive?: boolean } = {}) {
  let q = db().from("products").select("*");
  if (!opts.includeInactive) q = q.eq("active", true);
  if (opts.category) q = q.eq("category", opts.category);
  switch (opts.sort) {
    case "price-asc":
      q = q.order("price", { ascending: true }).order("sort_order");
      break;
    case "price-desc":
      q = q.order("price", { ascending: false }).order("sort_order");
      break;
    case "name":
      q = q.order("name");
      break;
    default:
      q = q.order("sort_order");
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(withImages);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await db().from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  if (error) throw error;
  return data ? withImages(data) : null;
}

export async function getFundStats(): Promise<FundStats> {
  const { data, error } = await db().from("fund_stats").select("*").single();
  if (error) throw error;
  return data as FundStats;
}

export async function getMilestones(): Promise<Milestone[]> {
  const { data, error } = await db().from("milestones").select("id, amount, title, description").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getReceipts(limit = 6): Promise<Receipt[]> {
  const { data, error } = await db()
    .from("receipts")
    .select("id, title, spent_on, amount, file_path")
    .order("spent_on", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, fileUrl: publicUrl("receipts", r.file_path) }));
}

export async function getLatestUpdate(): Promise<FundUpdate | null> {
  const { data, error } = await db()
    .from("fund_updates")
    .select("id, title, body, image_path, published_at")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? { ...data, imageUrl: publicUrl("site-media", data.image_path) } : null;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const { data, error } = await db().from("gallery_items").select("id, caption, image_path").order("sort_order").limit(4);
  if (error) throw error;
  return (data ?? []).map((g) => ({ id: g.id, caption: g.caption, imageUrl: publicUrl("site-media", g.image_path) }));
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}
