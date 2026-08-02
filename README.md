# VELMONT

A premium, quiet-luxury menswear e-commerce platform built with Next.js 15,
TypeScript, Tailwind CSS, and Supabase.

## Stack

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS, custom design tokens (ivory / beige / brown palette)
- **Fonts:** Cormorant Garamond (display) + Inter (sans)
- **Animation:** Framer Motion
- **Database / Auth / Storage:** Supabase (Postgres + Row Level Security)
- **State:** Zustand (cart, wishlist, recently viewed)
- **Forms & Validation:** React Hook Form + Zod
- **Charts:** Recharts (admin analytics)
- **Deployment:** Vercel-ready; Cloudflare-compatible (standard Next.js output)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migrations in order:
   - `supabase/migrations/0001_init.sql` — schema, RLS policies, triggers
   - `supabase/migrations/0002_seed.sql` — demo products/collections (optional)
   - `supabase/migrations/0003_checkout_function.sql` — atomic order creation
   - `supabase/migrations/0004_contact_submissions.sql` — contact form table
   - `supabase/migrations/0005_pending_checkouts.sql` — holds checkout data between payment and order creation
   - `supabase/migrations/0006_order_idempotency.sql` — makes order creation safe to call twice for the same payment
3. Promote your own account to admin so you can access `/admin`:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` from your Supabase project settings.

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## What's wired up vs. what needs a key

| Feature | Status |
|---|---|
| Product catalog, search, filtering, collections | Fully functional against Supabase |
| Cart, wishlist, recently viewed | Fully functional (client-persisted + synced for signed-in users) |
| Auth (login/register/account) | Fully functional via Supabase Auth |
| Order creation, inventory decrement | Fully functional, atomic and idempotent (see `create_order` SQL function) |
| Admin dashboard (products/orders/customers/coupons/inventory/analytics) | Fully functional, RLS-protected |
| **Payment collection (Stripe)** | **Fully functional** — real PaymentIntents, Stripe Elements card form, webhook-driven order confirmation with a local-dev fallback. See "Setting up Stripe" below. |
| Transactional email (order confirmation, contact form) | **Stub** — Resend integration point is commented in `src/app/api/contact/route.ts`; add `RESEND_API_KEY` to activate. |
| Tax calculation | Flat $0 placeholder — swap in Stripe Tax / TaxJar / Avalara before launch. |
| Rate limiting | In-memory fallback in `middleware.ts` (fine for a single instance); swap in the Upstash-backed limiter in `src/lib/utils/rate-limit.ts` for multi-instance production by setting `UPSTASH_REDIS_REST_URL`/`TOKEN`. |

## Setting Up Stripe

Checkout is a real, working Stripe integration — not a stub. Here's how the pieces fit together and how to turn it on.

### How it works

1. **`POST /api/checkout/create-intent`** — re-prices the cart server-side, validates any coupon, creates a Stripe PaymentIntent for the exact total, and stashes the full checkout payload (shipping address, cart lines) in the `pending_checkouts` table, keyed by the PaymentIntent id. Stripe's metadata field is too small to hold a full cart, which is why this table exists.
2. The checkout page renders Stripe's **PaymentElement** and calls `stripe.confirmPayment()`.
3. Once Stripe confirms the charge, **either** of two paths turns it into a real order (both call the same idempotent `create_order` Postgres function, so it's safe if both fire):
   - **`POST /api/webhooks/stripe`** — the production path. Stripe calls this directly once your site is deployed and the webhook is registered in the Stripe Dashboard.
   - **`POST /api/checkout/finalize`** — a client-side fallback called immediately after payment confirms in the browser. This exists because Stripe can't reach `localhost` with a webhook, so without it, local checkout would appear to hang even though the payment succeeded.

### Local development

1. Get your **test mode** keys from the [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys) and add them to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
2. (Optional but recommended) Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   This prints a `whsec_...` value — put it in `.env.local` as `STRIPE_WEBHOOK_SECRET`. Leave this command running alongside `npm run dev`.
3. Even without step 2, checkout will still complete locally via the `/api/checkout/finalize` fallback — the CLI just lets you exercise the real production path (the webhook) too.
4. Test with Stripe's test card `4242 4242 4242 4242`, any future expiry date, any 3-digit CVC, any postal code.

### Going live

1. Deploy the site (see Deployment below) so you have a public URL.
2. In the Stripe Dashboard, switch to **Live mode**, go to Developers → Webhooks → Add endpoint, and point it at `https://yourdomain.com/api/webhooks/stripe`, listening for `payment_intent.succeeded` (and `payment_intent.payment_failed` if you want failure logging).
3. Copy the live webhook's signing secret into your production environment variables as `STRIPE_WEBHOOK_SECRET`, and swap in your live `sk_live_...` / `pk_live_...` keys.

## Project Structure

```
src/
  app/                # Routes (App Router)
    admin/             # Admin dashboard (staff/admin only, enforced by middleware + RLS)
    api/               # Route handlers
    (storefront pages) # /, /shop, /product/[slug], /cart, /checkout, /account, etc.
  components/
    layout/            # Header, footer, mobile menu, search overlay
    home/               # Homepage sections
    product/            # Product card, gallery, reviews, add-to-cart
    account/, admin/, legal/, cart/, ui/
  lib/
    data/               # Server-side Supabase queries (Server Components only)
    supabase/           # Browser / server / admin Supabase clients + types
    validations/        # Zod schemas
    utils/               # Formatting, rate limiting, cn()
  store/                # Zustand client state
  middleware.ts          # Auth session refresh, route guards, rate limiting
supabase/
  migrations/            # SQL schema, RLS policies, seed data
```

## Design System

Colors, type scale, spacing, and animation timing all live in
`tailwind.config.ts`. The palette is deliberately restrained — no saturated
accent color — so hierarchy comes from type, weight, and space rather than
color, per the "quiet luxury" brief.

## Deployment

**Vercel:** connect the repo, set the environment variables from
`.env.example`, and deploy — no additional configuration needed.

**Cloudflare:** this is a standard Next.js app (no Vercel-specific APIs used
beyond `next/image` remote patterns), so it deploys via
`@cloudflare/next-on-pages` or Cloudflare's native Next.js support with the
same environment variables.

## Performance & Accessibility

- Server Components by default; client components only where interactivity
  requires it (cart, forms, modals).
- `next/image` throughout with explicit `sizes`, AVIF/WebP, and long cache TTL.
- Homepage and collection data revalidate hourly (`export const revalidate`)
  rather than fetching on every request.
- WCAG AA: visible focus rings (never suppressed), focus traps on all
  modals/drawers, `aria-label`s on icon-only buttons, semantic landmarks,
  skip-to-content link, `prefers-reduced-motion` respected globally.
