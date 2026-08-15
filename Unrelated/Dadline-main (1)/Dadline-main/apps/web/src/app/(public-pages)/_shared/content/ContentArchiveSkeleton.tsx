const SkeletonBlock = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 ${className}`}
  />
)

export default function ContentArchiveSkeleton() {
  return (
    <div
      className="bg-gray-50/70 pb-20 dark:bg-gray-950"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">در حال بارگذاری فهرست مطالب...</span>

      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <SkeletonBlock className="h-7 w-32 rounded-full" />
            <SkeletonBlock className="mt-4 h-10 w-3/4" />
            <SkeletonBlock className="mt-4 h-5 w-full max-w-2xl" />
            <SkeletonBlock className="mt-2 h-5 w-2/3" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/60"
              >
                <SkeletonBlock className="h-10 w-10 shrink-0" />
                <div className="flex-1">
                  <SkeletonBlock className="h-6 w-16" />
                  <SkeletonBlock className="mt-2 h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <SkeletonBlock className="h-11 lg:col-span-2" />
            <SkeletonBlock className="h-11" />
            <SkeletonBlock className="h-11" />
            <SkeletonBlock className="h-11" />
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonBlock
              key={index}
              className={`h-8 shrink-0 rounded-full ${
                index % 3 === 0 ? "w-24" : "w-20"
              }`}
            />
          ))}
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              {index < 3 && (
                <SkeletonBlock className="h-44 w-full rounded-none" />
              )}
              <div className="p-5">
                <div className="flex justify-between gap-4">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
                <SkeletonBlock className="mt-5 h-6 w-11/12" />
                <SkeletonBlock className="mt-2 h-6 w-3/4" />
                <SkeletonBlock className="mt-5 h-4 w-full" />
                <SkeletonBlock className="mt-2 h-4 w-5/6" />
                <div className="mt-7 flex justify-between gap-4">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-4 w-28" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
