import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ email: '', username: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
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
    <div className="noise-bg min-h-screen bg-ink flex items-center justify-center p-4 relative">
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display font-800 text-4xl text-paper tracking-tight">
            Task<span className="text-accent">Flow</span>
          </span>
          <p className="text-paper/40 text-sm mt-1 font-body">Start organizing your life</p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
          <h1 className="font-display font-700 text-paper text-xl mb-5">Create account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-paper/50">Email</label>
              <input type="email"
                className="input bg-white/5 border-white/10 text-paper placeholder:text-paper/20 focus:border-accent/60 focus:ring-accent/20"
                placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="label text-paper/50">Username</label>
              <input
                className="input bg-white/5 border-white/10 text-paper placeholder:text-paper/20 focus:border-accent/60 focus:ring-accent/20"
                placeholder="yourname" value={form.username} onChange={set('username')}
                minLength={3} required />
            </div>

            <div>
              <label className="label text-paper/50">Password</label>
              <input type="password"
                className="input bg-white/5 border-white/10 text-paper placeholder:text-paper/20 focus:border-accent/60 focus:ring-accent/20"
                placeholder="Min. 6 characters" value={form.password} onChange={set('password')}
                minLength={6} required />
            </div>

            <div>
              <label className="label text-paper/50">Confirm Password</label>
              <input type="password"
                className="input bg-white/5 border-white/10 text-paper placeholder:text-paper/20 focus:border-accent/60 focus:ring-accent/20"
                placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1 py-2.5">
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating…
                  </span>
                : 'Create account'}
            </button>
          </form>

          <p className="text-center text-paper/40 text-xs mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-light font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
