/**
 * Unified Project Card — used for Thumbnails, Videos, and Shorts.
 * 
 * Design: Image on top → tags + views → title → divider → client + link icon
 * Admin: Edit + Delete buttons on hover (only when isAdmin=true)
 */
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import './ProjectCard.css'

export default function ProjectCard({
  title = '',
  image = '',
  views = '',
  tags = [],
  client = '',
  link = '',
  type = 'thumbnail',
  onClick,
  isAdmin = false,
  onEdit,
  onDelete,
}) {
  const tagList = Array.isArray(tags) ? tags.filter(Boolean) : []
  const hasImage = Boolean(image?.trim())
  const hasLink = Boolean(link?.trim())

  const handleClick = (e) => {
    // Don't trigger card click if admin buttons were clicked
    if (e.target.closest('.project-card-admin-actions')) return
    if (onClick) onClick()
    else if (hasLink) window.open(link, '_blank', 'noopener,noreferrer')
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    if (onEdit) onEdit()
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) onDelete()
  }

  return (
    <div className="project-card" onClick={handleClick} role="button" tabIndex={0}>
      {/* ── Image ── */}
      <div className="project-card-img-wrap">
        {hasImage ? (
          <img
            src={image}
            alt={title || type}
            loading="lazy"
            className="project-card-img"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling && (e.target.nextSibling.style.display = 'flex')
            }}
          />
        ) : null}
        <div className="project-card-img-fallback" style={{ display: hasImage ? 'none' : 'flex' }}>
          {title || type.toUpperCase()}
        </div>
        {/* Hover overlay */}
        <div className="project-card-hover-overlay">
          <div className="project-card-play-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

      </div>

      {/* ── Info Area ── */}
      <div className="project-card-info">
        {/* Tags + Views row */}
        {(tagList.length > 0 || views) && (
          <div className="project-card-meta-row">
            <div className="project-card-tags">
              {tagList.slice(0, 3).map(t => (
                <span key={t} className="project-card-tag">{t}</span>
              ))}
            </div>
            {views && (
              <span className="project-card-views">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {views}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="project-card-title">{title || 'Untitled'}</h3>

        {/* Divider */}
        <div className="project-card-divider" />

        {/* Client + Link */}
        <div className="project-card-footer">
          <span className="project-card-client">{client || 'KIRA'}</span>
          {(hasLink || onClick) && (
            <svg className="project-card-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          )}
        </div>

        {/* Admin actions — below footer, visible on hover */}
        {isAdmin && (
          <div className="project-card-admin-actions">
            <button className="project-card-admin-btn project-card-admin-edit" onClick={handleEdit} title="Edit">
              <FiEdit2 size={13} />
              <span>Edit</span>
            </button>
            <button className="project-card-admin-btn project-card-admin-delete" onClick={handleDelete} title="Delete">
              <FiTrash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
