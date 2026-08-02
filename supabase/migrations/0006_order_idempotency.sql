-- =============================================================================
-- VELMONT — Idempotent order creation
--
-- Once real payments are involved, both the Stripe webhook AND a client-side
-- fallback call (for local dev, where webhooks can't reach localhost) may
-- try to turn the same successful payment into an order. Rather than rely
-- on "only one of them runs," make create_order safe to call twice for the
-- same PaymentIntent: the second call just returns the existing order.
-- =============================================================================

-- A payment intent should never be attached to more than one order.
create unique index orders_stripe_payment_intent_idx
  on public.orders(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create or replace function public.create_order(
  p_order_number text,
  p_user_id uuid,
  p_email text,
  p_shipping_address jsonb,
  p_billing_address jsonb,
  p_lines order_line_input[],
  p_shipping_cents integer,
  p_tax_cents integer,
  p_discount_cents integer,
  p_coupon_code text,
  p_stripe_payment_intent_id text
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal_cents integer := 0;
  v_line order_line_input;
  v_variant record;
  v_product record;
  v_image_url text;
begin
  -- Idempotency: if an order already exists for this PaymentIntent, this is
  -- a duplicate call (webhook + client fallback both fired) — return the
  -- existing order instead of double-charging inventory.
  if p_stripe_payment_intent_id is not null then
    select id into v_order_id from public.orders
      where stripe_payment_intent_id = p_stripe_payment_intent_id;
    if found then
      return v_order_id;
    end if;
  end if;

  if array_length(p_lines, 1) is null then
    raise exception 'Cannot create an order with no line items.';
  end if;

  foreach v_line in array p_lines loop
    select * into v_variant from public.product_variants
      where id = v_line.variant_id for update;

    if not found then
      raise exception 'Variant % does not exist.', v_line.variant_id;
    end if;

    if v_variant.stock_quantity < v_line.quantity then
      raise exception 'Insufficient stock for variant % (requested %, available %).',
        v_line.variant_id, v_line.quantity, v_variant.stock_quantity;
    end if;
  end loop;

  foreach v_line in array p_lines loop
    select * into v_variant from public.product_variants where id = v_line.variant_id;
    select * into v_product from public.products where id = v_variant.product_id;

    update public.product_variants
      set stock_quantity = stock_quantity - v_line.quantity
      where id = v_line.variant_id;

    v_subtotal_cents := v_subtotal_cents + (v_product.price_cents * v_line.quantity);
  end loop;

  insert into public.orders (
    order_number, user_id, email, shipping_address, billing_address,
    subtotal_cents, shipping_cents, tax_cents, discount_cents, total_cents,
    coupon_code, stripe_payment_intent_id, status
  ) values (
    p_order_number, p_user_id, p_email, p_shipping_address, p_billing_address,
    v_subtotal_cents, p_shipping_cents, p_tax_cents, p_discount_cents,
    v_subtotal_cents + p_shipping_cents + p_tax_cents - p_discount_cents,
    p_coupon_code, p_stripe_payment_intent_id,
    case when p_stripe_payment_intent_id is not null then 'paid' else 'pending' end
  )
  returning id into v_order_id;

  foreach v_line in array p_lines loop
    select * into v_variant from public.product_variants where id = v_line.variant_id;
    select * into v_product from public.products where id = v_variant.product_id;
    select url into v_image_url from public.product_images
      where product_id = v_product.id order by display_order limit 1;

    insert into public.order_items (
      order_id, product_id, variant_id, product_name, size, color,
      unit_price_cents, quantity, image_url
    ) values (
      v_order_id, v_product.id, v_variant.id, v_product.name, v_variant.size, v_variant.color,
      v_product.price_cents, v_line.quantity, v_image_url
    );
  end loop;

  if p_coupon_code is not null then
    update public.coupons set times_redeemed = times_redeemed + 1 where code = p_coupon_code;
  end if;

  return v_order_id;
exception
  -- Belt-and-suspenders: if a race let two calls both pass the idempotency
  -- check above, the unique index will reject the second insert — catch
  -- that and return the row the other call created instead of erroring.
  when unique_violation then
    select id into v_order_id from public.orders
      where stripe_payment_intent_id = p_stripe_payment_intent_id;
    return v_order_id;
end;
$$;

revoke execute on function public.create_order from public, anon, authenticated;
grant execute on function public.create_order to service_role;
