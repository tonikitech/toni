#!/usr/bin/env node

const { scrapeAll } = require('./scraper');
const { generateHTML, saveHTML } = require('./generator');

async function updateNews() {
  try {
    console.log('🔄 Fetching AI news...');
    const news = await scrapeAll();
    
    if (news.length === 0) {
      console.error('❌ No news found');
      return;
    }

    // Take top 5 stories
    const topNews = news.slice(0, 5);
    console.log(`✓ Found ${topNews.length} stories`);

    // Generate HTML
    const html = generateHTML(topNews);
    
    // Save to public directory
    const path = require('path');
    const outputPath = path.join(__dirname, 'public', 'index.html');
    saveHTML(html, outputPath);

    console.log('✅ News updated successfully!');
    console.log(`Last update: ${new Date().toLocaleString('de-DE')}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Run immediately or when called
if (require.main === module) {
  updateNews();
}

module.exports = { updateNews };
