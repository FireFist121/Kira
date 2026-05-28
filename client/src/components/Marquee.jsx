import { useMemo } from 'react'
import './Marquee.css'

const DEFAULT_ITEMS = [
  'THUMBNAIL DESIGN', 'VIDEO EDITING', 'COLOR GRADING',
  'MOTION GRAPHICS', 'BRAND IDENTITY', 'SOCIAL MEDIA',
]

export default function Marquee({ items }) {
  const displayItems = useMemo(() => {
    if (!items) return DEFAULT_ITEMS.map(s => ({ name: s, logo: '' }))
    
    if (Array.isArray(items)) {
      // It's already the new creators array
      return items.map(item => typeof item === 'string' ? { name: item, logo: '' } : item)
    }
    
    // It's the legacy comma-separated string
    return items.split(',').map(s => ({ name: s.trim(), logo: '' })).filter(c => c.name)
  }, [items])

  // Ensure we have enough items to fill the track and loop seamlessly
  let list = [...displayItems]
  if (list.length > 0) {
    while (list.length < 10) {
      list = [...list, ...displayItems]
    }
  }
  
  const doubled = [...list, ...list]
  return (
    <div className="marquee-strip">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <div key={i} className="marquee-item">
            {item.logo && (
              <div className="marquee-logo-outer">
                <img src={item.logo} alt="" className="marquee-logo" />
              </div>
            )}
            <div className="marquee-content-wrap">
              <span className="marquee-name">{item.name}</span>
              {item.subs && <span className="marquee-subs">{item.subs} Subscribers</span>}
            </div>
            <span className="marquee-dot">✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}
