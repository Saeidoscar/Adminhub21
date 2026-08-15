import Container from "@/components/shared/Container"
import Link from "next/link"
import { TbArrowRight, TbShieldLock } from "react-icons/tb"

export default function Page() {
  return (
    <Container className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200">
            <TbShieldLock className="text-3xl" />
          </div>
          <p className="text-xs font-semibold text-primary">
            دادلاین؛ عدالت برای همه
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">
            404
          </p>
          <h1 className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-50">
            دسترسی محدود شده است!
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            متأسفانه شما اجازه دسترسی به این صفحه را ندارید.
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <Link
            href="/pishkhan"
            className="button inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <TbArrowRight className="text-lg" />
            بازگشت به پیشخوان
          </Link>
        </div>
      </div>
    </Container>
  )
}
