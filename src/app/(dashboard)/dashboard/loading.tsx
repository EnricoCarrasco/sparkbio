import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard-specific loading skeleton.
 * Mirrors the visual layout of the dashboard page (profile editor + link list)
 * so the transition from loading to loaded is smooth and minimal.
 */
export default function DashboardLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6" aria-busy="true" aria-label="Loading dashboard">
      {/* Profile editor skeleton */}
      <div className="space-y-4 p-6 border border-border rounded-xl bg-white">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Social icons skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="size-9 rounded-full" />
          ))}
        </div>
      </div>

      {/* Link list skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 border border-border rounded-xl bg-white"
          >
            <Skeleton className="size-4 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-5 w-8 rounded-full shrink-0" />
            <Skeleton className="size-7 rounded-md shrink-0" />
            <Skeleton className="size-7 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
