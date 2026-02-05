import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { storage } from '@/lib/storage'
import {
  getTasksForSession,
  createTask,
  updateTask,
  canEditTask,
  canForwardTask,
  canApproveTaskCompletion,
  requestTaskCompletion,
  approveTaskCompletion,
  getDepartmentUsersOnly,
} from '@/lib/taskService'
import { TaskCard } from '@/components/TaskCard'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import { Modal } from '@/components/Modal'
import type { Task, TaskPriority } from '@/types'
import { TASK_PRIORITY_OPTIONS, TASK_TITLE_OPTIONS } from '@/lib/constants'

export function TaskManagement() {
  const { session } = useAuth()
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks())
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [forwardTask, setForwardTask] = useState<Task | null>(null)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [completionTask, setCompletionTask] = useState<Task | null>(null)
  const [approveTask, setApproveTask] = useState<Task | null>(null)

  const displayTasks = useMemo(() => {
    if (!session) return []
    return getTasksForSession(session).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [session, tasks])

  const refresh = () => setTasks(storage.getTasks())

  const departments = storage.getDepartments()

  if (!session) return null

  const canCreate = true

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">
          {session.role === 'SUPER_ADMIN' ? 'Task Management' : session.role === 'ADMIN' ? 'Department Tasks' : 'My Tasks'}
        </h1>
        {canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-500"
          >
            New task
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayTasks.length === 0 ? (
          <p className="text-slate-400">No tasks to show.</p>
        ) : (
          displayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              session={session}
              onUpdate={refresh}
              onEdit={canEditTask(session, task) ? setEditTask : undefined}
              onForward={canForwardTask(session, task) ? setForwardTask : undefined}
              onViewDetail={setDetailTask}
              onRequestComplete={setCompletionTask}
              onApproveComplete={canApproveTaskCompletion(session, task) ? () => setApproveTask(task) : undefined}
            />
          ))
        )}
      </div>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refresh}
        session={session}
        departments={departments}
        getUsers={(deptId: string) => getDepartmentUsersOnly(deptId)}
      />
      <EditTaskModal
        task={editTask}
        onClose={() => setEditTask(null)}
        onSaved={refresh}
        session={session}
        getUsers={(deptId) => getDepartmentUsersOnly(deptId)}
      />
      <ForwardTaskModal
        task={forwardTask}
        onClose={() => setForwardTask(null)}
        onForwarded={refresh}
        session={session}
        departments={departments}
        getUsers={(deptId) => getDepartmentUsersOnly(deptId)}
      />
      <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
      <CompletionRemarkModal
        task={completionTask}
        onClose={() => setCompletionTask(null)}
        onSubmitted={refresh}
      />
      <ApproveCompletionModal
        task={approveTask}
        onClose={() => setApproveTask(null)}
        onApproved={() => {
          if (approveTask) approveTaskCompletion(approveTask.id)
          refresh()
          setApproveTask(null)
        }}
      />
    </div>
  )
}

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  session: NonNullable<ReturnType<typeof useAuth>['session']>
  departments: { id: string; name: string }[]
  getUsers: (deptId: string) => { id: string; name: string; departmentId: string }[]
}

function CreateTaskModal({ open, onClose, onCreated, session, departments, getUsers }: CreateTaskModalProps) {
  const [titleOption, setTitleOption] = useState<string>(TASK_TITLE_OPTIONS[0].value)
  const [titleOther, setTitleOther] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const defaultDept = session.departmentId ?? departments[0]?.id ?? ''
  const [departmentId, setDepartmentId] = useState(defaultDept)
  const [assignedToId, setAssignedToId] = useState<string | null>(null)

  const users = departmentId ? getUsers(departmentId) : []
  const title = titleOption === 'Other' ? titleOther.trim() : titleOption

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    createTask(
      { title, description, priority, departmentId, assignedToId: assignedToId || null },
      session.userId
    )
    setTitleOption(TASK_TITLE_OPTIONS[0].value)
    setTitleOther('')
    setDescription('')
    setPriority('MEDIUM')
    setDepartmentId(defaultDept)
    setAssignedToId(null)
    onCreated()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Create task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400">Title</label>
          <select
            value={titleOption}
            onChange={(e) => setTitleOption(e.target.value)}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          >
            {TASK_TITLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {titleOption === 'Other' && (
            <input
              value={titleOther}
              onChange={(e) => setTitleOther(e.target.value)}
              placeholder="Enter task title"
              required
              className="mt-2 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          >
            {TASK_PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Department</label>
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value)
              setAssignedToId(null)
            }}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Assign to (optional, users only)</label>
          <select
            value={assignedToId ?? ''}
            onChange={(e) => setAssignedToId(e.target.value || null)}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded bg-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-500">
            Cancel
          </button>
          <button type="submit" className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500">
            Create
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface EditTaskModalProps {
  task: Task | null
  onClose: () => void
  onSaved: () => void
  session: NonNullable<ReturnType<typeof useAuth>['session']>
  getUsers: (deptId: string) => { id: string; name: string }[]
}

function EditTaskModal({ task, onClose, onSaved, session, getUsers }: EditTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [assignedToId, setAssignedToId] = useState<string | null>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setPriority(task.priority)
      setAssignedToId(task.assignedToId)
    }
  }, [task?.id])

  if (!task) return null

  const open = !!task
  const users = getUsers(task.departmentId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updates: Parameters<typeof updateTask>[1] = { title, description, priority, assignedToId: assignedToId ?? undefined }
    const options = assignedToId !== task.assignedToId ? { performedByUserId: session.userId } : undefined
    updateTask(task.id, updates, options)
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          >
            {TASK_PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Assign to (users only)</label>
          <select
            value={assignedToId ?? ''}
            onChange={(e) => setAssignedToId(e.target.value || null)}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded bg-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-500">
            Cancel
          </button>
          <button type="submit" className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500">
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface ForwardTaskModalProps {
  task: Task | null
  onClose: () => void
  onForwarded: () => void
  session: NonNullable<ReturnType<typeof useAuth>['session']>
  departments: { id: string; name: string }[]
  getUsers: (deptId: string) => { id: string; name: string }[]
}

interface CompletionRemarkModalProps {
  task: Task | null
  onClose: () => void
  onSubmitted: () => void
}

interface ApproveCompletionModalProps {
  task: Task | null
  onClose: () => void
  onApproved: () => void
}

function ApproveCompletionModal({ task, onClose, onApproved }: ApproveCompletionModalProps) {
  if (!task) return null

  return (
    <Modal open={!!task} onClose={onClose} title="Approve task completion">
      <div className="space-y-4">
        <p className="text-slate-300">
          Review the completion remark below. Approving will mark this task as completed.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-400">Task</label>
          <p className="mt-1 font-medium text-white">{task.title}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Completion remark</label>
          <p className="mt-1 whitespace-pre-wrap rounded bg-emerald-900/30 border border-emerald-700/50 p-3 text-sm text-slate-200 min-h-[80px]">
            {task.completedRemark || '—'}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApproved}
            className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Approve completion
          </button>
        </div>
      </div>
    </Modal>
  )
}

function CompletionRemarkModal({ task, onClose, onSubmitted }: CompletionRemarkModalProps) {
  const { session } = useAuth()
  const [remark, setRemark] = useState('')

  if (!task || !session) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    requestTaskCompletion(task.id, session.userId, remark.trim() || undefined)
    setRemark('')
    onSubmitted()
    onClose()
  }

  return (
    <Modal open={!!task} onClose={onClose} title="Complete task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-slate-300">Add a remark or description of the work done for this task.</p>
        <div>
          <label className="block text-sm font-medium text-slate-400">Remark / work description</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={4}
            placeholder="Describe what was done..."
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded bg-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-500">
            Cancel
          </button>
          <button type="submit" className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500">
            Mark complete
          </button>
        </div>
      </form>
    </Modal>
  )
}

function ForwardTaskModal({ task, onClose, onForwarded, session, departments, getUsers }: ForwardTaskModalProps) {
  const [departmentId, setDepartmentId] = useState('')
  const [assignedToId, setAssignedToId] = useState<string | null>(null)

  useEffect(() => {
    if (task) {
      setDepartmentId(task.departmentId)
      setAssignedToId(null)
    }
  }, [task?.id])

  if (!task) return null

  const open = !!task
  const effectiveDeptId = departmentId || task.departmentId
  const users = effectiveDeptId ? getUsers(effectiveDeptId) : []

  const handleDepartmentChange = (deptId: string) => {
    setDepartmentId(deptId)
    setAssignedToId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (assignedToId) {
      updateTask(task.id, { assignedToId }, { performedByUserId: session.userId })
      onForwarded()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Forward task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-slate-300">Choose a department and assign this task to a team member (users only).</p>
        <div>
          <label className="block text-sm font-medium text-slate-400">Department</label>
          <select
            value={effectiveDeptId}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">Assign to</label>
          <select
            value={assignedToId ?? ''}
            onChange={(e) => setAssignedToId(e.target.value || null)}
            required
            className="mt-1 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded bg-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-500">
            Cancel
          </button>
          <button type="submit" className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500">
            Forward
          </button>
        </div>
      </form>
    </Modal>
  )
}
