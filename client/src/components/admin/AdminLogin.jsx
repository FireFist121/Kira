import { useState } from 'react'
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft, FiShield } from 'react-icons/fi'
import { adminLogin } from '../../api'
import './AdminLogin.css'

export default function AdminLogin({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Both fields are required.'); return }
    setLoading(true)
    try {
      const res = await adminLogin(email, password)
      const { token, user } = res.data
      onLogin(token, user || { email: email.trim(), role: 'admin' })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Top accent bar */}
        <div className="login-accent-bar" />

        <div className="login-card-body">
          {/* Logo */}
          <div className="login-logo">
            KIR<span className="accent">4</span>
          </div>
          <div className="login-subtitle">Admin Portal · Restricted Access</div>

          <div className="login-divider" />

          <h1 className="login-heading">Welcome back</h1>
          <p className="login-desc">Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Email */}
            <div className="login-field">
              <label className="login-label">Email</label>
              <div className="login-input-wrap">
                <FiMail className="login-input-icon" />
                <input
                  type="email"
                  className="login-input"
                  placeholder="admin@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <FiLock className="login-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <FiAlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <><span className="login-spinner"/>Authenticating...</> : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <a href="/" className="login-back">
              <FiArrowLeft size={12} />
              Back to Portfolio
            </a>
            <span className="login-secure">
              <FiShield size={12} />
              Secure connection
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
