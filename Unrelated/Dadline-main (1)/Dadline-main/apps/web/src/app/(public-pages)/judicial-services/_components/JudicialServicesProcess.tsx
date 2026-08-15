"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  TbClock,
  TbFileCheck,
  TbFileDescription,
  TbRoute,
  TbSearch,
  TbUserCheck,
} from "react-icons/tb"
import Container from "@/components/shared/Container"
import SectionHeading from "./SectionHeading"

const processSteps = [
  {
    number: "۱",
    title: "ثبت پیش‌نویس و مدارک",
    description:
      "اطلاعات درخواست را مرحله‌به‌مرحله تکمیل کنید و مدارک و مستندات مرتبط را در همان پیش‌نویس بارگذاری کنید.",
    icon: TbFileDescription,
    iconClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    number: "۲",
    title: "احراز هویت و ثبت اولیه",
    description:
      "پس از تکمیل پیش‌نویس، احراز هویت انجام می‌شود و درخواست برای ورود به فرایند رسمی، ثبت اولیه خواهد شد.",
    icon: TbUserCheck,
    iconClass:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300",
  },
  {
    number: "۳",
    title: "بررسی کارشناس",
    description:
      "کارشناس اطلاعات و مدارک را بررسی می‌کند و در صورت وجود نقص یا ابهام، موارد لازم از طریق پنل اعلام می‌شود.",
    icon: TbSearch,
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",
  },
  {
    number: "۴",
    title: "ثبت نهایی",
    description:
      "پس از تأیید کارشناسی و تکمیل الزامات، درخواست مطابق ضوابط مربوط برای ثبت نهایی ارسال می‌شود.",
    icon: TbFileCheck,
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    number: "۵",
    title: "پیگیری درخواست",
    description:
      "وضعیت ثبت، پیام‌های احتمالی، رفع نقص و نتیجه درخواست را از پنل کاربری خود مشاهده و پیگیری کنید.",
    icon: TbClock,
    iconClass:
      "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-300",
  },
]

const JudicialServicesProcess = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-gray-200 bg-gray-50/80 py-20 dark:border-gray-800 dark:bg-gray-950/50 lg:py-24"
    >
      <Container className="px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="مسیر ثبت درخواست"
          title="از ثبت پیش‌نویس تا پیگیری نهایی در پنج گام روشن"
          description="فرایند ثبت خدمات قضایی به مراحل مشخص و قابل پیگیری تقسیم شده است؛ در هر گام می‌دانید درخواست در چه وضعیتی قرار دارد و اقدام بعدی چیست."
          icon={<TbRoute aria-hidden size={18} />}
        />

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((step, index) => {
            const Icon = step.icon

            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  bounce: 0.1,
                  delay: index * 0.08,
                }}
                viewport={{ once: true }}
                className="relative p-3"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.span
                      layoutId="processHoverBackground"
                      className="absolute inset-0 block size-full rounded-3xl bg-gray-200/70 dark:bg-zinc-800/80"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { duration: 0.15 },
                      }}
                      exit={{
                        opacity: 0,
                        transition: {
                          duration: 0.15,
                          delay: 0.15,
                        },
                      }}
                    />
                  )}
                </AnimatePresence>

                <div className="group relative z-10 flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`flex size-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${step.iconClass}`}
                    >
                      <Icon aria-hidden size={26} />
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-xs font-black text-primary">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-base font-black leading-7 text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export default JudicialServicesProcess
