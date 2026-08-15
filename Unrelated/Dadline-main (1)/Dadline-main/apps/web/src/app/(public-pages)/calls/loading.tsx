export default function CallsLoading() {
  return (
    <main
      className="min-h-screen animate-pulse px-4 pb-16 pt-24"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">در حال دریافت فهرست مشاوران...</span>
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-2xl flex-col items-center py-8">
          <div className="h-8 w-48 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="mt-5 h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="mt-3 h-5 w-4/5 rounded bg-gray-100 dark:bg-gray-800/70" />
        </div>
        <div className="mb-7 h-28 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-56 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex gap-3">
                <div className="h-14 w-14 rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-800/70" />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-6 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-6 w-20 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="mt-6 h-12 rounded-xl bg-gray-100 dark:bg-gray-800/70" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
