import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import type { Task } from '@/types'
import { getTaskBreakdown, getProductivityData, getProductivityForDate, type ProductivityPeriod } from '@/lib/dashboardCharts'

interface TaskBreakdownChartProps {
  tasks: Task[]
}

export function TaskBreakdownChart({ tasks }: TaskBreakdownChartProps) {
  const data = getTaskBreakdown(tasks)
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-600 bg-slate-800/50 text-slate-400">
        No task data to display
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-300">Task breakdown</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function TaskBreakdownPieChart({ tasks }: TaskBreakdownChartProps) {
  const data = getTaskBreakdown(tasks)
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-600 bg-slate-800/50 text-slate-400">
        No task data to display
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-300">Task breakdown</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} stroke="#1e293b" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface ProductivityChartProps {
  tasks: Task[]
}

const PERIODS: { value: ProductivityPeriod; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

export function ProductivityChart({ tasks }: ProductivityChartProps) {
  const [period, setPeriod] = useState<ProductivityPeriod>('week')
  const [filterDate, setFilterDate] = useState<string | null>(null)

  const data = filterDate
    ? [{ label: new Date(filterDate).toLocaleDateString(), completed: getProductivityForDate(tasks, filterDate), date: filterDate }]
    : getProductivityData(tasks, period)

  const isDateFilter = !!filterDate

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-slate-300">Productivity (completed tasks)</h3>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Filter by date:</span>
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={filterDate ?? ''}
              onChange={(e) => {
                const val = e.target.value || null
                if (val && val > new Date().toISOString().slice(0, 10)) return
                setFilterDate(val)
              }}
              className="rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </label>
          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate(null)}
              className="rounded px-2 py-1 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
          {!filterDate && (
            <div className="flex gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPeriod(p.value)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    period === p.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            {isDateFilter ? 'No completed tasks on this date' : 'No completed tasks in this period'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {isDateFilter ? (
              <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#3b82f6"
                  fill="url(#productivityGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
