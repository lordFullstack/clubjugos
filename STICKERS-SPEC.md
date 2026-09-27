# STICKERS-SPEC.md — especificación de arte para vos

Referencia para cuando hagas el arte de los stickers. Basado en cómo ya consume las imágenes el código (`components/sticker-tile.tsx`, `components/sticker-reveal-modal.tsx`).

## ⚠️ Corrección: cómo subir el arte de verdad

**Antes decía "reemplazá el archivo en `public/stickers/` y listo" — eso está mal, lo corrijo acá.** Verificado contra la base real: el `image_url` de cada sticker en la tabla `stickers` apunta a una URL de Supabase Storage (`.../storage/v1/object/public/stickers/<uuid>.png`), generada cuando lo subís desde el panel admin — **no** al archivo estático del repo.

Los 10 PNG que hoy viven en `public/stickers/*.png` (con nombres lindos tipo `mango-afan.png`) **solo se usan como vista previa hardcodeada en la landing page** (`app/page.tsx`, sección "Tu primera boleta"). Cambiar esos archivos no mueve nada en el álbum real de ningún cliente.

**Para que un sticker aparezca de verdad en el álbum:**
1. Entrá a `/admin/stickers` (rol ADMIN).
2. "+ Nuevo sticker" (o editá uno existente).
3. Subí el archivo ahí — el formulario ya acepta PNG, JPG y WEBP hasta 5 MB (tu `.webp` entra sin conversión).
4. Le ponés nombre, rareza, tipo (Coleccionable/Especial) y, si es especial, el premio que otorga.

Si además querés actualizar la vista previa de la landing con el nuevo estilo, ahí sí correspondería reemplazar el archivo en `public/stickers/` con el mismo nombre — pero es puramente cosmético para esa pantalla, no afecta el álbum real.

## Spec técnica (igual para los 13)

- **Formato:** PNG con transparencia real (canal alfa, no blanco de fondo).
- **Tamaño maestro:** 1024×1024 px. Opcional: exportar también 512×512 y 256×256, pero el código hoy sirve un solo archivo por sticker vía `next/image` con `object-contain`, así que **con el master de 1024 alcanza**.
- **Proporción:** el personaje ocupa 78–86% del lienzo. Zona segura ~8% por lado.
- **Sin fondo rectangular ni halo/glow incrustado en el PNG** — el halo de rareza y el borde tipo sticker ya los pone la UI (`ring-*` + `foil-shine` en `components/ui/rarity.ts` y `sticker-reveal-modal.tsx`), no hace falta pintarlos en la imagen.
- **Sin texto incrustado** (nombre, precio, info del premio) — todo eso lo muestra la UI aparte.
- **`object-contain`, nunca deformar ni recortar** — mantené ratio 1:1 real en el archivo.
- **Un archivo independiente por sticker**, incluida la corona/hojas o accesorios: todo dentro del mismo PNG.

## Dirección de estilo (según tu mockup)

Carita/personaje simple y redondeado, expresión clara y amigable, colores planos con sombreado sutil — más cercano al panel "Especificaciones de stickers (resumen)" de tu mockup que al estilo pintado con texto que tienen los 10 PNG actuales. Consistencia entre los 13: mismo grosor de contorno, mismo nivel de detalle, misma familia de expresiones.

## Los 13 archivos (nombre exacto a reemplazar en `public/stickers/`)

**10 coleccionables:**
`sandia-descanso.png` · `coco-tranqui.png` · `piña-rumba.png` · `papaya-encanta.png` · `sandia-vamos.png` · `limon-quemasspue.png` · `uva-tusabes.png` · `mango-afan.png` · `banana-parce.png` · `mango-fria.png`

**3 especiales:**
`special-patineta-tropical.png` · `special-taza-caida.png` · `special-fruta-jackpot.png`

> Ojo: en el mockup los especiales se llaman "Taza de Caída / Coco Dorado / Sorpresa Frutal" — son nombres de *visualización* (el campo `name` del sticker en el admin), no tienen que coincidir con el nombre del archivo. El archivo puede seguir siendo `special-taza-caida.png` aunque el sticker se llame "Taza de Caída" en pantalla; para los otros dos, cuando los crees en `/admin/stickers`, les ponés el nombre que quieras — no hace falta que el filename coincida.

## Rareza — qué pone la UI encima de tu arte (no lo dibujes vos)

| Rareza | Tratamiento que ya aplica el código |
|---|---|
| COMMON | aro neutro, sin brillo |
| UNCOMMON | aro verde jade |
| RARE | aro celeste + brillo |
| EPIC | aro guayaba + brillo + confeti discreto |
| LEGENDARY | aro dorado + brillo + confeti |
| SPECIAL (los 3 especiales) | halo dorado/guayaba de fondo + tratamiento premium en el modal |

Con que el sticker tenga fondo transparente y el personaje bien centrado, todo lo demás (aro de color, brillo, confeti, halo) lo pone la UI automáticamente según la rareza que le asignes en `/admin/stickers`.
