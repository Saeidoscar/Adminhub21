import FaqClient from "./FaqClient"

export interface FaqItem {
  id: string | number
  q: string
  a: string
}

export interface FaqProps {
  faqs: FaqItem[]
  title?: string
  description?: string
}

const Faq = ({ faqs, title, description }: FaqProps) => {
  if (!faqs || faqs.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {title || "سوالات متداول"}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400">
          در حال حاضر سوالی وجود ندارد
        </p>
      </div>
    )
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {title || "سوالات متداول"}
          </h2>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
        <FaqClient faqs={faqs} />
      </div>
    </>
  )
}

export default Faq
