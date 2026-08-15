"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TbChevronDown } from "react-icons/tb"

const faqs = [
  {
    q: "ویژگی‌های کلیدی نرم‌افزار دادلاین چیست؟",
    a: "مدیریت پرونده، دستیار هوش مصنوعی، تقویم حقوقی با یادآوری، دسترسی به قوانین، سیستم حسابداری، مدیریت وظایف، امضای آنلاین، ارتباط با موکلین، امنیت داده، مدیریت موکلین، ثبت ساعت کارکرد و سیستم منشی و همکار.",
  },
  {
    q: "آیا دادلاین دسترسی به قوانین و مقررات ایران را فراهم می‌کند؟",
    a: "بله، دادلاین آرشیو کاملی از قوانین ایران به همراه آرای وحدت رویه، نظریه‌های مشورتی، ترمینولوژی حقوقی و سایر مستندات رسمی را در اختیار کاربران قرار می‌دهد.",
  },
  {
    q: "هوش مصنوعی در نرم‌افزار دادلاین چگونه به وکلا کمک می‌کند؟",
    a: "دستیار هوشمند دادلاین می‌تواند وظایف پیشنهادی ثبت کند، لایحه و دادخواست تولید کند، استراتژی پرونده تعیین کند و به صورت ۳۶۰ درجه در تمام مراحل کار وکالت همراه شما باشد.",
  },
  {
    q: "آیا امکان امضای آنلاین قراردادها و مستندات وجود دارد؟",
    a: "بله، امکان ایجاد انواع قراردادهای وکالت به همراه احراز هویت طرفین، امضای دیجیتال و انعقاد آنلاین قرارداد در دادلاین فراهم است.",
  },
  {
    q: "تفاوت اشتراک پایه و ویژه در نرم‌افزار دادلاین چیست؟",
    a: "اشتراک پایه رایگان و برای همیشه است با ۱ پرونده فعال همزمان و ۳٬۰۰۰ توکن. اشتراک ویژه ۳۰۰ هزار تومان در ماه است با پرونده نامحدود، ۲۵٬۰۰۰ توکن و تسویه روزانه. کلیه امکانات نرم‌افزار در هر دو اشتراک فعال است.",
  },
  {
    q: "آیا امکان واگذاری کارهای وکالت به همکاران و منشی‌ها وجود دارد؟",
    a: "بله، می‌توانید تعداد نامحدودی منشی یا دستیار با دسترسی‌های مختلف تعریف کنید. منشی‌ها نیز می‌توانند یادآوری‌ها دریافت کنند و وظایف محوله را مدیریت کنند.",
  },
  {
    q: "آیا دادلاین برای وکلای مستقل و دفاتر وکالت مناسب است؟",
    a: "بله، دادلاین هم برای وکلای مستقل و هم برای دفاتر وکالت با چندین وکیل طراحی شده است. سیستم منشی و همکار امکان کار تیمی را فراهم می‌کند.",
  },
  {
    q: "چطور می‌توانم نرم‌افزار دادلاین را دریافت و فعال‌سازی کنم؟",
    a: "سه گام ساده: ۱) ثبت‌نام با شماره موبایل ۲) ثبت درخواست همکاری به عنوان متخصص حقوقی ۳) پس از تأیید، در کمتر از ۱ دقیقه نرم‌افزار را دانلود و فعال کنید.",
  },
]

const FAQItem = ({ q, a }: { q: string a: string }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white text-sm">
          {q}
        </span>
        <TbChevronDown
          size={18}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const LawOfficeFAQ = () => (
  <section id="questions" className="py-20 px-4">
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          سوالات متداول
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          پاسخ سوالات رایج درباره نرم‌افزار مدیریت دفتر وکالت دادلاین
        </p>
      </motion.div>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <FAQItem q={faq.q} a={faq.a} />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default LawOfficeFAQ
