export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING_APPROVAL'
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

export interface AssignmentHistoryEntry {
  assignedById: string
  assignedToId: string | null
  previousAssignedToId: string | null
  assignedAt: string
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
  completedRemark?: string
  assignmentHistory?: AssignmentHistoryEntry[]
  /** Set when status is PENDING_APPROVAL: user who requested completion */
  completionRequestedBy?: string
}

export interface Session {
  userId: string
  email: string
  role: Role
  departmentId: string
  name: string
}
