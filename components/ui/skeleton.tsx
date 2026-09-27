/**
 * Bloque base para pantallas de carga. Los `loading.tsx` de cada ruta ya
 * arman su propio layout de skeleton (porque cada pantalla tiene una forma
 * distinta), pero todos repetían a mano la misma clase
 * `animate-pulse rounded-* bg-ink-900/10`. Este primitivo la centraliza.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-xl bg-ink-900/10 ${className}`}
    />
  );
}
