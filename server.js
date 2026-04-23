require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── API Routes ───
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/work',      require('./routes/work'));
app.use('/api/contact',   require('./routes/contact'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/upload',    require('./routes/upload'));

// Initiate background Cron Services (YouTube Fetcher)
const youtubeService = require('./services/youtube');
youtubeService.initCronJobs();

// ─── Health check ───
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// ─── Serve Vite build in production ───
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
  );
}

app.listen(PORT, () => {
  console.log(`\n🟣 KIRA API running → http://localhost:${PORT}\n`);
});
