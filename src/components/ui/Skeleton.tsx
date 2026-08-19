interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#e2e8f0] ${className}`}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] space-y-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}
