const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'portfolio.json');
function readData()      { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'kira@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kira2025';
const JWT_SECRET     = process.env.JWT_SECRET     || process.env.ADMIN_SECRET || 'kira-super-secret-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signAdminToken() {
  return jwt.sign(
    { email: ADMIN_EMAIL, role: 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/** Validates JWT and ensures role is admin */
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please login.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied', message: 'Access denied' });
    }
    req.user = { email: decoded.email, role: decoded.role };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

// Legacy name used by upload route
const requireAuth = requireAdmin;

// ─── POST /api/admin/login ───
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required.' });
  }
  if (email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid credentials.' });
  }
  const token = signAdminToken();
  res.json({
    success: true,
    token,
    user: { email: ADMIN_EMAIL, role: 'admin' }
  });
});

// ─── POST /api/admin/verify ───
router.post('/verify', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied', message: 'Access denied' });
    }
    res.json({
      success: true,
      email: decoded.email,
      role: decoded.role
    });
  } catch (e) {
    res.status(401).json({ success: false, error: 'Token invalid or expired.' });
  }
});

// ─── GET /api/admin/messages ───
router.get('/messages', requireAdmin, (req, res) => {
  const { messages } = readData();
  res.json({ success: true, data: messages });
});

// ─── DELETE /api/admin/messages/:id ───
router.delete('/messages/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  data.messages = data.messages.filter(m => m.id !== id);
  writeData(data);
  res.json({ success: true });
});

// ─── PUT /api/admin/messages/:id/read ───
router.put('/messages/:id/read', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  const msg = data.messages.find(m => m.id === id);
  if (msg) { msg.read = true; writeData(data); }
  res.json({ success: true });
});

// ─── GET /api/admin/overview ───
router.get('/overview', requireAdmin, (req, res) => {
  const data = readData();
  res.json({
    success: true,
    data: {
      totalWork: data.work.length,
      totalThumbnails: data.work.filter(w => (!w.type || w.type === 'thumbnail')).length,
      totalVideos: data.work.filter(w => w.type === 'video').length,
      totalShorts: data.work.filter(w => w.type === 'short' || w.type === 'clip').length,
      totalMessages: data.messages.length,
      unreadMessages: data.messages.filter(m => !m.read).length,
      totalServices: data.services.length,
      available: data.available,
      stats: data.stats,
    }
  });
});

module.exports = router;
module.exports.requireAdmin = requireAdmin;
module.exports.requireAuth = requireAuth;
