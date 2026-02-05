import { useState, useRef, useEffect } from 'react'
import type { Task } from '@/types'

interface DeptOverviewCardProps {
  name: string
  total: number
  pending: number
  completed: number
  pendingTasks: Task[]
  completedTasks: Task[]
  onTaskClick?: (task: Task) => void
}

export function DeptOverviewCard({
  name,
  total,
  pending,
  completed,
  pendingTasks,
  completedTasks,
  onTaskClick,
}: DeptOverviewCardProps) {
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

  const hasTasks = pendingTasks.length > 0 || completedTasks.length > 0
  const showList = open || (hover && hasTasks)

  return (
    <div
      ref={cardRef}
      className={`relative rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 ${hasTasks ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => hasTasks && setOpen((o) => !o)}
      role={hasTasks ? 'button' : undefined}
      tabIndex={hasTasks ? 0 : undefined}
      onKeyDown={hasTasks ? (e) => (e.key === 'Enter' || e.key === ' ') && setOpen((o) => !o) : undefined}
    >
      <p className="font-medium text-white">{name}</p>
      <p className="mt-1 text-sm text-slate-400">
        {total} tasks · {pending} pending · {completed} completed
      </p>
      {showList && hasTasks && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-20 mt-1 max-h-80 w-80 overflow-auto rounded-lg border border-slate-600 bg-slate-800 py-2 shadow-xl"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {pendingTasks.length > 0 && (
            <div className="px-3 pb-2">
              <p className="text-xs font-medium text-amber-400">Pending ({pendingTasks.length})</p>
              <ul className="mt-1 list-none">
                {pendingTasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      className="w-full px-2 py-1.5 text-left text-sm text-white hover:bg-slate-700 rounded"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskClick?.(task)
                        setOpen(false)
                      }}
                    >
                      <span className="line-clamp-2">{task.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {completedTasks.length > 0 && (
            <div className="px-3">
              <p className="text-xs font-medium text-emerald-400">Completed ({completedTasks.length})</p>
              <ul className="mt-1 list-none">
                {completedTasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      className="w-full px-2 py-1.5 text-left text-sm text-white hover:bg-slate-700 rounded"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskClick?.(task)
                        setOpen(false)
                      }}
                    >
                      <span className="line-clamp-2">{task.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
