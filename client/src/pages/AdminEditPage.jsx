import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getWork, updateWork, uploadImage } from '../api'
import AdminLogin from '../components/admin/AdminLogin'
import '../components/admin/AdminDashboard.css'

const TYPE_OPTIONS = {
  thumbnail: ['Thumbnail', 'RP', 'Other'],
  video: ['Video', 'Short', 'RP', 'Other'],
  short: ['Short', 'Video', 'RP', 'Other'],
}

function tagsToString(tag) {
  if (Array.isArray(tag)) return tag.join(', ')
  return tag || ''
}

export default function AdminEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading, login } = useAuth()

  const [item, setItem] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load the specific item
  useEffect(() => {
    if (!user || user.role !== 'admin') return
    const fetchItem = async () => {
      try {
        const res = await getWork('all')
        const all = res.data.data
        const found = all.find(w => String(w.id || w._id) === String(id))
        if (found) {
          setItem(found)
          const category = (found.type || 'thumbnail').toLowerCase()
          const knownTypes = (TYPE_OPTIONS[category] || []).map(t => t.toLowerCase())
          const isKnown = knownTypes.includes(category) && category !== 'other'
          setForm({
            ...found,
            tag: tagsToString(found.tag),
            thumbnail: found.thumbnail || found.imageUrl || '',
            _typeMode: isKnown ? category : 'other',
            _customType: isKnown ? '' : found.type || '',
          })
        }
      } catch (e) {
        console.error('Failed to load item', e)
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id, user])

  const handleSave = async () => {
    if (!form?.title?.trim()) return alert('Title required')
    setSaving(true)
    try {
      const resolvedType = form._typeMode === 'other'
        ? (form._customType?.trim() || item.type)
        : form._typeMode || item.type

      const payload = { ...form, type: resolvedType }
      delete payload._typeMode
      delete payload._customType

      await updateWork(form.id, payload)
      navigate('/')
    } catch (e) {
      console.error(e)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await uploadImage(formData)
      setForm(prev => ({ ...prev, thumbnail: res.data.url }))
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  // Auth gate
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1012' }}>
        <div className="admin-loading"><div className="admin-spinner" /></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <AdminLogin onLogin={(token, userPayload) => login(token, userPayload)} />
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1012' }}>
        <div className="admin-loading"><div className="admin-spinner" /></div>
      </div>
    )
  }

  if (!item || !form) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1012', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Item not found</h2>
          <button onClick={() => navigate('/admin')} style={{ background: 'rgba(229,23,63,0.15)', color: '#e5173f', border: '1px solid rgba(229,23,63,0.3)', padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const category = (item.type || 'thumbnail').toLowerCase()
  const isThumbnail = category === 'thumbnail'
  const isVideo = category === 'video'
  const isShort = category === 'short'
  const pageTitle = isThumbnail ? 'THUMBNAIL' : isVideo ? 'VIDEO' : 'SHORT'

  return (
    <div className="dash-root" style={{ flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(15,16,18,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <button
          onClick={() => navigate('/admin')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#ccc', padding: '10px 20px', borderRadius: '10px',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            fontFamily: "'Inter', sans-serif", letterSpacing: '0.5px',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff' }}
          onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#ccc' }}
        >
          <FiArrowLeft size={14} /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: saving ? 'rgba(229,23,63,0.3)' : '#e5173f',
              border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '10px',
              cursor: saving ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 700,
              fontFamily: "'Inter', sans-serif", letterSpacing: '0.5px',
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 16px rgba(229,23,63,0.3)',
            }}
          >
            <FiSave size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <h1 className="dash-page-title" style={{ marginBottom: '32px' }}>EDIT {pageTitle}</h1>

        <div className="admin-glass-form-card">
          <div className="admin-form-section-title">BASIC INFO</div>

          {/* Preview */}
          {form.thumbnail && (
            <div style={{ marginBottom: '28px' }}>
              <div className="admin-form-section-title" style={{ marginBottom: '12px' }}>PREVIEW</div>
              <div style={{
                borderRadius: '12px', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
                maxWidth: isShort ? '200px' : '360px',
              }}>
                <img
                  src={form.thumbnail}
                  alt="Preview"
                  style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  onError={e => e.target.style.display = 'none'}
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="admin-form-group">
            <label className="admin-label">Title *</label>
            <input
              className="admin-input"
              placeholder="Title"
              value={form.title || ''}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Thumbnail URL */}
          <div className="admin-form-group">
            <label className="admin-label">Thumbnail image URL *</label>
            <div className="admin-input-row" style={{ display: 'flex', gap: '8px' }}>
              <input
                className="admin-input"
                style={{ flex: 1 }}
                placeholder={isShort ? "Vertical preview (9:16)" : isThumbnail ? "Direct image URL" : "Video thumbnail (16:9)"}
                value={form.thumbnail || ''}
                onChange={e => setForm({ ...form, thumbnail: e.target.value })}
              />
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <button type="button" className="dash-btn-fetch" disabled={isUploading}>
                  {isUploading ? '...' : 'Upload'}
                </button>
                <input
                  type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading}
                  style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Link */}
          <div className="admin-form-group">
            <label className="admin-label">{(isVideo || isShort) ? 'Video URL' : 'Link (redirect URL)'}</label>
            <input
              className="admin-input"
              placeholder={isThumbnail ? "https://example.com or YouTube link" : "https://youtube.com/..."}
              value={form.link || ''}
              onChange={e => setForm({ ...form, link: e.target.value })}
            />
          </div>

          {/* Type dropdown */}
          <div className="admin-form-group">
            <label className="admin-label">Type</label>
            <select
              className="admin-input"
              value={form._typeMode || category}
              onChange={e => setForm({ ...form, _typeMode: e.target.value, _customType: '' })}
            >
              {(TYPE_OPTIONS[category] || []).map(opt => (
                <option key={opt} value={opt.toLowerCase()}>{opt}</option>
              ))}
            </select>
          </div>

          {form._typeMode === 'other' && (
            <div className="admin-form-group">
              <label className="admin-label">Custom Type</label>
              <input
                className="admin-input"
                placeholder="e.g. Montage, Reel, Edit..."
                value={form._customType || ''}
                onChange={e => setForm({ ...form, _customType: e.target.value })}
              />
            </div>
          )}

          {/* Channel Name */}
          <div className="admin-form-group">
            <label className="admin-label">Channel Name</label>
            <input
              className="admin-input"
              placeholder="e.g. Channel or creator name"
              value={form.client || ''}
              onChange={e => setForm({ ...form, client: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div className="admin-form-group">
            <label className="admin-label">Tags (comma separated)</label>
            <input
              className="admin-input"
              placeholder="e.g. Gaming, Vlogs"
              value={form.tag || ''}
              onChange={e => setForm({ ...form, tag: e.target.value })}
            />
          </div>

          {/* Views */}
          {(isVideo || isShort) && (
            <div className="admin-form-group">
              <label className="admin-label">Views</label>
              <input
                className="admin-input"
                placeholder="e.g. 1.2M"
                value={form.views || ''}
                onChange={e => setForm({ ...form, views: e.target.value })}
              />
            </div>
          )}

          {/* Duration */}
          {isVideo && (
            <div className="admin-form-group">
              <label className="admin-label">Duration</label>
              <input
                className="admin-input"
                placeholder="e.g. 14:05"
                value={form.duration || ''}
                onChange={e => setForm({ ...form, duration: e.target.value })}
              />
            </div>
          )}

          {/* Featured */}
          <div className="admin-checkbox-row" style={{ marginTop: '24px' }}>
            <input
              type="checkbox"
              checked={form.featured || false}
              onChange={e => setForm({ ...form, featured: e.target.checked })}
              id="featuredToggle"
            />
            <label htmlFor="featuredToggle" className="admin-checkbox-label">Featured (pin to top)</label>
          </div>

          {/* Bottom actions */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
            <button type="button" className="dash-btn-white" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
