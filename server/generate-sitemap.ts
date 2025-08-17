import { writeSitemap } from './sitemap';

/**
 * Script to generate sitemap.xml file
 * This can be run manually or scheduled as a cron job
 */
async function main() {
  try {
    console.log('Starting sitemap generation...');
    await writeSitemap();
    console.log('Sitemap generation completed successfully!');
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();