import Container from "@/components/shared/Container"
import Skeleton from "@/components/ui/Skeleton"
import type { ReactNode } from "react"

const CardSkeleton = ({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) => (
  <div
    className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
  >
    {children}
  </div>
)

const ContractSingleSkeleton = () => {
  return (
    <Container className="min-w-0 space-y-5">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <Skeleton height={30} width={220} />
          <div className="flex flex-wrap gap-2">
            <Skeleton height={24} width={90} />
            <Skeleton height={24} width={170} />
            <Skeleton height={24} width={110} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton height={40} width={150} />
          <Skeleton height={40} width={120} />
        </div>
      </div>

      <CardSkeleton>
        <div className="grid min-w-0 gap-4 xl:grid-cols-[112px_minmax(0,1fr)_220px]">
          <div className="flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900">
            <Skeleton height={96} width={96} />
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/60"
              >
                <Skeleton height={14} width="45%" />
                <Skeleton className="mt-3" height={18} width="78%" />
                <Skeleton className="mt-3" height={14} width="55%" />
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 xl:self-center">
            <Skeleton height={40} width="100%" />
            <Skeleton height={40} width="100%" />
          </div>
        </div>
      </CardSkeleton>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <CardSkeleton>
            <div className="mb-4 flex items-center justify-between gap-3">
              <Skeleton height={24} width={130} />
              <Skeleton height={36} width={44} />
            </div>
            <div className="space-y-4">
              <div>
                <Skeleton height={14} width={90} />
                <Skeleton className="mt-2" height={44} width="100%" />
              </div>
              <div>
                <Skeleton height={14} width={120} />
                <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2 bg-gray-100 p-3 dark:bg-gray-700">
                    {[0, 1, 2, 3, 4, 5].map((item) => (
                      <Skeleton key={item} height={32} width={32} />
                    ))}
                  </div>
                  <div className="space-y-3 bg-white p-4 dark:bg-gray-900">
                    <Skeleton height={20} width="72%" />
                    <Skeleton height={16} width="100%" />
                    <Skeleton height={16} width="96%" />
                    <Skeleton height={16} width="88%" />
                    <Skeleton height={16} width="94%" />
                    <Skeleton height={16} width="76%" />
                    <Skeleton height={220} width="100%" />
                  </div>
                </div>
              </div>
            </div>
          </CardSkeleton>
        </div>

        <div className="order-first flex min-w-0 flex-col gap-5 xl:order-0">
          <CardSkeleton>
            <Skeleton height={22} width={150} />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                >
                  <Skeleton height={16} width="60%" />
                  <Skeleton className="mt-2" height={14} width="42%" />
                  <Skeleton className="mt-3" height={24} width="100%" />
                </div>
              ))}
            </div>
          </CardSkeleton>

          <CardSkeleton>
            <Skeleton height={22} width={90} />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} height={44} width="100%" />
              ))}
            </div>
          </CardSkeleton>
        </div>
      </div>
    </Container>
  )
}

export default ContractSingleSkeleton
