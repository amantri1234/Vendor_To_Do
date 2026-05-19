import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PASSWORD_RULES = [
  { test: (v) => v.length >= 12, label: 'At least 12 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
  { test: (v) => /\d/.test(v), label: 'One digit' },
  { test: (v) => /[!@#$%^&*(),.?":{}|<>_-]/.test(v), label: 'One special character' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ email: '', username: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const passwordErrors = PASSWORD_RULES.filter((r) => !r.test(form.password)).map((r) => r.label)
  const passwordValid = passwordErrors.length === 0 && form.password.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (!passwordValid) {
      toast.error('Password does not meet all requirements')
      return
    }
    setLoading(true)
    try {
      await register(form.email, form.username, form.password)
      navigate('/dashboard')
      toast.success('Account created!')
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(Array.isArray(detail) ? detail[0]?.msg : (detail ?? 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-teal via-teal to-teal-soft dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-10">
          <span className="font-display font-700 text-3xl text-cream tracking-tight">
            Task<span className="text-accent">Flow</span>
          </span>
          <p className="text-cream/40 text-sm mt-1.5 font-body tracking-wide">Enterprise task management</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-7">
          <h1 className="font-display font-600 text-slate dark:text-gray-100 text-lg mb-6">Create account</h1>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input"
                placeholder="you@company.com" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="label">Username</label>
              <input className="input"
                placeholder="yourname" value={form.username} onChange={set('username')}
                minLength={3} required />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" className="input"
                placeholder="Min. 12 characters" value={form.password} onChange={set('password')}
                minLength={12} required />
              {form.password.length > 0 && !passwordValid && (
                <ul className="mt-1.5 space-y-0.5">
                  {PASSWORD_RULES.map((r) => {
                    const ok = r.test(form.password)
                    return (
                      <li key={r.label} className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate/40 dark:text-gray-400'}`}>
                        <svg className={`w-3 h-3 ${ok ? 'text-emerald-500' : 'text-slate/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {ok
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          }
                        </svg>
                        {r.label}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input"
                placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            </div>

            <button type="submit" disabled={loading || (!passwordValid && form.password.length > 0)}
              className="w-full py-2.5 rounded-lg bg-teal text-white font-body font-medium text-sm
                hover:bg-teal-soft transition-colors focus:outline-none focus:ring-2 focus:ring-teal/40
                disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating…
                  </span>
                : 'Create account'}
            </button>
          </form>

          <p className="text-center text-slate-muted/50 dark:text-gray-400 text-xs mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-dark hover:text-accent font-medium dark:text-accent">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
