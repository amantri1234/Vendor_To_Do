import { useState, useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useDebounce } from '../hooks/useDebounce'
import { tasksAPI } from '../services/api'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import toast from 'react-hot-toast'

const FILTERS = ['all', 'pending', 'in-progress', 'completed']
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
const PAGE_SIZE = 10

export default function Dashboard() {
  const { tasks, loading, createTask, updateTask, deleteTask, completeTask, refresh } = useTasks()
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [filter, setFilter]         = useState('all')
  const [search, setSearch]         = useState('')
  const [sortBy, setSortBy]         = useState('created')
  const [page, setPage]             = useState(1)
  const [deletingDone, setDeletingDone] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const debouncedSearch = useDebounce(search, 250)

  const filtered = useMemo(() => {
    let list = [...tasks]
    if (filter !== 'all') list = list.filter((t) => t.status === filter)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter((t) =>
        t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      )
    }
    if (sortBy === 'priority') list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    if (sortBy === 'due')      list.sort((a, b) => (a.due_date ?? '') < (b.due_date ?? '') ? -1 : 1)
    return list
  }, [tasks, filter, debouncedSearch, sortBy])

  const stats = useMemo(() => ({
    total:     tasks.length,
    pending:   tasks.filter((t) => t.status === 'pending').length,
    progress:  tasks.filter((t) => t.status === 'in-progress').length,
    done:      tasks.filter((t) => t.is_completed).length,
  }), [tasks])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const onFilterChange = (f) => { setFilter(f); setPage(1) }

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (task) => { setEditTarget(task); setModalOpen(true) }

  const handleSave = async (data) => {
    try {
      if (editTarget) await updateTask(editTarget.id, data)
      else            await createTask(data)
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to save task')
      throw err
    }
  }

  const handleDelete = async (id) => {
    try { await deleteTask(id) }
    catch { toast.error('Failed to delete task') }
  }

  const handleComplete = async (id) => {
    try { await completeTask(id) }
    catch { toast.error('Failed to complete task') }
  }

  const handleDeleteCompleted = async () => {
    setDeletingDone(true)
    try {
      await tasksAPI.deleteCompleted()
      toast.success('All completed tasks deleted')
      refresh()
      setShowDeleteConfirm(false)
    } catch {
      toast.error('Failed to delete completed tasks')
    } finally {
      setDeletingDone(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-800 text-2xl sm:text-3xl text-slate dark:text-gray-100">My Tasks</h1>
          <p className="text-slate-muted dark:text-gray-400 text-sm mt-1">
            {stats.total === 0 ? 'No tasks yet — create your first one!' : `${stats.done} of ${stats.total} completed`}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {stats.done > 0 && (
            showDeleteConfirm ? (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 rounded-lg p-1">
                <button
                  onClick={handleDeleteCompleted}
                  disabled={deletingDone}
                  className="btn-danger btn-sm"
                >{deletingDone ? 'Deleting…' : 'Confirm'}</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost btn-sm">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowDeleteConfirm(true)} className="btn-ghost btn-sm text-red-600 dark:text-red-400 hover:bg-red-50">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Completed
              </button>
            )
          )}
          <button onClick={openCreate} className="btn-primary shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',       value: stats.total,    color: 'bg-teal text-cream dark:bg-teal-800 dark:text-cream' },
          { label: 'Pending',     value: stats.pending,  color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
          { label: 'In Progress', value: stats.progress, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
          { label: 'Completed',   value: stats.done,     color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-3 ${color}`}>
            <div className="font-display font-800 text-2xl">{value}</div>
            <div className="text-xs opacity-60 font-body mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1 bg-cream-soft dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-600 capitalize transition-all whitespace-nowrap
                ${filter === f ? 'bg-white dark:bg-gray-700 text-slate dark:text-gray-100 shadow-sm' : 'text-slate/40 dark:text-gray-400 hover:text-slate dark:hover:text-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="input py-1.5 w-auto text-xs">
          <option value="created">Sort: Newest</option>
          <option value="priority">Sort: Priority</option>
          <option value="due">Sort: Due Date</option>
        </select>

        <div className="flex-1 min-w-[140px] sm:min-w-[180px] relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate/30 dark:text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-8 text-xs py-1.5" placeholder="Search tasks…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-slate/30 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-display font-600 text-sm">
            {search || filter !== 'all' ? 'No tasks match your filters' : 'No tasks yet'}
          </p>
          {!search && filter === 'all' && (
            <button onClick={openCreate} className="btn-primary btn-sm mt-4 mx-auto">
              Create your first task
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paged.map((task) => (
              <TaskCard key={task.id} task={task}
                onEdit={openEdit} onDelete={handleDelete} onComplete={handleComplete} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost btn-sm"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`btn-sm rounded-lg font-display font-600 text-xs min-w-[32px]
                    ${page === p
                      ? 'bg-accent text-white'
                      : 'btn-ghost'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSave={handleSave} initial={editTarget} />
    </div>
  )
}
