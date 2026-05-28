const express = require('express');
const router = express.Router();
const Work = require('../models/Work');
const { getEnrichedViews } = require('../services/youtube');
const { requireAdmin } = require('./admin');

const ALLOWED_TYPES = ['thumbnail', 'video', 'short', 'slider', 'poster'];

function normalizeTags(tag) {
  if (Array.isArray(tag)) return tag.map(String).map(t => t.trim()).filter(Boolean);
  if (typeof tag === 'string') return tag.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

/**
 * Build a clean work item object for Mongoose
 */
function buildWorkItem(body, existing = {}) {
  const type = ALLOWED_TYPES.includes(body.type)
    ? body.type
    : (ALLOWED_TYPES.includes(existing.type) ? existing.type : 'thumbnail');

  const thumbnail = (body.thumbnail ?? body.imageUrl ?? existing.thumbnail ?? existing.imageUrl ?? '').trim();
  const tag = body.tag !== undefined ? normalizeTags(body.tag) : normalizeTags(existing.tag);

  const titleRaw = body.title !== undefined ? body.title : existing.title;
  const title = typeof titleRaw === 'string' ? titleRaw.trim() : titleRaw;
  if (!title) return null;

  const base = {
    title,
    type,
    tag,
    thumbnail,
    client: (body.client !== undefined ? body.client : (existing.client || '')).trim(),
    channelLogo: (body.channelLogo !== undefined ? body.channelLogo : (existing.channelLogo || '')).trim(),
    channelLink: (body.channelLink !== undefined ? body.channelLink : (existing.channelLink || '')).trim(),
    link: (body.link !== undefined ? body.link : (existing.link || '')).trim(),
    views: String(body.views !== undefined ? body.views : (existing.views ?? '0')),
    duration: (body.duration !== undefined ? body.duration : (existing.duration || '')).trim(),
    featured: body.featured !== undefined ? !!body.featured : !!existing.featured,
    color: body.color || existing.color || '#0d0f1a',
    aspectRatio: body.aspectRatio || existing.aspectRatio || '16:9',
  };

  if (type === 'slider') {
    base.beforeImage = (body.beforeImage || existing.beforeImage || '').trim();
    base.afterImage = (body.afterImage || existing.afterImage || '').trim();
  }

  return base;
}

// GET /api/work
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { type } = req.query;
    
    let query = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const works = await Work.find(query).sort({ createdAt: -1 }).lean();
    const list = getEnrichedViews(works);
    
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching work:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// POST /api/work
router.post('/', requireAdmin, async (req, res) => {
  try {
    const itemData = buildWorkItem(req.body, {});
    if (!itemData) return res.status(400).json({ success: false, error: 'Title required' });
    
    const item = await Work.create(itemData);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Error creating work:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// PUT /api/work/:id
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Work.findById(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    
    const itemData = buildWorkItem(req.body, existing);
    if (!itemData) return res.status(400).json({ success: false, error: 'Title required' });
    
    const updated = await Work.findByIdAndUpdate(id, itemData, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating work:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// DELETE /api/work/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Work.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting work:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

module.exports = router;

