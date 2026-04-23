const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATA_FILE = path.join(__dirname, '..', 'data', 'portfolio.json');
const CACHE_FILE = path.join(__dirname, '..', 'data', 'youtube_cache.json');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const API_URL = 'https://www.googleapis.com/youtube/v3/videos';

// In-Memory cache for lightning fast API responses
let memoryCache = {};
let quotaDailyUsage = 0;
let lastResetDate = new Date().toDateString();

// Load cache from disk on startup
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      memoryCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading YouTube cache', e);
  }
}
function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(memoryCache, null, 2));
  } catch (e) {
    console.error('Error saving YouTube cache', e);
  }
}

// Helper: Extract Video ID from URL
function extractVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) return match[2];
  
  // Also handle Shorts link
  const shortsReg = /youtube\.com\/shorts\/([^#\&\?]*)/;
  const matchShorts = url.match(shortsReg);
  if (matchShorts && matchShorts[1]) return matchShorts[1];
  
  return null;
}

// Read database to find YouTube videos
function getYouTubeTasks() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const ytProjects = (data.work || []).filter(w => {
      const t = (w.type === 'clip' ? 'short' : w.type) || 'thumbnail';
      if (t === 'thumbnail') return false;
      return extractVideoId(w.link);
    });
    
    // Sort by recent views / priority (for this example, just assume top 15 are active)
    const active = ytProjects.slice(0, 15);
    const archive = ytProjects.slice(15);
    
    return { active, archive };
  } catch (e) {
    return { active: [], archive: [] };
  }
}

async function fetchYouTubeStats(ids) {
  if (!YOUTUBE_API_KEY) return console.log('YouTube API Key missing. Skipping cron.');
  if (ids.length === 0) return;
  
  // Daily reset check
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    quotaDailyUsage = 0;
    lastResetDate = today;
  }
  
  if (quotaDailyUsage > 8000) {
    console.warn('⛔ YouTube Daily Quota Limit Reached (>8000). Pausing requests.');
    return;
  }

  try {
    const chunked = [];
    for (let i = 0; i < ids.length; i += 50) {
       chunked.push(ids.slice(i, i + 50));
    }

    for (const chunk of chunked) {
      quotaDailyUsage += 1; // 1 unit per read
      const res = await axios.get(API_URL, {
        params: {
          part: 'statistics,snippet',
          id: chunk.join(','),
          key: YOUTUBE_API_KEY
        }
      });
      
      const items = res.data.items || [];
      let updated = false;
      items.forEach(item => {
         const oldViews = memoryCache[item.id]?.views || 0;
         const newViews = item.statistics?.viewCount || 0;
         
         if (oldViews !== newViews) {
           memoryCache[item.id] = {
             title: item.snippet?.title || 'Unknown Title',
             views: parseInt(newViews, 10),
             likes: parseInt(item.statistics?.likeCount || 0, 10),
             comments: parseInt(item.statistics?.commentCount || 0, 10),
             updatedAt: new Date().toISOString()
           };
           updated = true;
         }
      });
      
      if (updated) saveCache();
    }
    console.log(`[YouTube Cron] Refreshed ${ids.length} videos. Daily Usage: ~${quotaDailyUsage}`);
    
  } catch (e) {
    console.error('Error fetching YouTube API', e.message);
  }
}

function initCronJobs() {
  loadCache();
  
  // 1-Minute Active Job
  cron.schedule('* * * * *', async () => {
     const { active } = getYouTubeTasks();
     const ids = active.map(w => extractVideoId(w.link)).filter(Boolean);
     if(ids.length) await fetchYouTubeStats(ids);
  });

  // Daily Archive Job (3 AM)
  cron.schedule('0 3 * * *', async () => {
     const { archive } = getYouTubeTasks();
     const ids = archive.map(w => extractVideoId(w.link)).filter(Boolean);
     if(ids.length) {
         // To properly stay within limits dynamically over weeks we batch them
         // For now, grabbing max 50 from the archive for simplicity
         const batch = ids.slice(0, 50); 
         console.log('[YouTube Archive Job] Updating Batch of', batch.length);
         await fetchYouTubeStats(batch);
     }
  });
  
  console.log('⏱️ YouTube Cron Service initialized');
}

// Merge Cache with Payload (videos & shorts only — thumbnails never get view enrichment)
function getEnrichedViews(projects) {
  return projects.map(p => {
    if (p.type === 'thumbnail') return p;
    const vid = extractVideoId(p.link);
    if (vid && memoryCache[vid]) {
      // Overwrite the static views with dynamically cached YouTube true views
      // Convert large numbers dynamically if wanted (e.g. 1M+, 500K, etc.)
      const count = memoryCache[vid].views;
      p.views = count >= 1000000 ? (count/1000000).toFixed(1) + 'M' :
                count >= 1000 ? (count/1000).toFixed(1) + 'K' : count;
      p.liveData = memoryCache[vid]; // pass down title, dislikes, etc just in case
    }
    return p;
  });
}

module.exports = {
  initCronJobs,
  getEnrichedViews,
  extractVideoId // export for testing/merging
};
