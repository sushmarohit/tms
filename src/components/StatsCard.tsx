import { useState, useRef, useEffect, useMemo } from 'react'
import type { Task } from '@/types'
import { storage } from '@/lib/storage'

interface StatsCardProps {
  label: string
  value: number
  variant?: 'default' | 'pending' | 'progress' | 'completed' | 'reassigned' | 'total'
  tasks?: Task[]
  onTaskClick?: (task: Task) => void
}

const variants = {
  default: 'border-slate-600 bg-slate-800/50',
  pending: 'border-amber-500/50 bg-amber-500/10',
  progress: 'border-blue-500/50 bg-blue-500/10',
  completed: 'border-emerald-500/50 bg-emerald-500/10',
  reassigned: 'border-violet-500/50 bg-violet-500/10',
  total: 'border-slate-500 bg-slate-800',
}

export function StatsCard({ label, value, variant = 'default', tasks = [], onTaskClick }: StatsCardProps) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (
        cardRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node)
      )
        return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const showList = open || (hover && tasks.length > 0)
  const hasTasks = tasks.length > 0
  const users = useMemo(() => storage.getUsers().filter((u) => u.status === 'APPROVED'), [])
  const getAssigneeName = (assignedToId: string | null) =>
    assignedToId ? users.find((u) => u.id === assignedToId)?.name ?? '—' : null

  return (
    <div
      ref={cardRef}
      className={`relative rounded-lg border px-4 py-3 ${variants[variant]} ${hasTasks ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => hasTasks && setOpen((o) => !o)}
      role={hasTasks ? 'button' : undefined}
      tabIndex={hasTasks ? 0 : undefined}
      onKeyDown={hasTasks ? (e) => (e.key === 'Enter' || e.key === ' ') && setOpen((o) => !o) : undefined}
    >
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {showList && hasTasks && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-20 mt-1 max-h-64 w-72 overflow-auto rounded-lg border border-slate-600 bg-slate-800 py-2 shadow-xl"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <p className="px-3 py-1 text-xs font-medium text-slate-500">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
          <ul className="list-none">
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTaskClick?.(task)
                    setOpen(false)
                  }}
                >
                  <span className="line-clamp-2">{task.title}</span>
                  {task.description && (
                    <span className="mt-0.5 block truncate text-xs text-slate-400">{task.description}</span>
                  )}
                  {getAssigneeName(task.assignedToId) && (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Assigned to: {getAssigneeName(task.assignedToId)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
