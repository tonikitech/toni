const fs = require('fs');
const path = require('path');

function generateHTML(news) {
  const featured = news[0] || {};
  const rest = news.slice(1, 5);

  const newsCards = rest.map(item => `
    <div class="news-card">
      <div class="card-image" style="background-image: url('${item.image}')"></div>
      <div class="card-content">
        <div class="card-source">${item.source}</div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.description}</p>
        <a href="${item.link}" target="_blank" class="read-more">Read More →</a>
      </div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI News - toni-ki.tech</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f0f;
      color: #fff;
      line-height: 1.6;
    }

    header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      padding: 40px 20px;
      text-align: center;
      border-bottom: 2px solid #ff6b00;
    }

    header h1 {
      font-size: 3em;
      font-weight: 900;
      background: linear-gradient(135deg, #ff6b00, #ffaa00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }

    header p {
      color: #aaa;
      font-size: 1.1em;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .featured-banner {
      position: relative;
      height: 500px;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 50px;
      box-shadow: 0 10px 40px rgba(255, 107, 0, 0.2);
    }

    .featured-image {
      position: absolute;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-image: url('${featured.image}');
      filter: brightness(0.5);
    }

    .featured-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 40px;
      background: linear-gradient(180deg, transparent, rgba(0,0,0,0.9));
    }

    .featured-source {
      display: inline-block;
      background: #ff6b00;
      color: #000;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .featured-title {
      font-size: 2.2em;
      font-weight: 900;
      margin-bottom: 15px;
      line-height: 1.2;
    }

    .featured-desc {
      font-size: 1.1em;
      color: #ddd;
      margin-bottom: 20px;
    }

    .featured-link {
      display: inline-block;
      background: #ff6b00;
      color: #000;
      padding: 12px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }

    .featured-link:hover {
      background: #ffaa00;
      transform: translateX(5px);
    }

    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 30px;
      margin-bottom: 50px;
    }

    .news-card {
      background: #1a1a1a;
      border-radius: 10px;
      overflow: hidden;
      transition: all 0.3s;
      border: 1px solid #333;
    }

    .news-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 40px rgba(255, 107, 0, 0.15);
      border-color: #ff6b00;
    }

    .card-image {
      width: 100%;
      height: 200px;
      background-size: cover;
      background-position: center;
    }

    .card-content {
      padding: 25px;
    }

    .card-source {
      display: inline-block;
      background: rgba(255, 107, 0, 0.2);
      color: #ff6b00;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .card-title {
      font-size: 1.3em;
      font-weight: 700;
      margin-bottom: 12px;
      line-height: 1.3;
    }

    .card-desc {
      color: #aaa;
      font-size: 0.95em;
      margin-bottom: 16px;
    }

    .read-more {
      color: #ff6b00;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
      display: inline-block;
    }

    .read-more:hover {
      color: #ffaa00;
      transform: translateX(5px);
    }

    footer {
      background: #1a1a1a;
      padding: 30px;
      text-align: center;
      color: #666;
      border-top: 1px solid #333;
    }

    footer p {
      font-size: 0.9em;
    }

    .updated-at {
      color: #888;
      font-size: 0.9em;
      margin-top: 10px;
    }

    @media (max-width: 768px) {
      header h1 {
        font-size: 2em;
      }

      .featured-title {
        font-size: 1.5em;
      }

      .featured-content {
        padding: 25px;
      }

      .news-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>⚡ BREAKING AI NEWS</h1>
    <p>Latest breaking headlines from the AI frontier</p>
  </header>

  <div class="container">
    <div class="featured-banner">
      <div class="featured-image"></div>
      <div class="featured-content">
        <div class="featured-source">${featured.source}</div>
        <h2 class="featured-title">${featured.title}</h2>
        <p class="featured-desc">${featured.description}</p>
        <a href="${featured.link}" target="_blank" class="featured-link">Read Full Story →</a>
      </div>
    </div>

    <div class="news-grid">
      ${newsCards}
    </div>
  </div>

  <footer>
    <p>🚀 AI News aggregated from top tech blogs</p>
    <p class="updated-at">Last updated: ${new Date().toLocaleString('de-DE')}</p>
  </footer>
</body>
</html>`;

  return html;
}

function saveHTML(html, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
  console.log(`✓ Generated: ${outputPath}`);
}

module.exports = { generateHTML, saveHTML };
