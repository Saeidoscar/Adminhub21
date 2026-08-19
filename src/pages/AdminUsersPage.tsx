import { useState, useEffect, useCallback } from "react"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import {
  listAdminUsers,
  getAdminUser,
  updateAdminUser,
  deleteAdminUser,
  type AdminUserRow,
} from "../lib/api"
import { Skeleton, UserCardSkeleton, ListSkeleton } from "../components/ui/Skeleton"
import { adminUserSchema, type AdminUserInput } from "../lib/validation"

const ROLE_COLORS: Record<string, string> = {
  employer: "bg-emerald-100 text-emerald-700",
  admin: "bg-blue-100 text-blue-700",
  super_admin: "bg-purple-100 text-purple-700",
}

export default function AdminUsersPage({
  tr,
  lang,
}: {
  tr: typeof t["en"] & typeof t["fa"]
  lang: Lang
}) {
  const isFa = lang === "fa"
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null)
  const [editForm, setEditForm] = useState({
    nameEn: "",
    nameFa: "",
    phone: "",
    role: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      })
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const handleEdit = (user: AdminUserRow) => {
    setEditingUser(user)
    setErrors({})
    setEditForm({
      nameEn: user.nameEn,
      nameFa: user.nameFa,
      phone: user.phone || "",
      role: user.role,
    })
  }

  const handleSave = async () => {
    if (!editingUser) return
    const result = adminUserSchema.safeParse({
      nameEn: editForm.nameEn,
      nameFa: editForm.nameFa,
      phone: editForm.phone,
      role: editForm.role,
    })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string
        if (key) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateAdminUser(
        editingUser.id,
        result.data as AdminUserInput,
      )
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setEditingUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(tr.adminUsers.deleteConfirm)) return
    setError(null)
    try {
      await deleteAdminUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isFa ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.adminUsers.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.adminUsers.sub}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            value={search}
            onChange={setSearch}
            placeholder={tr.adminUsers.search}
            label=""
          />
        </div>
        <div className="sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
          >
            <option value="">{tr.adminUsers.allRoles}</option>
            <option value="employer">{tr.adminUsers.employer}</option>
            <option value="admin">{tr.adminUsers.admin}</option>
            <option value="super_admin">{tr.adminUsers.superAdmin}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <ListSkeleton count={4} />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <div className="font-bold text-[#0f172a] mb-1">
            {tr.adminUsers.noUsers}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-5 card-hover"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] font-bold text-lg flex-shrink-0">
                  {(isFa ? user.nameFa : user.nameEn).charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm text-[#0f172a] truncate">
                          {isFa ? user.nameFa : user.nameEn}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700"}`}
                        >
                          {user.role === "employer"
                            ? tr.adminUsers.employer
                            : user.role === "admin"
                              ? tr.adminUsers.admin
                              : tr.adminUsers.superAdmin}
                        </span>
                        {user.phoneVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold flex-shrink-0">
                            <Icon name="check" size={10} />
                            {tr.adminUsers.verified}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#64748b] mb-1 truncate">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-xs text-[#64748b] mb-1">
                          {tr.adminUsers.phone}: {user.phone}
                        </div>
                      )}
                      <div className="text-xs text-[#64748b]">
                        {tr.adminUsers.createdAt}: {formatDate(user.createdAt)}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(user)}
                        className="w-8 h-8 rounded-lg bg-[#f2f5fa] flex items-center justify-center text-[#1e3a5f] hover:bg-[#1e3a5f]/10 transition-colors"
                      >
                        <Icon name="edit" size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-[#0f172a] text-lg mb-4">
              {tr.adminUsers.editUser}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {isFa ? "نام (انگلیسی)" : "Name (English)"}
                </label>
                <Input
                  value={editForm.nameEn}
                  onChange={(v) => setEditForm((f) => ({ ...f, nameEn: v }))}
                />
                {errors.nameEn && (
                  <p className="mt-1 text-xs text-red-600">{errors.nameEn}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {isFa ? "نام (فارسی)" : "Name (Persian)"}
                </label>
                <Input
                  value={editForm.nameFa}
                  onChange={(v) => setEditForm((f) => ({ ...f, nameFa: v }))}
                />
                {errors.nameFa && (
                  <p className="mt-1 text-xs text-red-600">{errors.nameFa}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.adminUsers.phone}
                </label>
                <Input
                  value={editForm.phone}
                  onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))}
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.adminUsers.role}
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
                >
                  <option value="employer">{tr.adminUsers.employer}</option>
                  <option value="admin">{tr.adminUsers.admin}</option>
                  <option value="super_admin">
                    {tr.adminUsers.superAdmin}
                  </option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? tr.common.loading : tr.adminUsers.save}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditingUser(null)}
                disabled={saving}
                className="flex-1"
              >
                {tr.adminUsers.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
