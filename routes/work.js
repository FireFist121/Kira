const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'portfolio.json');
function readData()      { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

const { getEnrichedViews } = require('../services/youtube');
const { requireAdmin } = require('./admin');

const ALLOWED_TYPES = ['thumbnail', 'video', 'short'];

function normalizeTags(tag) {
  if (Array.isArray(tag)) return tag.map(String).map(t => t.trim()).filter(Boolean);
  if (typeof tag === 'string') return tag.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

/** Normalize legacy disk records for API responses */
function migrateLegacyItem(w) {
  if (!w || typeof w !== 'object') return w;
  const thumb = w.thumbnail || w.imageUrl || '';
  let type = w.type === 'clip' ? 'short' : (w.type || 'thumbnail');
  if (!ALLOWED_TYPES.includes(type)) type = 'thumbnail';
  const out = { ...w, thumbnail: thumb, type };
  delete out.imageUrl;
  return out;
}

/**
 * Build a clean work item: thumbnails have title, client unused, tag, thumbnail only.
 * Videos & shorts include link; views/duration only where allowed.
 */
function buildWorkItem(body, existing = {}) {
  const type = ALLOWED_TYPES.includes(body.type)
    ? body.type
    : (ALLOWED_TYPES.includes(existing.type) ? existing.type : 'thumbnail');

  const thumbnail = (body.thumbnail ?? body.imageUrl ?? existing.thumbnail ?? existing.imageUrl ?? '').trim();
  const tag = body.tag !== undefined ? normalizeTags(body.tag) : normalizeTags(existing.tag);

  const id = existing.id || body.id;
  const titleRaw = body.title !== undefined ? body.title : existing.title;
  const title = typeof titleRaw === 'string' ? titleRaw.trim() : titleRaw;
  if (!title) return null;

  const base = {
    id,
    title,
    type,
    tag,
    thumbnail,
    featured: body.featured !== undefined ? !!body.featured : !!existing.featured,
    color: body.color || existing.color || '#0d0f1a',
  };

  if (type === 'thumbnail') {
    return base;
  }
  if (type === 'short') {
    return {
      ...base,
      link: (body.link !== undefined ? body.link : (existing.link || '')).trim(),
      views: String(body.views !== undefined ? body.views : (existing.views ?? '0')),
    };
  }
  return {
    ...base,
    client: (body.client !== undefined ? body.client : (existing.client || '')).trim(),
    link: (body.link !== undefined ? body.link : (existing.link || '')).trim(),
    views: String(body.views !== undefined ? body.views : (existing.views ?? '0')),
    duration: (body.duration !== undefined ? body.duration : (existing.duration || '')).trim(),
  };
}

// GET /api/work
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { type } = req.query;
  const { work } = readData();
  let list = (work || []).map(migrateLegacyItem);
  if (type && type !== 'all') {
    list = list.filter(w => w.type === type);
  }
  list = getEnrichedViews(list);
  res.json({ success: true, data: list });
});

// POST /api/work
router.post('/', requireAdmin, (req, res) => {
  const item = buildWorkItem({ ...req.body, id: Date.now() }, {});
  if (!item) return res.status(400).json({ success: false, error: 'Title required' });
  const data = readData();
  data.work = data.work || [];
  data.work.push(item);
  writeData(data);
  res.status(201).json({ success: true, data: item });
});

// PUT /api/work/:id
router.put('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  const idx = data.work.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  const existing = migrateLegacyItem(data.work[idx]);
  const item = buildWorkItem({ ...existing, ...req.body, id }, existing);
  if (!item) return res.status(400).json({ success: false, error: 'Title required' });
  data.work[idx] = item;
  writeData(data);
  res.json({ success: true, data: item });
});

// DELETE /api/work/:id
router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  const idx = data.work.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  data.work.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

module.exports = router;
