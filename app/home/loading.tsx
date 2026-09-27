import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse bg-paper-100 px-6 pb-32 pt-8">
      <Skeleton className="h-4 w-16 rounded-full" />
      <Skeleton className="mt-2 h-8 w-40" />
      <div className="mt-6 h-64 rounded-4xl bg-white shadow-card" />
      <Skeleton className="mt-6 h-14 rounded-2xl" />
    </main>
  );
}
