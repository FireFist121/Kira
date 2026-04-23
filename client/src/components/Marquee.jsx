import './Marquee.css'

const ITEMS = [
  'THUMBNAIL DESIGN', 'VIDEO EDITING', 'COLOR GRADING',
  'MOTION GRAPHICS', 'BRAND IDENTITY', 'SOCIAL MEDIA',
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="marquee-strip">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
