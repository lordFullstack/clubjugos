# 🥤 JugoClub — MVP

Sistema de fidelización por stickers digitales para una juguería. PWA mobile-first construida con Next.js (App Router) + TypeScript + Tailwind + Supabase.

## Estado actual: FASE 1 — Inicialización ✅

Lo que existe hasta ahora:

- Proyecto Next.js 15 (App Router) + TypeScript estricto + Tailwind CSS.
- Paleta de marca y tokens de diseño (`tailwind.config.ts`).
- Landing page (`/`) con el CTA "COMENZAR".
- Estructura de carpetas lista para las siguientes fases.
- ESLint configurado (flat config, basado en `eslint-config-next`).
- `.env.example` con las variables que se usarán a partir de la Fase 2.

Todavía **no** incluye: autenticación, base de datos, sistema de QR, motor de stickers, panel admin ni PWA (manifest/service worker). Eso llega en fases posteriores, según el plan.

## Estructura del proyecto

```
app/          → rutas (App Router)
components/   → componentes de UI reutilizables
lib/          → clientes de Supabase, helpers compartidos
services/     → lógica de negocio / acceso a datos
types/        → tipos e interfaces compartidas
hooks/        → hooks de React
utils/        → utilidades puras (formato, validaciones, etc.)
supabase/     → migraciones SQL y config local de Supabase
public/       → estáticos (íconos, manifest, etc. — se completa en Fase 12)
```

## Cómo correrlo localmente

```bash
npm install
cp .env.example .env.local   # completar con las credenciales de Supabase cuando existan (Fase 2)
npm run dev
```

Abrir http://localhost:3000

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run typecheck` — chequeo de TypeScript sin emitir archivos

## Siguiente fase recomendada

**FASE 2 — Supabase + autenticación**: configurar el proyecto de Supabase, clientes de servidor/cliente, y los flujos de registro/login para el rol `CUSTOMER`.
