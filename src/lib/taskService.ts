import type { Task, Session, User } from '@/types'
import { storage } from './storage'

export function getTasksForSession(session: Session): Task[] {
  const tasks = storage.getTasks()
  if (session.role === 'SUPER_ADMIN') return tasks
  if (session.role === 'ADMIN') return tasks.filter((t) => t.departmentId === session.departmentId)
  return tasks.filter((t) => t.assignedToId === session.userId)
}

export function getTaskById(id: string): Task | undefined {
  return storage.getTasks().find((t) => t.id === id)
}

export function createTask(
  data: { title: string; description: string; priority: Task['priority']; departmentId: string; assignedToId: string | null },
  createdById: string
): Task {
  const tasks = storage.getTasks()
  const task: Task = {
    id: 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    title: data.title,
    description: data.description,
    status: 'PENDING',
    priority: data.priority,
    departmentId: data.departmentId,
    assignedToId: data.assignedToId,
    createdById,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  storage.setTasks([...tasks, task])
  return task
}

export function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assignedToId'>>
): Task | null {
  const tasks = storage.getTasks()
  const idx = tasks.findIndex((t) => t.id === taskId)
  if (idx === -1) return null
  const next = tasks.map((t, i) =>
    i === idx ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
  )
  storage.setTasks(next)
  return next[idx] ?? null
}

export function canEditTask(session: Session, task: Task): boolean {
  if (session.role === 'SUPER_ADMIN') return true
  if (session.role === 'ADMIN' && task.departmentId === session.departmentId) return true
  return false
}

export function canForwardTask(session: Session, task: Task): boolean {
  if (session.role === 'SUPER_ADMIN') return true
  if (session.role === 'ADMIN' && task.departmentId === session.departmentId) return true
  if (session.role === 'USER' && task.assignedToId === session.userId) return true
  return false
}

export function getDepartmentUsers(departmentId: string): User[] {
  return storage.getUsers().filter((u) => u.departmentId === departmentId && u.status === 'APPROVED')
}

export function getAllUsers(): User[] {
  return storage.getUsers().filter((u) => u.status === 'APPROVED')
}
