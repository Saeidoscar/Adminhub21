import { auth } from "@/auth"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

export async function GET() {
  const session = await auth()

  if (!session?.accessToken) {
    return Response.json(
      { message: "برای مشاهده اطلاعات پیشخوان وارد شوید." },
      { status: 401 },
    )
  }

  const response = await fetch(`${API_INTERNAL_URL}/v1/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    cache: "no-store",
  })

  const body = await response.json().catch(() => null)

  return Response.json(body ?? {}, { status: response.status })
}
