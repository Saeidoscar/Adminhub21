import { useState, useCallback } from "react"
import type {
  ContractPackage,
  PlatformKey,
  PackageType,
  BillingCycle,
  PlatformConfig,
} from "@adminhub/shared"
import { usePackages } from "../contexts/PackageContext"
import { emptyPlatformConfig } from "../components/packages/platformSpecs"

export interface PackageFormState {
  name: string
  description: string
  type: PackageType
  platforms: PlatformKey[]
  priceToman: string
  priceUSD: string
  billingCycle: BillingCycle
  deliveryTime: string
  featured: boolean
  active: boolean
  platformConfigs: PlatformConfig[]
}

export interface UsePackageFormOptions {
  onSuccess?: () => void
}

export function usePackageForm({ onSuccess }: UsePackageFormOptions = {}) {
  const { addPackage, updatePackage } = usePackages()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<PackageFormState>({
    name: "",
    description: "",
    type: "platform",
    platforms: [],
    priceToman: "",
    priceUSD: "",
    billingCycle: "monthly",
    deliveryTime: "",
    featured: false,
    active: true,
    platformConfigs: [],
  })

  const resetForm = useCallback(() => {
    setForm({
      name: "",
      description: "",
      type: "platform",
      platforms: [],
      priceToman: "",
      priceUSD: "",
      billingCycle: "monthly",
      deliveryTime: "",
      featured: false,
      active: true,
      platformConfigs: [],
    })
    setEditingId(null)
    setErrors({})
  }, [])

  const startEdit = useCallback((pkg: ContractPackage) => {
    setEditingId(pkg.id)
    setForm({
      name: pkg.name,
      description: pkg.description,
      type: pkg.type,
      platforms: pkg.platforms,
      priceToman: String(pkg.priceToman),
      priceUSD: String(pkg.priceUSD),
      billingCycle: pkg.billingCycle,
      deliveryTime: pkg.deliveryTime,
      featured: pkg.featured,
      active: pkg.active,
      platformConfigs: pkg.platformConfigs,
    })
    setErrors({})
  }, [])

  const togglePlatform = useCallback((p: PlatformKey) => {
    setForm((f) => {
      const next = f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p]
      return {
        ...f,
        platforms: next,
        platformConfigs: next.map((pl) => {
          const existing = f.platformConfigs.find((c) => c.platform === pl)
          return existing ?? emptyPlatformConfig(pl)
        }),
      }
    })
  }, [])

  const updateConfig = useCallback(
    (platform: PlatformKey, field: string, value: unknown) => {
      setForm((f) => ({
        ...f,
        platformConfigs: f.platformConfigs.map((c) =>
          c.platform === platform
            ? { ...c, settings: { ...c.settings, [field]: value } }
            : c,
        ),
      }))
    },
    [],
  )

  const validate = useCallback((): boolean => {
    const fieldErrors: Record<string, string> = {}
    if (!form.name.trim()) fieldErrors.name = "Required"
    if (form.platforms.length === 0) fieldErrors.platforms = "Select at least one platform"
    if (!form.priceToman.trim() || isNaN(Number(form.priceToman)))
      fieldErrors.priceToman = "Valid price required"
    if (!form.priceUSD.trim() || isNaN(Number(form.priceUSD)))
      fieldErrors.priceUSD = "Valid price required"
    if (!form.deliveryTime.trim()) fieldErrors.deliveryTime = "Required"
    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }, [form])

  const handleSubmit = useCallback(async () => {
    if (!validate()) return

    const now = new Date().toISOString()
    const payload = {
      adminId: "current",
      name: form.name,
      description: form.description,
      type: form.type,
      platforms: form.platforms,
      platformConfigs: form.platformConfigs,
      priceToman: parseInt(form.priceToman) || 0,
      priceUSD: parseInt(form.priceUSD) || 0,
      billingCycle: form.billingCycle,
      deliveryTime: form.deliveryTime || "Within 24h",
      featured: form.featured,
      active: form.active,
      createdAt: now,
      updatedAt: now,
    }

    try {
      if (editingId) {
        await updatePackage({ ...payload, id: editingId })
      } else {
        await addPackage(payload)
      }
      resetForm()
      onSuccess?.()
    } catch {
      setErrors({ submit: "Failed to save package" })
    }
  }, [editingId, form, validate, addPackage, updatePackage, resetForm, onSuccess])

  const setF = useCallback(
    (k: string, v: string | boolean) =>
      setForm((f) => ({ ...f, [k]: v })),
    [],
  )

  return {
    form,
    editingId,
    errors,
    setFormField: setF,
    togglePlatform,
    updateConfig,
    startEdit,
    resetForm,
    handleSubmit,
    validate,
  }
}
