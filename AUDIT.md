# AUDIT.md — LOOP 00: Auditoría y baseline

Fecha: 2026-09-27
Alcance: inspección del código existente antes de tocar UI, según `JugoClub-Loops-Pack`. No se modificó lógica de negocio; solo se corrió `npm install`, `npm run typecheck`, `npm run build`, `npm run lint` y `npm audit` como línea base.

## Estado de la línea base (antes de tocar nada)

| Chequeo | Resultado |
|---|---|
| `npm install` | OK (396 paquetes) — **`package-lock.json` no está commiteado** (ver Deuda técnica) |
| `npm run typecheck` | ✅ Sin errores |
| `npm run build` | ✅ Compila y genera las 20 rutas sin warnings propios del proyecto |
| `npm run lint` | ✅ Sin warnings ni errores |
| `npm audit` (antes del parche) | 🔴 3 vulnerabilidades (2 high, 1 critical) — ver Riesgos de seguridad #1 |
| `npm audit` (después del parche, ver 1.1) | 🟡 2 vulnerabilidades (1 high, 1 moderate), ninguna crítica |

El proyecto arranca sano: no hay deuda de "no compila" ni de lint. El trabajo de los siguientes loops es sobre una base estable.

**Actualización post-auditoría:** con tu confirmación, ya se aplicó el parche de la sección 1.1 (`next` → `15.5.26` + `npm audit fix` para `sharp`). Typecheck y build se re-verificaron en verde después del cambio. Los detalles quedan documentados abajo tal como se encontraron originalmente.

---

## 1. Riesgos de seguridad

### 1.1 🔴 CRÍTICO — Next.js 15.5.21 tiene un RCE no autenticado conocido
`npm audit` reporta que la versión instalada (`next@15.5.21`, fijada sin rango en `package.json:13`) está dentro del rango vulnerable a:
- **GHSA-p293-qw3h-jr36** — RCE no autenticado en servidores hosteados en Windows.
- **GHSA-2xp9-vwfh-vxw4** — RCE no autenticado en la Image Optimization API cuando se usan archivos AVIF.

El propio entorno de desarrollo de este proyecto corre en Windows, así que el primer advisory aplica directamente. El fix es actualizar a `next@15.5.26` (parche, no rompe el rango semver real, solo el pin exacto en `package.json`).

**✅ Aplicado.** Se actualizó `next` a `15.5.26` en [package.json:13](package.json:13) y se corrió `npm audit fix` (sin `--force`), lo que además resolvió el advisory de `sharp`. `typecheck` y `build` se re-verificaron en verde después del cambio. Queda 1 advisory `high` (postcss, empaquetado dentro del propio `node_modules/next`) y 1 `moderate`, ambos solo resolubles subiendo a `next@16` (breaking change) — se deja fuera de alcance de este loop y anotado para revisar más adelante, no es explotable de forma crítica como el RCE que sí se corrigió.

### 1.2 Media — lecturas de datos de cliente sin filtro explícito por `customer_id`
Hallazgo prioritario que el propio pack pedía revisar. Tres lecturas en `services/customer-service.ts` dependen **exclusivamente** de RLS para acotar los resultados al cliente autenticado, sin un `.eq("customer_id", user.id)` explícito en el código:
- [`getCustomerPrizes`](services/customer-service.ts:189) → consulta `customer_prizes` sin filtro de cliente.
- [`getCustomerHistory`](services/customer-service.ts:226) → consulta `customer_stickers` sin filtro de cliente.
- [`getCurrentCollection`](services/customer-service.ts:81) → la sub-consulta de `obtained` sobre `customer_stickers` tampoco filtra por cliente.

Hoy esto **no es explotable**: las policies RLS (`customer_prizes_select_own`, `customer_stickers_select_own` en [005_customer_stickers_prizes_redemptions_scans.sql](supabase/migrations/005_customer_stickers_prizes_redemptions_scans.sql:77)) ya acotan `customer_id = auth.uid()`. Pero es un único punto de falla: si alguna vez una de estas funciones se invoca con el `service_role` client (que ignora RLS) en vez del cliente de sesión, un cliente vería premios/historial de otro sin ninguna señal en el código de que algo está mal. Se corrige en Loop 08 agregando el filtro explícito como defensa en profundidad, sin cambiar comportamiento.

### 1.3 Baja — dependencias con `install scripts` bloqueados
`npm install` reporta que `sharp@0.34.5` y `unrs-resolver@1.12.2` tienen scripts de instalación pendientes de aprobación (`npm warn allow-scripts`). Sin `sharp` compilado nativamente, `next/image` cae a un modo más lento en producción. Antes de desplegar, revisar deliberadamente esos scripts y aprobarlos (`npm approve-scripts`) en vez de ignorarlos.

### 1.4 Informativa — flujo de recompensa por query params (ya señalado por el pack)
`/scan/[token]` valida todo en el servidor vía `redeem_qr_token` (RPC `security definer`, ejecutable solo por `service_role` — [008](supabase/migrations/008_redeem_qr_token_atomic_function.sql:155)/[014](supabase/migrations/014_redeem_qr_token_collectible_special.sql:216)) y solo *después* pasa el resultado a `/reward` por query string. Confirmo el riesgo que ya documenta el pack: alguien podría armar a mano una URL `/reward?prize=1&spPrizeName=X` y ver una pantalla de "ganaste" falsa — pero no puede otorgarse un premio real así, porque `customer_prizes` solo se escribe desde la función atómica. Es un riesgo cosmético, no de negocio. Se atiende en Loop 08 como ya está previsto (persistir el resultado / `rewardId` en vez de query params crudos).

### 1.5 Lo que SÍ está bien blindado (no tocar)
- `redeem_qr_token` y `redeem_prize` son `security definer`, `set search_path = public`, y tienen `revoke execute ... from public, anon, authenticated` + `grant ... to service_role` únicamente ([008](supabase/migrations/008_redeem_qr_token_atomic_function.sql:155), [011](supabase/migrations/011_redeem_prize_atomic_function.sql:52)).
- `qr_tokens` tiene RLS habilitado **sin ninguna policy** para anon/authenticated: absolutamente nadie puede leer ni escribir esa tabla desde el navegador ([004](supabase/migrations/004_qr_tokens.sql:21)).
- El motor de sorteo (migración 014) ya implementa exactamente la regla de negocio del pack: coleccionables sin repetición mientras falten, especiales con tasa independiente por escaneo, y el premio de colección completa excluye los premios ya vinculados a un especial.
- El registro público (`handle_new_user`) fuerza `role = 'CUSTOMER'` sin importar los metadatos enviados — nadie puede auto-asignarse ADMIN/OPERATOR ([002](supabase/migrations/002_auth_trigger_and_rls_helpers.sql:11)).
- `profiles` revoca `update` general y solo otorga `update (name, phone, avatar_url)` — un cliente no puede cambiar su propio rol ni su `business_id` ([002](supabase/migrations/002_auth_trigger_and_rls_helpers.sql:63)).
- Los helpers `current_role()`/`current_business_id()` viven en el schema `private` (no expuesto por PostgREST) desde la migración 006, evitando que se invoquen como RPC pública.

---

## 2. Problemas UX

1. **Countdown obligatorio de 3s en cada revelación.** [`RewardReveal`](components/reward-reveal.tsx:83) siempre pasa por una cuenta regresiva 3→2→1 antes de mostrar el sticker, incluso para un COMMON. El Loop 03 pide una revelación ágil (fases de 0–900ms). Hoy cualquier escaneo exitoso tarda ~2.1s solo en la cuenta regresiva antes de ver algo.
2. **Sin CTA "CONTINUAR" en la revelación.** Loop 03 pide un CTA secundario para seguir escaneando sin forzar la salida al álbum; hoy `RewardReveal` solo ofrece "VER ÁLBUM" ([reward-reveal.tsx:237](components/reward-reveal.tsx:237)).
3. **El álbum es estático.** `StickerGrid` no tiene `onClick` en absoluto — ni para abrir detalle de un sticker obtenido ni para mostrar el estado bloqueado de uno pendiente (Loop 04 pide ambas interacciones).
4. **Slot bloqueado revela la rareza real.** En [`sticker-grid.tsx:33`](components/sticker-grid.tsx:33), el `ring` de color de rareza se aplica según `sticker.rarity` sin chequear `obtained`, así que un sticker que el cliente **no tiene** ya muestra visualmente si es RARE/EPIC/LEGENDARY por el color del borde. Loop 04 pide no inventar/filtrar información sobre slots bloqueados.
5. **Home no muestra "próximo objetivo" ni "premio disponible".** [`app/home/page.tsx`](app/home/page.tsx:33) solo muestra % de progreso y la grilla; no trae premios (`getCustomerPrizes` no se llama desde Home) ni resalta el último sticker obtenido, ambos pedidos explícitamente por Loop 04.
6. **Sin pantalla de "procesando" entre escanear y ver el resultado.** El escaneo exitoso hace `router.push` a `/scan/[token]` ([qr-scanner.tsx:75](components/qr-scanner.tsx:75)), que es una Server Component que valida contra la RPC y recién ahí redirige a `/reward`. Mientras tanto no hay ningún estado visual de "procesando" — la pantalla puede sentirse congelada un instante.

## 3. Problemas UI

1. **No hay componentes base reutilizables.** Botones, cards y CTAs están repetidos con las mismas clases Tailwind en al menos 6 archivos (`app/home/page.tsx`, `app/collection/page.tsx`, `app/prizes/page.tsx`, `components/reward-reveal.tsx`, `components/bottom-nav.tsx`, `components/redeem-prize-button.tsx`). Loop 01 pide extraer `Button`, `IconButton`, `Card`, etc. como componentes normalizados.
2. **Metadata de rareza duplicada e inconsistente.** `sticker-grid.tsx` define `RARITY_RING`/`RARITY_GLOW`; `reward-reveal.tsx` define por separado `RARITY_LABEL`/`RARITY_COLOR`. Son dos fuentes de verdad distintas para el mismo concepto (5 rarezas + SPECIAL), con riesgo de que diverjan visualmente.
3. **`EmptyState` no es reutilizable.** Existe solo dentro de `components/qr-scanner.tsx` como función local; Home/Álbum/Premios repiten manualmente un bloque "sin campaña activa" / "sin premios" con markup similar pero no compartido.
4. **No hay `Toast`/feedback unificado.** Los errores se muestran de formas distintas según pantalla: banner inline en `/scan` (vía `searchParams.error`), texto rojo bajo el botón en `RedeemPrizeButton`. Loop 01 pide un solo patrón de feedback.
5. **Faltan los 3 assets SPECIAL.** `public/stickers/` tiene los 10 PNG coleccionables exactamente como los nombra Loop 02 (`sandia-descanso.png`, `coco-tranqui.png`, etc.), pero **no existen** `special-patineta-tropical.png`, `special-taza-caida.png` ni `special-fruta-jackpot.png`. Sin esos archivos no se puede probar el flujo SPECIAL end-to-end con arte real.

## 4. Problemas de arquitectura

1. **Boilerplate de sesión repetido en 6 páginas de cliente.** `home`, `collection`, `scan`, `reward`, `prizes` y `profile` repiten `createClient()` + `auth.getUser()` + `redirect("/login")` cada uno. El lado admin ya resuelve esto con [`getAdminSession()`](lib/admin/get-admin-session.ts:26) envuelto en `React.cache()`; el lado cliente no tiene equivalente.
2. **`RewardReveal` es una página completa, no un modal.** Ocupa toda la pantalla (`min-h-screen`), no tiene `role="dialog"`/`aria-modal`, no maneja foco ni ESC. El propio AUDIT del pack (00) ya anticipaba esto: "debe evolucionar hacia un modal reutilizable, no duplicarse" — confirmado, es el objetivo central de Loop 03.
3. **`BottomNav` se importa manualmente en cada página** en vez de vivir en un layout compartido para las rutas de cliente (no hay `app/(customer)/layout.tsx`). Funciona, pero duplica el import y el padding inferior (`pb-32`) en cada page.tsx.
4. **`package-lock.json` no está versionado** (aparece como `??` en `git status`). Sin lockfile commiteado, dos instalaciones en momentos distintos pueden traer versiones de dependencias transitivas distintas — relevante justo ahora que hay un advisory crítico de por medio.

## 5. Deuda técnica

- Mapas de rareza duplicados (ver UI #2) — consolidar en un solo `lib/rarity.ts` o similar antes de escalar a `StickerRevealModal` (Loop 03) y `PrizeCard`/`Badge` (Loop 01).
- Sin tests automatizados (ni unitarios ni e2e); el Loop 09 depende enteramente de una matriz manual.
- 3 advisories de `npm audit` sin resolver (ver Seguridad 1.1).
- `sharp`/`unrs-resolver` con scripts de instalación no aprobados (ver Seguridad 1.3).

## 6. Quick wins (bajo riesgo, alto valor, no tocan lógica de negocio)

1. ~~Actualizar `next` a `15.5.26` para cerrar el RCE crítico~~ ✅ hecho.
2. ~~Commitear `package-lock.json`~~ ✅ hecho.
3. Agregar `.eq("customer_id", user.id)` explícito en las 3 lecturas señaladas en 1.2 (defensa en profundidad, cero cambio de comportamiento).
4. Generar/agregar los 3 PNG especiales faltantes en `public/stickers/` para poder probar Loop 02/03/05 con arte real.
5. Extraer un `getCustomerSession()` cacheado (mismo patrón que `getAdminSession()`) para las 6 páginas de cliente.

## 7. Cambios que NO se deben hacer

- No tocar el motor de sorteo de `redeem_qr_token` (migración 014): ya implementa exactamente "coleccionable sin repetición" + "especial con tasa independiente" + "premio de colección completa excluye premios especiales" tal como pide Loop 05.
- No relajar ni quitar ningún `revoke execute ... from public, anon, authenticated` de las funciones RPC.
- No tocar las policies RLS existentes de `customer_stickers`, `customer_prizes`, `redemptions`, `scan_events`, `qr_tokens` — ya cumplen "el cliente solo lee lo suyo, el staff lo de su negocio, nadie hace INSERT/UPDATE/DELETE salvo `service_role`".
- No renombrar los archivos/nombres de los 10 stickers coleccionables existentes: ya coinciden 1:1 con los nombres pedidos por Loop 02.
- No quitar el `on conflict (customer_id, prize_id) do nothing` al insertar `customer_prizes` (evita duplicar premios).
- No migrar de Supabase, no introducir un ORM, no reescribir el schema.
- No exponer el `service_role` client (`lib/supabase/service.ts`) a ningún Client Component.

## 8. Orden recomendado de implementación

Mantengo el orden del pack (`10-ORDEN-DE-EJECUCION.md`), con las notas de esta auditoría insertadas donde aplican:

1. ~~00 — Auditoría (este documento)~~ ✅
2. 01 — Design system (los tokens de color ya existen en `tailwind.config.ts`; el trabajo real es extraer `Button/Card/Badge/EmptyState/Toast` reutilizables y unificar los mapas de rareza duplicados)
3. 02 — Specs de stickers (generar los 3 PNG SPECIAL faltantes)
4. 03 — Modal de revelación (convertir `RewardReveal` en `StickerRevealModal` real: `role="dialog"`, foco, ESC, `prefers-reduced-motion`, quitar el countdown de 3s)
5. 04 — Home + Álbum + Scan (agregar interacción a `StickerGrid`, mostrar premio/próximo objetivo en Home, ocultar rareza real de slots bloqueados)
6. 05 — Especiales + premios (ya soportado en backend; falta UI dedicada más allá del modal)
7. 06 — Premios, perfil y estados globales
8. 07 — Admin responsive
9. 08 — Seguridad, datos y contratos (aplicar el fix de `next`, los filtros `customer_id` explícitos, y evaluar reemplazar los query params de `/reward` por un resultado persistido)
10. 09 — QA final (`npm run typecheck` + `npm run build` ya en verde como línea base)

---

**Archivos revisados:** todas las rutas en `app/`, todos los componentes en `components/`, todos los servicios en `services/`, `lib/supabase/*`, `lib/admin/*`, `lib/qr/token.ts`, `middleware.ts`, todas las migraciones en `supabase/migrations/`, `tailwind.config.ts`, `app/globals.css`, `public/stickers/`.
