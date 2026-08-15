// const { data } = useGetChanges()
// const changes = data ?? []

type ChangeType = "feature" | "fix" | "improvement"

interface Change {
  id: number
  version: string
  date: string
  type: ChangeType
  changes: string[]
}

const mockChanges: Change[] = [
  {
    id: 1,
    version: "v2.3.0",
    date: "1405/04/12",
    type: "feature",
    changes: [
      "افزوده شدن داشبورد جدید کاربران",
      "امکان مدیریت اعلان‌ها",
      "بهبود سرعت بارگذاری صفحات",
    ],
  },
  {
    id: 2,
    version: "v2.2.5",
    date: "1405/04/05",
    type: "fix",
    changes: [
      "رفع مشکل ورود کاربران",
      "رفع خطای ارسال درخواست‌های خدمات",
      "بهبود عملکرد نسخه موبایل",
    ],
  },
  {
    id: 3,
    version: "v2.2.0",
    date: "1405/03/28",
    type: "improvement",
    changes: [
      "بازطراحی صفحه پروفایل",
      "بهبود رابط کاربری فرم‌ها",
      "افزوده شدن انیمیشن‌های جدید",
    ],
  },
]

const badge = {
  feature: {
    title: "ویژگی جدید",
    className: "bg-emerald-100 text-emerald-700",
  },
  fix: {
    title: "رفع باگ",
    className: "bg-red-100 text-red-700",
  },
  improvement: {
    title: "بهبود",
    className: "bg-blue-100 text-blue-700",
  },
}

const ChangesPage = () => {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">تغییرات و بروزرسانی‌ها</h1>

          <p className="mt-4 text-gray-500">
            آخرین امکانات، بهبودها و رفع مشکلات دادلاین
          </p>
        </div>

        <div className="space-y-8">
          {mockChanges.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{item.version}</h2>

                  <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${badge[item.type].className}`}
                >
                  {badge[item.type].title}
                </span>
              </div>

              <ul className="space-y-3">
                {item.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary" />

                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default ChangesPage
