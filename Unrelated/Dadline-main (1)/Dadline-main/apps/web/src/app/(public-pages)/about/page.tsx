import Link from "next/link"
import {
  TbBuildingBank,
  TbScale,
  TbUsers,
  TbRocket,
  TbShield,
  TbArrowLeft,
  TbExternalLink,
  TbCertificate,
  TbAward,
} from "react-icons/tb"

export const metadata = {
  title: "درباره ما | دادلاین",
  description:
    "دادلاین، پلتفرم هوشمند خدمات حقوقی ایران — شرکت دانش‌بنیان توسعه تجارت کارزاد",
}

const stats = [
  { value: "200+", label: "وکیل و متخصص فعال" },
  { value: "5000+", label: "کاربر ثبت‌نام‌شده" },
  { value: "1000+", label: "مشاوره انجام‌شده" },
  { value: "4.9", label: "امتیاز رضایت کاربران" },
]

const values = [
  {
    icon: <TbScale size={24} />,
    title: "عدالت برای همه",
    desc: "باور داریم دسترسی به خدمات حقوقی باید برای همه شهروندان ایران آسان، سریع و مقرون‌به‌صرفه باشد.",
    color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: <TbShield size={24} />,
    title: "امنیت و اعتماد",
    desc: "تمامی متخصصان احراز هویت شده‌اند و اطلاعات کاربران با رمزگذاری چندلایه محافظت می‌شود.",
    color:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: <TbRocket size={24} />,
    title: "نوآوری مستمر",
    desc: "با بهره‌گیری از هوش مصنوعی و فناوری‌های نوین، خدمات حقوقی را متحول می‌کنیم.",
    color:
      "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
  },
  {
    icon: <TbUsers size={24} />,
    title: "جامعه‌محور",
    desc: "دادلاین بستری برای تعامل سازنده میان وکلا، متخصصان و کاربران برای ارتقای آگاهی حقوقی جامعه است.",
    color:
      "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
  },
]

const licenses = [
  {
    title: "نماد اعتماد الکترونیکی",
    subtitle: "اینماد — وزارت صنعت، معدن و تجارت",
    icon: <TbCertificate size={28} />,
    color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
    href: "https://trustseal.enamad.ir/?id=553054&code=YWplyjGCpDzzDhTauznMgO7Lxv9SPrdD",
    badge: "معتبر",
    badgeColor:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    title: "شرکت دانش‌بنیان",
    subtitle: "معاونت علمی و فناوری ریاست جمهوری",
    icon: <TbAward size={28} />,
    color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
    href: "https://pub.daneshbonyan.ir",
    badge: "تأییدشده",
    badgeColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    title: "مجوز ارائه خدمات حقوقی آنلاین",
    subtitle: "کانون وکلای دادگستری ایران",
    icon: <TbScale size={28} />,
    color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
    href: "#",
    badge: "در حال اخذ",
    badgeColor:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  {
    title: "عضو اتحادیه کسب و کارهای مجازی",
    subtitle: "درگاه ملی مجوزها",
    icon: <TbBuildingBank size={28} />,
    color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
    href: "https://qr.mojavez.ir/track/3010790",
    badge: "معتبر",
    badgeColor:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
]

const AboutPage = () => (
  <>
    <main className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <TbBuildingBank size={16} />
            شرکت دانش‌بنیان توسعه تجارت کارزاد
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            دادلاین؛
            <br />
            <span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              عدالت برای همه
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mx-auto leading-relaxed mb-8">
            دادلاین یک پلتفرم هوشمند ارائه خدمات حقوقی است که با هدف دموکراتیزه
            کردن دسترسی به عدالت، مشاوره حقوقی آنلاین، مدیریت پرونده، قراردادهای
            الکترونیکی و هوش مصنوعی حقوقی را در یک سامانه یکپارچه فراهم می‌کند.
          </p>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {licenses.map((license) => (
              <a
                key={license.title}
                href={license.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${license.color}`}
                  >
                    {license.icon}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-lg ${license.badgeColor}`}
                  >
                    {license.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-primary transition-colors">
                    {license.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {license.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-primary transition-colors mt-auto">
                  <TbExternalLink size={12} />
                  مشاهده مجوز
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 items-center">
          <div>
            <p className="text-primary font-medium text-sm mb-3">مأموریت ما</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
              دسترسی آسان به عدالت، حق همه است
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
              در دادلاین باور داریم که هر شهروند ایرانی، صرف‌نظر از موقعیت
              جغرافیایی یا وضعیت مالی، باید به خدمات حقوقی باکیفیت دسترسی داشته
              باشد. از روستا تا کلان شهر، عدالت برای همه.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              با ترکیب فناوری هوش مصنوعی، شبکه‌ای از وکلای متخصص احراز هویت‌شده و
              یک پلتفرم کاربرپسند، فرآیندهای حقوقی را ساده، سریع و شفاف کرده‌ایم.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                همکاری با دادلاین
                <TbArrowLeft size={17} />
              </Link>
              <Link
                href="/changelog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-medium hover:bg-white/10 transition-colors text-sm"
              >
                آخرین به‌روزرسانی‌ها
              </Link>
            </div>
          </div>
          <div className="bg-linear-to-br from-primary/5 to-blue-500/5 rounded-3xl p-8 border border-primary/10">
            <div className="grid grid-cols-2 gap-4">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.color}`}
                  >
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                      {v.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  </>
)

export default AboutPage
