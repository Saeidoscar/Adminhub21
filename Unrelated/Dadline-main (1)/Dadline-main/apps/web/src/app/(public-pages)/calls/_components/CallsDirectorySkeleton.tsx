export default function CallsDirectorySkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">در حال دریافت فهرست مشاوران...</span>
      <div className="mb-8 grid animate-pulse gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`h-11 rounded-xl bg-gray-100 dark:bg-gray-800 ${
              index === 0 ? "sm:col-span-2 lg:col-span-3 xl:col-span-2" : ""
            }`}
          />
        ))}
      </div>
      <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-56 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex gap-3">
              <div className="h-14 w-14 rounded-xl bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-800/70" />
              </div>
            </div>
            <div className="mt-6 h-6 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mt-6 h-12 rounded-xl bg-gray-100 dark:bg-gray-800/70" />
          </div>
        ))}
      </div>
    </div>
  )
}
