export default function PricingLoading() {
  return (
    <main
      className="min-h-screen animate-pulse bg-gray-50/70 pb-20 pt-24 dark:bg-gray-950"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">در حال دریافت تعرفه خدمات...</span>
      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-9 w-52 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="mt-7 h-12 w-full max-w-xl rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="mt-5 h-6 w-full max-w-2xl rounded-lg bg-gray-100 dark:bg-gray-800/70" />
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="h-14 bg-gray-100 dark:bg-gray-800" />
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="grid grid-cols-[140px_1fr_150px] gap-5 border-t border-gray-100 px-5 py-5 dark:border-gray-800"
            >
              <div className="h-6 rounded-lg bg-gray-100 dark:bg-gray-800" />
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-800/70" />
              </div>
              <div className="h-6 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
