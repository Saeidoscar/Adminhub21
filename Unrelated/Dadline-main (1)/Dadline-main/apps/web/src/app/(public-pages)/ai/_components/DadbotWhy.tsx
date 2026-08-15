"use client" /* متن */ /* ویژگی‌ها */

import { motion } from "framer-motion"
import { TbBolt, TbBook, TbShield, TbClock } from "react-icons/tb"

const features = [
  {
    icon: <TbBolt size={22} />,
    title: "سرعت بالا",
    desc: "تحلیل سریع داده‌های حقوقی و دسترسی لحظه‌ای به قوانین و مقررات",
  },
  {
    icon: <TbBook size={22} />,
    title: "جامع و مستند",
    desc: "دسترسی به نظریه‌های مشورتی، آرای وحدت رویه و کلیه منابع حقوقی ایران",
  },
  {
    icon: <TbShield size={22} />,
    title: "محرمانه و امن",
    desc: "اطلاعات شما کاملاً محرمانه نگهداری می‌شود و در اختیار هیچ شخص ثالثی قرار نمی‌گیرد",
  },
  {
    icon: <TbClock size={22} />,
    title: "۲۴ ساعته",
    desc: "در هر ساعت از شبانه‌روز، بدون نوبت‌گیری، پاسخ سوالات حقوقی خود را دریافت کنید",
  },
]

const DadbotWhy = () => (
  <section className="py-20 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-violet-600 dark:text-violet-400 font-medium text-sm mb-3">
            چرا دادبات؟
          </p>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            چرا از هوش مصنوعی حقوقی
            <br />
            <span className="bg-linear-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              دادبات استفاده کنیم؟
            </span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
            دادبات با تحلیل سریع داده‌های حقوقی و دسترسی لحظه‌ای به قوانین، مقررات
            و مستندات رسمی ایران از جمله نظریه‌های مشورتی، آرای وحدت رویه و سایر
            منابع معتبر، امکان ارائه راهنمایی حقوقی اولیه، بررسی متون، ارزیابی
            ریسک و تهیه پیش‌نویس اسناد را با دقت و سرعتی فراتر از روش‌های سنتی
            فراهم می‌کند.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            این سامانه با پاسخ‌های شفاف و مستند، به کاربر کمک می‌کند پیش از مراجعه
            به وکیل تصویر روشنی از وضعیت حقوقی خود به‌دست آورد و زمان و هزینه‌های
            اضافی را کاهش دهد.
          </p>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, x: +50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex flex-col gap-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
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
        </motion.div>
      </div>
    </div>
  </section>
)

export default DadbotWhy
