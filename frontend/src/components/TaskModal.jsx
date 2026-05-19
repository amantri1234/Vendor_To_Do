import { useState, useEffect } from 'react'

const STATUSES  = ['pending', 'in-progress', 'completed']
const PRIORITIES = ['low', 'medium', 'high']

const EMPTY = {
  title: '', description: '', status: 'pending',
  priority: 'medium', due_date: '',
}

export default function TaskModal({ open, onClose, onSave, initial }) {
  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initial
        ? {
            title:       initial.title       ?? '',
            description: initial.description ?? '',
            status:      initial.status      ?? 'pending',
            priority:    initial.priority    ?? 'medium',
            due_date:    initial.due_date
              ? new Date(initial.due_date).toISOString().slice(0, 16)
              : '',
          }
        : EMPTY
      )
    }
  }, [open, initial])

  if (!open) return null

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      }
      await onSave(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-teal/40 dark:bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md card p-6 animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-700 text-lg dark:text-gray-100">
            {initial ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="btn-icon text-slate/40 hover:text-slate dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="Task title…" value={form.title} onChange={set('title')} required />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Optional description…"
              value={form.description} onChange={set('description')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Due Date</label>
            <input type="datetime-local" className="input" value={form.due_date} onChange={set('due_date')} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving || !form.title.trim()} className="btn-primary flex-1">
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
