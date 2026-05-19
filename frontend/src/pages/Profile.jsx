import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, logout } = useAuth()
  const [username, setUsername] = useState(user?.username || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!username.trim()) return
    setSaving(true)
    try {
      const { data } = await usersAPI.updateProfile({ username })
      localStorage.setItem('user', JSON.stringify(data))
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-800 text-2xl sm:text-3xl text-slate dark:text-gray-100">Profile</h1>
        <p className="text-slate-muted dark:text-gray-400 text-sm mt-1">Manage your account settings</p>
      </div>

      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-cream-dim dark:border-gray-700">
          <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center text-accent font-display font-700 text-2xl">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-display font-700 text-lg dark:text-gray-200">{user?.username}</h2>
            <p className="text-sm text-slate/50 dark:text-gray-400">{user?.email}</p>
            <p className="text-xs text-slate/40 dark:text-gray-500 mt-0.5">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input bg-cream-soft dark:bg-gray-700 text-slate/60 dark:text-gray-400" value={user?.email || ''} disabled />
            <p className="text-xs text-slate/40 dark:text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)}
              minLength={3} required />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card p-6 mt-6 border-red-200 dark:border-red-900/50">
        <h3 className="font-display font-700 text-base text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate/50 dark:text-gray-400 mb-4">Sign out of your account on this device.</p>
        <button onClick={logout} className="btn-danger">Sign Out</button>
      </div>
    </div>
  )
}
