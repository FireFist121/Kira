require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Work = require('./models/Work');
const Settings = require('./models/Settings');

const DATA_FILE = path.join(__dirname, 'data', 'portfolio.json');

function normTags(tag) {
  if (Array.isArray(tag)) return tag.map(String).map(t => t.trim()).filter(Boolean);
  if (typeof tag === 'string') return tag.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

async function migrate() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    if (!fs.existsSync(DATA_FILE)) {
      console.error('❌ portfolio.json not found in data/');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    
    // Clear old data
    await Work.deleteMany({});
    await Settings.deleteMany({});
    console.log('Cleared existing collections');

    // Insert work
    if (data.work && data.work.length > 0) {
      const works = data.work.map(w => {
        const { id, imageUrl, ...rest } = w; // Remove old numeric ID
        return {
          ...rest,
          type: w.type === 'clip' ? 'short' : (w.type || 'thumbnail'),
          thumbnail: w.thumbnail || w.imageUrl || '',
          tag: normTags(w.tag)
        };
      });
      await Work.insertMany(works);
      console.log(`Inserted ${works.length} work items.`);
    }

    // Insert global settings (Consolidated)
    const { tagline, bio1, bio2, skills, available, stats } = data;
    await Settings.create({
      key: 'global',
      data: {
        tagline: tagline || '',
        bio1: bio1 || '',
        bio2: bio2 || '',
        skills: skills || [],
        available: available !== undefined ? available : true,
        stats: stats || { projects: "0", clients: "0", years: "0" }
      }
    });

    // Insert messages
    await Settings.create({
      key: 'messages',
      data: data.messages || []
    });

    // Insert services
    await Settings.create({
      key: 'services',
      data: data.services || []
    });

    console.log('Consolidated global settings, messages, and services.');
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

migrate();

