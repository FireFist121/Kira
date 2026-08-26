const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

/** Helper to get or create messages setting */
async function getMessagesSettings() {
  let settings = await Settings.findOne({ key: 'messages' });
  if (!settings) {
    settings = await Settings.create({ key: 'messages', data: [] });
  }
  return settings;
}

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message, service } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }
    
    const settings = await getMessagesSettings();
    const msg = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      service: service || 'General',
      message: message.trim(),
      time: new Date().toISOString(),
      read: false
    };
    
    settings.data.unshift(msg);
    settings.markModified('data');
    await settings.save();
    
    console.log(`\n📩 New message from ${name} (${email}) — Service: ${service || 'General'}\n${message}\n`);
    res.json({ success: true, message: '✦ Message sent! KIRA will hit you back soon.' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

module.exports = router;

