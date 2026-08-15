import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react"
import type {
  AdminProfile,
  ContractPackage,
  CustomOffer,
  PlatformKey,
  BillingCycle,
} from "@adminhub/shared"
import {
  createOffer,
  createPackage,
  deletePackage as deletePackageApi,
  getAuthToken,
  listAdminProfiles,
  listOffers,
  listPackages,
  updatePackage as updatePackageApi,
} from "../lib/api"

export interface PackageContextValue {
  admins: AdminProfile[]
  packages: ContractPackage[]
  admin: (id: string | number) => AdminProfile | undefined
  packagesForAdmin: (adminId: string) => ContractPackage[]
  pkg: (id: string) => ContractPackage | undefined
  packagesForPlatform: (platform: PlatformKey) => ContractPackage[]
  refresh: () => Promise<void>
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
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [packages, setPackages] = useState<ContractPackage[]>([])
  const [offers, setOffers] = useState<CustomOffer[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const refresh = useCallback(async () => {
    try {
      const [nextAdmins, nextPackages] = await Promise.all([
        listAdminProfiles(),
        listPackages(),
      ])
      setAdmins(nextAdmins)
      setPackages(nextPackages)
    } catch (error) {
      console.warn("Failed to load marketplace data", error)
      setAdmins([])
      setPackages([])
    }

    try {
      if (getAuthToken()) {
        const nextOffers = await listOffers()
        setOffers(nextOffers)
      } else {
        setOffers([])
      }
    } catch (error) {
      console.warn("Failed to load offers", error)
      setOffers([])
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addPackage = useCallback(
    async (
      input: Omit<ContractPackage, "id" | "createdAt" | "updatedAt">,
    ): Promise<ContractPackage> => {
      const pkg = await createPackage(input)
      setPackages((list) => [pkg, ...list])
      return pkg
    },
    [],
  )

  const updatePackage = useCallback(
    async (pkg: ContractPackage): Promise<ContractPackage> => {
      const updated = await updatePackageApi(pkg.id, pkg)
      setPackages((list) =>
        list.map((item) => (item.id === pkg.id ? updated : item)),
      )
      return updated
    },
    [],
  )

  const deletePackage = useCallback(async (id: string): Promise<void> => {
    await deletePackageApi(id)
    setPackages((list) => list.filter((item) => item.id !== id))
  }, [])

  const submitOffer = useCallback(
    async (
      input: Omit<CustomOffer, "id" | "createdAt">,
    ): Promise<CustomOffer> => {
      const offer = await createOffer(input)
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
  const admin = useCallback(
    (id: string | number) =>
      admins.find((profile) => String(profile.id) === String(id)),
    [admins],
  )
  const pkg = useCallback(
    (id: string) => packages.find((item) => item.id === id),
    [packages],
  )
  const packagesForAdmin = useCallback(
    (adminId: string) =>
      packages.filter(
        (item) => item.adminId === adminId && item.active !== false,
      ),
    [packages],
  )
  const packagesForPlatform = useCallback(
    (platform: PlatformKey) =>
      packages.filter(
        (item) => item.platforms.includes(platform) && item.active !== false,
      ),
    [packages],
  )

  const value: PackageContextValue = {
    admins,
    packages,
    admin,
    packagesForAdmin,
    pkg,
    packagesForPlatform,
    refresh,
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
