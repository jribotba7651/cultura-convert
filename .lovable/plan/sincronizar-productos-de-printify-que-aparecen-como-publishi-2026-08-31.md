# Sincronizar productos de Printify que aparecen como "Publishing"

## Qué está pasando

El estado **"Publishing"** en Printify no bloquea la sincronización. Revisé la función `sync-printify-products`: pide **todos** los productos del shop (`/v1/shops/{shop}/products.json`) y no filtra por estado de publicación. Los 6 productos que ya están en la tienda también aparecen como "Publishing" en Printify, y funcionan bien.

"Publishing" se queda pegado porque el shop de Printify está conectado por API: Printify espera que la tienda le confirme que el producto ya fue publicado. Nunca llega esa confirmación, así que el estado se queda en "Publishing" para siempre. Es cosmético en Printify, no afecta tu tienda.

Lo único que falta es correr la sincronización.

## Qué haría

1. **Confirmación de publicación automática (quita el "Publishing")**
   Al sincronizar cada producto, avisarle a Printify que ya está publicado usando los endpoints `publishing_succeeded` (y `publishing_failed` si el producto se salta). Con esto los productos pasan de "Publishing" a publicado en Printify.

2. **Mejor visibilidad en `/admin/inventory`**
   Después de sincronizar, mostrar en pantalla: cuántos productos trajo, cuántos se saltaron y por qué (por ejemplo, sin variantes disponibles), y la lista de títulos nuevos. Hoy solo sale un toast con el número.

3. **Verificación**
   Reviso los logs de la función y la tabla de productos para confirmar que los nuevos (Jíbaro en la Luna T‑Shirts, Moon Cowboy Tee, Every Journey Tee, Identity is Encrypted Tee, Proud Tee, stickers, velas, café) quedaron activos y visibles en `/store`.

Nota: el llavero **Rectangle Photo Keyring** está *Unpublished* en Printify. Igual se sincroniza porque la función no filtra por estado; si no lo quieres en la tienda, dímelo y lo excluyo.

## Detalles técnicos

- `supabase/functions/sync-printify-products/index.ts`: agregar llamadas `POST /v1/shops/{shop_id}/products/{product_id}/publishing_succeeded.json` tras cada upsert exitoso, y acumular un arreglo `skipped` con motivo.
- La respuesta de la función devuelve `{ success, message, syncedCount, deactivatedCount, skipped[] }`.
- `src/pages/AdminInventory.tsx`: renderizar el resumen del sync en un panel colapsable bajo el botón, sin tocar la lógica de inventario existente.
- La sincronización sigue requiriendo tu sesión de admin: hay que pulsar el botón en `/admin/inventory`.
