const SkeletonBlock = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 ${className}`}
  />
)

export default function ContentDetailSkeleton() {
  return (
    <div
      className="bg-gray-50/70 pb-20 dark:bg-gray-950"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">در حال بارگذاری جزئیات مطلب...</span>

      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          <SkeletonBlock className="h-5 w-40" />
          <div className="mt-5 max-w-4xl">
            <SkeletonBlock className="h-7 w-28 rounded-full" />
            <SkeletonBlock className="mt-5 h-10 w-11/12" />
            <SkeletonBlock className="mt-3 h-10 w-3/4" />
            <SkeletonBlock className="mt-5 h-5 w-full" />
            <SkeletonBlock className="mt-2 h-5 w-2/3" />
            <div className="mt-6 flex flex-wrap gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-4 w-24" />
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <main className="min-w-0">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <SkeletonBlock className="mb-8 aspect-[16/8] w-full rounded-2xl" />
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  className={`h-5 ${index % 4 === 3 ? "w-2/3" : "w-full"}`}
                />
              ))}
            </div>
            <div className="mt-8 flex gap-2 border-t border-gray-200 pt-6 dark:border-gray-800">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-8 w-20 rounded-full" />
              ))}
            </div>
            <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
              <SkeletonBlock className="h-24 w-full rounded-2xl" />
              <SkeletonBlock className="mt-6 h-36 w-full rounded-2xl" />
            </div>
          </article>

          <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <SkeletonBlock className="h-7 w-28" />
            <SkeletonBlock className="mt-6 h-28 w-full rounded-2xl" />
            <SkeletonBlock className="mt-4 h-28 w-full rounded-2xl" />
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <SidebarSkeleton rows={2} />
          <SidebarSkeleton rows={4} />
          <SidebarSkeleton rows={3} />
        </aside>
      </div>
    </div>
  )
}

function SidebarSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <SkeletonBlock className="h-6 w-32" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonBlock
            key={index}
            className={`h-10 ${index % 2 === 0 ? "w-full" : "w-4/5"}`}
          />
        ))}
      </div>
    </div>
  )
}
