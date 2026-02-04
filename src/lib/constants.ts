export const STORAGE_KEYS = {
  USERS: 'tms_users',
  DEPARTMENTS: 'tms_departments',
  TASKS: 'tms_tasks',
  SESSION: 'tms_session',
} as const

export const DEPARTMENTS_SEED = [
  { id: 'dept-bde', name: 'BDE' },
  { id: 'dept-marketing', name: 'Marketing' },
  { id: 'dept-sales', name: 'Sales' },
  { id: 'dept-hr', name: 'HR' },
  { id: 'dept-tech', name: 'Tech' },
] as const

export const ROLE_OPTIONS_SIGNUP = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
] as const

export const TASK_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'COMPLETED', label: 'Completed' },
] as const

export const TASK_PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
] as const

export const TASK_TITLE_OPTIONS = [
  { value: 'Bug Fix', label: 'Bug Fix' },
  { value: 'Feature Request', label: 'Feature Request' },
  { value: 'Code Review', label: 'Code Review' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Deployment', label: 'Deployment' },
  { value: 'Design', label: 'Design' },
  { value: 'Research', label: 'Research' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Report', label: 'Report' },
  { value: 'Data Entry', label: 'Data Entry' },
  { value: 'Customer Support', label: 'Customer Support' },
  { value: 'Training', label: 'Training' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Other', label: 'Other' },
] as const
