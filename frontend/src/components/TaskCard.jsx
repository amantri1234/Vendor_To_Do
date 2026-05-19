import { useState } from 'react'
import { format } from 'date-fns'

const STATUS_STYLES = {
  'pending':     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'completed':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

const PRIORITY_DOT = {
  low:    'bg-emerald-400',
  medium: 'bg-amber-400',
  high:   'bg-red-400',
}

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const [confirming, setConfirming] = useState(false)

  const handleDelete = () => {
    if (confirming) {
      onDelete(task.id)
    } else {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2500)
    }
  }

  return (
    <div className={`card p-4 animate-slide-up group transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900/60
      ${task.is_completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => !task.is_completed && onComplete(task.id)}
          disabled={task.is_completed}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
            ${task.is_completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-cream-dim dark:border-gray-600 hover:border-accent'}`}
        >
          {task.is_completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-display font-600 text-sm ${task.is_completed ? 'line-through text-slate/40 dark:text-gray-500' : 'dark:text-gray-200'}`}>
              {task.title}
            </h3>
            <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} title={task.priority} />
          </div>

          {task.description && (
            <p className="text-xs text-slate/50 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`badge text-[10px] ${STATUS_STYLES[task.status]}`}>
              {task.status}
            </span>
            <span className="badge bg-cream-soft dark:bg-gray-700 text-slate/50 dark:text-gray-300 text-[10px] capitalize">
              {task.priority}
            </span>
            {task.due_date && (
              <span className="text-[10px] font-mono text-slate/40 dark:text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(new Date(task.due_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="btn-icon text-slate/40 hover:text-accent"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className={`btn-icon ${confirming ? 'text-red-500 bg-red-50 dark:bg-red-900/30' : 'text-slate/40 hover:text-red-500'}`}
            title={confirming ? 'Click again to confirm' : 'Delete'}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
