"use client"

import { motion } from "framer-motion"
import {
  TbFolder,
  TbRobot,
  TbCalendar,
  TbBook,
  TbReceipt,
  TbChecklist,
  TbFileText,
  TbMessageCircle,
  TbShield,
  TbUsers,
  TbClock,
  TbUserPlus,
} from "react-icons/tb"

const features = [
  {
    icon: <TbFolder size={24} />,
    title: "مدیریت کامل پرونده‌ها",
    desc: "پیگیری دقیق پرونده‌ها، زمان‌بندی جلسات دادرسی، ثبت مستندات و اطلاعات موکلان، همه در یک پنجره جامع",
    color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: <TbRobot size={24} />,
    title: "دستیار هوش مصنوعی",
    desc: "دستیار هوشمند ۳۶۰ درجه جهت ثبت وظایف پیشنهادی، تولید لایحه، دادخواست، تعیین استراتژی و ...",
    color:
      "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
  },
  {
    icon: <TbCalendar size={24} />,
    title: "تقویم حقوقی با یادآوری",
    desc: "مدیریت کامل رویدادها، جلسات با تنظیم انواع یادآوری‌ها به روش پیامکی، پوش نوتیفیکیشن و تلگرام",
    color:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: <TbBook size={24} />,
    title: "دسترسی کامل به قوانین",
    desc: "آرشیو کامل از قوانین به همراه آرای وحدت رویه، نظریه‌های مشورتی، ترمینولوژی و سایر مستندات حقوقی",
    color:
      "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: <TbReceipt size={24} />,
    title: "سیستم حسابداری دفتر",
    desc: "مدیریت مالی ساده و شفاف با امکان صدور، ارسال و پرداخت فاکتور برای موکلین و ثبت کلیه درآمد و هزینه‌ها",
    color: "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30",
  },
  {
    icon: <TbChecklist size={24} />,
    title: "مدیریت وظیفه و پیگیری‌ها",
    desc: "امکان تعریف وظایف مختلف برای هر پرونده با تنظیم تاریخ مهلت انجام و مسئول انجام وظیفه",
    color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30",
  },
  {
    icon: <TbFileText size={24} />,
    title: "عقد قرارداد و امضاء آنلاین",
    desc: "امکان ایجاد انواع قراردادهای وکالت به همراه احراز هویت طرفین، امضا و انعقاد آنلاین",
    color:
      "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30",
  },
  {
    icon: <TbMessageCircle size={24} />,
    title: "ارتباط مستقیم با موکلین",
    desc: "موکلین به‌راحتی روند پرونده خود را مشاهده و پیگیری می‌کنند، بدون نیاز به تماس تلفنی مکرر",
    color: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30",
  },
  {
    icon: <TbShield size={24} />,
    title: "امنیت و حفاظت داده‌ها",
    desc: "رمزگذاری چندلایه و پشتیبان‌گیری منظم از داده و مستندات پرونده‌ها در سرورهای امن",
    color:
      "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: <TbUsers size={24} />,
    title: "سیستم موکلین و اشخاص",
    desc: "سیستم مدیریت موکلین و اشخاص پرونده با امکان ثبت، استعلام و کسب درآمد دائمی از اشخاص ثبت‌شده",
    color:
      "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
  },
  {
    icon: <TbClock size={24} />,
    title: "مدیریت ثبت ساعت کارکرد",
    desc: "ثبت دقیق عملکرد به‌صورت مجزا برای هر پرونده یا عملکرد آزاد + محاسبه حق مشاوره بر اساس تایمر",
    color:
      "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: <TbUserPlus size={24} />,
    title: "سیستم منشی و همکار",
    desc: "امکان ثبت بی‌نهایت منشی یا دستیار با تعریف دسترسی‌های مختلف + دریافت یادآوری‌ها توسط منشی‌ها",
    color: "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30",
  },
]

const LawOfficeFeatures = () => (
  <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-3">
          ویژگی‌ها و امکانات
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          نرم‌افزار ابری مدیریت دفتر وکالت
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
          مجموعه‌ای از نیازمندی‌های حقوقی شما در یک سامانه — مخصوص وکلا و متخصصان
          حقوقی ایرانی
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}
            >
              {f.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default LawOfficeFeatures
