import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="noise-bg min-h-screen bg-ink flex items-center justify-center p-4 relative">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display font-800 text-4xl text-paper tracking-tight">
            Task<span className="text-accent">Flow</span>
          </span>
          <p className="text-paper/40 text-sm mt-1 font-body">Your tasks, beautifully organized</p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
          <h1 className="font-display font-700 text-paper text-xl mb-5">Welcome back</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-paper/50">Email</label>
              <input
                type="email" className="input bg-white/5 border-white/10 text-paper placeholder:text-paper/20
                  focus:border-accent/60 focus:ring-accent/20"
                placeholder="you@example.com"
                value={form.email} onChange={set('email')} required
              />
            </div>

            <div>
              <label className="label text-paper/50">Password</label>
              <input
                type="password" className="input bg-white/5 border-white/10 text-paper placeholder:text-paper/20
                  focus:border-accent/60 focus:ring-accent/20"
                placeholder="••••••••"
                value={form.password} onChange={set('password')} required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1 py-2.5">
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-paper/40 text-xs mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-light font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
