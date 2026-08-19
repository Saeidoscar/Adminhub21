import { test, expect } from "@playwright/test"

const uniqueEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

async function registerAndLogin(request: any, role: "employer" | "admin" = "employer") {
  const email = uniqueEmail(role)
  const password = "password123"

  const registerRes = await request.post("/api/auth/register", {
    data: {
      email,
      password,
      role,
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
  return { accessToken: loginBody.accessToken as string, email }
}

test.describe("Auth flow", () => {
  test("should register a new employer", async ({ request }) => {
    const email = uniqueEmail("register")
    const response = await request.post("/api/auth/register", {
      data: {
        email,
        password: "password123",
        role: "employer",
        nameEn: "Test User",
        nameFa: "کاربر تست",
      },
    })

    expect(response.ok()).toBe(true)
    const body = await response.json()
    expect(body.user).toBeDefined()
    expect(body.user.email).toBe(email)
    expect(body.accessToken).toBeDefined()
  })

  test("should login with valid credentials", async ({ request }) => {
    const { accessToken } = await registerAndLogin(request)

    expect(accessToken).toBeDefined()
    expect(accessToken.length).toBeGreaterThan(0)
  })

  test("should reject login with wrong password", async ({ request }) => {
    const email = uniqueEmail("badlogin")
    await request.post("/api/auth/register", {
      data: { email, password: "password123", role: "employer", nameEn: "Test", nameFa: "تست" },
    })

    const response = await request.post("/api/auth/login", {
      data: { email, password: "wrong-password" },
    })

    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(401)
  })
})
