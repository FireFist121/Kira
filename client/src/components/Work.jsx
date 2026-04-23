import { useState } from 'react'
import './Work.css'

export default function Work({ work = [], category = 'projects', title, subtitle, id }) {
  // If projects, we filter out shorts. If shorts, we only show shorts.
  const isShorts = category === 'shorts'
  
  const [active, setActive] = useState('all')

  const baseItems = isShorts
    ? work.filter(w => w.type?.toLowerCase() === 'short')
    : work.filter(w => w.type?.toLowerCase() !== 'short')

  const filtered = active === 'all'
    ? baseItems
    : baseItems.filter(w => w.type?.toLowerCase() === active)

  // Only show tabs for projects to filter within (Thumbnail vs Video).
  const FILTERS = isShorts ? [] : [
    { key: 'all',       label: 'All'        },
    { key: 'thumbnail', label: 'Thumbnails' },
    { key: 'video',     label: 'Videos'     },
    { key: 'brand',     label: 'Branding'   },
  ]

  // Hide the entire section if no items exist for this category
  if (baseItems.length === 0) return null;

  return (
    <section id={id} className={`work section-pad ${isShorts ? 'shorts-bg' : ''}`}>
      <div className="container">
        <div className="section-header reveal">
          <div className="section-label">{isShorts ? '03 — Shorts' : '02 — Work'}</div>
          <h2 className="section-title">{title}</h2>
          <p className="section-sub">{subtitle}</p>
        </div>

        {!isShorts && FILTERS.length > 0 && (
          <div className="work-filters reveal">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`work-filter-btn${active === f.key ? ' active' : ''}`}
                onClick={() => setActive(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <div className={`work-grid ${isShorts ? 'shorts-grid' : ''}`}>
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className={`work-card reveal ${isShorts ? 'short-card' : ''}`}
              style={{ transitionDelay: `${i * 0.05}s` }}
              onClick={() => {
                if (item.link) {
                  window.open(item.link, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="work-img-wrapper">
                {(item.thumbnail || item.imageUrl) ? (
                  <img src={item.thumbnail || item.imageUrl} alt={item.title} className="work-img" />
                ) : (
                  <div className="work-placeholder" style={{ background: item.color || '#0d0f1a' }}>
                    <span className="work-placeholder-num">KIR4</span>
                    <div className="work-placeholder-glow" />
                  </div>
                )}
              </div>
              <div className="work-overlay">
                <div className="work-type-badge">{item.type || (isShorts ? 'Short' : 'Project')}</div>
                <div>
                  <div className="work-title">{item.title}</div>
                  <div className="work-meta">
                    {item.client ? `${item.client} · ` : ''} 
                    {item.views ? `${item.views} Views` : ''}
                  </div>
                </div>
              </div>
              
              {/* Premium hover corner accents */}
              <div className="corner-accent top-left"></div>
              <div className="corner-accent bottom-right"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
