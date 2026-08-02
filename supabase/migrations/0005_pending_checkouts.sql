-- =============================================================================
-- VELMONT — Pending checkouts
--
-- Stripe's PaymentIntent metadata has a 500-character-per-key limit, which
-- isn't enough to hold a full cart + shipping address. Instead, we create
-- the PaymentIntent first, stash the checkout payload here keyed by its id,
-- and turn it into a real order once payment succeeds (via webhook, with a
-- client-side fallback for local dev — see /api/checkout/finalize).
-- =============================================================================

create table public.pending_checkouts (
  id uuid primary key default uuid_generate_v4(),
  stripe_payment_intent_id text not null unique,
  email text not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  lines jsonb not null, -- [{ variantId, quantity }]
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  discount_cents integer not null default 0,
  coupon_code text,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index pending_checkouts_intent_idx on public.pending_checkouts(stripe_payment_intent_id);

alter table public.pending_checkouts enable row level security;

-- Written and read exclusively by the service role (checkout + webhook
-- routes), never directly by client code — no public policies needed.
