"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  TbBrandAndroid,
  TbBrandApple,
  TbBrandWindows,
  TbWorld,
  TbArrowLeft,
} from "react-icons/tb"

const platforms = [
  { icon: <TbBrandAndroid size={22} />, name: "کافه بازار", href: "#" },
  { icon: <TbBrandAndroid size={22} />, name: "سیب اپ", href: "#" },
  { icon: <TbBrandApple size={22} />, name: "App Store", href: "#" },
  { icon: <TbBrandWindows size={22} />, name: "ویندوز", href: "#" },
  { icon: <TbWorld size={22} />, name: "نسخه وب", href: "/sign-up" },
]

const LawOfficeDownload = () => (
  <section id="download" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          همین حالا نرم‌افزار را دانلود کنید
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">
          دادلاین؛ عدالت برای همه
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {platforms.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors text-gray-700 dark:text-gray-300 font-medium text-sm shadow-sm"
            >
              {p.icon}
              {p.name}
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
          >
            ثبت‌نام و شروع رایگان
            <TbArrowLeft size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
)

export default LawOfficeDownload
