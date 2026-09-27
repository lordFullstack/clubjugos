# VISUAL-AUDIT.md — UI Pack LOOP 00: Auditoría visual

Fecha: 2026-09-27
Alcance: auditoría puramente visual (jerarquía, spacing, componentes repetidos, responsive, accesibilidad, inconsistencias) de Home, Álbum, QR, modal, especiales, premios, perfil, onboarding/login, loading, errores y admin. **No se modificó lógica** — este documento es de lectura, igual que `AUDIT.md` del pack anterior.

Referencia de dirección visual: el mockup que compartió el usuario (paleta tropical, tipografía **Sora**, logo con hoja, sidebar oscura en admin, tarjetas de premio con tabs).

## Contexto: esto no arranca de cero

El pack funcional anterior (`AUDIT.md`, loops 00-09, ya mergeados) ya dejó un design system parcial: `components/ui/` (Button, IconButton, Modal, EmptyState, RarityBadge, Toast, Skeleton), `TicketCard`, `StickerTile`, `PrizeCard`, `ProgressBar`, `BottomNav`. Este pack UI es sobre **refinar y completar visualmente** ese sistema, no reemplazarlo.

## 1. Tipografía — hallazgo con decisión pendiente

El mockup nombra explícitamente **Sora** (Bold/Semibold/Regular/Medium) como única familia. El proyecto hoy usa 3 fuentes vía `next/font/google` en `app/layout.tsx`:
- `Inter` → `--font-sans` (cuerpo de texto)
- `Fraunces` (serif, con ejes `opsz`/`SOFT`) → `--font-display` (títulos, cifras) — elegida a propósito por un comentario en el código: "guiño a la tipografía de etiquetas de cajas de fruta vintage"
- `JetBrains Mono` → `--font-mono` (tokens, fechas, boletas)

Adoptar Sora como pide el mockup significa **reemplazar Fraunces** (perder el guiño "vintage fruit crate label") por una geométrica sans más moderna/neutra, coherente con la dirección "fresco, tropical, moderno" del pack. Es una decisión de marca visible, no una corrección técnica — la trato como pregunta abierta para el LOOP 01, no la resuelvo acá.

## 2. Falta una capa real de tokens CSS

`tailwind.config.ts` define los colores/sombras/radios como `theme.extend`, pero no existen como **custom properties de CSS** (`:root { --color-*: ... }`). El LOOP 01 de este pack pide explícitamente "tokens CSS para colores, superficies, texto, bordes, radios, spacing, tipografía y sombras" — hoy solo existen como config de Tailwind, no como variables inspeccionables/reutilizables fuera de clases de utilidad. Definirlas como CSS vars y conectarlas al `theme.extend` de Tailwind (para poder seguir usando `bg-citrus-500` normalmente) resuelve esto sin duplicar nada.

## 3. Componentes normalizados vs. pendientes

Ya existen y están bien: `Button`, `IconButton`, `Modal`, `EmptyState`, `RarityBadge`, `Toast`, `TicketCard`, `ProgressBar`, `StickerTile`, `PrizeCard`.

Pendientes de normalizar como componente propio (hoy son markup repetido inline):
- **Avatar** — el círculo con `IconAvatar` en `app/profile/page.tsx` es un `<div>` a mano; se repite el mismo patrón (círculo blanco + sombra + ícono) en varios lados sin componente.
- **Skeleton** existe (`components/ui/skeleton.tsx`) pero **no se usa en ningún lado** — los 8 `loading.tsx` de rutas de cliente siguen con su propio patrón de `animate-pulse` a mano (que también está bien y es consistente entre sí, pero es una segunda convención en paralelo a `Skeleton`).
- **Badge de estado** (Disponible/Canjeado/Bloqueado/Expirado en `PrizeCard`, Activo/Inactivo en el admin) usa clases de color repetidas en cada lugar en vez de un componente `<Badge>` compartido.
- **StickerCard** que pide el pack — hoy es `StickerTile`, ya cumple el rol pero con ese nombre; no hace falta renombrar, solo confirmar que cubre lo pedido (obtenido/bloqueado/duplicado ya lo hace; "especial" con tratamiento distinto lo maneja `SpecialBlock` dentro del modal, no `StickerTile` — los especiales no viven en el grid del álbum, así que esto es correcto, no un gap).

## 4. Jerarquía y spacing — por pantalla

- **Home:** ya sigue el orden que pide el pack (saludo → progreso → CTA → últimos stickers → próximo objetivo → nav), implementado en el pack anterior (LOOP 04). El CTA "ESCANEAR QR" es de ancho completo y fácil con una mano — cumple. Falta jerarquía visual más fuerte entre el nombre de la campaña y el progreso (mismo peso tipográfico hoy).
- **Álbum:** grid de 4 columnas ya responsive y consistente. Falta el diferenciador visual explícito para duplicado que pide el mockup más allá del contador `x2` — hoy es solo texto pequeño, no un badge.
- **Escaneo QR:** estados ya cubiertos (permiso, escaneando, detectado, procesando, éxito→modal directo, error) del pack anterior. Visualmente el marco de escaneo es un rectángulo blanco simple; el mockup usa esquinas tipo mira de cámara más marcadas.
- **Modal de sticker:** ya tiene fases de animación, rareza, duplicado, especial. Falta el detalle visual de "premium y sutil" que pide este pack — hoy reusa confeti simple, no un tratamiento distinto para EPIC/LEGENDARY/SPECIAL más allá del halo de color.
- **Especiales:** hoy solo aparecen dentro del modal de revelación y en una lista plana en Álbum ("Especiales ganados"). El mockup muestra una pantalla/sección propia con las 3 tarjetas especiales + su premio asociado, más elaborada que la lista actual.
- **Premios:** ya tiene 3 estados (Disponibles/Canjeados/vacío, LOOP 06 del pack anterior). El mockup pide tabs "Disponibles / Mis premios" — hoy son secciones apiladas verticalmente, no tabs.
- **Perfil:** tiene progreso, historial, cerrar sesión. Falta "nivel" (concepto nuevo del mockup, no existe en el modelo de datos — a definir si es real o solo visual con el % de progreso).
- **Login/Registro:** funcionales y ya con buen spacing (revisado en vivo, LOOP 09). No usan `TicketCard` ni el resto del sistema de componentes — son formularios sueltos con su propio estilo. Vale la pena unificarlos.
- **Loading/errores:** consistentes entre sí (mismo patrón `animate-pulse`), pero como se dijo en el punto 3, en paralelo al componente `Skeleton` sin usar.
- **Admin:** el cambio más grande de este pack. Hoy es `AdminShell` con header + nav horizontal con scroll. El mockup pide sidebar fija en desktop, colapsable en tablet, top bar + nav compacta en mobile — es una reestructuración real del layout, no solo retoque de estilos.

## 5. Accesibilidad — estado actual

Ya cubierto por el pack anterior: `role="dialog"`/`aria-modal` en modales, foco gestionado (LOOP 03/09, verificado en vivo), `prefers-reduced-motion` respetado globalmente, touch targets ≥44px en `Button`/`IconButton`. Pendiente real: contraste no medido con herramienta dedicada, iconos de solo-ícono sin `aria-label` explícito en algunos botones del admin (ej. toggle Activo/Inactivo en `sticker-list.tsx`/`prize-list.tsx` son botones de texto, no ícono, así que están bien — pero el ícono de cerrar del modal QR en `qr-generator-form.tsx` si lo tuviera necesitaría revisión).

## 6. Responsive — breakpoints a cubrir en este pack

El pack pide probar hasta 1280+ (LOOP 08), más ancho que el "desktop admin" genérico del pack anterior. El admin hoy no tiene un layout de sidebar que aprovechar esos anchos — ligado al punto del admin arriba.

## Qué NO se toca (ver PROMPT-CLAUDE.md del pack)

Supabase, RLS, QR, premios, autenticación, lógica, IDs, handlers ni contratos JS — ninguno de los hallazgos de arriba implica tocar nada de eso; todo es CSS/markup/estructura de componentes.

## Orden recomendado

Sigue el orden del pack: 01 Design System (resolver la pregunta de Sora acá) → 02 Home/Álbum → 03 QR → 04 Modal → 05 Especiales → 06 Premios/Perfil → 07 Admin (el más grande, sidebar) → 08 Microinteracciones + QA.
