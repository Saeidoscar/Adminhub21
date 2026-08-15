"use client"

import { motion } from "framer-motion"
import { TbCheck } from "react-icons/tb"
import type { DocTypeContent } from "../../_data/legal-documents"

const DocTypeUseCases = ({ data }: { data: DocTypeContent }) => (
  <section className="py-16 px-4">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          چه زمانی به {data.shortLabel} نیاز دارید؟
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.useCases.map((useCase, i) => (
          <motion.div
            key={useCase}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${data.color.bg} ${data.color.text}`}
            >
              <TbCheck size={14} />
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {useCase}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default DocTypeUseCases
