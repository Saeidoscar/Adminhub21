import Container from "@/components/shared/Container"
import Skeleton from "@/components/ui/Skeleton"

export default function QuestionsLoading() {
  return (
    <Container>
      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton height={32} width={260} />
          <Skeleton className="mt-4" height={18} width="70%" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <Skeleton height={20} width="35%" />
              <Skeleton className="mt-5" height={24} width="80%" />
              <Skeleton className="mt-3" height={16} />
              <Skeleton className="mt-2" height={16} width="85%" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}
