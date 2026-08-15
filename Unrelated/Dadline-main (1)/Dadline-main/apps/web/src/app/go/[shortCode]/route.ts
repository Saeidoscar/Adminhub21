import { NextResponse } from "next/server"
import { resolveShortLink } from "@/server/actions/short-links/resolveShortLink"

export const dynamic = "force-dynamic"

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dadline.net"
).replace(/\/$/, "")

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await params

  if (!/^[A-Za-z0-9]{1,10}$/.test(shortCode)) {
    return new Response("Not Found", { status: 404 })
  }

  const originalUrl = await resolveShortLink(shortCode)

  if (!originalUrl) {
    return new Response("Not Found", { status: 404 })
  }

  let destination: URL

  try {
    destination = new URL(originalUrl, SITE_URL)
  } catch {
    return new Response("Not Found", { status: 404 })
  }

  const response = NextResponse.redirect(destination, 302)
  response.headers.set("Cache-Control", "no-store")

  return response
}
