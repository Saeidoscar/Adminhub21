"use client"

import { motion } from "framer-motion"
import {
  TbRobot,
  TbBook,
  TbFileText,
  TbBuildingBank,
  TbUsers,
  TbShoppingBag,
} from "react-icons/tb"

const features = [
  {
    icon: <TbRobot size={26} />,
    title: "دستیار هوش مصنوعی",
    desc: "بهره‌مندی از پیشرفته‌ترین مدل هوش مصنوعی حقوقی با پاسخگویی‌های دقیق منطبق با قوانین",
    color:
      "from-violet-500/10 to-violet-600/5 border-violet-200 dark:border-violet-900",
    iconColor:
      "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
  },
  {
    icon: <TbBook size={26} />,
    title: "دسترسی کامل به قوانین",
    desc: "آرشیو کامل از قوانین به همراه آرای وحدت رویه، نظریه‌های مشورتی، ترمینولوژی و سایر مستندات حقوقی",
    color:
      "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-900",
    iconColor:
      "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: <TbFileText size={26} />,
    title: "عقد قرارداد و امضاء آنلاین",
    desc: "امکان ایجاد انواع قراردادهای وکالت به همراه احراز هویت طرفین، امضا و انعقاد آنلاین",
    color:
      "from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-900",
    iconColor:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: <TbBuildingBank size={26} />,
    title: "نرم‌افزار مدیریت دفتر وکلا",
    desc: "دسترسی به به‌روزترین نرم‌افزار مدیریت دفتر ویژه وکلا با امکاناتی مانند مدیریت پرونده‌ها، اعلان‌ها و ...",
    color:
      "from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-900",
    iconColor:
      "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: <TbUsers size={26} />,
    title: "ارائه خدمات متنوع",
    desc: "ارائه خدمات متنوع حقوقی به کاربران اعم از مشاوره‌های تلفنی و متنی، ارزیابی پرونده‌ها، تنظیم مستندات و ...",
    color:
      "from-rose-500/10 to-rose-600/5 border-rose-200 dark:border-rose-900",
    iconColor:
      "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30",
  },
  {
    icon: <TbShoppingBag size={26} />,
    title: "فروشگاه محصولات حقوقی",
    desc: "امکان عرضه و فروش محصولات حقوقی مانند انواع اظهارنامه، دادخواست، قرارداد، شکواییه و ...",
    color:
      "from-cyan-500/10 to-cyan-600/5 border-cyan-200 dark:border-cyan-900",
    iconColor:
      "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30",
  },
]

const StartFeatures = () => (
  <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-primary font-medium text-sm mb-3">
          خدمات و امکانات دادلاین
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          همه ابزارها در یک پلتفرم
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mx-auto">
          پذیرش انواع مشاوره‌های تلفنی و متنی، رسیدگی پرونده‌های حقوقی، تنظیم
          مستندات و ده‌ها خدمت دیگر
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className={`flex flex-col gap-4 p-6 rounded-2xl border bg-linear-to-br ${f.color}`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.iconColor}`}
            >
              {f.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default StartFeatures
