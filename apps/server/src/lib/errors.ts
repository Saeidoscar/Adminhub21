import type { ErrorHandler } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const onError: ErrorHandler = (err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      { error: { code: err.code ?? "API_ERROR", message: err.message } },
      err.status as ContentfulStatusCode,
    )
  }

  console.error("[adminhub-api]", err)
  return c.json(
    { error: { code: "INTERNAL", message: "Internal server error" } },
    500,
  )
}
