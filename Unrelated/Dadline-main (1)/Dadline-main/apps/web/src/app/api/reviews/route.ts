import { NextResponse } from "next/server"
import { apiGet } from "@/lib/apiClient"
import type { PublicReview } from "@/@types/reviews"

type ReviewsResponse = {
  data: PublicReview[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const vendor = url.searchParams.get("vendor")
  const page = url.searchParams.get("page") ?? "1"
  const perPage = url.searchParams.get("per_page") ?? "9"

  if (!vendor) {
    return NextResponse.json({ error: "شناسه ارائه‌دهنده الزامی است." }, {
      status: 400,
    })
  }

  const query = new URLSearchParams({
    vendor,
    page,
    per_page: perPage,
  })

  const response = await apiGet<ReviewsResponse>(
    `/reviews?${query.toString()}`,
    undefined,
    { revalidate: false },
  )

  if (!response.ok || !response.data) {
    return NextResponse.json(
      { error: response.error ?? "دریافت دیدگاه‌ها با خطا مواجه شد." },
      { status: response.status || 500 },
    )
  }

  return NextResponse.json(response.data)
}
