import { Modal } from '@/components/Modal'
import { storage } from '@/lib/storage'
import type { Task } from '@/types'
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '@/lib/constants'

interface TaskDetailModalProps {
  task: Task | null
  onClose: () => void
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  if (!task) return null

  const users = storage.getUsers().filter((u) => u.status === 'APPROVED')
  const assignee = users.find((u) => u.id === task.assignedToId)
  const creator = users.find((u) => u.id === task.createdById)
  const getName = (id: string) => users.find((u) => u.id === id)?.name ?? id
  const priorityLabel = TASK_PRIORITY_OPTIONS.find((o) => o.value === task.priority)?.label ?? task.priority
  const statusLabel = TASK_STATUS_OPTIONS.find((o) => o.value === task.status)?.label ?? task.status
  const history = task.assignmentHistory ?? []

  return (
    <Modal open={!!task} onClose={onClose} title="Task details">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-white">{task.title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {statusLabel} · {priorityLabel}
            {assignee && ` · Assigned to ${assignee.name}`}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Description</label>
          <p className="mt-1 whitespace-pre-wrap rounded bg-slate-700/50 p-3 text-sm text-slate-200">
            {task.description || '—'}
          </p>
        </div>
        {((task.status === 'COMPLETED' || task.status === 'PENDING_APPROVAL') && task.completedRemark) && (
          <div>
            <label className="block text-sm font-medium text-slate-400">
              Completion remark {task.status === 'PENDING_APPROVAL' && '(awaiting approval)'}
            </label>
            <p className="mt-1 whitespace-pre-wrap rounded bg-emerald-900/30 p-3 text-sm text-slate-200">
              {task.completedRemark}
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-slate-500">Created by</span>
          <span className="text-slate-200">{creator?.name ?? '—'}</span>
          <span className="text-slate-500">Created</span>
          <span className="text-slate-200">{new Date(task.createdAt).toLocaleString()}</span>
          <span className="text-slate-500">Last updated</span>
          <span className="text-slate-200">{new Date(task.updatedAt).toLocaleString()}</span>
        </div>
        {history.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-400">Assignment history</label>
            <ul className="mt-1 space-y-1 rounded bg-slate-700/30 p-3 text-sm">
              {history.map((entry, i) => (
                <li key={i} className="text-slate-300">
                  {entry.previousAssignedToId == null ? 'Assigned' : 'Re-assigned'} to{' '}
                  {entry.assignedToId ? getName(entry.assignedToId) : 'Unassigned'} by{' '}
                  {getName(entry.assignedById)} on{' '}
                  {new Date(entry.assignedAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}
