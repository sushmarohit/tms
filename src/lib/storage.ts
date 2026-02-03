import type { User, Department, Task, Session } from '@/types'
import { STORAGE_KEYS, DEPARTMENTS_SEED } from './constants'

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getUsers(): User[] {
    return get(STORAGE_KEYS.USERS, [])
  },
  setUsers(users: User[]): void {
    set(STORAGE_KEYS.USERS, users)
  },

  getDepartments(): Department[] {
    const depts = get<Department[]>(STORAGE_KEYS.DEPARTMENTS, [])
    if (depts.length === 0) {
      const seed = DEPARTMENTS_SEED.map((d) => ({ id: d.id, name: d.name }))
      set(STORAGE_KEYS.DEPARTMENTS, seed)
      return seed
    }
    return depts
  },
  setDepartments(departments: Department[]): void {
    set(STORAGE_KEYS.DEPARTMENTS, departments)
  },

  getTasks(): Task[] {
    return get(STORAGE_KEYS.TASKS, [])
  },
  setTasks(tasks: Task[]): void {
    set(STORAGE_KEYS.TASKS, tasks)
  },

  getSession(): Session | null {
    return get<Session | null>(STORAGE_KEYS.SESSION, null)
  },
  setSession(session: Session | null): void {
    set(STORAGE_KEYS.SESSION, session)
  },
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION)
  },
}

export function seedSuperAdmin(): void {
  const users = storage.getUsers()
  const hasSuperAdmin = users.some((u) => u.role === 'SUPER_ADMIN')
  if (hasSuperAdmin) return

  const superAdmin: User = {
    id: 'sa-1',
    name: 'Super Admin',
    email: 'superadmin@tms.demo',
    departmentId: DEPARTMENTS_SEED[0].id,
    role: 'SUPER_ADMIN',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
  }
  storage.setUsers([...users, superAdmin])
}
