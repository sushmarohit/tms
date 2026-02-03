import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import type { Session, User } from '@/types'
import { storage, seedSuperAdmin } from '@/lib/storage'

interface AuthContextValue {
  session: Session | null
  login: (email: string, password: string) => { ok: boolean; error?: string }
  signup: (data: { name: string; email: string; departmentId: string; role: 'ADMIN' | 'USER' }) => { ok: boolean; error?: string }
  logout: () => void
  updateProfile: (updates: { name?: string; email?: string }) => { ok: boolean; error?: string }
  approveUser: (userId: string, role?: User['role'], departmentId?: string) => void
  getPendingUsers: () => User[]
  getUserById: (id: string) => User | undefined
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => storage.getSession())

  useEffect(() => {
    seedSuperAdmin()
    storage.getDepartments()
  }, [])

  const login = useCallback((email: string, _password: string) => {
    const users = storage.getUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return { ok: false, error: 'User not found' }
    if (user.status !== 'APPROVED') return { ok: false, error: 'Account pending approval' }
    const s: Session = {
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      name: user.name,
    }
    storage.setSession(s)
    setSession(s)
    return { ok: true }
  }, [])

  const signup = useCallback(
    (data: { name: string; email: string; departmentId: string; role: 'ADMIN' | 'USER' }) => {
      const users = storage.getUsers()
      if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase()))
        return { ok: false, error: 'Email already registered' }
      const id = 'u-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
      const newUser: User = {
        id,
        name: data.name,
        email: data.email,
        departmentId: data.departmentId,
        role: data.role,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      storage.setUsers([...users, newUser])
      return { ok: true }
    },
    []
  )

  const logout = useCallback(() => {
    storage.clearSession()
    setSession(null)
  }, [])

  const updateProfile = useCallback((updates: { name?: string; email?: string }) => {
    const current = storage.getSession()
    if (!current) return { ok: false, error: 'Not logged in' }
    const users = storage.getUsers()
    const idx = users.findIndex((u) => u.id === current.userId)
    if (idx === -1) return { ok: false, error: 'User not found' }
    if (updates.email !== undefined) {
      const existing = users.find((u) => u.id !== current.userId && u.email.toLowerCase() === updates.email!.toLowerCase())
      if (existing) return { ok: false, error: 'Email already in use' }
    }
    const next = users.map((u, i) =>
      i === idx ? { ...u, ...updates } : u
    )
    storage.setUsers(next)
    const updatedUser = next[idx]!
    const newSession: Session = {
      ...current,
      name: updatedUser.name,
      email: updatedUser.email,
    }
    storage.setSession(newSession)
    setSession(newSession)
    return { ok: true }
  }, [])

  const approveUser = useCallback((userId: string, role?: User['role'], departmentId?: string) => {
    const users = storage.getUsers()
    const updated = users.map((u) => {
      if (u.id !== userId) return u
      return {
        ...u,
        status: 'APPROVED' as const,
        ...(role != null && { role }),
        ...(departmentId != null && { departmentId }),
      }
    })
    storage.setUsers(updated)
  }, [])

  const getPendingUsers = useCallback(() => {
    return storage.getUsers().filter((u) => u.status === 'PENDING')
  }, [])

  const getUserById = useCallback((id: string) => {
    return storage.getUsers().find((u) => u.id === id)
  }, [])

  const value: AuthContextValue = {
    session,
    login,
    signup,
    logout,
    updateProfile,
    approveUser,
    getPendingUsers,
    getUserById,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
