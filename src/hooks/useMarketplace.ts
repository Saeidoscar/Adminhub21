import { useState, useEffect, useCallback } from "react"
import type { ContractRow, Contract, FavoriteRow, AdminProfile } from "@adminhub/shared"
import {
  listContracts,
  getContract,
  updateContractStatus,
  listFavorites,
  addFavorite,
  removeFavorite,
} from "../lib/api"
import { filterAndSortAdmins, isFavoriteAdmin, toggleFavoriteService, loadMarketplaceData } from "../services/marketplaceService"
import type { MarketplaceFilters } from "../services/marketplaceService"

export function useContracts() {
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContracts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listContracts()
      setContracts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contracts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadContracts()
  }, [loadContracts])

  const updateStatus = useCallback(async (contractId: string, status: string) => {
    const updated = await updateContractStatus(contractId, { status: status as Contract["status"] })
    setContracts((prev) => prev.map((c) => (c.id === contractId ? updated : c)))
    return updated
  }, [])

  const viewContract = useCallback(async (id: string): Promise<Contract | null> => {
    const contract = await getContract(id)
    return contract
  }, [])

  return { contracts, loading, error, loadContracts, updateStatus, viewContract }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRow[]>([])
  const [favLoading, setFavLoading] = useState<Record<string, boolean>>({})

  const loadFavorites = useCallback(async () => {
    try {
      const data = await listFavorites()
      setFavorites(data)
    } catch {
      setFavorites([])
    }
  }, [])

  const toggleFavorite = useCallback(async (adminId: string) => {
    setFavLoading((prev) => ({ ...prev, [adminId]: true }))
    try {
      const isFav = isFavoriteAdmin(favorites, adminId)
      if (isFav) {
        await removeFavorite(adminId)
      } else {
        await addFavorite(adminId)
      }
      setFavorites((prev) => toggleFavoriteService(prev, adminId, isFav))
    } catch {
      // silently fail
    } finally {
      setFavLoading((prev) => {
        const next = { ...prev }
        delete next[adminId]
        return next
      })
    }
  }, [favorites])

  const isFavorite = useCallback((adminId: string) => {
    return isFavoriteAdmin(favorites, adminId)
  }, [favorites])

  return { favorites, favLoading, loadFavorites, toggleFavorite, isFavorite }
}

export function useMarketplace(filters: MarketplaceFilters) {
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { loadFavorites, favorites, favLoading, toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { admins: profiles } = await loadMarketplaceData()
        if (!cancelled) {
          setAdmins(profiles)
        }
        if (!cancelled) {
          void loadFavorites()
        }
      } catch {
        if (!cancelled) {
          setAdmins([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [loadFavorites])

  const filtered = filterAndSortAdmins(admins, filters)

  return { admins, filtered, loading, favorites, favLoading, toggleFavorite, isFavorite }
}
