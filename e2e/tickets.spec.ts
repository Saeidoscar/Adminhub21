import { test, expect } from "@playwright/test"

const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

async function registerAndLogin(request: any) {
  const email = uniqueEmail("ticket")
  const password = "password123"

  const registerRes = await request.post("/api/auth/register", {
    data: {
      email,
      password,
      role: "employer",
      nameEn: "Test User",
      nameFa: "کاربر تست",
    },
  })
  expect(registerRes.ok()).toBe(true)

  const loginRes = await request.post("/api/auth/login", {
    data: { email, password },
  })
  expect(loginRes.ok()).toBe(true)
  const loginBody = await loginRes.json()
  return loginBody.accessToken as string
}

test.describe("Send message flow", () => {
  test("should create ticket and send message", async ({ request }) => {
    const accessToken = await registerAndLogin(request)

    const ticketRes = await request.post("/api/tickets", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        subject: "E2E Test Ticket",
        category: "technical",
        priority: "high",
      },
    })

    expect(ticketRes.ok()).toBe(true)
    const ticketBody = await ticketRes.json()
    expect(ticketBody.ticket).toBeDefined()
    expect(ticketBody.ticket.subject).toBe("E2E Test Ticket")
    const ticketId = ticketBody.ticket.id

    const messageRes = await request.post(`/api/tickets/${ticketId}/messages`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        body: "Hello, this is an E2E test message",
      },
    })

    expect(messageRes.ok()).toBe(true)
    const messageBody = await messageRes.json()
    expect(messageBody.message).toBeDefined()
    expect(messageBody.message.body).toBe("Hello, this is an E2E test message")
    expect(messageBody.message.ticketId).toBe(ticketId)
  })
})
