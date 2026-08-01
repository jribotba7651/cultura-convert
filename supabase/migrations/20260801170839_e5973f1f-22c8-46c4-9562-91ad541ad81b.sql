UPDATE public.orders
SET status = 'cancelled',
    notes = COALESCE(notes || ' | ', '') || 'Test order - no charge - cancelled during Phase 3 attribution verification',
    updated_at = now()
WHERE id::text LIKE 'de3b2fd4%'
   OR id::text LIKE '31b9be19%'
   OR id = '487044e8-5778-485d-bd7e-82cbb84e71c5';