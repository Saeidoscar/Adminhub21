import LegalDocumentsHero from "./_components/LegalDocumentsHero"
import LegalDocumentsMethods from "./_components/LegalDocumentsMethods"
import DocumentTypeGrid from "./_components/DocumentTypeGrid"
import LegalDocumentsFAQ from "./_components/LegalDocumentsFAQ"

export const metadata = {
  title: "تنظیم اوراق قضایی | دادلاین",
  description:
    "تنظیم دادخواست، لایحه، قرارداد، شکواییه و اظهارنامه با هوش مصنوعی حقوقی دادبات یا دریافت پیشنهاد قیمت از وکلای متخصص.",
}

const LegalDocumentsPage = () => (
  <>
    <LegalDocumentsHero />
    <LegalDocumentsMethods />
    <DocumentTypeGrid />
    <LegalDocumentsFAQ />
  </>
)

export default LegalDocumentsPage
