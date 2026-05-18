import { useState, useEffect } from 'react'
import { tasksAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tasksAPI.stats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-24 text-ink/30">
          <p className="font-display font-600 text-sm">Could not load analytics</p>
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Total Tasks', value: stats.total, color: 'bg-ink text-paper' },
    { label: 'Pending', value: stats.pending, color: 'bg-amber-100 text-amber-800' },
    { label: 'In Progress', value: stats.in_progress, color: 'bg-blue-100 text-blue-800' },
    { label: 'Completed', value: stats.completed, color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Overdue', value: stats.overdue, color: 'bg-red-100 text-red-800' },
  ]

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-ink">Analytics</h1>
        <p className="text-ink/40 text-sm mt-1">Task completion overview and statistics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {cards.map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <div className="font-display font-800 text-2xl">{value}</div>
            <div className="text-xs opacity-60 font-body mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card p-6 mb-6">
        <h2 className="font-display font-700 text-base mb-3">Completion Rate</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-paper-soft rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="font-display font-700 text-xl text-ink">{completionRate}%</span>
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="card p-6 mb-6">
        <h2 className="font-display font-700 text-base mb-4">By Priority</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'High', value: stats.high_priority, color: 'bg-red-500' },
            { label: 'Medium', value: stats.medium_priority, color: 'bg-amber-500' },
            { label: 'Low', value: stats.low_priority, color: 'bg-emerald-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mx-auto mb-2`}>
                <span className="font-display font-700 text-white text-lg">{value}</span>
              </div>
              <div className="text-xs text-ink/50 font-body">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status breakdown bar chart */}
      <div className="card p-6">
        <h2 className="font-display font-700 text-base mb-4">Status Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'Pending', value: stats.pending, pct: stats.total > 0 ? (stats.pending / stats.total) * 100 : 0, color: 'bg-amber-400' },
            { label: 'In Progress', value: stats.in_progress, pct: stats.total > 0 ? (stats.in_progress / stats.total) * 100 : 0, color: 'bg-blue-400' },
            { label: 'Completed', value: stats.completed, pct: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0, color: 'bg-emerald-400' },
          ].map(({ label, value, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-display font-600">{label}</span>
                <span className="text-ink/50">{value} tasks ({Math.round(pct)}%)</span>
              </div>
              <div className="bg-paper-soft rounded-full h-2.5 overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
