# KIR4 Portfolio — Local Setup

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
http://localhost:3000
```

## Dev Mode (auto-restart on changes)
```bash
npm run dev
```

## Structure
```
kira-portfolio/
├── server.js          ← Express backend
├── routes/
│   └── api.js         ← API endpoints
├── public/
│   ├── index.html     ← Main HTML
│   ├── css/
│   │   └── style.css  ← All styles
│   └── js/
│       └── main.js    ← Frontend JS
└── package.json
```

## API Endpoints
- `GET  /api/portfolio`   → Full portfolio data
- `GET  /api/services`    → Services list
- `GET  /api/thumbnails`  → Work/thumbnail items
- `POST /api/contact`     → Contact form (logs to console)

## Customization
Edit `routes/api.js` to update:
- Name, tagline, socials
- Services (title, description, tags)
- Thumbnail/work items
- Skills list

## Adding Real Images
Place images in `public/images/` and update `work-placeholder` divs in `main.js` to use `<img>` tags with real paths.

## Deploy
Works on any Node.js host: Railway, Render, Vercel (with adapter), etc.
