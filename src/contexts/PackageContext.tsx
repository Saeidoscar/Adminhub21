import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react"
import type {
  AdminProfile,
  ContractPackage,
  CustomOffer,
  PlatformKey,
  BillingCycle,
} from "../lib/types"
import {
  ADMIN_PROFILES,
  ALL_PACKAGES,
  ALL_OFFERS,
  adminById,
  packagesByAdmin,
  packageById,
  packagesByPlatform,
} from "../lib/mockPackages"

export interface PackageContextValue {
  admins: AdminProfile[]
  packages: ContractPackage[]
  admin: (id: string | number) => AdminProfile | undefined
  packagesForAdmin: (adminId: string) => ContractPackage[]
  pkg: (id: string) => ContractPackage | undefined
  packagesForPlatform: (platform: PlatformKey) => ContractPackage[]
  refresh: () => void
  addPackage: (
    input: Omit<ContractPackage, "id" | "createdAt" | "updatedAt">,
  ) => Promise<ContractPackage>
  updatePackage: (pkg: ContractPackage) => Promise<ContractPackage>
  deletePackage: (id: string) => Promise<void>
  submitOffer: (
    offer: Omit<CustomOffer, "id" | "createdAt">,
  ) => Promise<CustomOffer>
  offers: CustomOffer[]
  comparison: {
    selected: Set<string>
    toggle: (id: string) => void
    clear: () => void
    add: (id: string) => void
    has: (id: string) => boolean
  }
}

const PackageContext = createContext<PackageContextValue>(null as never)

export function usePackages() {
  return useContext(PackageContext)
}

export function PackageProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<ContractPackage[]>([...ALL_PACKAGES])
  const [offers, setOffers] = useState<CustomOffer[]>([...ALL_OFFERS])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const mutate = useCallback(
    (fn: (list: ContractPackage[]) => ContractPackage[]) => {
      setPackages(fn)
    },
    [],
  )

  const addPackage = useCallback(
    async (
      input: Omit<ContractPackage, "id" | "createdAt" | "updatedAt">,
    ): Promise<ContractPackage> => {
      const now = new Date().toISOString()
      const pkg: ContractPackage = {
        ...input,
        id: `pkg-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      }
      mutate((list) => [pkg, ...list])
      return pkg
    },
    [mutate],
  )

  const updatePackage = useCallback(
    async (pkg: ContractPackage): Promise<ContractPackage> => {
      const now = new Date().toISOString()
      const updated = { ...pkg, updatedAt: now }
      mutate((list) => list.map((p) => (p.id === pkg.id ? updated : p)))
      return updated
    },
    [mutate],
  )

  const deletePackage = useCallback(
    async (id: string): Promise<void> => {
      mutate((list) => list.filter((p) => p.id !== id))
    },
    [mutate],
  )

  const submitOffer = useCallback(
    async (
      input: Omit<CustomOffer, "id" | "createdAt">,
    ): Promise<CustomOffer> => {
      const now = new Date().toISOString()
      const offer: CustomOffer = {
        ...input,
        id: `offer-${Date.now()}`,
        createdAt: now,
      }
      setOffers((list) => [offer, ...list])
      return offer
    },
    [],
  )

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clear = useCallback(() => setSelected(new Set()), [])
  const add = useCallback(
    (id: string) => setSelected((prev) => new Set(prev).add(id)),
    [],
  )
  const has = useCallback((id: string) => selected.has(id), [selected])
  const packagesForAdmin = useCallback(
    (adminId: string) => packagesByAdmin(adminId),
    [],
  )
  const packagesForPlatform = useCallback(
    (platform: PlatformKey) => packagesByPlatform(platform),
    [],
  )

  const value: PackageContextValue = {
    admins: ADMIN_PROFILES,
    packages,
    admin: adminById,
    packagesForAdmin,
    pkg: packageById,
    packagesForPlatform,
    refresh: () => {
      setPackages([...ALL_PACKAGES])
      setOffers([...ALL_OFFERS])
    },
    addPackage,
    updatePackage,
    deletePackage,
    submitOffer,
    offers,
    comparison: { selected, toggle, clear, add, has },
  }

  return (
    <PackageContext.Provider value={value}>{children}</PackageContext.Provider>
  )
}

export type {
  AdminProfile,
  ContractPackage,
  CustomOffer,
  PlatformKey,
  BillingCycle,
}
