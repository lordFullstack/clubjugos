export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-40 rounded-xl bg-ink-900/10" />
      <div className="mt-6 space-y-3">
        <div className="h-20 rounded-2xl bg-white shadow-card" />
        <div className="h-20 rounded-2xl bg-white shadow-card" />
        <div className="h-20 rounded-2xl bg-white shadow-card" />
      </div>
    </div>
  );
}
