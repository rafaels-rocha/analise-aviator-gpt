const db = require('./db');
const scraper = require('./scraper');
const logger = require('./logger');

async function main() {
  try {
    await db.connect();
    await scraper.scrapeAviator();
  } catch (error) {
    logger.error('Error in main function:', error);
  }
}

main();