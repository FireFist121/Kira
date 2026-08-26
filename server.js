require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./api/index.js'); // Import Express App

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

// Make io globally available for services
global.io = io;

// Initiate background Cron Services (YouTube Fetcher) for Local
const youtubeService = require('./services/youtube');
(async () => {
  try {
    const connectDB = require('./db');
    await connectDB();
    await youtubeService.initCronJobs();
  } catch (err) {
    console.error('Failed to initialize YouTube Cron Jobs:', err);
  }
})();

io.on('connection', (socket) => {
  console.log('🔌 Client connected to Socket.IO');
  socket.on('disconnect', () => console.log('🔌 Client disconnected'));
});

// ─── Serve Vite build in production locally ───
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
  );
}

server.listen(PORT, () => {
  console.log(`\n🟣 KIRA API running → http://localhost:${PORT}\n`);
});
