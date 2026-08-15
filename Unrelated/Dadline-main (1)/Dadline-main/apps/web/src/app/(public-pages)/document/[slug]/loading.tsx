import Skeleton from "@/components/ui/Skeleton"

const DocumentDetailLoading = () => (
  <main className="min-h-screen px-4 pt-24 pb-16" aria-busy="true">
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} width={index === 3 ? 160 : 72} height={14} />
        ))}
      </div>

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton width={72} height={24} />
            <Skeleton width={80} height={24} />
          </div>
          <Skeleton width={360} height={34} />
          <Skeleton width={128} height={24} />
        </div>
        <Skeleton width={42} height={42} className="rounded-xl" />
      </div>

      <Skeleton
        width="100%"
        height={46}
        className="mb-6 rounded-xl lg:hidden"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <Skeleton width={96} height={20} />
              <Skeleton width={104} height={12} />
            </div>
            <div className="space-y-3">
              <Skeleton width="100%" height={14} />
              <Skeleton width="95%" height={14} />
              <Skeleton width="88%" height={14} />
              <Skeleton width="72%" height={14} />
              <Skeleton width="90%" height={14} />
            </div>
            <div className="mt-8 flex gap-5 border-t border-gray-100 pt-5 dark:border-gray-800">
              <Skeleton width={88} height={12} />
              <Skeleton width={72} height={12} />
              <Skeleton width={128} height={12} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex justify-between">
              <Skeleton width={64} height={14} />
              <Skeleton width={104} height={20} />
            </div>
            <Skeleton width="100%" height={46} className="rounded-xl" />
            <Skeleton width="70%" height={12} className="mx-auto" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <Skeleton width={88} height={16} className="mb-4" />
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" width={48} height={48} />
              <div className="flex-1 space-y-2">
                <Skeleton width={112} height={14} />
                <Skeleton width={88} height={12} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton width={128} height={22} className="mb-5" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-2xl border border-gray-200 p-5 dark:border-gray-800"
            >
              <Skeleton width={72} height={20} />
              <Skeleton width="100%" height={16} />
              <Skeleton width="70%" height={16} />
              <div className="flex items-center gap-2">
                <Skeleton variant="circle" width={32} height={32} />
                <Skeleton width={92} height={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </main>
)

export default DocumentDetailLoading
