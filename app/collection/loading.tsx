import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse bg-paper-100 px-6 pb-32 pt-8">
      <Skeleton className="h-8 w-40" />
      <div className="mt-5 h-80 rounded-4xl bg-white shadow-card" />
    </main>
  );
}
