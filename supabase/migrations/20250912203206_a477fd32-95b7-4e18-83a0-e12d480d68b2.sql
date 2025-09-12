-- Fix incorrect product prices that were multiplied by 100 too many times
UPDATE products 
SET 
  price_cents = price_cents / 100,
  compare_at_price_cents = compare_at_price_cents / 100 
WHERE price_cents > 10000;