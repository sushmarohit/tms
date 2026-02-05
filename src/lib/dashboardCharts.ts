import type { Task } from '@/types'

export interface TaskBreakdownItem {
  name: string
  value: number
  fill: string
}

export function getTaskBreakdown(tasks: Task[]): TaskBreakdownItem[] {
  const pending = tasks.filter((t) => t.status === 'PENDING').length
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const pendingApproval = tasks.filter((t) => t.status === 'PENDING_APPROVAL').length
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  const reassigned = tasks.filter(
    (t) => t.assignedToId != null && t.assignedToId !== t.createdById
  ).length

  return [
    { name: 'Pending', value: pending, fill: '#f59e0b' },
    { name: 'In Progress', value: inProgress, fill: '#3b82f6' },
    { name: 'Pending Approval', value: pendingApproval, fill: '#a855f7' },
    { name: 'Completed', value: completed, fill: '#10b981' },
    { name: 'Re-assigned', value: reassigned, fill: '#8b5cf6' },
  ].filter((d) => d.value > 0)
}

export type ProductivityPeriod = 'day' | 'week' | 'month' | 'year'

export interface ProductivityPoint {
  label: string
  completed: number
  date: string
}

function toDateKey(d: Date, period: ProductivityPeriod): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  if (period === 'day') return `${y}-${m}-${day}`
  if (period === 'week') {
    const start = new Date(d)
    start.setDate(d.getDate() - d.getDay())
    return start.toISOString().slice(0, 10)
  }
  if (period === 'month') return `${y}-${m}`
  return `${y}`
}

function formatLabel(key: string, period: ProductivityPeriod): string {
  if (period === 'day') return 'Today'
  if (period === 'week') return key.slice(5)
  if (period === 'month') return key
  return key // year: e.g. "2024"
}

export function getProductivityData(
  tasks: Task[],
  period: ProductivityPeriod
): ProductivityPoint[] {
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED')
  const now = new Date()
  const buckets: Record<string, number> = {}

  if (period === 'day') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const key = toDateKey(start, 'day')
    buckets[key] = 0
  } else if (period === 'week') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      buckets[toDateKey(d, 'week')] = 0
    }
  } else if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    for (let i = 0; i < 12; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
      buckets[toDateKey(d, 'month')] = 0
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const y = now.getFullYear() - 4 + i
      buckets[String(y)] = 0
    }
  }

  for (const t of completedTasks) {
    const d = new Date(t.updatedAt)
    const key = period === 'year' ? String(d.getFullYear()) : toDateKey(d, period)
    if (key in buckets) buckets[key] += 1
  }

  const keys = Object.keys(buckets).sort()
  return keys.map((key) => ({
    label: formatLabel(key, period),
    completed: buckets[key] ?? 0,
    date: key,
  }))
}

/** Get completed count for a single date (YYYY-MM-DD). For calendar date filter. */
export function getProductivityForDate(tasks: Task[], dateStr: string): number {
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED')
  const [y, m, d] = dateStr.split('-').map(Number)
  const targetStart = new Date(y, m - 1, d, 0, 0, 0, 0)
  const targetEnd = new Date(y, m - 1, d, 23, 59, 59, 999)
  return completedTasks.filter((t) => {
    const updated = new Date(t.updatedAt).getTime()
    return updated >= targetStart.getTime() && updated <= targetEnd.getTime()
  }).length
}
