"use client" /* <div className="text-center">
                <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors">
                    اطلاعات بیشتر
                    <TbArrowLeft size={16} />
                </Link>
            </div> */

import { motion } from "framer-motion"
import Link from "next/link"
import {
  TbScale,
  TbGavel,
  TbCertificate,
  TbUserCheck,
  TbArrowLeft,
} from "react-icons/tb"

const types = [
  {
    icon: <TbScale size={26} />,
    title: "وکیل پایه یک دادگستری",
    desc: "پس از احراز هویت، کد ملی در سامانه استعلام و اطلاعات پروانه وکالت دریافت می‌شود",
    color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: <TbGavel size={26} />,
    title: "قاضی بازنشسته",
    desc: "پس از احراز هویت، بارگذاری مستند شغلی جهت احراز تخصص الزامی است",
    color:
      "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
  },
  {
    icon: <TbCertificate size={26} />,
    title: "کارشناس رسمی دادگستری",
    desc: "پس از احراز هویت، کد ملی در سامانه استعلام و اطلاعات مجوز دریافت می‌شود",
    color:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: <TbUserCheck size={26} />,
    title: "متخصصان حقوقی",
    desc: "پس از احراز هویت، بارگذاری مدرک تحصیلی یا مستند شغلی جهت احراز الزامی است",
    color:
      "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
  },
]

const StartRequirements = () => (
  <section id="conditions" className="py-20 px-4">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-primary font-medium text-sm mb-3">شرایط ثبت‌نام</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          چه افرادی می‌توانند ثبت‌نام کنند؟
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
          کلیه خدمات حقوقی دادلاین توسط وکلای پایه یک دادگستری، قضات بازنشسته،
          کارشناسان رسمی دادگستری و کلیه متخصصان حقوقی احراز هویت‌شده ارائه
          می‌گردد
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {types.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.color}`}
            >
              {t.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">
                {t.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      {}
    </div>
  </section>
)

export default StartRequirements
