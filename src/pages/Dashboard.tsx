import { useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { storage } from '@/lib/storage'
import { getTasksForSession } from '@/lib/taskService'
import { StatsCard } from '@/components/StatsCard'
import { TaskBreakdownPieChart, ProductivityChart } from '@/components/DashboardCharts'

function useTaskStats(session: ReturnType<typeof useAuth>['session']) {
  return useMemo(() => {
    if (!session) return { pending: 0, inProgress: 0, completed: 0, reassigned: 0, total: 0 }
    const tasks = getTasksForSession(session)
    const reassigned = tasks.filter(
      (t) => t.assignedToId != null && t.assignedToId !== t.createdById
    ).length
    return {
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      reassigned,
      total: tasks.length,
    }
  }, [session])
}

export function Dashboard() {
  const { session } = useAuth()
  const tasks = useMemo(() => {
    if (!session) return []
    return getTasksForSession(session)
  }, [session])
  const stats = useTaskStats(session)

  const [deptStats] = useState(() => {
    if (session?.role !== 'SUPER_ADMIN') return null
    const allTasks = storage.getTasks()
    const depts = storage.getDepartments()
    return depts.map((d) => ({
      id: d.id,
      name: d.name,
      total: allTasks.filter((t) => t.departmentId === d.id).length,
      pending: allTasks.filter((t) => t.departmentId === d.id && t.status === 'PENDING').length,
      completed: allTasks.filter((t) => t.departmentId === d.id && t.status === 'COMPLETED').length,
    }))
  })

  if (!session) return null

  const isSuperAdmin = session.role === 'SUPER_ADMIN'

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>

      {/* Stats – same for all, scoped by role via getTasksForSession */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-slate-400">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard label="Pending" value={stats.pending} variant="pending" />
          <StatsCard label="In Progress" value={stats.inProgress} variant="progress" />
          <StatsCard label="Completed" value={stats.completed} variant="completed" />
          <StatsCard label="Re-assigned" value={stats.reassigned} variant="reassigned" />
          <StatsCard label="Total" value={stats.total} variant="total" />
        </div>
      </section>

      {/* Charts – same for all, data scoped by role */}
      <section className="grid gap-6 lg:grid-cols-2">
        <TaskBreakdownPieChart tasks={tasks} />
        <ProductivityChart tasks={tasks} />
      </section>

      {/* Department overview – Super Admin only */}
      {isSuperAdmin && deptStats && (
        <section>
          <h2 className="mb-3 text-lg font-medium text-white">Department overview</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {deptStats.map((d) => (
              <div
                key={d.id}
                className="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3"
              >
                <p className="font-medium text-white">{d.name}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {d.total} tasks · {d.pending} pending · {d.completed} completed
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
