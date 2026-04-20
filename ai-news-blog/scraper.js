const https = require('https');
const http = require('http');
const { parseStringPromise } = require('xml2js');

const SOURCES = [
  { name: 'OpenAI', url: 'https://openai.com/blog/rss.xml', type: 'rss' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', type: 'rss' },
  { name: 'HackerNews', url: 'https://hnrss.org/frontpage', type: 'rss' },
];

let imageCounter = 1;

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
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
      image: extractImage(item) || getUniqueImage(),
    }));
  } catch (err) {
    console.error(`Error scraping ${source.name}:`, err.message);
    return [];
  }
}

function getUniqueImage() {
  const id = imageCounter++;
  return `https://picsum.photos/800/400?random=${id}`;
}

function extractImage(item) {
  // Try multiple image extraction methods
  if (item['media:content']?.[0]?.$ && item['media:content'][0].$.url) {
    return item['media:content'][0].$.url;
  }
  
  if (item['media:thumbnail']?.[0]?.$ && item['media:thumbnail'][0].$.url) {
    return item['media:thumbnail'][0].$.url;
  }
  
  if (item['image:url']?.[0]) {
    return item['image:url'][0];
  }
  
  const content = item['content:encoded']?.[0] || item.description?.[0] || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch?.[1]) {
    return imgMatch[1];
  }
  
  const ogMatch = content.match(/og:image.*content=["']([^"']+)/i);
  if (ogMatch?.[1]) {
    return ogMatch[1];
  }
  
  return null;
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
