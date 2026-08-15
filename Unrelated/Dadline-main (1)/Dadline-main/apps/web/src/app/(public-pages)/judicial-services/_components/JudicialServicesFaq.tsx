import Faq from "@/components/template/Faq"
import { faqs } from "../_data/judicial-services"

const JudicialServicesFaq = () => (
  <section
    id="faq"
    className="border-t border-gray-200 bg-gray-50/70 px-4 py-20 dark:border-gray-800 dark:bg-gray-950/30 sm:px-6 lg:px-8 lg:py-24"
  >
    <div className="mx-auto max-w-7xl">
      <Faq
        faqs={faqs}
        title="پاسخ به پرسش‌های پرتکرار شما"
        description="اگر درباره فرایند ثبت درخواست، احراز هویت، پیگیری پرونده، دریافت نتیجه یا محرمانگی اطلاعات سؤالی دارید، این بخش کمک می‌کند سریع‌تر به پاسخ برسید."
      />
    </div>
  </section>
)

export default JudicialServicesFaq
