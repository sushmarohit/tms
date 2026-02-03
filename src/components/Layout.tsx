import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const navByRole = {
  SUPER_ADMIN: [
    { to: '/', label: 'Dashboard' },
    { to: '/users', label: 'User Management' },
    { to: '/tasks', label: 'Task Management' },
  ],
  ADMIN: [
    { to: '/', label: 'Dashboard' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/team', label: 'Team' },
  ],
  USER: [
    { to: '/', label: 'Dashboard' },
    { to: '/tasks', label: 'My Tasks' },
  ],
} as const

export function Layout({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!session) return <>{children}</>

  const links = navByRole[session.role]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar overlay (mobile) */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        aria-hidden
        style={{ display: sidebarOpen ? 'block' : 'none' }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-slate-700 bg-slate-850 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-700 px-4 lg:justify-center">
          <Link to="/" className="text-lg font-semibold text-white" onClick={() => setSidebarOpen(false)}>
            TMS Demo
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded p-2 text-slate-400 hover:bg-slate-700 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-700 bg-slate-900/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded p-2 text-slate-400 hover:bg-slate-700 hover:text-white lg:hidden"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <span className="text-sm text-slate-300">
              {session.name} <span className="text-slate-500">({session.role.replace('_', ' ')})</span>
            </span>
            <Link
              to="/profile"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                location.pathname === '/profile'
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              My Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-600"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  )
}
