import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { storage } from '@/lib/storage'

export function Profile() {
  const { session, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (session) {
      setName(session.name)
      setEmail(session.email)
    }
  }, [session])

  if (!session) return null

  const departments = storage.getDepartments()
  const department = departments.find((d) => d.id === session.departmentId)?.name ?? session.departmentId

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    const result = updateProfile({ name: name.trim(), email: email.trim().toLowerCase() })
    if (result.ok) setSaved(true)
    else setError(result.error ?? 'Update failed')
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold text-white">My Profile</h1>
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
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Department</label>
            <p className="mt-1 text-slate-300">{department}</p>
            <p className="text-xs text-slate-500">Department cannot be changed here. Contact Super Admin.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Role</label>
            <p className="mt-1 text-slate-300">{session.role.replace('_', ' ')}</p>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary-600 py-2 font-medium text-white hover:bg-primary-500"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  )
}
