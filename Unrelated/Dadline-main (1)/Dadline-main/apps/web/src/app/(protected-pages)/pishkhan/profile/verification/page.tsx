import Container from "@/components/shared/Container"
import { getVerification } from "@/server/actions/profile/getVerification"
import VerificationClient from "./_components/VerificationClient"

type PageProps = {
  searchParams?: Promise<{
    payment?: string
    inquiry?: string
    returnContext?: string
  }>
}

const paymentStatus = (value?: string) =>
  value === "success" || value === "failed" ? value : null

const inquiryStatus = (value?: string) =>
  value === "matched" || value === "not_matched" || value === "unavailable"
    ? value
    : null

export default async function Page({ searchParams }: PageProps) {
  const query = (await searchParams) ?? {}
  const status = paymentStatus(query.payment)
  const verificationResult = await getVerification()

  return (
    <Container className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          احراز هویت
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          برای دسترسی به خدمات رسمی دادلاین، مراحل احراز هویت را تکمیل نمایید.
        </p>
      </div>

      {verificationResult.data ? (
        <VerificationClient
          data={verificationResult.data}
          paymentStatus={status}
          inquiryStatus={inquiryStatus(query.inquiry)}
          returnContext={query.returnContext ?? null}
        />
      ) : (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
          {verificationResult.error ?? "وضعیت احراز هویت قابل نمایش نیست."}
        </div>
      )}
    </Container>
  )
}
