import Link from "next/link"

const Page = () => {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-lg">صفحه اصلی</span>
      <span className="text-red-600 text-base">
        همه منوهای نوار کناری (سایدبار) به صفحه اصلی لینک خورده اند. هیچ صفحه
        جداگانهای برای آنها ساخته نشده و فقط جنبه نمایشی دارند. به عبارت دیگر،
        روت (مسیرهای مجزا) برای این منوها تعریف نشده است.
      </span>
      <Link href="/pishkhan/contracts">ورود به قراردادها </Link>
    </div>
  )
}

export default Page
