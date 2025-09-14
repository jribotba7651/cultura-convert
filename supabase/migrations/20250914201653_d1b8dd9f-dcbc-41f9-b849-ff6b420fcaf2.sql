-- Deactivate the Latino Voter product that should no longer be visible
UPDATE products 
SET is_active = false 
WHERE id = '8e020081-74d7-4efc-9a0c-a106c6933ec4' 
AND title->>'en' = 'Latino Voter - Unisex Heavy Cotton Tee';