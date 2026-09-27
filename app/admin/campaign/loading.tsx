import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <div className="mt-6 animate-pulse space-y-3">
        <div className="h-20 rounded-2xl bg-white shadow-card" />
        <div className="h-20 rounded-2xl bg-white shadow-card" />
        <div className="h-20 rounded-2xl bg-white shadow-card" />
      </div>
    </div>
  );
}
