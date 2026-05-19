import { useState } from 'react'

const PRIORITIES = ['low', 'medium', 'high']
const EMPTY_TASK = { title: '', description: '', priority: 'medium', order: 0 }

export default function TemplateModal({ open, onClose, onSave }) {
  const [name, setName]       = useState('')
  const [desc, setDesc]       = useState('')
  const [tasks, setTasks]     = useState([{ ...EMPTY_TASK }])
  const [saving, setSaving]   = useState(false)

  if (!open) return null

  const handleClose = () => {
    setName(''); setDesc(''); setTasks([{ ...EMPTY_TASK }])
    onClose()
  }

  const setTask = (i, k) => (e) =>
    setTasks((prev) => prev.map((t, idx) => idx === i ? { ...t, [k]: e.target.value } : t))

  const addTask = () =>
    setTasks((prev) => [...prev, { ...EMPTY_TASK, order: prev.length }])

  const removeTask = (i) =>
    setTasks((prev) => prev.filter((_, idx) => idx !== i).map((t, idx) => ({ ...t, order: idx })))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || tasks.some((t) => !t.title.trim())) return
    setSaving(true)
    try {
      await onSave({ name, description: desc, tasks })
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-teal/40 dark:bg-gray-950/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg card p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-700 text-lg dark:text-gray-100">New Template</h2>
          <button onClick={handleClose} className="btn-icon text-slate/40 hover:text-slate dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Template Name *</label>
            <input className="input" placeholder="e.g. Morning Routine" value={name}
              onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} placeholder="What is this template for?"
              value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Tasks in template</label>
              <button type="button" onClick={addTask}
                className="text-xs text-accent hover:text-accent-dark font-display font-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add task
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((task, i) => (
                <div key={i} className="bg-cream-soft dark:bg-gray-700/50 rounded-xl p-3 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/10 dark:bg-accent/20 text-accent text-[10px] font-mono font-600
                                     flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      className="input bg-white dark:bg-gray-800 text-sm py-1.5"
                      placeholder={`Task ${i + 1} title…`}
                      value={task.title}
                      onChange={setTask(i, 'title')}
                      required
                    />
                    {tasks.length > 1 && (
                      <button type="button" onClick={() => removeTask(i)}
                        className="shrink-0 btn-icon text-slate/30 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pl-7">
                    <input
                      className="input bg-white dark:bg-gray-800 text-xs py-1.5"
                      placeholder="Description (optional)"
                      value={task.description}
                      onChange={setTask(i, 'description')}
                    />
                    <select className="input bg-white dark:bg-gray-800 text-xs py-1.5" value={task.priority}
                      onChange={setTask(i, 'priority')}>
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p} priority</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving || !name.trim() || tasks.some((t) => !t.title.trim())}
              className="btn-primary flex-1">
              {saving ? 'Creating…' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
