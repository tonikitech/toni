const https = require('https');
const http = require('http');
const { parseStringPromise } = require('xml2js');

const SOURCES = [
  { name: 'OpenAI', url: 'https://openai.com/blog/rss.xml', type: 'rss' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', type: 'rss' },
  { name: 'HackerNews', url: 'https://hnrss.org/frontpage', type: 'rss' },
];

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeSource(source) {
  try {
    const xml = await fetchUrl(source.url);
    const parsed = await parseStringPromise(xml);
    const items = parsed.rss?.channel?.[0]?.item || [];
    
    return items.slice(0, 5).map(item => ({
      source: source.name,
      title: item.title?.[0] || 'No title',
      link: item.link?.[0] || '',
      description: item.description?.[0]?.substring(0, 150) || '',
      pubDate: item.pubDate?.[0] || new Date().toISOString(),
      image: extractImage(item) || `https://via.placeholder.com/800x400?text=${source.name}`,
    }));
  } catch (err) {
    console.error(`Error scraping ${source.name}:`, err.message);
    return [];
  }
}

function extractImage(item) {
  // Try content:encoded for image tags
  const content = item['content:encoded']?.[0] || item.description?.[0] || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch?.[1];
}

async function scrapeAll() {
  const allNews = [];
  for (const source of SOURCES) {
    const news = await scrapeSource(source);
    allNews.push(...news);
  }
  return allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

module.exports = { scrapeAll };
