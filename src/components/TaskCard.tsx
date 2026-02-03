import type { Task, TaskStatus } from '@/types'
import type { Session } from '@/types'
import { storage } from '@/lib/storage'
import { canEditTask, canForwardTask } from '@/lib/taskService'
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/lib/constants'

interface TaskCardProps {
  task: Task
  session: Session
  onUpdate: () => void
  onEdit?: (task: Task) => void
  onForward?: (task: Task) => void
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-600 text-slate-200',
  MEDIUM: 'bg-amber-600/80 text-white',
  HIGH: 'bg-red-600/80 text-white',
}

export function TaskCard({ task, session, onUpdate, onEdit, onForward }: TaskCardProps) {
  const users = storage.getUsers().filter((u) => u.status === 'APPROVED')
  const assignee = users.find((u) => u.id === task.assignedToId)
  const canEdit = canEditTask(session, task)
  const canForward = canForwardTask(session, task)

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as TaskStatus
    const tasks = storage.getTasks()
    const next = tasks.map((t) =>
      t.id === task.id ? { ...t, status, updatedAt: new Date().toISOString() } : t
    )
    storage.setTasks(next)
    onUpdate()
  }

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-white">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-slate-400 line-clamp-2">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority] ?? priorityColors.LOW}`}>
              {TASK_PRIORITY_OPTIONS.find((o) => o.value === task.priority)?.label ?? task.priority}
            </span>
            {assignee && (
              <span className="text-xs text-slate-500">Assigned to {assignee.name}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {TASK_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded bg-slate-600 px-2 py-1 text-sm font-medium text-slate-200 hover:bg-slate-500"
            >
              Edit
            </button>
          )}
          {canForward && onForward && (
            <button
              type="button"
              onClick={() => onForward(task)}
              className="rounded bg-primary-600 px-2 py-1 text-sm font-medium text-white hover:bg-primary-500"
            >
              Forward
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
