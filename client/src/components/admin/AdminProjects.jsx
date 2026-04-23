import { useState, useEffect } from 'react'
import { getWork, createWork, updateWork, deleteWork, uploadImage } from '../../api'

function tagsToString(tag) {
  if (Array.isArray(tag)) return tag.join(', ')
  return tag || ''
}

const TYPE_OPTIONS = {
  thumbnail: ['Thumbnail', 'RP', 'Other'],
  video: ['Video', 'Short', 'RP', 'Other'],
  short: ['Short', 'Video', 'RP', 'Other'],
}

const CATEGORY_PRESETS = ['Gaming', 'Design', 'Vlog', 'Tutorial', 'Montage', 'Other']

export default function AdminProjects({ category, editId, onEditClear }) {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  
  const isThumbnail = category === 'thumbnail'
  const isVideo = category === 'video'
  const isShort = category === 'short'

  const pageTitle = isThumbnail ? 'THUMBNAILS' : isVideo ? 'VIDEOS' : 'SHORTS'
  const tableColCount = isThumbnail ? 5 : isVideo ? 8 : 6

  useEffect(() => {
    load()
    setForm(null)
    setIsAdding(false)
  }, [category])

  // Auto-open edit form when editId is provided (from public page Edit button)
  useEffect(() => {
    if (editId && projects.length > 0) {
      const item = projects.find(p => String(p.id || p._id) === String(editId))
      if (item) {
        handleEdit(item)
        if (onEditClear) onEditClear()
      }
    }
  }, [editId, projects])

  const load = async () => {
    try {
      const res = await getWork('all')
      const allData = res.data.data
      
      const filtered = allData.filter(p => {
        const t = (p.type || '').toLowerCase()
        if (isThumbnail) return t === 'thumbnail'
        if (isVideo) return t === 'video'
        if (isShort) return t === 'short'
        return false
      })
      
      setProjects(filtered)
    } catch(e) { console.error('Failed to load projects', e) }
  }

  const defaultForm = () => {
    return { title: '', type: category, tag: '', featured: false, thumbnail: '', client: '', link: '', views: '', duration: '' }
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setForm({ ...defaultForm(), _typeMode: category, _customType: '' })
  }

  const handleEdit = (p) => {
    const knownTypes = (TYPE_OPTIONS[category] || []).map(t => t.toLowerCase())
    const pType = (p.type || category).toLowerCase()
    const isKnown = knownTypes.includes(pType) && pType !== 'other'
    setForm({
      ...p,
      tag: tagsToString(p.tag),
      customTag: p.customTag || '',
      thumbnail: p.thumbnail || p.imageUrl || '',
      _typeMode: isKnown ? pType : 'other',
      _customType: isKnown ? '' : p.type || '',
    })
    setIsAdding(true)
  }

  const handleCancel = () => {
    setForm(null)
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!form.title?.trim()) return alert('Title required')
    try {
      // Resolve the type
      const resolvedType = form._typeMode === 'other' 
        ? (form._customType?.trim() || category) 
        : form._typeMode || category

      const payload = { ...form, type: resolvedType }
      // Clean internal state fields
      delete payload._typeMode
      delete payload._customType
      if (form.id) {
        await updateWork(form.id, payload)
      } else {
        await createWork(payload)
      }
      handleCancel()
      load()
    } catch(e) {
      console.error(e)
      alert('Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this item?")) return
    try {
      await deleteWork(id)
      load()
    } catch(e) {}
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

  const handleFetch = async () => {
    if (!form.link?.trim()) return alert('Please enter a video URL first.');
    let fetchUrl = form.link.trim();
    let videoId = '';
    
    const watchMatch = fetchUrl.match(/[?&]v=([^&]+)/);
    const shortMatch = fetchUrl.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    const youtuMatch = fetchUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    
    if (shortMatch) videoId = shortMatch[1];
    else if (watchMatch) videoId = watchMatch[1];
    else if (youtuMatch) videoId = youtuMatch[1];

    if (fetchUrl.includes('/shorts/') && videoId) {
      fetchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    }

    try {
      const resMetadata = fetch(`https://noembed.com/embed?url=${encodeURIComponent(fetchUrl)}`).then(r => r.json());
      const resViews = (videoId && !isThumbnail) 
        ? fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`).then(r => r.json()).catch(() => ({}))
        : Promise.resolve({});

      const [data, viewsData] = await Promise.all([resMetadata, resViews]);

      if (data.error) return alert('Could not fetch video info. Ensure the video is public and valid.');

      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        client: data.author_name || prev.client,
        thumbnail: data.thumbnail_url || prev.thumbnail,
        views: viewsData.viewCount ? formatViews(viewsData.viewCount) : prev.views,
        link: fetchUrl
      }));
    } catch (e) {
      console.error('Fetch error:', e);
      alert('Failed to connect to fetch API.');
    }
  }

  const toggleFeatured = async (p) => {
    const updated = { ...p, featured: !p.featured }
    await updateWork(p.id, updated)
    load()
  }

  const [previewImg, setPreviewImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      if (res.data?.success) {
        setForm(prev => ({ ...prev, thumbnail: res.data.url }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isAdding && form) {
    return (
      <div className="admin-form-container">
        <div className="dash-header-row">
          <h1 className="dash-page-title">{form.id ? 'EDIT ' : 'ADD '} {pageTitle.slice(0, -1)}</h1>
        </div>

        <div className="admin-glass-form-card">
        <div className="admin-form-section-title">BASIC INFO</div>

        <div className="admin-form-group">
          <label className="admin-label">Title *</label>
          <input 
            className="admin-input" 
            placeholder="Title" 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})} 
          />
        </div>

        {/* Thumbnail image — all types */}
        <div className="admin-form-group">
          <label className="admin-label">Thumbnail image URL *</label>
          <div className="admin-input-row" style={{ display: 'flex', gap: '8px' }}>
            <input 
              className="admin-input" 
              style={{ flex: 1 }}
              placeholder={isShort ? "Vertical preview (9:16)" : isThumbnail ? "Direct image URL (e.g. 1920×1080)" : "Video thumbnail (16:9)"}
              value={form.thumbnail || ''} 
              onChange={e => setForm({...form, thumbnail: e.target.value})} 
            />
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <button type="button" className="dash-btn-fetch" disabled={isUploading}>
                {isUploading ? '...' : 'Upload'}
              </button>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Link — all types */}
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

        {/* Type dropdown */}
        <div className="admin-form-group">
          <label className="admin-label">Type</label>
          <select
            className="admin-input"
            value={form._typeMode || category}
            onChange={e => setForm({...form, _typeMode: e.target.value, _customType: ''})}
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
              onChange={e => setForm({...form, _customType: e.target.value})}
            />
          </div>
        )}

        {/* Channel Name — all types */}
        <div className="admin-form-group">
          <label className="admin-label">Channel Name</label>
          <input 
            className="admin-input" 
            placeholder="e.g. Channel or creator name" 
            value={form.client || ''} 
            onChange={e => setForm({...form, client: e.target.value})} 
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Tags (comma separated)</label>
          <input 
            className="admin-input" 
            placeholder="e.g. Gaming, Vlogs" 
            value={form.tag || ''} 
            onChange={e => setForm({...form, tag: e.target.value})} 
          />
        </div>

        {(isVideo || isShort) && (
          <div className="admin-form-group">
            <label className="admin-label">Views</label>
            <input 
              className="admin-input" 
              placeholder="e.g. 1.2M" 
              value={form.views || ''} 
              onChange={e => setForm({...form, views: e.target.value})} 
            />
          </div>
        )}

        {isVideo && (
          <div className="admin-form-group">
            <label className="admin-label">Duration</label>
            <input 
              className="admin-input" 
              placeholder="e.g. 14:05" 
              value={form.duration || ''} 
              onChange={e => setForm({...form, duration: e.target.value})} 
            />
          </div>
        )}

        <div className="admin-checkbox-row" style={{ marginTop: '24px' }}>
          <input 
            type="checkbox" 
            checked={form.featured || false} 
            onChange={e => setForm({...form, featured: e.target.checked})} 
            id="featuredToggle"
          />
          <label htmlFor="featuredToggle" className="admin-checkbox-label">Featured (pin to top)</label>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          <button type="button" className="dash-btn-white" onClick={handleSave}>Save</button>
          <button type="button" style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }} onClick={handleCancel}>Cancel</button>
        </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="dash-header-row">
        <h1 className="dash-page-title">{pageTitle}</h1>
        <button 
          type="button"
          className="dash-btn-white" 
          style={{ borderRadius: '50px', padding: '12px 24px' }}
          onClick={handleAddNew}
        >
          + Add {pageTitle.slice(0, -1)}
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>PREVIEW</th>
              <th>TITLE</th>
              {isVideo && <th>CREATOR</th>}
              <th>TAGS</th>
              {!isThumbnail && <th>VIEWS</th>}
              {isVideo && <th>DURATION</th>}
              <th>FEATURED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const displayTags = Array.isArray(p.tag) ? p.tag.join(', ') : (p.tag || '-');
              const previewImageUrl = p.thumbnail || p.imageUrl || '';

              return (
                 <tr key={p.id}>
                    <td>
                      <div 
                        style={{
                          width: isShort ? '40px' : '80px', 
                          height: isShort ? '71px' : '45px', 
                          background: '#111', 
                          borderRadius: '4px', 
                          overflow: 'hidden',
                          cursor: isThumbnail ? 'zoom-in' : 'default',
                          border: '1px solid #333'
                        }}
                        onClick={() => {
                          if (isThumbnail && previewImageUrl) setPreviewImg(previewImageUrl);
                        }}
                      >
                         {previewImageUrl && (
                           <img src={previewImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         )}
                      </div>
                    </td>
                    <td>
                      <span className="admin-table-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</span>
                    </td>
                    
                    {isVideo && (
                      <td style={{ color: '#aaa', fontSize: '13px' }}>
                        {p.client || '-'}
                      </td>
                    )}

                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                         {String(displayTags).split(',').filter(Boolean).map(t => (
                           <span key={t} className="admin-badge" style={{ background: 'rgba(255,255,255,0.05)', textTransform: 'capitalize' }}>{t.trim()}</span>
                         ))}
                      </div>
                    </td>

                    {!isThumbnail && (
                      <td style={{ color: '#aaa', fontSize: '13px' }}>{p.views || '0'}</td>
                    )}

                    {isVideo && (
                      <td style={{ color: '#aaa', fontSize: '13px' }}>{p.duration || '-'}</td>
                    )}

                    <td>
                      <div 
                        className={`featured-toggle ${p.featured ? 'on' : ''}`}
                        onClick={() => toggleFeatured(p)}
                      ></div>
                    </td>
                    
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" className="admin-action-btn" onClick={() => handleEdit(p)}>Edit</button>
                        <button type="button" className="admin-action-btn" onClick={() => handleDelete(p.id)} style={{ color: '#e5173f' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
              )
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={tableColCount} style={{ textAlign: 'center', color: '#555', padding: '60px 0' }}>
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {previewImg && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setPreviewImg(null)}
        >
          <img src={previewImg} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
        </div>
      )}
    </>
  )
}
