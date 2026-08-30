# Sincronizar productos nuevos de Printify

## Diagnóstico
- La tabla `products` no tiene productos creados después del 2026-05-30.
- Los productos de la tienda llegan a Supabase mediante el edge function `sync-printify-products`; agregar productos en Printify no los sincroniza automáticamente.

## Plan
1. Ejecutar el edge function `sync-printify-products` (con las credenciales PRINTIFY_API_KEY / PRINTIFY_SHOP_ID ya configuradas).
2. Verificar con una consulta SQL que los productos nuevos aparecen en `public.products` con `is_active = true`, título, imágenes y precios correctos.
3. Confirmar que se ven en `/store` (la vista `products_public`).
4. Si algún producto nuevo no aparece, revisar los logs del edge function para detectar errores de la API de Printify.

## Notas técnicas
- No se cambia código ni esquema; solo se dispara la sincronización existente.
- Si la sincronización trae productos incompletos (sin imagen/precio), se reportará antes de tocar nada.
