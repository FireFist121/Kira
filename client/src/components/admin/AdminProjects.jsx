import { useState, useEffect } from 'react'
import { getWork, createWork, updateWork, deleteWork, uploadImage, reorderWork } from '../../api'

function tagsToString(tag) {
  if (Array.isArray(tag)) return tag.join(', ')
  return tag || ''
}

const TYPE_OPTIONS = {
  thumbnail: ['Thumbnail', 'Before/After Slider', 'Poster'],
  video: ['Video', 'Short', 'Other'],
  short: ['Short', 'Video', 'Other'],
}

const CATEGORY_PRESETS = ['Gaming', 'Design', 'Vlog', 'Tutorial', 'Montage', 'Other']

export default function AdminProjects({ category, editId, onEditClear }) {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [draggedId, setDraggedId] = useState(null)

  const handleDragStart = (e, id) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => {
      e.target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnter = (e, targetId) => {
    e.preventDefault()
    if (draggedId === targetId || !draggedId) return
    
    setProjects(prev => {
      const items = [...prev]
      const draggedIdx = items.findIndex(i => i.id === draggedId || i._id === draggedId)
      const targetIdx = items.findIndex(i => i.id === targetId || i._id === targetId)
      
      if (draggedIdx === -1 || targetIdx === -1) return items
      
      const [draggedItem] = items.splice(draggedIdx, 1)
      items.splice(targetIdx, 0, draggedItem)
      return items
    })
  }

  const handleDragEnd = async (e) => {
    e.target.style.opacity = '1'
    setDraggedId(null)
    
    const itemsToUpdate = projects.map((p, index) => ({
      id: p.id || p._id,
      order: index
    }))
    
    try {
      await reorderWork(itemsToUpdate)
    } catch(err) {
      console.error('Failed to save order', err)
      load()
    }
  }
  
  const isThumbnail = category === 'thumbnail'
  const isVideo = category === 'video'
  const isShort = category === 'short'
  const isPoster = category === 'poster'

  const pageTitle = isThumbnail ? 'THUMBNAILS' : isVideo ? 'VIDEOS' : isShort ? 'SHORTS' : 'POSTERS'
  const tableColCount = isThumbnail ? 6 : isVideo ? 9 : isPoster ? 6 : 7

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
        if (isThumbnail) return t === 'thumbnail' || t === 'slider' || t === 'poster' || t === 'rp'
        if (isVideo) return t === 'video'
        if (isShort) return t === 'short'
        return false
      })
      
      setProjects(filtered)
    } catch(e) { console.error('Failed to load projects', e) }
  }

  const defaultForm = () => {
    return { title: '', type: category, tag: '', featured: false, pinned: false, thumbnail: '', client: '', link: '', views: '', duration: '', beforeImage: '', afterImage: '', aspectRatio: '16:9' }
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setForm({ ...defaultForm(), _typeMode: category, _customType: '' })
  }

  const handleEdit = (p) => {
    const pType = (p.type || category).toLowerCase()
    
    // Define known values for the dropdown
    const knownValues = ['thumbnail', 'slider', 'video', 'short', 'rp', 'poster']
    const isKnown = knownValues.includes(pType)
    
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
    
    // Channel link is mandatory for thumbnails
    if (isThumbnail && !form.channelLink?.trim()) {
      return alert('Channel Link is required for thumbnails. Please enter the channel URL before saving.')
    }

    // Validation for slider
    if (form._typeMode === 'slider') {
      if (!form.beforeImage?.trim() || !form.afterImage?.trim()) {
        return alert('Before and After images are required for sliders')
      }
    }

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
    
    try {
      const { fetchYouTubeMetadata } = await import('../../api');
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
      const { fetchYouTubeMetadata } = await import('../../api');
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

  const toggleFeatured = async (p) => {
    const updated = { ...p, featured: !p.featured }
    await updateWork(p.id, updated)
    load()
  }

  const [previewImg, setPreviewImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e, field = 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      if (res.data?.success) {
        setForm(prev => ({ ...prev, [field]: res.data.url }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isAdding && form) {
    const formTypeLabel = form._typeMode === 'slider' ? 'SLIDER' : (form._typeMode || category).toUpperCase()

    return (
      <div className="admin-form-container">
        <div className="dash-header-row">
          <h1 className="dash-page-title">{form.id ? 'EDIT ' : 'ADD '} {formTypeLabel}</h1>
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
            <div className={`admin-form-group ${!form.beforeImage?.trim() ? 'has-error' : ''}`}>
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
            <div className={`admin-form-group ${!form.afterImage?.trim() ? 'has-error' : ''}`}>
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
              onChange={e => setForm({...form, _customType: e.target.value})}
            />
          </div>
        )}

        {/* Channel Info — all types */}
        <div className="admin-form-group">
          <label className="admin-label">
            Channel Link {isThumbnail && <span style={{ color: '#e5173f' }}>*</span>}
          </label>
          <div className="admin-input-row" style={{ display: 'flex', gap: '8px' }}>
            <input 
              className="admin-input" 
              style={{ flex: 1, borderColor: isThumbnail && !form.channelLink?.trim() ? '#e5173f' : '' }}
              placeholder="https://youtube.com/@channel or channel URL" 
              value={form.channelLink || ''} 
              onChange={e => setForm({...form, channelLink: e.target.value})} 
            />
            <button type="button" className="dash-btn-fetch" onClick={handleChannelFetch}>✨ Fetch</button>
          </div>
          {isThumbnail && !form.channelLink?.trim() && (
            <p style={{ color: '#e5173f', fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>Required — thumbnail will not be saved without a channel link</p>
          )}
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

        <div className="admin-form-group">
          <label className="admin-label">Tags (comma separated)</label>
          <input 
            className="admin-input" 
            placeholder="e.g. Gaming, Vlogs" 
            value={form.tag || ''} 
            onChange={e => setForm({...form, tag: e.target.value})} 
          />
        </div>

        {!isPoster && !isThumbnail && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-label">Views</label>
              <input 
                className="admin-input" 
                placeholder="e.g. 1.2M, 500K" 
                value={form.views || ''} 
                onChange={e => setForm({...form, views: e.target.value})} 
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Duration</label>
              <input 
                className="admin-input" 
                placeholder="e.g. 10:24" 
                value={form.duration || ''} 
                onChange={e => setForm({...form, duration: e.target.value})} 
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
          <div className="admin-checkbox-row">
            <input 
              type="checkbox" 
              checked={form.featured || false} 
              onChange={e => setForm({...form, featured: e.target.checked})} 
              id="featuredToggle"
            />
            <label htmlFor="featuredToggle" className="admin-checkbox-label">Featured (Display on main page)</label>
          </div>
          <div className="admin-checkbox-row">
            <input 
              type="checkbox" 
              checked={form.pinned || false} 
              onChange={e => setForm({...form, pinned: e.target.checked})} 
              id="pinnedToggle"
            />
            <label htmlFor="pinnedToggle" className="admin-checkbox-label">Pinned (Lock to top)</label>
          </div>
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            className="dash-btn-white" 
            style={{ borderRadius: '50px', padding: '12px 24px', background: isReordering ? '#e5173f' : 'rgba(255,255,255,0.05)', color: isReordering ? '#fff' : '#ccc', border: '1px solid ' + (isReordering ? '#e5173f' : '#333') }}
            onClick={() => setIsReordering(!isReordering)}
          >
            {isReordering ? 'Done Reordering' : 'Reorder'}
          </button>
          <button 
            type="button"
            className="dash-btn-white" 
            style={{ borderRadius: '50px', padding: '12px 24px' }}
            onClick={handleAddNew}
            disabled={isReordering}
          >
            + Add {pageTitle.slice(0, -1)}
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>PREVIEW</th>
              <th>TITLE</th>
              {isVideo && <th>CREATOR</th>}
              <th className="dash-th">TAGS</th>
              {!isPoster && !isThumbnail && <th className="dash-th">VIEWS</th>}
              {isVideo && <th>DURATION</th>}
              <th>FEATURED</th>
              <th>PINNED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const displayTags = Array.isArray(p.tag) ? p.tag.join(', ') : (p.tag || '-');
              const previewImageUrl = p.thumbnail || p.imageUrl || (p.type === 'slider' ? (p.beforeImage || p.afterImage || '') : '');

              return (
                 <tr 
                   key={p.id || p._id}
                   draggable={isReordering}
                   onDragStart={isReordering ? (e) => handleDragStart(e, p.id || p._id) : undefined}
                   onDragEnter={isReordering ? (e) => handleDragEnter(e, p.id || p._id) : undefined}
                   onDragOver={isReordering ? (e) => e.preventDefault() : undefined}
                   onDragEnd={isReordering ? handleDragEnd : undefined}
                   style={{ cursor: isReordering ? 'grab' : 'default', transition: 'background 0.2s' }}
                 >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isReordering && <div style={{ color: '#555', cursor: 'grab', fontSize: '18px' }}>⋮⋮</div>}
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
                            if (isThumbnail && previewImageUrl && !isReordering) setPreviewImg(previewImageUrl);
                          }}
                        >
                           {previewImageUrl && (
                             <img src={previewImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
                           )}
                        </div>
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

                    {!isPoster && !isThumbnail && (
                      <td style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                        {p.views || '0'}
                      </td>
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
                      <div 
                        className={`featured-toggle pinned-toggle ${p.pinned ? 'on' : ''}`}
                        onClick={() => {
                          const updated = { ...p, pinned: !p.pinned }
                          updateWork(p.id || p._id, updated).then(() => load())
                        }}
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
