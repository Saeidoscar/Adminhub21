import { test, expect } from "@playwright/test"

const API_URL = process.env.API_URL || "http://localhost:8787"

let accessToken: string
let userId: string

async function registerAndGetToken(request: any, role: "employer" | "admin" = "employer") {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
  const password = "password123"

  const registerRes = await request.post(`${API_URL}/api/auth/register`, {
    data: {
      email,
      password,
      role,
      nameEn: "E2E User",
      nameFa: "کاربر تست",
    },
  })
  expect(registerRes.ok()).toBe(true)
  const data = await registerRes.json()
  accessToken = data.accessToken
  userId = data.user.id
}

test.describe("Auth E2E", () => {
  test("register and login", async ({ request }) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

    const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: {
        email,
        password: "password123",
        role: "employer",
        nameEn: "Test User",
        nameFa: "کاربر تست",
      },
    })

    expect(registerResponse.ok()).toBeTruthy()
    const registerData = await registerResponse.json()
    expect(registerData.user).toBeDefined()
    expect(registerData.accessToken).toBeDefined()

    const meResponse = await request.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${registerData.accessToken}`,
      },
    })

    expect(meResponse.ok()).toBeTruthy()
    const meData = await meResponse.json()
    expect(meData.user.id).toBe(registerData.user.id)
  })

  test("login returns tokens", async ({ request }) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
    const password = "password123"

    await request.post(`${API_URL}/api/auth/register`, {
      data: {
        email,
        password,
        role: "employer",
        nameEn: "Login User",
        nameFa: "کاربر لاگین",
      },
    })

    const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email,
        password,
      },
    })

    expect(loginResponse.ok()).toBeTruthy()
    const loginData = await loginResponse.json()
    expect(loginData.accessToken).toBeDefined()
  })
})

test.describe("Packages E2E", () => {
  test.beforeAll(async ({ request }) => {
    await registerAndGetToken(request, "admin")
  })

  test("create package", async ({ request }) => {
    const response = await request.post(`${API_URL}/api/packages`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        name: "Test Package",
        description: "A test package",
        type: "platform",
        platforms: ["telegram", "instagram"],
        platformConfigs: [
          { platform: "telegram", settings: {} },
          { platform: "instagram", settings: {} },
        ],
        priceToman: 1000000,
        priceUSD: 0,
        billingCycle: "monthly",
        deliveryTime: "7 days",
        featured: false,
        active: true,
      },
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.package).toBeDefined()
    expect(data.package.name).toBe("Test Package")
  })
})

test.describe("Tickets E2E", () => {
  test.beforeAll(async ({ request }) => {
    await registerAndGetToken(request)
  })

  test("create ticket and send message", async ({ request }) => {
    const ticketResponse = await request.post(`${API_URL}/api/tickets`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        subject: "Test Ticket",
        category: "technical",
        priority: "medium",
      },
    })

    expect(ticketResponse.ok()).toBeTruthy()
    const ticketData = await ticketResponse.json()
    expect(ticketData.ticket).toBeDefined()
    const ticketId = ticketData.ticket.id

    const messageResponse = await request.post(
      `${API_URL}/api/tickets/${ticketId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          body: "Hello, this is a test message",
        },
      },
    )

    expect(messageResponse.ok()).toBeTruthy()
    const messageData = await messageResponse.json()
    expect(messageData.message).toBeDefined()
    expect(messageData.message.body).toBe("Hello, this is a test message")
  })
})
