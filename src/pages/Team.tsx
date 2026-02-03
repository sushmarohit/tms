import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { storage } from '@/lib/storage'

export function Team() {
  const { session } = useAuth()
  const members = useMemo(() => {
    if (!session || session.role !== 'ADMIN') return []
    return storage
      .getUsers()
      .filter((u) => u.departmentId === session.departmentId && u.status === 'APPROVED')
  }, [session])

  const department = useMemo(() => {
    if (!session) return null
    return storage.getDepartments().find((d) => d.id === session.departmentId)
  }, [session])

  if (session?.role !== 'ADMIN') return null

  const roleLabel = (r: string) => (r === 'ADMIN' ? 'Admin' : 'User')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Team Members</h1>
      <p className="text-slate-400">
        Read-only list of approved users in {department?.name ?? 'your department'}.
      </p>
      <div className="overflow-x-auto rounded-lg border border-slate-600 -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="min-w-[28rem] w-full divide-y divide-slate-600">
          <thead className="bg-slate-800">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Name</th>
              <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Email</th>
              <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-slate-300">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600 bg-slate-800/50">
            {members.map((u) => (
              <tr key={u.id}>
                <td className="whitespace-nowrap px-4 py-2 text-white">{u.name}</td>
                <td className="whitespace-nowrap px-4 py-2 text-slate-300">{u.email}</td>
                <td className="whitespace-nowrap px-4 py-2 text-slate-300">{roleLabel(u.role)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
