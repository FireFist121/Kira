import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { getPortfolio } from './api'
import Layout from './components/Layout'
import Home from './pages/Home'
import AdminPage from './pages/AdminPage'
import AdminEditPage from './pages/AdminEditPage'
import AnimatedDotsBackground from './components/AnimatedDotsBackground'
import CustomCursor from './components/CustomCursor'

export default function App() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getPortfolio().then(res => setData(res.data.data)).catch(console.error)
  }, [])

  if (!data) return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '32px',
        letterSpacing: '6px',
        color: 'rgba(255,255,255,0.08)',
        textTransform: 'uppercase',
        animation: 'pulse 1.6s ease-in-out infinite',
      }}>
        KIR<span style={{ color: '#e5173f' }}>4</span>
      </div>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </div>
  )

  return (
    <>
      <AnimatedDotsBackground />
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Layout available={data.available} />}>
          <Route index element={<Home data={data} />} />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/edit/:id" element={<AdminEditPage />} />
      </Routes>
    </>
  )
}
