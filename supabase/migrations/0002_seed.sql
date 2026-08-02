-- =============================================================================
-- VELMONT — Seed data (safe to run once against a fresh database)
-- =============================================================================

insert into public.collections (slug, name, description, hero_image_url, is_featured, display_order) values
  ('the-atelier-edit', 'The Atelier Edit', 'Tailoring built on eighty-year-old patternmaking archives, remade for a quieter era.', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1600', true, 1),
  ('winter-outerwear', 'Winter Outerwear', 'Cashmere, wool, and shearling, cut for cold mornings and long journeys.', 'https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1600', true, 2),
  ('essentials', 'The Essentials', 'The pieces that never leave rotation.', 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1600', false, 3);

-- Products
with c1 as (select id from public.collections where slug = 'the-atelier-edit'),
     c2 as (select id from public.collections where slug = 'winter-outerwear'),
     c3 as (select id from public.collections where slug = 'essentials')
insert into public.products (sku, slug, name, description, care_instructions, material, price_cents, compare_at_price_cents, collection_id, category, is_new_arrival, is_best_seller, rating_average, rating_count)
values
  ('VLM-BLZ-001', 'unstructured-wool-blazer', 'Unstructured Wool Blazer', 'Cut from a mid-weight Italian wool in a soft, unlined construction, this blazer moves with you rather than against you. Half-canvas front, horn buttons, hand-finished lapel.', 'Dry clean only. Store on a wide-shouldered hanger.', '100% Italian Wool', 189000, 225000, (select id from c1), 'Tailoring', true, true, 4.8, 42),
  ('VLM-COT-002', 'camel-hair-overcoat', 'Camel Hair Overcoat', 'A single-breasted overcoat in pure camel hair, cut long and lean. The kind of coat that gets better with a decade of wear.', 'Dry clean only.', '100% Camel Hair', 298000, null, (select id from c2), 'Outerwear', true, true, 4.9, 31),
  ('VLM-KNT-003', 'cashmere-crewneck', 'Cashmere Crewneck', 'Two-ply Mongolian cashmere, fully fashioned for a clean seam line at the shoulder. Sits close without clinging.', 'Hand wash cold or dry clean. Lay flat to dry.', '100% Mongolian Cashmere', 68000, null, (select id from c3), 'Knitwear', false, true, 4.7, 88),
  ('VLM-SHT-004', 'oxford-dress-shirt', 'Oxford Dress Shirt', 'A slightly heavier oxford cloth than most, so it holds its shape through a long day. Mother-of-pearl buttons, single-needle tailoring.', 'Machine wash cold, hang dry.', '100% Egyptian Cotton', 32000, null, (select id from c3), 'Shirts', false, true, 4.6, 120),
  ('VLM-TRS-005', 'flannel-trouser', 'Flannel Trouser', 'A relaxed straight leg in brushed wool flannel. Sits at the natural waist with a clean, pleat-free front.', 'Dry clean only.', '100% Wool Flannel', 42000, 52000, (select id from c1), 'Trousers', true, false, 4.5, 27),
  ('VLM-KNT-006', 'shawl-collar-cardigan', 'Shawl Collar Cardigan', 'A generous shawl collar and horn toggle buttons on a heavyweight lambswool knit. Built for the coldest months.', 'Dry clean only.', '100% Lambswool', 58000, null, (select id from c2), 'Knitwear', true, false, 4.8, 19),
  ('VLM-ACC-007', 'italian-leather-belt', 'Italian Leather Belt', 'Full-grain leather from a family-run tannery outside Florence, finished with a solid brass buckle.', 'Wipe clean. Condition every six months.', 'Full-Grain Leather', 18500, null, (select id from c3), 'Accessories', false, true, 4.9, 64),
  ('VLM-COT-008', 'quilted-field-jacket', 'Quilted Field Jacket', 'A diamond-quilted field jacket in waxed cotton, lined in brushed wool tartan. Built for standing in a field, styled for standing anywhere.', 'Spot clean. Rewax as needed.', 'Waxed Cotton, Wool Lining', 74500, null, (select id from c2), 'Outerwear', false, false, 4.6, 15),
  ('VLM-SHT-009', 'merino-polo', 'Merino Wool Polo', 'A three-button polo in fine merino jersey — enough structure to layer under a blazer, soft enough to wear alone.', 'Hand wash cold, lay flat to dry.', '100% Merino Wool', 29500, null, (select id from c3), 'Knitwear', true, false, 4.4, 22),
  ('VLM-BLZ-010', 'double-breasted-suit', 'Double-Breasted Suit', 'A six-button double-breasted suit in a fine wool twill, cut with a slight drape through the chest for a soft, old-world silhouette.', 'Dry clean only.', '100% Super 130s Wool', 349000, 399000, (select id from c1), 'Tailoring', false, true, 5.0, 12),
  ('VLM-TRS-011', 'corduroy-trouser', 'Corduroy Trouser', 'An eight-wale corduroy in a heavyweight cotton blend, cut with a relaxed taper.', 'Machine wash cold, tumble dry low.', '98% Cotton, 2% Elastane', 38500, null, (select id from c3), 'Trousers', false, false, 4.3, 33),
  ('VLM-ACC-012', 'silk-knit-tie', 'Silk Knit Tie', 'A square-end knit tie in heavy silk, woven in a small mill in Como.', 'Dry clean only.', '100% Silk', 9800, null, (select id from c3), 'Accessories', false, false, 4.7, 41);

-- Images (2 per product: primary + hover)
insert into public.product_images (product_id, url, alt_text, display_order, is_hover_image)
select id, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-BLZ-001'
union all select id, 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200', name || ' — detail', 1, true from public.products where sku = 'VLM-BLZ-001'
union all select id, 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-COT-002'
union all select id, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1200', name || ' — detail', 1, true from public.products where sku = 'VLM-COT-002'
union all select id, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-KNT-003'
union all select id, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200', name || ' — detail', 1, true from public.products where sku = 'VLM-KNT-003'
union all select id, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-SHT-004'
union all select id, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200', name || ' — detail', 1, true from public.products where sku = 'VLM-SHT-004'
union all select id, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-TRS-005'
union all select id, 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-KNT-006'
union all select id, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-ACC-007'
union all select id, 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-COT-008'
union all select id, 'https://images.unsplash.com/photo-1622445275576-721325763afe?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-SHT-009'
union all select id, 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-BLZ-010'
union all select id, 'https://images.unsplash.com/photo-1602293589930-45821b6d33fc?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-TRS-011'
union all select id, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1200', name || ' — front view', 0, false from public.products where sku = 'VLM-ACC-012';

-- Variants (sizes S–XXL, two colorways) with stock
insert into public.product_variants (product_id, size, color, color_hex, sku_suffix, stock_quantity, low_stock_threshold)
select p.id, size, color, hex, sku_suf, (10 + (random() * 20)::int), 3
from public.products p
cross join (values ('S','SM'), ('M','MD'), ('L','LG'), ('XL','XL'), ('XXL','XX')) as sizes(size, sku_suf)
cross join (values ('Navy', '#22283A'), ('Charcoal', '#3B3A36')) as colors(color, hex);

-- One product intentionally low on stock, to demonstrate the "Almost Gone" state.
update public.product_variants set stock_quantity = 2
where product_id = (select id from public.products where sku = 'VLM-BLZ-010') and size = 'XXL';

update public.product_variants set stock_quantity = 0
where product_id = (select id from public.products where sku = 'VLM-COT-002') and size = 'S';

-- Coupons
insert into public.coupons (code, type, percentage, min_subtotal_cents, is_active, expires_at) values
  ('WELCOME10', 'percentage', 10, 0, true, now() + interval '1 year'),
  ('FREESHIP', 'free_shipping', null, 20000, true, now() + interval '1 year');
