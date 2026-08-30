import type { ContractRow, Contract, AdminProfile } from "@adminhub/shared"
import {
  listContracts,
  getContract,
  updateContractStatus,
  createContract,
  listAdminProfiles,
} from "../lib/api"

export async function fetchContracts(): Promise<ContractRow[]> {
  return listContracts()
}

export async function fetchContract(id: string): Promise<ContractRow | null> {
  return getContract(id)
}

export async function changeContractStatus(
  id: string,
  status: ContractRow["status"],
): Promise<ContractRow> {
  return updateContractStatus(id, { status })
}

export async function createContractService(
  input: {
    platform: string
    amountToman: number
    amountUSD: number
    hasInsurance: boolean
    hasSubstitute: boolean
    termClause?: string
    substituteClause?: string
    startDate?: string
    endDate?: string
    adminId?: string
  },
): Promise<ContractRow> {
  return createContract({
    ...input,
    adminId: input.adminId || "current",
  })
}

export async function fetchAdminsForContract(): Promise<AdminProfile[]> {
  return listAdminProfiles()
}

export function contractAmountDisplay(
  contract: Contract,
  lang: "en" | "fa",
): string {
  if (lang === "fa") {
    return `${(contract.amountToman / 1000000).toFixed(1)}M تومان`
  }
  return `$${contract.amountUSD}`
}

export function filterActiveContracts(contracts: ContractRow[]): ContractRow[] {
  return contracts.filter((c) => c.status === "active")
}

export function sumCompletedContractAmounts(
  contracts: ContractRow[],
): { toman: number; usd: number } {
  return contracts
    .filter((c) => c.status === "completed")
    .reduce(
      (acc, c) => ({
        toman: acc.toman + c.amountToman,
        usd: acc.usd + c.amountUSD,
      }),
      { toman: 0, usd: 0 },
    )
}
