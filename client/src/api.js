import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Auto-attach admin token (skip public GETs so a stale JWT cannot break /work or /portfolio reads)
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kira_admin_token')
  const method = (cfg.method || 'get').toLowerCase()
  const path = (cfg.url || '').split('?')[0]
  const isPublicGet = method === 'get' && (path === '/work' || path === '/portfolio')
  if (token && !isPublicGet) cfg.headers['x-admin-token'] = token
  return cfg
})

// Drop stale admin session when a protected call fails (expired JWT, etc.)
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const url = String(err.config?.url || '')
    const isLogin = url.includes('/admin/login')
    if ((status === 401 || status === 403) && !isLogin) {
      const hadToken = err.config?.headers?.['x-admin-token']
      if (hadToken) {
        localStorage.removeItem('kira_admin_token')
        window.dispatchEvent(new Event('kira-auth-logout'))
      }
    }
    return Promise.reject(err)
  }
)

// ─── Portfolio ───
export const getPortfolio  = ()           => api.get('/portfolio')
export const updateStats   = (body)       => api.put('/portfolio/stats', body)
export const updateContent = (body)       => api.put('/portfolio/content', body)

// ─── Work (public read, admin write) ───
export const getWork       = (type)       => api.get('/work', { params: { type } })
export const createWork    = (body)       => api.post('/work', body)
export const updateWork    = (id, body)   => api.put(`/work/${id}`, body)
export const deleteWork    = (id)         => api.delete(`/work/${id}`)

// ─── Contact ───
export const sendContact   = (body)       => api.post('/contact', body)

// ─── Admin Auth ───
export const adminLogin    = (email, password) => api.post('/admin/login', { email, password })
export const verifyAdmin   = ()                => api.post('/admin/verify')

// ─── Admin — Messages ───
export const getMessages   = ()           => api.get('/admin/messages')
export const deleteMessage = (id)         => api.delete(`/admin/messages/${id}`)
export const markRead      = (id)         => api.put(`/admin/messages/${id}/read`)

// ─── Admin — Overview ───
export const getOverview   = ()           => api.get('/admin/overview')

// ─── Admin — Upload ───
export const uploadImage   = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export default api
