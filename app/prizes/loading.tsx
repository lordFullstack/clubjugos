import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse bg-paper-100 px-6 pb-32 pt-8">
      <Skeleton className="h-8 w-32" />
      <div className="mt-6 space-y-3">
        <div className="h-20 rounded-3xl bg-white shadow-card" />
        <div className="h-20 rounded-3xl bg-white shadow-card" />
        <div className="h-20 rounded-3xl bg-white shadow-card" />
      </div>
    </main>
  );
}
