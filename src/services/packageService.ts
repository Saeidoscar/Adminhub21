import type { ContractPackage, PlatformKey, AdminProfile, CustomOffer } from "@adminhub/shared"
import {
  listAdminProfiles,
  listPackages,
  listOffers,
  createPackage,
  updatePackage,
  deletePackage,
  createOffer,
} from "../lib/api"
import {
  packagesByAdmin,
  packagesByPlatform,
  findAdmin,
  findPackage,
} from "../domain/package"

export async function fetchPackagesWithAdmins(): Promise<{
  admins: AdminProfile[]
  packages: ContractPackage[]
}> {
  const [admins, packages] = await Promise.all([listAdminProfiles(), listPackages()])
  return { admins, packages }
}

export async function fetchOffers(): Promise<CustomOffer[]> {
  return listOffers()
}

export async function createPackageService(
  input: Omit<ContractPackage, "id" | "createdAt" | "updatedAt">,
): Promise<ContractPackage> {
  return createPackage(input)
}

export async function updatePackageService(
  pkg: ContractPackage,
): Promise<ContractPackage> {
  return updatePackage(pkg.id, pkg)
}

export async function deletePackageService(id: string): Promise<void> {
  return deletePackage(id)
}

export async function createOfferService(
  input: Omit<CustomOffer, "id" | "createdAt">,
): Promise<CustomOffer> {
  return createOffer(input)
}
