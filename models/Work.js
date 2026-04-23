const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  title: { type: String, required: true },
  client: { type: String, default: '' },
  views: { type: String, default: '0' },
  type: { type: String, enum: ['thumbnail', 'video', 'short'], default: 'thumbnail' },
  color: { type: String, default: '#0d0f1a' },
  thumbnail: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  link: { type: String, default: '' },
  tag: [{ type: String }],
  duration: { type: String, default: '' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Work', workSchema);
