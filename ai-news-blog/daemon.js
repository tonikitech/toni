#!/usr/bin/env node

const cron = require('node-cron');
const { updateNews } = require('./index');

// Schedule: 0 9 * * * = every day at 09:00
const task = cron.schedule('0 9 * * *', async () => {
  console.log(`\n⏰ [${new Date().toLocaleString('de-DE')}] Running scheduled news update...`);
  await updateNews();
}, {
  timezone: 'Europe/Berlin'
});

// Also run on startup
console.log('🚀 AI News Daemon started');
console.log('⏰ Next update scheduled for: 09:00 (Europe/Berlin)');
console.log('📝 Press Ctrl+C to stop\n');

updateNews().catch(err => console.error('Startup update failed:', err));

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n\n👋 Daemon stopped');
  task.stop();
  process.exit(0);
});
