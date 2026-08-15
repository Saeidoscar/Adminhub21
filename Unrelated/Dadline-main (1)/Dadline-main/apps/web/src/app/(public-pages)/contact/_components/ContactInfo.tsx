"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  TbTicket,
  TbMail,
  TbPhone,
  TbMapPin,
  TbBrandTelegram,
  TbBrandYoutube,
  TbBrandLinkedin,
  TbBrandInstagram,
  TbBrandMessenger,
} from "react-icons/tb"

const cards = [
  {
    icon: <TbTicket size={26} />,
    title: "ثبت تیکت پشتیبانی",
    desc: "سریع‌ترین روش برای دریافت پاسخ — تیم پشتیبانی در کمتر از ۱ ساعت پاسخ می‌دهد",
    value: "ثبت تیکت",
    href: "/pishkhan/tickets/new",
    color: "from-primary/10 to-primary/5 border-primary/20",
    iconColor: "text-primary bg-primary/10",
    isExternal: false,
  },
  {
    icon: <TbMail size={26} />,
    title: "رایانامه",
    desc: "برای مکاتبات رسمی، همکاری‌های تجاری و ارسال مستندات",
    value: "dadlinenet@gmail.com",
    href: "mailto:dadlinenet@gmail.com",
    color:
      "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-900",
    iconColor:
      "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
    isExternal: false,
  },
  {
    icon: <TbPhone size={26} />,
    title: "شماره تماس",
    desc: "پاسخگو در ساعات اداری — شنبه تا چهارشنبه ۸ تا ۱۶",
    value: "۰۵۶۳۲۸۳۱۶۱۶",
    href: "tel:05632831616",
    color:
      "from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-900",
    iconColor:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
    isExternal: false,
  },
  {
    icon: <TbMapPin size={26} />,
    title: "آدرس دفتر",
    desc: "مرکز رشد واحدهای فناور — واحد ۱۰۶",
    value: "خراسان جنوبی، طبس، بلوار بهشتی جنوبی، پلاک ۷۸",
    href: "https://maps.google.com/?q=طبس+خراسان+جنوبی",
    color:
      "from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-900",
    iconColor:
      "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
    isExternal: true,
  },
]

const ContactInfo = () => (
  <section className="py-12 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Link
              href={card.href}
              target={card.isExternal ? "_blank" : undefined}
              rel={card.isExternal ? "noopener noreferrer" : undefined}
              className={`group flex flex-col gap-4 p-6 rounded-2xl border bg-linear-to-br ${card.color} hover:shadow-md transition-all duration-200 h-full`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconColor}`}
              >
                {card.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                  {card.desc}
                </p>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                  {card.value}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <TbBrandTelegram size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              تلگرام دادلاین
            </h4>
            <Link
              href="https://t.me/dadlinenet"
              target="_blank"
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              @dadlinenet
            </Link>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <TbBrandYoutube size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              یوتیوب دادلاین
            </h4>
            <Link
              href="https://www.youtube.com/@dadLinenet"
              target="_blank"
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              @dadlinenet
            </Link>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <TbBrandInstagram size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              اینستاگرام دادلاین
            </h4>
            <Link
              href="https://instagram.com/dadlinenet"
              target="_blank"
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              @dadlinenet
            </Link>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <TbBrandLinkedin size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              لینکدین دادلاین
            </h4>
            <Link
              href="https://ir.linkedin.com/company/dadline"
              target="_blank"
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              @dadline
            </Link>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <TbBrandMessenger size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              ایتا دادلاین
            </h4>
            <Link
              href="https://eitaa.com/dadlinenet"
              target="_blank"
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              @dadlinenet
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
)

export default ContactInfo
