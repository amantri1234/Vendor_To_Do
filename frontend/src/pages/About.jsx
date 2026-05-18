export default function About() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-ink">About TaskFlow</h1>
        <p className="text-ink/40 text-sm mt-1">Everything you need to know about this app</p>
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <h2 className="font-display font-700 text-base mb-2">What is TaskFlow?</h2>
          <p className="text-sm text-ink/70 leading-relaxed">
            TaskFlow is a full-stack task management application built with modern web technologies.
            It helps you organize tasks, create reusable templates, track progress, and stay productive.
          </p>
        </div>

        <div className="border-t border-paper-dim pt-4">
          <h2 className="font-display font-700 text-base mb-2">Tech Stack</h2>
          <ul className="text-sm text-ink/70 space-y-1.5">
            {[
              ['Backend', 'FastAPI (Python) — high-performance async API framework'],
              ['Database', 'SQLite (dev) / MySQL (prod) via SQLAlchemy ORM'],
              ['Auth', 'JWT tokens with bcrypt password hashing'],
              ['Frontend', 'React 18 + Vite + TailwindCSS'],
              ['Routing', 'React Router v6 with protected/public routes'],
              ['Styling', 'Custom design system with dark theme support'],
            ].map(([label, desc]) => (
              <li key={label} className="flex gap-2">
                <span className="font-display font-600 text-accent shrink-0 w-20">{label}:</span>
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-paper-dim pt-4">
          <h2 className="font-display font-700 text-base mb-2">Features</h2>
          <ul className="text-sm text-ink/70 space-y-1.5">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Create, edit, delete, and complete tasks</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Filter by status, sort by priority/due date, full-text search</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Reusable task templates with one-click apply</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Analytics dashboard with completion stats</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Multi-user with JWT authentication</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-paper-dim pt-4">
          <h2 className="font-display font-700 text-base mb-2">Version</h2>
          <p className="text-sm text-ink/70">v1.0.0 — Built with FastAPI + React</p>
        </div>
      </div>
    </div>
  )
}
