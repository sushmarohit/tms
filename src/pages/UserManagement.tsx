import { useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { storage } from '@/lib/storage'
import { Modal } from '@/components/Modal'
import type { User, Role } from '@/types'

export function UserManagement() {
  const { session, approveUser } = useAuth()
  const [users, setUsers] = useState<User[]>(() => storage.getUsers())
  const [approveModal, setApproveModal] = useState<{ user: User } | null>(null)
  const [roleOverride, setRoleOverride] = useState<Role | null>(null)
  const [deptOverride, setDeptOverride] = useState<string | null>(null)

  const departments = storage.getDepartments()
  const pending = useMemo(() => users.filter((u) => u.status === 'PENDING'), [users])
  const approved = useMemo(() => users.filter((u) => u.status === 'APPROVED'), [users])

  const refresh = () => setUsers(storage.getUsers())

  const openApprove = (user: User) => {
    setApproveModal({ user })
    setRoleOverride(user.role)
    setDeptOverride(user.departmentId)
  }

  const handleApprove = () => {
    if (!approveModal) return
    approveUser(approveModal.user.id, roleOverride ?? undefined, deptOverride ?? undefined)
    setApproveModal(null)
    refresh()
  }

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id
  const roleLabel = (r: Role) => (r === 'SUPER_ADMIN' ? 'Super Admin' : r === 'ADMIN' ? 'Admin' : 'User')

  if (session?.role !== 'SUPER_ADMIN') return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">User Management</h1>

      <section>
        <h2 className="mb-3 text-lg font-medium text-amber-400">Pending approval</h2>
        {pending.length === 0 ? (
          <p className="text-slate-400">No pending users.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-600">
            <table className="min-w-full divide-y divide-slate-600">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Department</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Requested role</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600 bg-slate-800/50">
                {pending.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2 text-white">{u.name}</td>
                    <td className="px-4 py-2 text-slate-300">{u.email}</td>
                    <td className="px-4 py-2 text-slate-300">{getDeptName(u.departmentId)}</td>
                    <td className="px-4 py-2 text-slate-300">{roleLabel(u.role)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => openApprove(u)}
                        className="rounded bg-primary-600 px-2 py-1 text-sm font-medium text-white hover:bg-primary-500"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">All users</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-600">
          <table className="min-w-full divide-y divide-slate-600">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Department</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Role</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600 bg-slate-800/50">
              {approved.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-white">{u.name}</td>
                  <td className="px-4 py-2 text-slate-300">{u.email}</td>
                  <td className="px-4 py-2 text-slate-300">{getDeptName(u.departmentId)}</td>
                  <td className="px-4 py-2 text-slate-300">{roleLabel(u.role)}</td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-emerald-600/30 px-2 py-0.5 text-xs text-emerald-300">
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={!!approveModal}
        onClose={() => setApproveModal(null)}
        title="Approve user"
      >
        {approveModal && (
          <div className="space-y-4">
            <p className="text-slate-300">
              Approve <strong className="text-white">{approveModal.user.name}</strong> (
              {approveModal.user.email})?
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-400">Role (optional change)</label>
              <select
                value={roleOverride ?? approveModal.user.role}
                onChange={(e) => setRoleOverride(e.target.value as Role)}
                className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Department (optional change)</label>
              <select
                value={deptOverride ?? approveModal.user.departmentId}
                onChange={(e) => setDeptOverride(e.target.value)}
                className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setApproveModal(null)}
                className="rounded bg-slate-600 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500"
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
