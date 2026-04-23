/**
 * Confirm Modal — Premium glassmorphic delete confirmation
 */
import { useEffect } from 'react'
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi'
import './ConfirmModal.css'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Close button */}
        <button className="confirm-close" onClick={onCancel} aria-label="Close">
          <FiX size={18} />
        </button>

        {/* Icon */}
        <div className="confirm-icon-wrap">
          <FiAlertTriangle size={28} />
        </div>

        {/* Text */}
        <h2 className="confirm-title">{title || 'Delete Item?'}</h2>
        <p className="confirm-message">
          {message || 'This action cannot be undone. Are you sure you want to permanently delete this item?'}
        </p>

        {/* Actions */}
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-btn-delete" onClick={onConfirm}>
            <FiTrash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
