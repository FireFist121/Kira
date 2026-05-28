const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { requireAdmin } = require('./admin');

/** Helper to get settings or return default object */
async function getSettings() {
  let settings = await Settings.findOne({ key: 'global' });
  if (!settings) {
    settings = await Settings.create({ key: 'global', data: {
      stats: { projects: "0", clients: "0", years: "0" },
      tagline: "",
      bio1: "",
      bio2: "",
      skills: [],
      marqueeText: "",
      creators: [], // Array of { name, logo }
      available: true
    }});
  }
  return settings;
}

// GET /api/portfolio
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const settings = await getSettings();
    res.json({ success: true, data: settings.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// PUT /api/portfolio/stats
router.put('/stats', requireAdmin, async (req, res) => {
  try {
    const { projects, clients, years } = req.body;
    const settings = await getSettings();
    
    if (projects) settings.data.stats.projects = projects;
    if (clients)  settings.data.stats.clients  = clients;
    if (years)    settings.data.stats.years    = years;
    
    settings.markModified('data');
    await settings.save();
    res.json({ success: true, data: settings.data.stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// PUT /api/portfolio/content
router.put('/content', requireAdmin, async (req, res) => {
  try {
    const { tagline, bio1, bio2, skills, marqueeText, creators, available } = req.body;
    
    // Fetch current data first to merge
    const settings = await getSettings();
    const newData = { ...settings.data };
    
    if (tagline !== undefined)   newData.tagline   = tagline;
    if (bio1    !== undefined)   newData.bio1      = bio1;
    if (bio2    !== undefined)   newData.bio2      = bio2;
    if (skills  !== undefined)   newData.skills    = skills;
    if (marqueeText !== undefined) newData.marqueeText = marqueeText;
    if (creators !== undefined) newData.creators = creators;
    if (available !== undefined) newData.available = available;
    
    await Settings.updateOne({ key: 'global' }, { $set: { data: newData } });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Portfolio update error:', error);
    res.status(500).json({ success: false, error: 'Database error', details: error.message });
  }
});

module.exports = router;

