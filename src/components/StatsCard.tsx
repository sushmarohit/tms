interface StatsCardProps {
  label: string
  value: number
  variant?: 'default' | 'pending' | 'progress' | 'completed' | 'reassigned' | 'total'
}

const variants = {
  default: 'border-slate-600 bg-slate-800/50',
  pending: 'border-amber-500/50 bg-amber-500/10',
  progress: 'border-blue-500/50 bg-blue-500/10',
  completed: 'border-emerald-500/50 bg-emerald-500/10',
  reassigned: 'border-violet-500/50 bg-violet-500/10',
  total: 'border-slate-500 bg-slate-800',
}

export function StatsCard({ label, value, variant = 'default' }: StatsCardProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${variants[variant]}`}>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}
