const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { requireAdmin } = require('./admin');

const DATA_FILE = path.join(__dirname, '..', 'data', 'portfolio.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET /api/portfolio — full data (avoid stale 304 in browser for XHR)
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const data = readData();
  res.json({ success: true, data });
});

// PUT /api/portfolio/stats
router.put('/stats', requireAdmin, (req, res) => {
  const { projects, clients, years } = req.body;
  const data = readData();
  if (projects) data.stats.projects = projects;
  if (clients)  data.stats.clients  = clients;
  if (years)    data.stats.years    = years;
  writeData(data);
  res.json({ success: true, data: data.stats });
});

// PUT /api/portfolio/content
router.put('/content', requireAdmin, (req, res) => {
  const { tagline, bio1, bio2, skills, available } = req.body;
  const data = readData();
  if (tagline !== undefined)   data.tagline   = tagline;
  if (bio1    !== undefined)   data.bio1      = bio1;
  if (bio2    !== undefined)   data.bio2      = bio2;
  if (skills  !== undefined)   data.skills    = skills;
  if (available !== undefined) data.available = available;
  writeData(data);
  res.json({ success: true });
});

module.exports = router;
