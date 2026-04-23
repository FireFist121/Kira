import { useAuth } from '../context/AuthContext'
import AdminLogin from '../components/admin/AdminLogin'
import AdminDashboard from '../components/admin/AdminDashboard'

export default function AdminPage() {
  const { user, loading, login, logout } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'transparent' }}>
        <div className="admin-loading">
          <div className="admin-spinner" />
        </div>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return <AdminLogin onLogin={(token, userPayload) => login(token, userPayload)} />
  }

  return <AdminDashboard onLogout={logout} />
}
