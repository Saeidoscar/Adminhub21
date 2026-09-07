import type { ContractRow } from "@adminhub/shared"
import { apiFetch, unwrapList, unwrapItem } from "./core"

export type { ContractRow }

export interface CreateContractInput {
  offerId?: string
  adminId?: string
  platform: string
  amountToman: number
  amountUSD: number
  hasInsurance: boolean
  hasSubstitute: boolean
  termClause?: string
  substituteClause?: string
  startDate?: string
  endDate?: string
}

export type Contract = ContractRow

export async function createContract(
  input: CreateContractInput,
): Promise<ContractRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/contracts", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const contract = unwrapItem<ContractRow>(payload, "contract")
  if (!contract) {
    throw new Error("Contract creation response was empty")
  }
  return contract
}

export async function getContract(id: string): Promise<ContractRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/contracts/${id}`)
  return unwrapItem<ContractRow>(payload, "contract")
}

export async function updateContractStatus(
  id: string,
  input: { status: ContractRow["status"] },
): Promise<ContractRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/contracts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  )
  const contract = unwrapItem<ContractRow>(payload, "contract")
  if (!contract) {
    throw new Error("Contract update response was empty")
  }
  return contract
}

export interface ListContractsQuery {
  status?: "active" | "pending" | "completed" | "disputed"
  platform?: string
}

export async function listContracts(
  query: ListContractsQuery = {},
): Promise<ContractRow[]> {
  const params = new URLSearchParams()

  if (query.status) {
    params.set("status", query.status)
  }

  if (query.platform) {
    params.set("platform", query.platform)
  }

  const queryString = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/contracts${queryString ? `?${queryString}` : ""}`,
  )

  return unwrapList<ContractRow>(payload, "contracts")
}
