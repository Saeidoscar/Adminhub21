import { test, expect } from "@playwright/test"

const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

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
  return loginBody.accessToken as string
}

test.describe("Create package flow", () => {
  test("should create a package as admin", async ({ request }) => {
    const accessToken = await registerAndLogin(request, "admin")

    const response = await request.post("/api/packages", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        name: "Test Package",
        description: "A test package for E2E testing",
        type: "platform",
        platforms: ["instagram", "telegram"],
        platformConfigs: [
          { platform: "instagram", settings: { followers: 1000 } },
          { platform: "telegram", settings: { members: 500 } },
        ],
        priceToman: 4500000,
        priceUSD: 108,
        billingCycle: "monthly",
        deliveryTime: "Within 24h",
        featured: false,
        active: true,
      },
    })

    expect(response.ok()).toBe(true)
    const body = await response.json()
    expect(body.package).toBeDefined()
    expect(body.package.name).toBe("Test Package")
    expect(body.package.platforms).toEqual(["instagram", "telegram"])
    expect(body.package.priceUSD).toBe(108)
  })
})
