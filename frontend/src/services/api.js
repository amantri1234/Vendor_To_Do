import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,   // 15s — fail fast instead of hanging forever
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    // Normalise network / timeout errors into a readable message
    if (!err.response) {
      err.message = err.code === 'ECONNABORTED'
        ? 'Request timed out — please try again'
        : 'Network error — check your connection'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  list:            ()         => api.get('/tasks'),
  create:          (data)     => api.post('/tasks', data),
  update:          (id, data) => api.put(`/tasks/${id}`, data),
  delete:          (id)       => api.delete(`/tasks/${id}`),
  complete:        (id)       => api.patch(`/tasks/${id}/complete`),
  stats:           ()         => api.get('/tasks/stats'),
  bulkDelete:      (ids)      => api.post('/tasks/bulk-delete', ids),
  deleteCompleted: ()         => api.delete('/tasks/completed'),
}

// ── Templates ─────────────────────────────────────────────────────────────────
export const templatesAPI = {
  list:       ()     => api.get('/templates'),
  create:     (data) => api.post('/templates', data),
  delete:     (id)   => api.delete(`/templates/${id}`),
  applyTasks: (id)   => api.post(`/templates/${id}/create-tasks`),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: ()       => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
}

export default api
