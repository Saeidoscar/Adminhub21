import { NextResponse } from "next/server"

import { apiBaseUrl } from "@/lib/api"
import { getSessionToken } from "@/lib/session"

/**
 * Streams a contract PDF from the API to the browser.
 *
 * The token lives in an httpOnly cookie, so the browser cannot call the API
 * directly; this route is the only place it is attached.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = await getSessionToken()

  if (!token) {
    // A relative Location keeps this correct behind a proxy, where the request
    // host is not the public host.
    return new NextResponse(null, {
      status: 307,
      headers: {
        Location: `/sign-in?redirectUrl=${encodeURIComponent(`/app/contracts/${id}`)}`,
      },
    })
  }

  try {
    const response = await fetch(`${apiBaseUrl()}/api/v1/contracts/${encodeURIComponent(id)}/pdf`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
      cache: "no-store",
    })

    if (!response.ok || !response.body) {
      return NextResponse.json(
        {
          message:
            response.status === 404 ? "فایل PDF هنوز تولید نشده است." : "دریافت فایل ممکن نشد.",
        },
        { status: response.status || 502 },
      )
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/pdf",
        "Content-Disposition":
          response.headers.get("Content-Disposition") ??
          `attachment; filename="contract-${id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch {
    return NextResponse.json({ message: "ارتباط با سرویس برقرار نشد." }, { status: 502 })
  }
}
