"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  TbFileText,
  TbGavel,
  TbFileDescription,
  TbAlertTriangle,
  TbMailForward,
  TbArrowLeft,
  TbLanguage,
} from "react-icons/tb"
import { docsData, DOCUMENT_TYPES_LIST } from "../_data/legal-documents"
import type { DocType } from "../_data/legal-documents"

const iconMap: Record<DocType, ReactNode> = {
  petition: <TbFileText size={26} />,
  bill: <TbGavel size={26} />,
  contract: <TbFileDescription size={26} />,
  complaint: <TbAlertTriangle size={26} />,
  statement: <TbMailForward size={26} />,
  translate: <TbLanguage size={26} />,
}

const DocumentTypeGrid = () => (
  <section id="document-types" className="py-16 px-4 scroll-mt-20">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          نوع سند خود را انتخاب کنید
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          پس از ثبت درخواست تنظیم اوراق قضایی شما، پیشنهادهای مختلفی از سوی
          وکلای دادلاین خدمت شما ارسال خواهد شد
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DOCUMENT_TYPES_LIST.map((t, i) => {
          const data = docsData[t.slug]
          return (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div
                className={`flex flex-col h-full p-6 rounded-2xl border bg-linear-to-br ${data.color.from} ${data.color.to} ${data.color.border} hover:shadow-md transition-all`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${data.color.bg} ${data.color.text}`}
                >
                  {iconMap[t.slug]}
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  تنظیم {data.shortLabel}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 flex-1">
                  {data.tagline}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <Link
                    href={`/pishkhan/legal-documents/${t.slug}`}
                    className={`group inline-flex items-center gap-1.5 text-sm font-semibold ${data.color.text}`}
                  >
                    ثبت درخواست
                    <TbArrowLeft
                      size={16}
                      className="group-hover:-translate-x-1 transition-transform"
                    />
                  </Link>

                  <Link
                    href={`/legal-documents/${t.slug}`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    اطلاعات بیشتر
                  </Link>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  </section>
)

export default DocumentTypeGrid
