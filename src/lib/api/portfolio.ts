import { apiFetch, unwrapList, unwrapItem } from "./core"

export interface PortfolioRow {
  id: string
  adminId: string
  title: string
  description: string
  mediaUrl: string
  mediaType: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export async function listAdminPortfolio(
  adminId: string,
): Promise<PortfolioRow[]> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/portfolio/admin/${adminId}`,
  )
  return unwrapList<PortfolioRow>(payload, "portfolio")
}

export async function getAdminPortfolio(
  id: string,
): Promise<PortfolioRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/portfolio/${id}`,
  )
  return unwrapItem<PortfolioRow>(payload, "portfolio")
}

export async function createAdminPortfolio(data: {
  title: string
  description: string
  mediaUrl: string
  mediaType: string
  tags?: string[]
}): Promise<PortfolioRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/portfolio", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const portfolio = unwrapItem<PortfolioRow>(payload, "portfolio")
  if (!portfolio) {
    throw new Error("Create portfolio response was empty")
  }
  return portfolio
}

export async function updateAdminPortfolio(
  id: string,
  data: Partial<{
    title: string
    description: string
    mediaUrl: string
    mediaType: string
    tags: string[]
  }>,
): Promise<PortfolioRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/portfolio/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  )
  const portfolio = unwrapItem<PortfolioRow>(payload, "portfolio")
  if (!portfolio) {
    throw new Error("Update portfolio response was empty")
  }
  return portfolio
}

export async function deleteAdminPortfolio(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/portfolio/${id}`, {
    method: "DELETE",
  })
}
