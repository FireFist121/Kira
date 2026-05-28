import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar({ available }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminMenu, setAdminMenu] = useState(false)
  const { user, loading, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const navigateAdmin = (hash) => {
    window.location.href = `/admin${hash}`
  }

  const scrollToSection = (sectionId) => {
    setMenuOpen(false)
    if (location.pathname === '/') {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate('/', { state: { scrollTo: sectionId } })
    }
  }

  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      const id = location.state.scrollTo
      setTimeout(() => {
        if (id === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [location])

  const NAV_ITEMS = [
    { id: 'home', label: 'Home' },
    { id: 'thumbnails', label: 'Thumbnails' },
    { id: 'videos', label: 'Videos' },
    { id: 'shorts', label: 'Shorts' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <button
          className="nav-logo"
          onClick={() => scrollToSection('home')}
        >
          KIR<span className="accent">4</span>
        </button>

        <ul className="nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.id}>
              <button
                className="nav-link nav-link-btn"
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
          {!loading && isAdmin && (
            <li>
              <a className="nav-link nav-link-btn" href="/admin">
                Dashboard
              </a>
            </li>
          )}
        </ul>

        <div className="nav-right">
          {!loading && isAdmin ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setAdminMenu(!adminMenu)}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--white)',
                  padding: '8px 16px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                ⚙ ADMIN
              </button>
              {adminMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                  background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  padding: '12px', minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                  <button onClick={() => navigateAdmin('')} style={{ background: 'none', border: 'none', color: '#fff', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '13px', borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background='none'}>Dashboard</button>
                  <button onClick={() => navigateAdmin('#new-project')} style={{ background: 'none', border: 'none', color: '#fff', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '13px', borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background='none'}>+ New Project</button>
                  <button onClick={() => navigateAdmin('#new-short')} style={{ background: 'none', border: 'none', color: '#fff', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '13px', borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background='none'}>+ New Short</button>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#f87171', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '13px', borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background='none'}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="avail-badge">
              <div className={`avail-dot${available ? '' : ' off'}`} />
              {available ? 'Available' : 'Busy'}
            </div>
          )}

          <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className="mob-link mob-link-btn"
            onClick={() => scrollToSection(item.id)}
          >
            {item.label}
          </button>
        ))}
        {!loading && isAdmin && (
          <a className="mob-link mob-link-btn" href="/admin">Dashboard</a>
        )}
      </div>
    </nav>
  )
}
