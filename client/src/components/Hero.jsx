import { useEffect, useRef, useState } from 'react'
import './Hero.css'

function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        let current = 0
        const step = Math.ceil(target / 60)
        const iv = setInterval(() => {
          current = Math.min(current + step, target)
          setVal(current)
          if (current >= target) clearInterval(iv)
        }, 24)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{val}{suffix}</span>
}

export default function Hero({ data }) {
  const { stats = {}, available, tagline } = data || {}

  return (
    <section id="home" className="hero">
      <div className="hero-inner container">
        <div className="hero-tag">
          <span className="hero-tag-line" />
          Jaipur, India · {available ? 'Open for work' : 'Currently busy'}
        </div>

        <h1 className="hero-title">
          <span className="hero-title-row">
            <span className="line1">KIR<span className="accent">4</span></span>
          </span>
          <span className="hero-title-row">
            <span className="line2">DESIGNS</span>
          </span>
        </h1>

        <div className="hero-bottom">
          <div className="hero-left">
            <p className="hero-desc">
              <strong>{tagline || 'Thumbnail Designer × Video Editor.'}</strong>{' '}
              Engineered for click-through. Built for creators who can't afford to be ignored.
            </p>
            <div className="hero-cta">
              <a
                href="#thumbnails"
                className="btn btn-primary"
                onClick={e => { e.preventDefault(); document.querySelector('#thumbnails')?.scrollIntoView({ behavior: 'smooth' }) }}
              >
                View Work
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="#contact"
                className="btn btn-ghost"
                onClick={e => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) }}
              >
                Let's Talk
              </a>
            </div>
          </div>

          <div className="hero-stats">
            {[
              { num: parseInt(stats.projects) || 50, suffix: '+', label: 'Projects' },
              { num: parseInt(stats.clients)  || 30,  suffix: '+', label: 'Clients'  },
              { num: parseInt(stats.years)    || 3,   suffix: '+', label: 'Years'    },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-num">
                  <Counter target={s.num} suffix={s.suffix} />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}
