import { Skeleton } from "@/components/ui/skeleton";

export function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="glass-card p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
