const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'portfolio.json');
function readData()      { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

// POST /api/contact
router.post('/', (req, res) => {
  const { name, email, message, service } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }
  const data = readData();
  const msg = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim(),
    service: service || 'General',
    message: message.trim(),
    time: new Date().toISOString(),
    read: false
  };
  data.messages.unshift(msg);
  writeData(data);
  console.log(`\n📩 New message from ${name} (${email}) — Service: ${service || 'General'}\n${message}\n`);
  res.json({ success: true, message: '✦ Message sent! KIRA will hit you back soon.' });
});

module.exports = router;
