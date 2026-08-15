import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"
const WALLET_PATH = "/pishkhan/wallet"
const SUPPORTED_GATEWAYS = new Set(["gateway", "sep", "zibal"])

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{
    gateway: string
  }>
}

export async function GET(request: Request, context: RouteContext) {
  return proxyGatewayCallback(request, context)
}

export async function POST(request: Request, context: RouteContext) {
  return proxyGatewayCallback(request, context)
}

async function proxyGatewayCallback(request: Request, context: RouteContext) {
  const { gateway } = await context.params

  if (!SUPPORTED_GATEWAYS.has(gateway)) {
    return redirectToWallet(request, "failed")
  }

  const incomingUrl = new URL(request.url)
  const callbackUrl = `${API_INTERNAL_URL}/v1/payments/${gateway}/callback?${incomingUrl.searchParams.toString()}`
  const response = await fetch(callbackUrl, {
    method: request.method,
    headers: forwardHeaders(request),
    body: await requestBody(request),
    cache: "no-store",
  }).catch(() => null)

  return redirectToWallet(request, response?.ok ? "success" : "failed")
}

function forwardHeaders(request: Request): Headers {
  const headers = new Headers({
    Accept: "application/json",
  })
  const contentType = request.headers.get("content-type")

  if (contentType) {
    headers.set("Content-Type", contentType)
  }

  return headers
}

async function requestBody(request: Request): Promise<BodyInit | undefined> {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined
  }

  const body = await request.arrayBuffer()

  return body.byteLength > 0 ? body : undefined
}

function redirectToWallet(request: Request, status: "success" | "failed") {
  const url = new URL(WALLET_PATH, request.url)
  url.searchParams.set("payment", status)

  revalidateTag("wallet:dashboard", "max")

  return NextResponse.redirect(url)
}
