export default function About() {
  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-800 text-2xl sm:text-3xl text-slate dark:text-gray-100">About TaskFlow</h1>
        <p className="text-slate-muted dark:text-gray-400 text-sm mt-1">Your tasks, secured and organized</p>
      </div>

      <div className="card p-4 sm:p-6 space-y-6">
        <div>
          <h2 className="font-display font-700 text-base mb-3">Why TaskFlow?</h2>
          <p className="text-sm text-slate/70 dark:text-gray-300 leading-relaxed">
            TaskFlow is a modern task management platform designed for teams and individuals who need 
            a reliable, secure, and fast way to manage their work. Unlike generic todo apps, TaskFlow 
            prioritizes your data security while delivering a premium experience.
          </p>
        </div>

        <div className="border-t border-cream-dim dark:border-gray-700 pt-4">
          <h2 className="font-display font-700 text-base mb-3">Key Advantages</h2>
          <ul className="space-y-3">
            {[
              ['Enterprise-Grade Security', 'Passwords are hashed with bcrypt, sessions use JWT tokens, API endpoints are rate-limited, and account lockout prevents brute-force attacks.'],
              ['Your Data Stays Yours', 'All data is encrypted in transit via HTTPS. MongoDB Atlas provides automated backups, encryption at rest, and enterprise-grade infrastructure.'],
              ['Lightning Fast', 'Built on FastAPI (async Python) and MongoDB — tasks load instantly even with thousands of entries.'],
              ['Reusable Templates', 'Create task templates once and apply them in one click. Perfect for recurring workflows like onboarding, maintenance checks, or daily routines.'],
              ['Analytics at a Glance', 'Track completion rates, priority breakdowns, and overdue tasks with real-time analytics.'],
              ['Works Everywhere', 'Use TaskFlow on desktop, tablet, or mobile. The responsive design adapts to your screen.'],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                <div>
                  <span className="font-display font-600 text-sm text-slate dark:text-gray-200">{title}</span>
                  <p className="text-xs text-slate/50 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-cream-dim dark:border-gray-700 pt-4">
          <h2 className="font-display font-700 text-base mb-3">Security Architecture</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Password Hashing', 'bcrypt with salt rounds — passwords are never stored in plain text.'],
              ['JWT Authentication', 'Stateless tokens expire after 60 minutes. No session data stored server-side.'],
              ['Rate Limiting', '5 login attempts per minute, 3 register attempts per minute — prevents brute force.'],
              ['Account Lockout', '10 failed attempts locks the account for 15 minutes.'],
              ['Security Headers', 'HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy set on every response.'],
              ['No Stack Leaks', 'Production errors return generic messages — no internal details exposed.'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-cream-soft dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-display font-600 text-xs text-accent mb-1">{title}</div>
                <p className="text-xs text-slate/60 dark:text-gray-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-cream-dim dark:border-gray-700 pt-4">
          <h2 className="font-display font-700 text-base mb-3">Data Safety</h2>
          <ul className="space-y-2 text-sm text-slate/70 dark:text-gray-300">
            {[
              'All API traffic is encrypted with TLS/SSL in production.',
              'Database hosted on MongoDB Atlas with automated daily backups and 99.95% uptime SLA.',
              'Data stored in isolated collections — each user only sees their own tasks.',
              'Passwords are salted and hashed — even database access cannot reveal plaintext passwords.',
              'Sensitive fields (passwords, tokens) are never logged or exposed in error responses.',
              'You can delete your account and all associated data at any time.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-cream-dim dark:border-gray-700 pt-4">
          <h2 className="font-display font-700 text-base mb-3">Quick Guide</h2>
          <ol className="space-y-3 text-sm text-slate/70 dark:text-gray-300">
            {[
              ['Create an account', 'Sign up with your email, username, and a strong password (12+ chars with mixed case, numbers, and symbols).'],
              ['Add tasks', 'Click "New Task" to add a task with a title, description, priority, due date, and status.'],
              ['Stay organized', 'Use filters (All/Pending/In Progress/Completed), search by keyword, and sort by date, priority, or due date.'],
              ['Build templates', 'Got recurring tasks? Create a template with predefined tasks and apply it anytime with one click.'],
              ['Track progress', 'Visit Analytics to see completion rates, status breakdowns, and priority distribution.'],
              ['Manage your profile', 'Update your username or change your password from the Profile page.'],
            ].map(([step, desc], i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-display font-600 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <span className="font-display font-600 text-slate dark:text-gray-200">{step}</span>
                  <p className="text-xs text-slate/50 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-cream-dim dark:border-gray-700 pt-4">
          <h2 className="font-display font-700 text-base mb-2">Version</h2>
          <p className="text-sm text-slate/70 dark:text-gray-400">v1.0.0 — Built with FastAPI + React + MongoDB</p>
        </div>
      </div>
    </div>
  )
}
