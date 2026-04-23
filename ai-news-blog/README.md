# ⚡ AI News Blog

A fast, minimal AI news aggregator for toni-ki.tech. Headlines from top tech sources, updated daily.

## Features

✅ **Daily Updates** — Automatic refresh at 09:00 (Europe/Berlin)  
✅ **Tech Blog Sources** — OpenAI, Hugging Face, HackerNews  
✅ **Mobile Responsive** — Works on all devices  
✅ **Clean Design** — Focus on headlines & images  
✅ **Zero Dependencies** (in production) — Static HTML/CSS  

## Quick Start

### Local
```bash
npm install
npm start
```

Generates `public/index.html` with latest news.

### Daemon (Scheduled Updates)
```bash
npm run daemon
```

Runs daily at 09:00. Daemonizes and updates automatically.

### Deploy
See [DEPLOY.md](./DEPLOY.md) for full Hostinger setup.

## Project Structure

```
ai-news-blog/
├── scraper.js       # Fetches RSS feeds
├── generator.js     # Creates HTML
├── index.js         # Main update logic
├── daemon.js        # Scheduled updates
├── package.json
├── public/          # Output directory
│   └── index.html   # Generated site
└── DEPLOY.md        # Deployment guide
```

## Customization

### Add News Sources
Edit `scraper.js`, update `SOURCES`:

```javascript
const SOURCES = [
  { name: 'Your Blog', url: 'https://...rss.xml' },
  // ...
];
```

### Change Update Time
Edit `daemon.js`, cron schedule:

```javascript
cron.schedule('0 9 * * *', ...) // 9:00 daily
cron.schedule('0 */2 * * *', ...) // Every 2 hours
```

### Styling
Edit `generator.js`, modify the CSS in the `generateHTML()` function.

## Tech Stack

- **Node.js** — Runtime
- **xml2js** — RSS parsing
- **node-cron** — Scheduling
- **HTML/CSS** — Frontend

## License

MIT

---

**Made with ⚡ by Toni**
