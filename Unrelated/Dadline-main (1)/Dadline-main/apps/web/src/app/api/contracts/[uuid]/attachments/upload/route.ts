import { auth } from "@/auth"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

type RouteContext = {
  params: Promise<{ uuid: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ message: "برای آپلود پیوست وارد شوید." }, {
      status: 401,
    })
  }

  const { uuid } = await context.params
  const formData = await request.formData()
  const response = await fetch(
    `${API_INTERNAL_URL}/v1/contracts/${encodeURIComponent(uuid)}/attachments/upload`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: formData,
      cache: "no-store",
    },
  )

  const body = await response.json().catch(() => null)

  return Response.json(body ?? {}, { status: response.status })
}
