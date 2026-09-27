# QA.md — LOOP 09: QA y pruebas

Fecha: 2026-09-27
Alcance: matriz mínima del pack, verificada contra la app real corriendo localmente conectada al proyecto de Supabase real (`jugoclub`, `ihvhvlmbujcyhamfveek`), no solo por lectura de código. Se usó una cuenta de cliente descartable (`qa-test-claude-loop09@example.com`) creada por el propio flujo de registro y **borrada por completo al final** (perfil + `auth.users`, cascada limpia verificada en 0 filas). Los escenarios de escaneo/premios que requieren `service_role` (no disponible en este entorno) se probaron invocando `redeem_qr_token`/`redeem_prize` directamente por SQL contra datos de prueba descartables, con limpieza posterior.

**⚠️ Incidente durante la prueba, ya reportado al usuario en el chat:** para forzar determinísticamente la caída de un SPECIAL sin depender del azar, se cambiaron temporalmente las tasas de caída (`campaign_stickers.probability`) de los 3 stickers SPECIAL reales de la campaña "Colección Sabores". El respaldo de los valores originales se guardó en una tabla temporal que no sobrevivió entre llamadas, así que **no se pudieron restaurar automáticamente**. Quedaron en: Banano Legendario 100%, Picada de la Suerte 0%, Combo Sorpresa 0%. El usuario decidió corregirlas él mismo desde `/admin/stickers`. Ningún otro dato de negocio fue afectado.

## Cliente

| Caso | Resultado | Método |
|---|---|---|
| Registro | ✅ | Navegador real, cuenta descartable, auto-login tras crear cuenta |
| Login (credenciales incorrectas) | ✅ "Email o contraseña incorrectos." | Navegador real |
| Login (credenciales correctas) | ✅ | Navegador real |
| Logout | ✅ redirige a `/login` | Navegador real |
| Rutas protegidas sin sesión | ✅ `/home` → `/login` | Navegador real |
| Home | ✅ progreso, próximo objetivo, CTA, datos reales de campaña | Navegador real |
| Escaneo válido → sticker nuevo | ✅ `success:true`, sticker devuelto, `obtainedCount` correcto | RPC directo (SQL), datos descartables |
| QR usado | ✅ segundo intento → `QR_USED`, sin nueva fila en `customer_stickers` | RPC directo (SQL) |
| QR expirado | ✅ `QR_EXPIRED` | RPC directo (SQL) |
| Álbum vacío | ✅ 10 slots "?", 0% | Navegador real (cuenta nueva) |
| Álbum completo + sin especial ese escaneo | ✅ **sin crash**, `sticker:null`, `special:null`, `collectionComplete:true` — ver nota abajo | RPC directo (SQL) |
| Especial sin premio (duplicado) | ✅ `isDuplicate:true`, `prizeUnlocked:false`, `prizeName:null` | RPC directo (SQL) |
| Especial con premio | ✅ `isDuplicate:false`, `prizeUnlocked:true`, `prizeName` correcto | RPC directo (SQL) |
| Premio disponible | ✅ sección "Disponibles" con botón de canje | Navegador real + RPC |
| Premio canjeado | ✅ `redeem_prize` exitoso, reintento → `PRIZE_ALREADY_REDEEMED`, 1 sola fila en `redemptions` | RPC directo (SQL) |
| Offline | ✅ revisado por código (LOOP 06): detecta reconexión, botón reintentar, texto explícito de que un escaneo en curso no se procesó | Code review (no se pudo forzar offline real en este navegador) |

**Nota sobre "álbum completo + sin especial":** este es exactamente el escenario que rompía la función `redeem_qr_token` de este repo (bug encontrado y corregido en este mismo loop, ver `017_fix_unassigned_record_bug.sql`). La prueba se corrió contra la versión ya corregida que está viva en producción; no se pudo reproducir el bug original porque ya no existe ahí — pero confirma que el fix backporteado al repo es el comportamiento correcto.

## Responsive

| Viewport | Resultado |
|---|---|
| 360×800 | ✅ sin overflow horizontal (verificado por JS: `scrollWidth === clientWidth`) |
| 390×844 | ✅ sin overflow horizontal, revisado visualmente (Home/Álbum/Premios/Perfil) |
| 430×932 | ✅ sin overflow horizontal (verificado por JS) |
| Tablet / desktop admin | ⏸ no verificado en este pase — pendiente |

## Accesibilidad

| Caso | Resultado | Método |
|---|---|---|
| Teclado / foco en modal | ✅ el foco entra al `<div role="dialog">` al abrir | JS: `document.activeElement` |
| ESC cierra modal y devuelve el foco | ✅ verificado con el modal de detalle de sticker: foco vuelve exactamente al botón que lo abrió | JS: `document.activeElement` antes/después de `Escape` |
| `aria-label`/`role="dialog"`/`aria-modal` | ✅ presentes en los modales probados | `read_page` (árbol de accesibilidad) |
| `prefers-reduced-motion` | ✅ la regla `@media (prefers-reduced-motion: reduce)` está presente en el CSS servido | JS: inspección de `document.styleSheets`. No se pudo forzar la preferencia real del SO en este navegador para probar el efecto end-to-end |
| Contraste | ⏸ no medido con herramienta de contraste — pendiente |
| Lectores de pantalla reales | ⏸ no probado con un lector de pantalla real — pendiente |

## Datos

| Caso | Resultado | Método |
|---|---|---|
| QR usado no vuelve a entregar recompensa | ✅ | RPC directo, dos llamadas secuenciales al mismo token |
| Premio no se duplica accidentalmente | ✅ `on conflict do nothing` + `UNIQUE(customer_id, prize_id)`; confirmado 1 sola fila en `customer_prizes` tras 2 disparadores del mismo premio | RPC directo + conteo en tabla |
| Dos escaneos concurrentes no duplican QR | ⚠️ Verificado por code review (`select ... for update` bloquea la fila) + prueba secuencial (el segundo intento ve `USED` de forma determinística). **No se pudo simular concurrencia real** (dos requests literalmente simultáneos) con la herramienta SQL disponible, que ejecuta de forma secuencial |
| Un cliente no ve premios de otro | ✅ Verificado a nivel de policy (LOOP 08, en vivo): `customer_prizes_select_own` exige `customer_id = auth.uid()`. **No verificado con dos sesiones autenticadas reales en paralelo** (el rol usado para consultas SQL es `service_role`/`postgres`, que no está sujeto a RLS) |

## Criterio final del loop

- [x] `npm run typecheck` — sin errores
- [x] `npm run lint` — sin warnings
- [x] `npm run build` — compila y genera las 21 rutas
- [x] Sin imports muertos introducidos en ningún loop de esta sesión
- [x] Sin regresiones del flujo QR — al contrario, se encontró y corrigió un bug real preexistente (`017_fix_unassigned_record_bug.sql`)

## Pendiente para una próxima pasada

- Tablet y desktop del panel admin (no se probó visualmente en este loop).
- Medición real de contraste (herramienta dedicada, ej. axe/Lighthouse).
- Lector de pantalla real (VoiceOver/NVDA), no solo árbol de accesibilidad.
- `prefers-reduced-motion` end-to-end (forzar la preferencia real del SO/navegador).
- Concurrencia real de dos escaneos simultáneos (necesita dos conexiones/requests en paralelo de verdad).
- Aislamiento de premios entre clientes con dos sesiones autenticadas reales (no solo la policy leída).
- Sincronizar al repo las migraciones que existen en producción pero no acá (`010_test_qr_tokens_fixed`, `013_promote_admin_test_user`, `014_promote_operator_test_user`, `019_perf_indexes` — ver AUDIT.md/LOOP 08), si el usuario lo pide.
- **Corregir manualmente las tasas de caída de los 3 stickers SPECIAL** en `/admin/stickers` (ver incidente arriba) — a cargo del usuario.
