import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { storage } from '@/lib/storage'
import { Modal } from '@/components/Modal'
import type { User, Role } from '@/types'

export function UserManagement() {
  const { session, approveUser, rejectUser } = useAuth()
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

  const handleReject = (userId: string) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      rejectUser(userId)
      refresh()
    }
  }

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id
  const roleLabel = (r: Role) => (r === 'SUPER_ADMIN' ? 'Super Admin' : r === 'ADMIN' ? 'Admin' : 'User')

  if (session?.role !== 'SUPER_ADMIN') return null

  return (
    <div className="min-w-0 max-w-full space-y-6">
      <h1 className="text-2xl font-semibold text-white">User Management</h1>

      <section>
        <h2 className="mb-3 text-lg font-medium text-amber-400">Pending approval</h2>
        {pending.length === 0 ? (
          <p className="text-slate-400">No pending users.</p>
        ) : (
          <>
            {/* Mobile & tablet: card list */}
            <div className="space-y-3 md:hidden">
              {pending.map((u) => (
                <div
                  key={u.id}
                  className="rounded-lg border border-slate-600 bg-slate-800/50 p-4 space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-white">{u.name}</p>
                    <div className="flex shrink-0 gap-2">
                      {u.status === 'APPROVED' && (
                        <Link
                          to={`/profile/${u.id}`}
                          className="rounded bg-slate-600 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-500"
                        >
                          Profile
                        </Link>
                      )}
                      {u.status === 'PENDING' && (
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => openApprove(u)}
                            className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(u.id)}
                            className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 break-all">{u.email}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                    <span><span className="text-slate-500">Dept:</span> {getDeptName(u.departmentId)}</span>
                    <span><span className="text-slate-500">Role:</span> {roleLabel(u.role)}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="hidden md:block min-w-0 overflow-x-auto rounded-lg border border-slate-600" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full min-w-[32rem] divide-y divide-slate-600">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Name</th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Email</th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Department</th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Requested role</th>
                    <th className="whitespace-nowrap px-4 py-2 text-right text-sm font-medium text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600 bg-slate-800/50">
                  {pending.map((u) => (
                    <tr key={u.id}>
                      <td className="whitespace-nowrap px-4 py-2 text-white">{u.name}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-slate-300">{u.email}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-slate-300">{getDeptName(u.departmentId)}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-slate-300">{roleLabel(u.role)}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-right">
                        {u.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openApprove(u)}
                              className="rounded bg-primary-600 px-2 py-1 text-sm font-medium text-white hover:bg-primary-500"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(u.id)}
                              className="rounded bg-red-600 px-2 py-1 text-sm font-medium text-white hover:bg-red-500"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">All users</h2>
        {/* Mobile & tablet: card list */}
        <div className="space-y-3 md:hidden">
          {approved.map((u) => (
            <div
              key={u.id}
              className="rounded-lg border border-slate-600 bg-slate-800/50 p-4 space-y-2"
            >
              <div className="flex justify-between items-start gap-2">
                <p className="font-medium text-white">{u.name}</p>
                <Link
                  to={`/profile/${u.id}`}
                  className="shrink-0 rounded bg-slate-600 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-500"
                >
                  Profile
                </Link>
              </div>
              <p className="text-sm text-slate-300 break-all">{u.email}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                <span><span className="text-slate-500">Dept:</span> {getDeptName(u.departmentId)}</span>
                <span><span className="text-slate-500">Role:</span> {roleLabel(u.role)}</span>
              </div>
              <span className="inline-block rounded bg-emerald-600/30 px-2 py-0.5 text-xs text-emerald-300">
                Approved
              </span>
            </div>
          ))}
        </div>
        {/* Desktop: table */}
        <div className="hidden md:block min-w-0 overflow-x-auto rounded-lg border border-slate-600" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full min-w-[32rem] divide-y divide-slate-600">
            <thead className="bg-slate-800">
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Name</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Email</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Department</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Role</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Status</th>
                <th className="whitespace-nowrap px-4 py-2 text-right text-sm font-medium text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600 bg-slate-800/50">
              {approved.map((u) => (
                <tr key={u.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-white">{u.name}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-300">{u.email}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-300">{getDeptName(u.departmentId)}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-300">{roleLabel(u.role)}</td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <span className="rounded bg-emerald-600/30 px-2 py-0.5 text-xs text-emerald-300">
                      Approved
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <Link
                      to={`/profile/${u.id}`}
                      className="rounded bg-slate-600 px-2 py-1 text-sm font-medium text-slate-200 hover:bg-slate-500"
                    >
                      Profile
                    </Link>
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
