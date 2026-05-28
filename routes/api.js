const express = require('express');
const router = express.Router();

// Portfolio data
const portfolioData = {
  name: "Kir4 Designs",
  alias: "KIRA",
  role: "Thumbnail Designer & Video Editor",
  location: "Jaipur, India",
  tagline: "Designing impact, one pixel at a time",
  available: true,
  socials: {
    instagram: "kir4designs",
    discord: "kir4isdead"
  },
  stats: {
    projects: "150+",
    clients: "40+",
    experience: "3+ yrs"
  },
  services: [
    {
      id: 1,
      title: "Thumbnail Design",
      description: "Eye-catching thumbnails that stop the scroll. Designed for CTR — every pixel has a purpose.",
      icon: "🎯",
      tags: ["YouTube", "Twitch", "Clickbait-Free"]
    },
    {
      id: 2,
      title: "Video Editing",
      description: "Cuts that feel cinematic. Pacing, color, motion — all dialed in for your audience.",
      icon: "🎬",
      tags: ["Premiere Pro", "After Effects", "Color Grading"]
    },
    {
      id: 3,
      title: "Graphic Design",
      description: "Logos, banners, brand kits. Visual identity built from scratch or refreshed.",
      icon: "✦",
      tags: ["Branding", "Social Media", "Print"]
    }
  ],
  thumbnails: [
    { id: 1, title: "Gaming Series", client: "YouTube Channel", views: "2.1M" },
    { id: 2, title: "Tech Review", client: "Tech Creator", views: "890K" },
    { id: 3, title: "Vlog Series", client: "Lifestyle Creator", views: "1.4M" },
    { id: 4, title: "Tutorial Pack", client: "Edu Channel", views: "560K" },
    { id: 5, title: "Podcast Cover", client: "Podcast Network", views: "320K" },
    { id: 6, title: "Brand Reveal", client: "Startup Brand", views: "1.1M" }
  ],
  skills: ["Photoshop", "Premiere Pro", "After Effects", "Illustrator", "Figma", "DaVinci Resolve"]
};

// GET portfolio data
router.get('/portfolio', (req, res) => {
  res.json({ success: true, data: portfolioData });
});

// GET services
router.get('/services', (req, res) => {
  res.json({ success: true, data: portfolioData.services });
});

// GET thumbnails
router.get('/thumbnails', (req, res) => {
  res.json({ success: true, data: portfolioData.thumbnails });
});

// POST contact form
router.post('/contact', (req, res) => {
  const { name, email, message, service } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields required' });
  }
  
  // In production, you'd send an email or save to DB here
  console.log(`\n📩 New message from ${name} (${email})\nService: ${service || 'General'}\n${message}\n`);
  
  res.json({ 
    success: true, 
    message: 'Message received! KIRA will hit you back soon.' 
  });
});

module.exports = router;
