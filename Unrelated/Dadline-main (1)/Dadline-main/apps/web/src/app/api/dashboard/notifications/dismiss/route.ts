import { auth } from "@/auth"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.accessToken) {
    return Response.json({ message: "برای مدیریت اعلان‌ها وارد شوید." }, {
      status: 401,
    })
  }

  const body = await request.json().catch(() => null)

  const response = await fetch(
    `${API_INTERNAL_URL}/v1/auth/me/notifications/dismiss`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    },
  )

  const payload = await response.json().catch(() => null)

  return Response.json(payload ?? {}, { status: response.status })
}
