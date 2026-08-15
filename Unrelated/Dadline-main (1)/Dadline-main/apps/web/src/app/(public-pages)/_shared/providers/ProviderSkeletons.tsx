export const ProviderCardSkeleton = () => (
  <div className="flex flex-col gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-40 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-800" />
    </div>
    <div className="flex gap-2">
      <div className="h-5 w-14 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-5 w-12 rounded bg-gray-200 dark:bg-gray-800" />
    </div>
  </div>
)

export const ProviderCardSkeletonGrid = ({
  count = 12,
}: {
  count?: number
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProviderCardSkeleton key={i} />
    ))}
  </div>
)

export const ProviderFiltersSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-8 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-11 rounded-xl bg-gray-200 dark:bg-gray-800" />
      ))}
    </div>
  </div>
)

export const ProviderPageSkeleton = () => (
  <main className="min-h-screen pt-24 pb-16 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-2 mb-6 animate-pulse">
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="mb-8 space-y-3 animate-pulse">
        <div className="h-9 w-72 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-96 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <ProviderFiltersSkeleton />
      <ProviderCardSkeletonGrid />
    </div>
  </main>
)
