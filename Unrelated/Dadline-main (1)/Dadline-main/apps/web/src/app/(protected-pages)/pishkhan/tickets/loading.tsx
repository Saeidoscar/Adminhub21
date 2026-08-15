import Container from "@/components/shared/Container"

export default function Loading() {
  return (
    <Container>
      <div className="grid min-h-[650px] animate-pulse overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[340px_1fr]">
        <div className="space-y-4 border-l border-gray-200 p-4 dark:border-gray-800">
          <div className="h-8 w-40 rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
        <div className="hidden p-8 md:block">
          <div className="h-full rounded-3xl bg-gray-50 dark:bg-gray-800/50" />
        </div>
      </div>
    </Container>
  )
}
