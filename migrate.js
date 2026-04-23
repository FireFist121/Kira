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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    
    // Clear old data
    await Work.deleteMany({});
    await Settings.deleteMany({});
    console.log('Cleared existing collections');

    // Insert work
    if (data.work && data.work.length > 0) {
      const works = data.work.map(w => {
        const { imageUrl, ...rest } = w;
        return {
          ...rest,
          type: w.type === 'clip' ? 'short' : (w.type || 'thumbnail'),
          thumbnail: w.thumbnail || w.imageUrl || '',
          tag: normTags(w.tag),
          _id: new mongoose.Types.ObjectId()
        };
      });
      await Work.insertMany(works);
      console.log(`Inserted ${works.length} work items.`);
    }

    // Insert globals
    const { services, messages, available, stats, bio1, bio2, skills } = data;
    await Settings.create([
      { key: 'services', data: services || [] },
      { key: 'messages', data: messages || [] },
      { key: 'available', data: available !== undefined ? available : true },
      { key: 'stats', data: stats || {} },
      { key: 'about', data: { bio1, bio2, skills: skills || [] } }
    ]);
    console.log('Inserted global settings.');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

migrate();
