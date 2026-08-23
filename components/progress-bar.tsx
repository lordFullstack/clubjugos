export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/5"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
