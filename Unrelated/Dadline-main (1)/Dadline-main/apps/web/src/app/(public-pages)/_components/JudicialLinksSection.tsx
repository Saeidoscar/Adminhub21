"use client"

import { motion } from "framer-motion"
import { TbExternalLink } from "react-icons/tb"

const judicialLinks = [
  { title: "سامانه عدل ایران", href: "https://adliran.ir/" },
  {
    title: "سامانه ابلاغ",
    href: "https://eblagh.adliran.ir/Dashboard/NoticeIndex",
  },
  { title: "سامانه ثنا", href: "https://sana.adliran.ir/" },
  { title: "سامانه ثبت من", href: "https://my.ssaa.ir/" },
  { title: "سامانه ملی آرای قضایی", href: "https://ara.jri.ac.ir/" },
  {
    title: "محاسبه هزینه دادرسی",
    href: "https://adliran.ir/Home/JSSCalculateCash",
  },
  { title: "درگاه ملی قوه قضاییه", href: "https://eadl.ir/" },
  { title: "کانون وکلا", href: "https://icbar.ir/" },
]

const JudicialLinksSection = () => {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            دسترسی سریع به سامانه‌های قضایی
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            لینک‌های مستقیم به سامانه‌های رسمی قوه قضاییه
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {judicialLinks.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-sm transition-all group text-sm"
            >
              <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary transition-colors">
                {link.title}
              </span>
              <TbExternalLink
                size={14}
                className="text-gray-400 group-hover:text-primary transition-colors shrink-0"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default JudicialLinksSection
