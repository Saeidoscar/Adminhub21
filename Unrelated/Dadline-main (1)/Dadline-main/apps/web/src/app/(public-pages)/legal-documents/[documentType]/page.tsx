import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Faq from "@/components/template/Faq"
import { docsData, DOCUMENT_TYPES_LIST } from "../_data/legal-documents"
import type { DocType } from "../_data/legal-documents"
import DocTypeHero from "./_components/DocTypeHero"
import DocTypeUseCases from "./_components/DocTypeUseCases"
import DocTypeSiblings from "./_components/DocTypeSiblings"

type Props = { params: Promise<{ documentType: string }> }

export async function generateStaticParams() {
  return DOCUMENT_TYPES_LIST.map((t) => ({ documentType: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { documentType } = await params
  const data = docsData[(documentType as DocType)]
  if (!data) return { title: "صفحه یافت نشد | دادلاین" }
  return {
    title: `${data.title} | دادلاین`,
    description: data.heroDescription,
  }
}

const DocTypePage = async ({ params }: Props) => {
  const { documentType } = await params
  const data = docsData[(documentType as DocType)]
  if (!data) notFound()

  return (
    <>
      <DocTypeHero data={data} />
      <DocTypeUseCases data={data} />
      <section className="py-4 px-4">
        <Faq
          faqs={data.faq}
          description={`سؤالات متداول درباره تنظیم ${data.shortLabel}`}
        />
      </section>
      <DocTypeSiblings current={data.slug} />
    </>
  )
}

export default DocTypePage
