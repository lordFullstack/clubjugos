export function ProgressBar({
  percent,
  label = "Progreso del álbum",
}: {
  percent: number;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="mt-2 h-3 w-full overflow-hidden rounded-full bg-ink-900/[0.06]"
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full origin-left animate-grow-x rounded-full bg-gradient-to-r from-citrus-400 via-citrus-500 to-citrus-600"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
