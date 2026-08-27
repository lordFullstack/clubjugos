export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse bg-paper-100 px-6 pb-32 pt-8">
      <div className="flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-white shadow-card" />
        <div className="mt-3 h-6 w-32 rounded-lg bg-ink-900/10" />
      </div>
      <div className="mt-8 space-y-2">
        <div className="h-14 rounded-2xl bg-white shadow-card" />
        <div className="h-14 rounded-2xl bg-white shadow-card" />
      </div>
    </main>
  );
}
