export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse bg-paper-100 px-6 pb-32 pt-8">
      <div className="h-4 w-16 rounded-full bg-ink-900/10" />
      <div className="mt-2 h-8 w-40 rounded-xl bg-ink-900/10" />
      <div className="mt-6 h-64 rounded-4xl bg-white shadow-card" />
      <div className="mt-6 h-14 rounded-2xl bg-ink-900/10" />
    </main>
  );
}
