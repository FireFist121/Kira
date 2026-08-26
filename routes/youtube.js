const express = require('express');
const router = express.Router();
const axios = require('axios');
const { extractVideoId } = require('../services/youtube');
const { requireAdmin } = require('./admin');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

router.get('/metadata', requireAdmin, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  console.log('--- YouTube Fetch Request ---');
  console.log('URL:', url);

  if (!YOUTUBE_API_KEY) {
    return res.status(500).json({ error: 'YouTube API key not configured' });
  }

  try {
    const videoId = extractVideoId(url);
    
    if (videoId) {
      // --- FETCH VIA VIDEO ID ---
      const videoRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: { part: 'snippet,statistics', id: videoId, key: YOUTUBE_API_KEY }
      });

      if (!videoRes.data.items?.length) return res.status(404).json({ error: 'Video not found' });

      const video = videoRes.data.items[0];
      const channelId = video.snippet.channelId;

      const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: { part: 'snippet,statistics', id: channelId, key: YOUTUBE_API_KEY }
      });

      const channel = channelRes.data.items?.[0];

      return res.json({
        title: video.snippet.title,
        channelName: video.snippet.channelTitle,
        channelId: channelId,
        channelLogo: channel?.snippet?.thumbnails?.high?.url || channel?.snippet?.thumbnails?.medium?.url || channel?.snippet?.thumbnails?.default?.url || '',
        channelLink: `https://youtube.com/channel/${channelId}`,
        thumbnail: video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url || '',
        views: video.statistics?.viewCount || '0',
        subscriberCount: channel?.statistics?.subscriberCount || '0'
      });
    } else {
      // --- FETCH VIA CHANNEL URL ---
      let channelParams = { part: 'snippet,statistics', key: YOUTUBE_API_KEY };
      
      // Handle @username
      // Robust handle extraction
      const handleMatch = url.match(/(?:youtube\.com\/|youtu\.be\/)(?:@)?([a-zA-Z0-9\._-]+)/i);
      const idMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/i);
      const userMatch = url.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/i);
      const customMatch = url.match(/youtube\.com\/c\/([a-zA-Z0-9_-]+)/i);

      if (handleMatch && !url.includes('/channel/') && !url.includes('/user/')) {
        channelParams.forHandle = handleMatch[1].replace('@', '');
      }
      else if (idMatch) channelParams.id = idMatch[1];
      else if (userMatch) channelParams.forUsername = userMatch[1];
      else return res.status(400).json({ error: 'Invalid YouTube URL. Please provide a video link or a channel link (@handle or /channel/id)' });

      let channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', { params: channelParams });
      let channel = channelRes.data.items?.[0];

      // --- SEARCH FALLBACK ---
      if (!channel && channelParams.forHandle) {
        console.log('forHandle failed, trying search fallback for:', channelParams.forHandle);
        const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: `@${channelParams.forHandle}`,
            type: 'channel',
            maxResults: 1,
            key: YOUTUBE_API_KEY
          }
        });
        
        const searchItem = searchRes.data.items?.[0];
        if (searchItem) {
          const channelId = searchItem.snippet.channelId;
          const retryRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: { part: 'snippet,statistics', id: channelId, key: YOUTUBE_API_KEY }
          });
          channel = retryRes.data.items?.[0];
        }
      }

      if (!channel) return res.status(404).json({ error: 'Channel not found after search fallback' });

      return res.json({
        channelName: channel.snippet.title,
        channelId: channel.id,
        channelLogo: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.medium?.url || '',
        channelLink: `https://youtube.com/channel/${channel.id}`,
        subscriberCount: channel.statistics?.subscriberCount || '0'
      });
    }
  } catch (err) {
    console.error('YouTube Fetch Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch YouTube metadata' });
  }
});

module.exports = router;
