## Diagnóstico

Verifiqué la base de datos y los logs:
- Tu rol `admin` está correctamente asignado a `jribot@gmail.com` en `user_roles` ✅
- El edge function `check-admin-access` responde `Admin check for user jribot@gmail.com: true` ✅

O sea, el backend está perfecto. El problema es del lado del cliente en `jibaroenlaluna.com`.

## Causa más probable

Las sesiones de Supabase se guardan en `localStorage` **por dominio**. Si iniciaste sesión en el preview de Lovable (`*.lovable.app`), esa sesión NO existe en `jibaroenlaluna.com`. Necesitas hacer login otra vez en ese dominio específico.

Causa secundaria posible: el `UserMenu` y `useAdminCheck` fallan silenciosamente cuando el `check-admin-access` devuelve error — no hay forma visual de saber si es "no soy admin", "no estoy logueado" o "hubo un error de red".

## Cambios propuestos

### 1. `src/components/UserMenu.tsx`
- Añadir estado `checkingAdmin` para no ocultar el menú mientras todavía está verificando.
- Loggear con `console.warn` el error completo si el invoke falla (status, mensaje, contexto), para que en producción puedas abrir la consola y ver exactamente por qué.
- No llamar al edge function si no hay sesión activa (evita ruido).

### 2. `src/hooks/useAdminCheck.ts`
- Mismos logs detallados: si entras directo a `/admin/blog` y te rechaza, la consola te dirá si fue por falta de sesión, error de red, o porque no eres admin.
- Mensaje de toast más específico según la causa.

### 3. Sin cambios en backend
- El edge function ya tiene CORS correcto y funciona. No se toca.
- No se toca la BD ni RLS.

## Cómo probar después

1. Abre `https://jibaroenlaluna.com` en una pestaña nueva.
2. Si no ves tu avatar (solo "Sign in"), entra con `jribot@gmail.com` → el menú admin aparecerá.
3. Si ves tu avatar pero no el menú admin, abre la consola del navegador (F12) y los nuevos logs te dirán exactamente qué pasó.
