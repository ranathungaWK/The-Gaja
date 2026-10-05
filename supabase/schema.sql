-- GAJA store schema. Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  name_si       text,
  summary       text not null default 'Cotton tee  /  S to XXL',
  description   text not null default '',
  description_si text,
  story_title   text,
  story_body    text,
  colour_name   text not null,             -- e.g. "Black tee"
  colour_hex    text not null default '#10281b',
  category      text not null check (category in ('light','dark','green')),
  price         integer not null check (price >= 0),          -- LKR
  fund_amount   integer not null default 1000 check (fund_amount >= 0),
  sizes         text[] not null default array['S','M','L','XL','XXL'],
  stock         integer not null default 120 check (stock >= 0),
  run_size      integer not null default 120,
  drop_label    text not null default 'Drop 01',
  images        text[] not null default '{}',   -- storage paths in bucket "product-images"
  image_alts    text[] not null default '{}',
  sort_order    integer not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1042;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null default ('GJ-' || nextval('public.order_number_seq')),
  email            text not null,
  phone            text not null,
  first_name       text not null,
  last_name        text not null,
  address          text not null,
  city             text not null,
  postal_code      text not null,
  delivery_method  text not null check (delivery_method in ('standard','express')),
  payment_method   text not null check (payment_method in ('card','bank','cod')),
  subtotal         integer not null,
  delivery_fee     integer not null,
  extra_donation   integer not null default 0,
  total            integer not null,
  fund_contribution integer not null,
  status           text not null default 'pending'
                   check (status in ('pending','paid','printing','shipped','delivered','cancelled')),
  created_at       timestamptz not null default now()
);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  colour_name  text not null,
  size         text not null,
  quantity     integer not null check (quantity > 0),
  unit_price   integer not null,
  fund_amount  integer not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------------
-- Fund
-- ---------------------------------------------------------------------------
create table if not exists public.fund_settings (
  id             integer primary key default 1 check (id = 1),
  goal           integer not null default 500000,
  offline_raised integer not null default 0,   -- money raised outside the site
  offline_shirts integer not null default 0,
  drop_name      text not null default 'Drop 01',
  drop_ends_at   timestamptz not null default (now() + interval '30 days'),
  first_run      integer not null default 120
);

create table if not exists public.donations (
  id         uuid primary key default gen_random_uuid(),
  amount     integer not null check (amount > 0),
  frequency  text not null default 'one_time' check (frequency in ('one_time','monthly')),
  name       text,
  email      text,
  status     text not null default 'pledged' check (status in ('pledged','paid','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id          uuid primary key default gen_random_uuid(),
  amount      integer not null,
  title       text not null,
  description text not null,
  sort_order  integer not null default 0
);

create table if not exists public.receipts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  spent_on   date not null,
  amount     integer not null,
  file_path  text,          -- storage path in bucket "receipts"
  created_at timestamptz not null default now()
);

create table if not exists public.fund_updates (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  image_path   text,        -- storage path in bucket "site-media"
  published_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id         uuid primary key default gen_random_uuid(),
  caption    text not null,
  image_path text,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Inbound messages
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  email      text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  topic      text not null,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Live fund figures
-- ---------------------------------------------------------------------------
create or replace view public.fund_stats with (security_invoker = false) as
select
  s.goal,
  s.drop_name,
  s.drop_ends_at,
  s.first_run,
  ( s.offline_raised
    + coalesce((select sum(o.fund_contribution) from public.orders o where o.status <> 'cancelled'), 0)
    + coalesce((select sum(d.amount) from public.donations d where d.status = 'paid'), 0)
  )::integer as raised,
  ( s.offline_shirts
    + coalesce((select sum(i.quantity) from public.order_items i
                join public.orders o on o.id = i.order_id where o.status <> 'cancelled'), 0)
  )::integer as shirts_sold,
  (select count(*) from public.products p where p.active)::integer as designs,
  greatest(0, ceil(extract(epoch from (s.drop_ends_at - now())) / 86400))::integer as days_left
from public.fund_settings s
where s.id = 1;

-- ---------------------------------------------------------------------------
-- Place an order atomically: prices come from the products table, never the client.
-- items: [{ "product_id": uuid, "size": text, "quantity": int }]
-- ---------------------------------------------------------------------------
create or replace function public.place_order(
  p_email text, p_phone text, p_first_name text, p_last_name text,
  p_address text, p_city text, p_postal_code text,
  p_delivery_method text, p_payment_method text,
  p_extra_donation integer, p_items jsonb
) returns table(order_id uuid, order_number text)
language plpgsql security definer set search_path = public as $$
declare
  v_order   public.orders%rowtype;
  v_item    jsonb;
  v_product public.products%rowtype;
  v_qty     integer;
  v_size    text;
  v_sub     integer := 0;
  v_fund    integer := 0;
  v_fee     integer;
begin
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'Your bag is empty';
  end if;
  if p_extra_donation is null or p_extra_donation < 0 or p_extra_donation > 1000000 then
    raise exception 'Invalid donation amount';
  end if;

  insert into public.orders (email, phone, first_name, last_name, address, city, postal_code,
                             delivery_method, payment_method, subtotal, delivery_fee,
                             extra_donation, total, fund_contribution)
  values (p_email, p_phone, p_first_name, p_last_name, p_address, p_city, p_postal_code,
          p_delivery_method, p_payment_method, 0, 0, p_extra_donation, 0, 0)
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty  := (v_item->>'quantity')::integer;
    v_size := v_item->>'size';
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid and active for update;
    if not found then raise exception 'A product in your bag is no longer available'; end if;
    if v_qty is null or v_qty < 1 or v_qty > 20 then raise exception 'Invalid quantity'; end if;
    if not (v_size = any(v_product.sizes)) then raise exception 'Invalid size for %', v_product.name; end if;
    if v_product.stock < v_qty then raise exception 'Only % left of %', v_product.stock, v_product.name; end if;

    update public.products set stock = stock - v_qty where id = v_product.id;
    insert into public.order_items (order_id, product_id, product_name, colour_name, size,
                                    quantity, unit_price, fund_amount)
    values (v_order.id, v_product.id, v_product.name, v_product.colour_name, v_size,
            v_qty, v_product.price, v_product.fund_amount);
    v_sub  := v_sub + v_product.price * v_qty;
    v_fund := v_fund + v_product.fund_amount * v_qty;
  end loop;

  v_fee := case
    when p_delivery_method = 'express' then 900
    when v_sub >= 8000 then 0
    else 450 end;

  update public.orders set
    subtotal = v_sub,
    delivery_fee = v_fee,
    total = v_sub + v_fee + p_extra_donation,
    fund_contribution = v_fund + p_extra_donation
  where id = v_order.id;

  return query select v_order.id, v_order.order_number;
end $$;

revoke all on function public.place_order from public, anon, authenticated;
grant execute on function public.place_order to service_role;

-- ---------------------------------------------------------------------------
-- Row level security: the public site reads catalogue + fund data only.
-- Every write goes through the server with the secret key.
-- ---------------------------------------------------------------------------
alter table public.products               enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.fund_settings          enable row level security;
alter table public.donations              enable row level security;
alter table public.milestones             enable row level security;
alter table public.receipts               enable row level security;
alter table public.fund_updates           enable row level security;
alter table public.gallery_items          enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages       enable row level security;

do $$
declare t text;
begin
  foreach t in array array['products','fund_settings','milestones','receipts','fund_updates','gallery_items'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

grant select on public.fund_stats to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage buckets (public read, server-only write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true),
       ('site-media',     'site-media',     true),
       ('receipts',       'receipts',       true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Seed content (only when empty)
-- ---------------------------------------------------------------------------
insert into public.fund_settings (id, offline_raised, offline_shirts)
values (1, 184000, 184) on conflict (id) do nothing;

insert into public.products (slug, name, summary, description, story_title, story_body,
                             colour_name, colour_hex, category, price, sort_order, image_alts)
select * from (values
  ('the-line-tee', 'The Line Tee', 'Cotton tee  /  S to XXL',
   'A white tee with a single line through the middle. One side is the field, the other is the forest. The print sits where they meet.',
   'Drawing the line.',
   'The Line is about the edge where a village ends and the forest begins. Nobody chose it, but everyone lives with it.',
   'White tee', '#ffffff', 'light', 3200, 1,
   array['White tee flat-lay, soft daylight','Back view','Fabric close-up','Print detail']),
  ('night-watch-tee', 'Night Watch Tee', 'Cotton tee  /  S to XXL',
   'A black tee for the long hours between dusk and dawn. One side keeps watch over the harvest. The other keeps to the old path. The print holds both in the same frame.',
   'Keeping watch.',
   'Night Watch is about the hours when fields are quiet and everyone is listening. A lantern on one side, a shadow on the other, and a line that neither side drew.',
   'Black tee', '#10281b', 'dark', 3200, 2,
   array['Black tee flat-lay, soft daylight','Back view','Fabric close-up','Print detail']),
  ('hold-ground-tee', 'Hold Ground Tee', 'Cotton tee  /  S to XXL',
   'A forest green tee for everyone standing their ground. Farmers hold their fields; elephants hold their routes. The fund helps both hold on.',
   'Holding ground.',
   'Hold Ground is about staying where you belong without having to fight for it. A fence that guides, a light that warns, and a harvest that survives.',
   'Forest green tee', '#1d4b34', 'green', 3200, 3,
   array['Forest green tee flat-lay, soft daylight','Back view','Fabric close-up','Print detail'])
) v
where not exists (select 1 from public.products);

insert into public.milestones (amount, title, description, sort_order)
select * from (values
  (100000, 'Solar fence kit', 'First fence for one village edge.', 1),
  (250000, 'Warning lights',  'Early alerts for a farming community.', 2),
  (400000, 'Harvest support', 'Help for families after crop loss.', 3),
  (500000, 'Second village',  'Take the work to a new area.', 4)
) v where not exists (select 1 from public.milestones);

insert into public.receipts (title, spent_on, amount)
select * from (values
  ('Solar fence kit, supplier invoice', date '2026-09-12', 98400),
  ('Warning light units',               date '2026-09-28', 62000),
  ('Install labour and posts',          date '2026-10-03', 24500)
) v where not exists (select 1 from public.receipts);

insert into public.fund_updates (title, body)
select 'The first fence is up.',
       'Posts are in, panels are charging and the village has its first warning light. Photos and the full receipt are above.'
where not exists (select 1 from public.fund_updates);

insert into public.gallery_items (caption, sort_order)
select * from (values
  ('A solar fence at dusk.', 1),
  ('A warning light on a post.', 2),
  ('A family at a fenced field.', 3),
  ('A harvest saved.', 4)
) v where not exists (select 1 from public.gallery_items);
