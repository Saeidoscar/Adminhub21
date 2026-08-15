"use client"

import { useState } from "react"
import { TbChevronDown } from "react-icons/tb"
import { motion, AnimatePresence } from "framer-motion"

interface FaqItem {
  id: string | number
  q: string
  a: string
}

const FAQItem = ({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FaqItem
  isOpen: boolean
  onToggle: () => void
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-colors duration-200 hover:border-gray-300 dark:hover:border-gray-600">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
        className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
      >
        <h3 className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
          {faq.q}
        </h3>
        <TbChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`answer-${faq.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              id={`faq-answer-${faq.id}`}
              role="region"
              aria-labelledby={`faq-question-${faq.id}`}
              className="px-5 pb-5 text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4"
            >
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FaqClient = ({ faqs }: { faqs: FaqItem[] }) => {
  const [openFaqId, setOpenFaqId] = useState<string | number | null>(null)

  const toggleFaq = (id: string | number) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  return (
    <div className="flex flex-col gap-3" role="list">
      {faqs.map((faq) => (
        <div key={faq.id} role="listitem">
          <FAQItem
            faq={faq}
            isOpen={openFaqId === faq.id}
            onToggle={() => toggleFaq(faq.id)}
          />
        </div>
      ))}
    </div>
  )
}

export default FaqClient
