import { getContractBasePricing } from "@/server/actions/contracts/getContracts"
import ContractWorkspace from "../_components/ContractWorkspace"

export default async function Page() {
  const pricing = await getContractBasePricing()

  return <ContractWorkspace basePricing={pricing.pricing} />
}
