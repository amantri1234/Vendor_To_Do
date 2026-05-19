import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTemplates } from '../hooks/useTemplates'
import TemplateModal from '../components/TemplateModal'
import toast from 'react-hot-toast'

const PRIORITY_COLOR = { low: 'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30', medium: 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30', high: 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30' }

export default function Templates() {
  const { templates, loading, createTemplate, deleteTemplate, applyTemplate } = useTemplates()
  const [modalOpen, setModalOpen]       = useState(false)
  const [applying, setApplying]         = useState(null)
  const [confirmDel, setConfirmDel]     = useState(null)
  const navigate = useNavigate()

  const handleCreate = async (data) => {
    try { await createTemplate(data) }
    catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to create template')
      throw err
    }
  }

  const handleApply = async (id) => {
    setApplying(id)
    try {
      await applyTemplate(id)
      navigate('/dashboard')
    } catch {
      toast.error('Failed to apply template')
    } finally {
      setApplying(null)
    }
  }

  const handleDelete = async (id) => {
    if (confirmDel === id) {
      try { await deleteTemplate(id) }
      catch { toast.error('Failed to delete template') }
      setConfirmDel(null)
    } else {
      setConfirmDel(id)
      setTimeout(() => setConfirmDel(null), 2500)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-800 text-2xl sm:text-3xl text-slate dark:text-gray-100">Templates</h1>
          <p className="text-slate-muted dark:text-gray-400 text-sm mt-1">
            Create reusable task sets and apply them instantly
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </button>
      </div>

      {/* How it works banner */}
      <div className="bg-teal dark:bg-gray-800 rounded-2xl p-4 mb-6 flex items-start gap-4">
        <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="text-cream dark:text-gray-100 font-display font-600 text-sm">How Templates Work</p>
          <p className="text-cream/40 dark:text-gray-400 text-xs mt-0.5 leading-relaxed">
            Create a template with a list of predefined tasks (e.g., "Morning Routine"). 
            When you click <span className="text-accent font-medium">Apply Template</span>, all tasks are instantly added to your task list — ready to go.
          </p>
        </div>
      </div>

      {/* Template grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-24 text-slate/30 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p className="font-display font-600 text-sm">No templates yet</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary btn-sm mt-4 mx-auto">
            Create your first template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="card p-5 animate-slide-up hover:shadow-md dark:hover:shadow-gray-900/60 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-700 text-base dark:text-gray-200">{tpl.name}</h3>
                  {tpl.description && (
                    <p className="text-xs text-slate/50 dark:text-gray-400 mt-0.5 line-clamp-2">{tpl.description}</p>
                  )}
                </div>
                <span className="badge bg-cream-soft dark:bg-gray-700 text-slate/50 dark:text-gray-300 shrink-0 ml-2">
                  {tpl.template_tasks.length} task{tpl.template_tasks.length !== 1 ? 's' : ''}
                </span>
              </div>

              <ul className="space-y-1.5 mb-4">
                {tpl.template_tasks
                  .sort((a, b) => a.order - b.order)
                  .slice(0, 5)
                  .map((tt) => (
                    <li key={tt.id} className="flex items-center gap-2 text-xs text-slate/70 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
                      <span className="flex-1 truncate">{tt.title}</span>
                      <span className={`badge text-[10px] ${PRIORITY_COLOR[tt.priority]}`}>
                        {tt.priority}
                      </span>
                    </li>
                  ))}
                {tpl.template_tasks.length > 5 && (
                  <li className="text-[10px] text-slate/30 dark:text-gray-500 pl-3.5">
                    +{tpl.template_tasks.length - 5} more tasks…
                  </li>
                )}
              </ul>

              <div className="flex items-center gap-2 pt-3 border-t border-cream-dim dark:border-gray-700">
                <button
                  onClick={() => handleApply(tpl.id)}
                  disabled={applying === tpl.id}
                  className="btn-primary btn-sm flex-1 justify-center"
                >
                  {applying === tpl.id
                    ? <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Applying…
                      </span>
                    : <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Apply Template
                      </>
                  }
                </button>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  className={`btn btn-sm ${confirmDel === tpl.id ? 'btn-danger' : 'btn-ghost'}`}
                  title={confirmDel === tpl.id ? 'Click to confirm deletion' : 'Delete template'}
                >
                  {confirmDel === tpl.id ? 'Confirm?' : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TemplateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
      />
    </div>
  )
}
