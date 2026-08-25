export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="mt-2 h-3 w-full overflow-hidden rounded-full bg-ink-900/[0.06]"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-citrus-400 via-citrus-500 to-citrus-600 transition-all duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
