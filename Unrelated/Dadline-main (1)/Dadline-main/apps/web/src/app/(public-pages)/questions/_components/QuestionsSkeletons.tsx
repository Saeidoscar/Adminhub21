export function QuestionsListSkeleton() {
  return (
    <main
      className="min-h-screen animate-pulse px-4 pb-16 pt-24"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">در حال دریافت پرسش‌های حقوقی...</span>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-3">
          <div className="h-9 w-72 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-full max-w-xl rounded bg-gray-100 dark:bg-gray-800/70" />
        </div>
        <div className="mb-8 h-12 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-3">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-4 flex gap-2">
                  <div className="h-6 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-6 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="h-5 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-3 h-4 w-full rounded bg-gray-100 dark:bg-gray-800/70" />
                <div className="mt-2 h-4 w-3/5 rounded bg-gray-100 dark:bg-gray-800/70" />
              </div>
            ))}
          </div>
          <div className="space-y-5">
            <div className="h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
            <div className="h-56 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
          </div>
        </div>
      </div>
    </main>
  )
}

export function QuestionDetailSkeleton() {
  return (
    <main
      className="min-h-screen animate-pulse px-4 pb-16 pt-24"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">در حال دریافت جزئیات پرسش...</span>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 h-5 w-52 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <article className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex gap-2">
                <div className="h-6 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-6 w-24 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="h-8 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800/70" />
                <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800/70" />
                <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-800/70" />
              </div>
            </article>
            <div className="mt-8 space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-40 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                />
              ))}
            </div>
          </div>
          <div className="space-y-5 lg:col-span-1">
            <div className="h-12 rounded-xl bg-primary/30" />
            <div className="h-32 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
            <div className="h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
            <div className="h-56 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
          </div>
        </div>
      </div>
    </main>
  )
}
