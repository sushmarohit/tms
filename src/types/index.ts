export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Department {
  id: string
  name: string
}

export interface User {
  id: string
  name: string
  email: string
  departmentId: string
  role: Role
  status: 'PENDING' | 'APPROVED'
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  departmentId: string
  assignedToId: string | null
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  userId: string
  email: string
  role: Role
  departmentId: string
  name: string
}
