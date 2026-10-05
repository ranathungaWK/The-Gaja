# GAJA — Two sides. One land.

Online store for GAJA, an independent T-shirt brand from Sri Lanka. LKR 1,000 from every shirt goes to a fund for elephant-safe fences, early-warning lights and harvest support. Built from the Figma design with Next.js 16 (App Router), Supabase (Postgres + Storage) and a PWA layer, so one responsive build serves desktop and mobile.

## What's in it

| Route | What it does |
| --- | --- |
| `/` | Home: hero with live fund total, the two sides, shirts, fund band, money steps, creator, newsletter signup |
| `/shop` | Product grid with colour filters (`?c=light\|dark\|green`) and sorting (`?sort=price-asc\|price-desc\|name`) |
| `/shop/[slug]` | Product page: gallery, colour swatches, sizes, quantity, add to bag, accordions, size guide, related shirts |
| `/bag` | Bag held in `localStorage`: quantities, remove, free-delivery progress, optional extra gift to the fund |
| `/checkout` | Contact, address, delivery method, payment method; places the order server-side |
| `/order/[id]` | Confirmation with order details, payment instructions and the order's fund impact |
| `/cause`, `/fund`, `/story` | Cause story; live fund progress, milestones, receipts, updates, gallery, direct-gift form |
| `/contact` | Contact form and FAQ |
| `/admin` | Password-protected admin: orders, products and photos, fund content, donations, inbox |

Also included:

- **Light and dark themes.** The theme follows the system setting until the visitor picks one, then remembers it.
- **English and Sinhala.** All interface copy is translated, in `src/lib/i18n/dictionaries.ts`.
- **PWA.** It's installable, with a manifest and icons. The service worker in `public/sw.js` caches visited pages and assets and falls back to `/offline` when there's no connection.

## Setup

```bash
npm install
npm run db:setup   # creates tables, policies, storage buckets and seed content (safe to re-run)
npm run dev        # http://localhost:3000
```

`.env.local` (not committed) holds:

| Variable | Used for |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SECRET_KEY` | Server-only key; every database and storage call runs on the server |
| `SUPABASE_PUBLISHABLE_KEY` | Not needed by the app today (no browser-side Supabase calls) |
| `DATABASE_URL` | Session pooler connection string, only used by `npm run db:setup` |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `ADMIN_SESSION_SECRET` | Signs the admin session cookie |
| `SITE_URL` | (optional) Public URL, used for metadata, e.g. `https://gaja.lk` |

The direct database host (`db.<ref>.supabase.co`) is IPv6-only, so `DATABASE_URL` uses the IPv4 session pooler (`aws-0-ap-southeast-2.pooler.supabase.com`).

## Data model (`supabase/schema.sql`)

- `products`: catalogue, price, fund share, sizes, stock, photo paths in the `product-images` bucket.
- `orders` and `order_items`: created by the `place_order()` function. It reads prices from `products`, so the browser cannot change prices. It checks stock and sizes, decrements stock and computes delivery (LKR 450, free from LKR 8,000; express LKR 900) and the fund contribution, all in one transaction.
- `fund_settings` and the `fund_stats` view. Raised = offline amount + fund share of every non-cancelled order + donations marked paid.
- `donations`, `milestones`, `receipts`, `fund_updates`, `gallery_items`, `newsletter_subscribers`, `contact_messages`.
- Row level security is on everywhere. Anonymous users can only read catalogue and fund tables; all writes go through Server Actions with the secret key.
- Storage buckets: `product-images`, `site-media`, `receipts`. All are public-read and upload only from the admin.

## Running the shop

1. Sign in at `/admin` with `ADMIN_PASSWORD`.
2. **Products**: upload photos (the first one is the main image), set prices, stock and sizes, or add a new design.
3. **Orders**: move each order through pending → paid → printing → shipped → delivered. Cancelled orders stop counting towards the fund.
4. **Fund**: set the goal and drop end date, add receipts (photo or PDF), post updates, fill the gallery, and mark direct gifts as paid when the money arrives.
5. **Inbox**: contact messages and newsletter subscribers.

## Payments: still needs a gateway

Bank transfer and cash on delivery work as they are. **Card** orders are recorded with the note that a payment link will be emailed, but no card processor is connected yet. Direct gifts are also recorded as pledges. To take cards online, connect a gateway such as PayHere (Sri Lanka) or Stripe and mark orders and donations paid from its webhook. Order confirmation and receipt emails are not sent automatically yet either; Resend or Supabase's SMTP would cover that.

## Deploying

Any Node host works, Vercel being the simplest. Set the variables above in the host, run `npm run build`, then `npm start`. The service worker only registers in production builds.
