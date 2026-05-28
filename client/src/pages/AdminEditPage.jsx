import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getWork, updateWork, uploadImage } from '../api'
import AdminLogin from '../components/admin/AdminLogin'
import '../components/admin/AdminDashboard.css'

const TYPE_OPTIONS = {
  thumbnail: ['Thumbnail', 'Poster', 'Before/After Slider'],
  video: ['Video', 'Short', 'Other'],
  short: ['Short', 'Video', 'Other'],
}

function tagsToString(tag) {
  if (Array.isArray(tag)) return tag.join(', ')
  return tag || ''
}

const formatViews = (views) => {
  if (!views) return '';
  const num = parseInt(views, 10);
  if (isNaN(num)) return views;
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};

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
          const pType = (found.type || 'thumbnail').toLowerCase()
          const knownValues = ['thumbnail', 'slider', 'video', 'short', 'rp', 'poster']
          const isKnown = knownValues.includes(pType)
          
          setForm({
            ...found,
            tag: tagsToString(found.tag),
            thumbnail: found.thumbnail || found.imageUrl || '',
            beforeImage: found.beforeImage || '',
            afterImage: found.afterImage || '',
            _typeMode: isKnown ? pType : 'other',
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
    
    // Validation for slider
    if (form._typeMode === 'slider') {
      if (!form.beforeImage?.trim() || !form.afterImage?.trim()) {
        return alert('Before and After images are required for sliders')
      }
    }

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

  const handleFileUpload = async (e, field = 'thumbnail') => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await uploadImage(formData)
      setForm(prev => ({ ...prev, [field]: res.data.url }))
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFetch = async () => {
    if (!form.link?.trim()) return alert('Please enter a video URL first.');
    let fetchUrl = form.link.trim();
    
    try {
      const { fetchYouTubeMetadata } = await import('../api');
      const res = await fetchYouTubeMetadata(fetchUrl);
      const data = res.data;

      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        client: data.channelName || prev.client,
        channelLink: data.channelLink || prev.channelLink,
        channelLogo: data.channelLogo || prev.channelLogo,
        thumbnail: data.thumbnail || prev.thumbnail,
        views: data.views ? formatViews(data.views) : prev.views,
        link: fetchUrl
      }));
    } catch (e) {
      console.error('Fetch error:', e);
      alert(e.response?.data?.error || 'Failed to fetch video info. Ensure the URL is valid.');
    }
  }

  const handleChannelFetch = async () => {
    if (!form.channelLink?.trim()) return alert('Please enter a channel link first.');
    let fetchUrl = form.channelLink.trim();
    
    try {
      const { fetchYouTubeMetadata } = await import('../api');
      const res = await fetchYouTubeMetadata(fetchUrl);
      const data = res.data;

      setForm(prev => ({
        ...prev,
        client: data.channelName || prev.client,
        channelLink: data.channelLink || prev.channelLink,
        channelLogo: data.channelLogo || prev.channelLogo
      }));
    } catch (e) {
      console.error('Channel fetch error:', e);
      alert(e.response?.data?.error || 'Failed to fetch channel info. Ensure the URL is valid (e.g. youtube.com/@handle).');
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

  const pType = (item.type || 'thumbnail').toLowerCase()
  const displayType = pType === 'slider' ? 'SLIDER' : pType.toUpperCase()
  const category = form._typeMode || pType
  const isShort = category === 'short'
  const isVideo = category === 'video'
  const isThumbnail = category === 'thumbnail'

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
        <h1 className="dash-page-title" style={{ marginBottom: '32px' }}>EDIT {displayType}</h1>

        <div className="admin-glass-form-card">
          <div className="admin-form-section-title">BASIC INFO</div>

          {/* Preview */}
          {((form.thumbnail || form.beforeImage || form.afterImage)) && (
            <div style={{ marginBottom: '28px' }}>
              <div className="admin-form-section-title" style={{ marginBottom: '12px' }}>PREVIEW</div>
              <div style={{
                borderRadius: '12px', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
                maxWidth: isShort ? '200px' : '360px',
              }}>
                <img
                  src={form.thumbnail || form.beforeImage || form.afterImage}
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
            <div className="admin-input-row" style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="admin-input" 
                style={{ flex: 1 }}
                placeholder={isThumbnail ? "https://example.com or YouTube link" : "https://youtube.com/..."} 
                value={form.link || ''} 
                onChange={e => setForm({...form, link: e.target.value})} 
              />
              {(isVideo || isShort) && (
                <button type="button" className="dash-btn-fetch" onClick={handleFetch}>▶ Fetch</button>
              )}
            </div>
          </div>

          {/* Type and Ratio dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-label">Type</label>
              <select
                className="admin-input"
                value={form._typeMode || category}
                onChange={e => {
                  const newType = e.target.value;
                  const updates = { _typeMode: newType, _customType: '' };
                  if (newType === 'poster' || newType === 'short') {
                    updates.aspectRatio = 'auto';
                  }
                  setForm({...form, ...updates});
                }}
              >
                {(TYPE_OPTIONS[category] || []).map(opt => (
                  <option key={opt} value={opt === 'Before/After Slider' ? 'slider' : opt.toLowerCase()}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Aspect Ratio</label>
              <select
                className="admin-input"
                value={form.aspectRatio || '16:9'}
                onChange={e => setForm({...form, aspectRatio: e.target.value})}
              >
                <option value="auto">Auto (Full Height - Best for Posters)</option>
                <option value="16:9">16:9 (Standard)</option>
                <option value="4:3">4:3 (Classic)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:5">4:5 (Instagram)</option>
                <option value="9:16">9:16 (Vertical/Shorts)</option>
                <option value="21:9">21:9 (Ultrawide)</option>
              </select>
            </div>
          </div>

          {form._typeMode === 'slider' && (
            <>
              <div className="admin-form-group">
                <label className="admin-label">Before Image URL *</label>
                <div className="admin-input-row" style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    className="admin-input" 
                    style={{ flex: 1, borderColor: !form.beforeImage?.trim() ? '#e5173f' : '' }}
                    placeholder="Paste before image URL..." 
                    value={form.beforeImage || ''} 
                    onChange={e => setForm({...form, beforeImage: e.target.value})} 
                  />
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <button type="button" className="dash-btn-fetch" disabled={isUploading}>
                      {isUploading ? '...' : 'Upload'}
                    </button>
                    <input 
                      type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'beforeImage')} disabled={isUploading}
                      style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">After Image URL *</label>
                <div className="admin-input-row" style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    className="admin-input" 
                    style={{ flex: 1, borderColor: !form.afterImage?.trim() ? '#e5173f' : '' }}
                    placeholder="Paste after image URL..." 
                    value={form.afterImage || ''} 
                    onChange={e => setForm({...form, afterImage: e.target.value})} 
                  />
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <button type="button" className="dash-btn-fetch" disabled={isUploading}>
                      {isUploading ? '...' : 'Upload'}
                    </button>
                    <input 
                      type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'afterImage')} disabled={isUploading}
                      style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

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

          {/* Channel Info — all types */}
          <div className="admin-form-group">
            <label className="admin-label">Channel Link</label>
            <div className="admin-input-row" style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="admin-input" 
                style={{ flex: 1 }}
                placeholder="https://youtube.com/@channel or channel URL" 
                value={form.channelLink || ''} 
                onChange={e => setForm({...form, channelLink: e.target.value})} 
              />
              <button type="button" className="dash-btn-fetch" onClick={handleChannelFetch}>✨ Fetch</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-label">Channel Name</label>
              <input 
                className="admin-input" 
                placeholder="Fetched automatically" 
                value={form.client || ''} 
                onChange={e => setForm({...form, client: e.target.value})} 
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Channel Logo URL</label>
              <div className="admin-input-row" style={{ display: 'flex', gap: '8px' }}>
                <input 
                  className="admin-input" 
                  style={{ flex: 1 }}
                  placeholder="Fetched logo URL" 
                  value={form.channelLogo || ''} 
                  onChange={e => setForm({...form, channelLogo: e.target.value})} 
                />
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <button type="button" className="dash-btn-fetch" disabled={isUploading}>
                    {isUploading ? '...' : 'Upload'}
                  </button>
                  <input 
                    type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'channelLogo')} disabled={isUploading}
                    style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
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
