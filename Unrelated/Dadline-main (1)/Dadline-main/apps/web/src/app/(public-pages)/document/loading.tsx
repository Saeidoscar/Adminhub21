import Skeleton from "@/components/ui/Skeleton"

const DocumentCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    <div className="flex gap-2">
      <Skeleton width={64} height={22} />
      <Skeleton width={72} height={22} />
    </div>
    <div className="space-y-2 py-1">
      <Skeleton width="100%" height={16} />
      <Skeleton width="75%" height={16} />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton variant="circle" width={32} height={32} />
      <div className="flex-1 space-y-1.5">
        <Skeleton width={96} height={12} />
        <Skeleton width={72} height={10} />
      </div>
    </div>
    <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
      <Skeleton width={92} height={12} />
      <Skeleton width={76} height={16} />
    </div>
  </div>
)

const DocumentLoading = () => (
  <main className="min-h-screen px-4 pt-24 pb-16" aria-busy="true">
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton width={48} height={14} />
        <Skeleton width={8} height={14} />
        <Skeleton width={128} height={14} />
      </div>

      <div className="mb-8 space-y-3">
        <Skeleton width={310} height={32} />
        <Skeleton width="55%" height={14} />
      </div>

      <div className="mb-4 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton
            key={index}
            width={112}
            height={40}
            className="shrink-0 rounded-xl"
          />
        ))}
      </div>

      <div className="mb-8 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-[1fr_224px_208px] dark:border-gray-800 dark:bg-gray-900">
        <Skeleton width="100%" height={42} className="rounded-xl" />
        <Skeleton width="100%" height={42} className="rounded-xl" />
        <Skeleton width="100%" height={42} className="rounded-xl" />
      </div>

      <Skeleton width={120} height={14} className="mb-5" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <DocumentCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </main>
)

export default DocumentLoading
