/**
 * Google Indexing API Script
 * 
 * Usage: 
 * 1. Obtain a Service Account JSON key from Google Cloud Console.
 * 2. Place it as 'service-account.json' in the root.
 * 3. Run: node scripts/google-indexing.js
 */

const fs = require('fs');
const { google } = require('googleapis');
const axios = require('axios');
const xml2js = require('xml2js');

const SERVICE_ACCOUNT_FILE = 'service-account.json';
const SITEMAP_URL = 'https://thesoulhimalaya.com/sitemap.xml';

async function indexSite() {
  if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    console.error(`Error: ${SERVICE_ACCOUNT_FILE} not found. Please follow the instructions in the script.`);
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const client = await auth.getClient();
  const tokens = await auth.getAccessToken();

  console.log('Fetching sitemap...');
  const sitemapResponse = await axios.get(SITEMAP_URL);
  const parser = new xml2js.Parser();
  const sitemapData = await parser.parseStringPromise(sitemapResponse.data);

  const urls = sitemapData.urlset.url.map(u => u.loc[0]);
  console.log(`Found ${urls.length} URLs in sitemap.`);

  for (const url of urls) {
    console.log(`Notifying Google about: ${url}`);
    try {
      const response = await axios.post(
        'https://indexing.googleapis.com/v3/urlNotifications:publish',
        {
          url: url,
          type: 'URL_UPDATED',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens}`,
          },
        }
      );
      console.log(`Status for ${url}: ${response.statusText}`);
    } catch (error) {
      console.error(`Failed to notify for ${url}:`, error.response?.data || error.message);
    }
    // Rate limit friendly delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Indexing notification complete.');
}

indexSite();
