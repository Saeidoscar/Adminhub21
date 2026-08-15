const Block = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse bg-gray-200/80 dark:bg-gray-800 ${className}`}
  />
)

export const ProviderProfileSkeleton = () => (
  <main
    className="min-h-screen bg-white dark:bg-gray-950"
    aria-label="در حال بارگذاری پروفایل"
  >
    <section className="border-b border-gray-200 bg-white px-4 pb-24 pt-32 dark:border-gray-800 dark:bg-gray-950 sm:px-8">
      <div className="mx-auto grid min-h-140 max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.75fr]">
        <div className="space-y-6">
          <Block className="h-9 w-52" />
          <Block className="h-16 w-4/5" />
          <Block className="h-5 w-full max-w-2xl" />
          <Block className="h-5 w-3/5" />
          <div className="flex gap-3 pt-4">
            <Block className="h-12 w-44" />
            <Block className="h-12 w-36" />
          </div>
        </div>
        <Block className="mx-auto aspect-4/5 w-full max-w-md rounded-3xl" />
      </div>
    </section>
    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-4">
        <Block className="h-4 w-24" />
        <Block className="h-10 w-64" />
        <Block className="h-5 w-full" />
      </div>
      <div className="space-y-4 border-r-2 border-gray-100 pr-8">
        <Block className="h-5 w-full" />
        <Block className="h-5 w-11/12" />
        <Block className="h-5 w-4/5" />
        <div className="grid grid-cols-2 gap-6 pt-8">
          <Block className="h-28" />
          <Block className="h-28" />
        </div>
      </div>
    </section>
    <section className="bg-gray-50 px-4 py-24 dark:bg-gray-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Block className="mb-10 h-10 w-72" />
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Block key={index} className="h-72" />
          ))}
        </div>
      </div>
    </section>
  </main>
)
