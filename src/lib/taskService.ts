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
  const now = new Date().toISOString()
  const assignmentHistory: Task['assignmentHistory'] =
    data.assignedToId != null
      ? [{ assignedById: createdById, assignedToId: data.assignedToId, previousAssignedToId: null, assignedAt: now }]
      : []
  const task: Task = {
    id: 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    title: data.title,
    description: data.description,
    status: 'PENDING',
    priority: data.priority,
    departmentId: data.departmentId,
    assignedToId: data.assignedToId,
    createdById,
    createdAt: now,
    updatedAt: now,
    assignmentHistory,
  }
  storage.setTasks([...tasks, task])
  return task
}

export function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assignedToId' | 'completedRemark'>>,
  options?: { performedByUserId?: string }
): Task | null {
  const tasks = storage.getTasks()
  const idx = tasks.findIndex((t) => t.id === taskId)
  if (idx === -1) return null
  const current = tasks[idx]!
  const now = new Date().toISOString()
  let assignmentHistory = current.assignmentHistory ?? []
  if (
    updates.assignedToId !== undefined &&
    updates.assignedToId !== current.assignedToId &&
    options?.performedByUserId
  ) {
    assignmentHistory = [
      ...assignmentHistory,
      {
        assignedById: options.performedByUserId,
        assignedToId: updates.assignedToId,
        previousAssignedToId: current.assignedToId,
        assignedAt: now,
      },
    ]
  }
  const next = tasks.map((t, i) => {
    if (i !== idx) return t
    return {
      ...t,
      ...updates,
      updatedAt: now,
      ...(assignmentHistory.length > (t.assignmentHistory?.length ?? 0) ? { assignmentHistory } : {}),
    }
  })
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

/** Only USER role – for assigning/re-assigning tasks (not Admin or Super Admin). */
export function getDepartmentUsersOnly(departmentId: string): User[] {
  return storage
    .getUsers()
    .filter((u) => u.departmentId === departmentId && u.status === 'APPROVED' && u.role === 'USER')
}

export function getAllUsers(): User[] {
  return storage.getUsers().filter((u) => u.status === 'APPROVED')
}
