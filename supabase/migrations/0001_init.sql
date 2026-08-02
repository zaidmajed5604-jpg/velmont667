-- =============================================================================
-- VELMONT — Initial schema
-- Run via: supabase db push  (or paste into the Supabase SQL editor)
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- fuzzy search on product titles

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
create type user_role as enum ('customer', 'staff', 'admin');
create type order_status as enum (
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);
create type coupon_type as enum ('percentage', 'fixed_amount', 'free_shipping');

-- -----------------------------------------------------------------------------
-- PROFILES (extends auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- ADDRESSES
-- -----------------------------------------------------------------------------
create table public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null,
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_idx on public.addresses(user_id);

-- -----------------------------------------------------------------------------
-- COLLECTIONS
-- -----------------------------------------------------------------------------
create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text,
  hero_image_url text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- PRODUCTS
-- -----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  sku text not null unique,
  slug text not null unique,
  name text not null,
  description text not null default '',
  care_instructions text,
  material text,
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  currency text not null default 'USD',
  collection_id uuid references public.collections(id) on delete set null,
  category text not null, -- e.g. 'Outerwear', 'Suits', 'Shirts', 'Knitwear', 'Accessories'
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  is_published boolean not null default true,
  rating_average numeric(2,1) not null default 0,
  rating_count integer not null default 0,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_collection_idx on public.products(collection_id);
create index products_category_idx on public.products(category);
create index products_published_idx on public.products(is_published);
create index products_search_idx on public.products using gin(search_vector);
create index products_name_trgm_idx on public.products using gin(name gin_trgm_ops);

create function public.products_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C');
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_search_vector_trigger
  before insert or update on public.products
  for each row execute procedure public.products_search_vector_update();

-- -----------------------------------------------------------------------------
-- PRODUCT IMAGES
-- -----------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text not null default '',
  display_order integer not null default 0,
  is_hover_image boolean not null default false
);

create index product_images_product_idx on public.product_images(product_id);

-- -----------------------------------------------------------------------------
-- PRODUCT VARIANTS (size / color combinations, each with its own stock)
-- -----------------------------------------------------------------------------
create table public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  color_hex text,
  sku_suffix text not null,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 3,
  created_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create index product_variants_product_idx on public.product_variants(product_id);

-- -----------------------------------------------------------------------------
-- REVIEWS
-- -----------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index reviews_product_idx on public.reviews(product_id);

-- Keep product rating aggregates in sync automatically.
create function public.update_product_rating()
returns trigger language plpgsql as $$
declare
  target_product uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set rating_average = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = target_product), 0),
      rating_count = (select count(*) from public.reviews r where r.product_id = target_product)
  where p.id = target_product;
  return null;
end;
$$;

create trigger reviews_rating_sync
  after insert or update or delete on public.reviews
  for each row execute procedure public.update_product_rating();

-- -----------------------------------------------------------------------------
-- WISHLIST
-- -----------------------------------------------------------------------------
create table public.wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- -----------------------------------------------------------------------------
-- CARTS (persisted server-side so it survives across devices)
-- -----------------------------------------------------------------------------
create table public.carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_id text, -- for guest carts, tied to a signed cookie
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_owner check (user_id is not null or session_id is not null)
);

create unique index carts_user_idx on public.carts(user_id) where user_id is not null;
create unique index carts_session_idx on public.carts(session_id) where session_id is not null;

create table public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index cart_items_cart_idx on public.cart_items(cart_id);

-- -----------------------------------------------------------------------------
-- COUPONS
-- -----------------------------------------------------------------------------
create table public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  type coupon_type not null,
  value_cents integer, -- for fixed_amount
  percentage integer check (percentage between 1 and 100), -- for percentage
  min_subtotal_cents integer not null default 0,
  max_redemptions integer,
  times_redeemed integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- ORDERS
-- -----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  status order_status not null default 'pending',
  email text not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  subtotal_cents integer not null,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  discount_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'USD',
  coupon_code text,
  stripe_payment_intent_id text,
  tracking_number text,
  tracking_carrier text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_number_idx on public.orders(order_number);

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  product_name text not null, -- snapshot at time of purchase
  size text not null,
  color text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0),
  image_url text
);

create index order_items_order_idx on public.order_items(order_id);

-- -----------------------------------------------------------------------------
-- NEWSLETTER
-- -----------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- -----------------------------------------------------------------------------
-- updated_at helper
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at before update on public.orders
  for each row execute procedure public.set_updated_at();
create trigger carts_set_updated_at before update on public.carts
  for each row execute procedure public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Helper: is the current user staff or admin?
create function public.is_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

-- PROFILES: users read/update their own; staff read all.
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or public.is_staff());
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- ADDRESSES: fully owned by the user.
create policy "addresses_owner_all" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- COLLECTIONS / PRODUCTS / IMAGES / VARIANTS: public read, staff write.
create policy "collections_public_read" on public.collections for select using (true);
create policy "collections_staff_write" on public.collections for all using (public.is_staff()) with check (public.is_staff());

create policy "products_public_read" on public.products for select using (is_published = true or public.is_staff());
create policy "products_staff_write" on public.products for all using (public.is_staff()) with check (public.is_staff());

create policy "product_images_public_read" on public.product_images for select using (true);
create policy "product_images_staff_write" on public.product_images for all using (public.is_staff()) with check (public.is_staff());

create policy "product_variants_public_read" on public.product_variants for select using (true);
create policy "product_variants_staff_write" on public.product_variants for all using (public.is_staff()) with check (public.is_staff());

-- REVIEWS: public read; owner can write their own; staff can moderate (delete).
create policy "reviews_public_read" on public.reviews for select using (true);
create policy "reviews_owner_insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_owner_update" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_owner_or_staff_delete" on public.reviews for delete using (auth.uid() = user_id or public.is_staff());

-- WISHLIST: fully owned.
create policy "wishlist_owner_all" on public.wishlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CARTS: owner (by user_id) can access; guest carts are accessed via the
-- service role from a server route after verifying the signed session cookie.
create policy "carts_owner_all" on public.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart_items_owner_all" on public.cart_items for all using (
  exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
);

-- COUPONS: not publicly readable (validated server-side only); staff manage.
create policy "coupons_staff_all" on public.coupons for all using (public.is_staff()) with check (public.is_staff());

-- ORDERS: owner reads their own; staff read/write all; inserts happen via
-- the service role during checkout (server-side only).
create policy "orders_owner_read" on public.orders for select using (auth.uid() = user_id or public.is_staff());
create policy "orders_staff_write" on public.orders for update using (public.is_staff());

create policy "order_items_owner_read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff()))
);

-- NEWSLETTER: anyone can insert (subscribe); only staff can read the list.
create policy "newsletter_public_insert" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter_staff_read" on public.newsletter_subscribers for select using (public.is_staff());

-- =============================================================================
-- STORAGE (product imagery)
-- =============================================================================
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

create policy "product_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_bucket_staff_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_staff());
