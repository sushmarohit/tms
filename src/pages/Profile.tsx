import { useState, useEffect } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { storage } from '@/lib/storage'
import type { User, Role } from '@/types'

const roleLabel = (r: Role) => (r === 'SUPER_ADMIN' ? 'Super Admin' : r === 'ADMIN' ? 'Admin' : 'User')

export function Profile() {
  const { userId: routeUserId } = useParams<{ userId: string }>()
  const { session, updateProfile, updateUserDepartmentRole, getUserById } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const isViewingOther = Boolean(routeUserId && routeUserId !== session?.userId)
  const isSuperAdmin = session?.role === 'SUPER_ADMIN'
  const canSeeDeptRole = !isViewingOther || isSuperAdmin
  const canEditDeptRole = isSuperAdmin

  const targetUser: User | undefined = isViewingOther && routeUserId ? getUserById(routeUserId) : session ? { id: session.userId, name: session.name, email: session.email, departmentId: session.departmentId, role: session.role, status: 'APPROVED', createdAt: '' } : undefined

  useEffect(() => {
    if (targetUser) {
      setName(targetUser.name)
      setEmail(targetUser.email)
      setDepartmentId(targetUser.departmentId)
      setRole(targetUser.role)
    }
  }, [targetUser?.id, targetUser?.name, targetUser?.email, targetUser?.departmentId, targetUser?.role])

  if (!session) return null

  if (isViewingOther && !isSuperAdmin) return <Navigate to="/profile" replace />

  if (isViewingOther && routeUserId && !targetUser) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <p className="text-slate-400">User not found.</p>
        <Link to="/users" className="text-primary-400 hover:underline">Back to User Management</Link>
      </div>
    )
  }

  const departments = storage.getDepartments()
  const departmentName = departments.find((d) => d.id === departmentId)?.name ?? departmentId

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    const targetId = isViewingOther ? routeUserId! : session.userId
    if (isViewingOther) {
      const result = updateUserDepartmentRole(targetId, { departmentId: departmentId || undefined, role: role || undefined })
      if (result.ok) setSaved(true)
      else setError(result.error ?? 'Update failed')
    } else {
      const profileResult = updateProfile({ name: name.trim(), email: email.trim().toLowerCase() })
      if (!profileResult.ok) {
        setError(profileResult.error ?? 'Update failed')
        return
      }
      if (canEditDeptRole && (departmentId || role)) {
        const deptRoleResult = updateUserDepartmentRole(targetId, { departmentId: departmentId || undefined, role: role || undefined })
        if (deptRoleResult.ok) setSaved(true)
        else setError(deptRoleResult.error ?? 'Profile updated but department/role update failed')
      } else {
        setSaved(true)
      }
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold text-white">
        {isViewingOther ? 'User Profile' : 'My Profile'}
      </h1>
      {isViewingOther && (
        <Link to="/users" className="text-sm text-primary-400 hover:underline">← Back to User Management</Link>
      )}
      <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-300">{error}</div>
          )}
          {saved && (
            <div className="rounded-md bg-emerald-500/20 px-3 py-2 text-sm text-emerald-300">
              Profile updated.
            </div>
          )}
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-slate-400">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              readOnly={isViewingOther}
              className={`mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${isViewingOther ? 'cursor-not-allowed opacity-80' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-slate-400">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={isViewingOther}
              className={`mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${isViewingOther ? 'cursor-not-allowed opacity-80' : ''}`}
            />
          </div>
          {canSeeDeptRole && (
            <>
              <div>
                <label htmlFor="profile-department" className="block text-sm font-medium text-slate-400">
                  Department
                </label>
                {canEditDeptRole ? (
                  <select
                    id="profile-department"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 text-slate-300">{departmentName}</p>
                )}
              </div>
              <div>
                <label htmlFor="profile-role" className="block text-sm font-medium text-slate-400">
                  Role
                </label>
                {canEditDeptRole ? (
                  <select
                    id="profile-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                ) : (
                  <p className="mt-1 text-slate-300">{role ? roleLabel(role) : ''}</p>
                )}
              </div>
              {!canEditDeptRole && (
                <p className="text-xs text-slate-500">Contact Super Admin to change department or role.</p>
              )}
            </>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary-600 py-2 font-medium text-white hover:bg-primary-500"
          >
            {isViewingOther ? 'Update department & role' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
