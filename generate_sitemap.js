import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

let db = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  } else {
    console.warn("⚠️ firebase-applet-config.json not found. Dynamic sitemap entries from Firestore will be skipped.");
  }
} catch (e) {
  console.error("⚠️ Failed to initialize Firebase in generate_sitemap.js:", e);
}

const baseUrl = 'https://thesoulhimalaya.com';
const staticPages = [
  '',
  '/services',
  '/tours',
  '/trekks',
  '/yoga',
  '/meditation',
  '/wfh',
  '/shop',
  '/cart',
  '/parvati-valley',
  '/parvati-valley/malana',
  '/parvati-valley/tosh',
  '/parvati-valley/pulga',
  '/parvati-valley/kheerganga',
  '/about',
  '/contact',
  '/soul-cafe'
];

async function generateSitemap() {
  let dynamicUrls = [];

  // Local Constants
  try {
    const constantsPath = path.join(process.cwd(), 'src', 'constants.ts');
    if (fs.existsSync(constantsPath)) {
      const content = fs.readFileSync(constantsPath, 'utf-8');
      const idMatches = content.match(/id:\s*['"](.*?)['"]/g) || [];
      idMatches.forEach(m => {
        const id = m.split(/['"]/)[1];
        let url = null;
        if (id.startsWith('tour-')) url = `/tours/${id}`;
        else if (id.startsWith('trekk-')) url = `/trekks/${id}`;
        else if (id.startsWith('yoga-')) url = `/yoga/${id}`;
        else if (id.startsWith('med-')) url = `/meditation/${id}`;
        
        if (url && !dynamicUrls.includes(url)) dynamicUrls.push(url);
      });
    }
  } catch (e) {
    console.error("Failed to parse constants for sitemap:", e);
  }

  // Firebase SEO Settings
  if (db) {
    try {
      const seoSnap = await getDocs(collection(db, "seo_settings"));
      seoSnap.forEach(doc => {
        const data = doc.data();
        let p = data.path;
        if (p) {
          if (p.includes('?id=')) {
            const [base_path, qs] = p.split('?id=');
            p = `${base_path}/${qs}`;
          }
          if (!dynamicUrls.includes(p)) {
            dynamicUrls.push(p);
          }
        }
      });

      const contentSnap = await getDocs(collection(db, "content"));
      contentSnap.forEach(doc => {
        const data = doc.data();
        const type = data.type;
        const id = doc.id;
        let url = null;
        if (type === 'tour') url = `/tours/${id}`;
        else if (type === 'trekk' || type === 'trek') url = `/trekks/${id}`;
        else if (type === 'yoga') url = `/yoga/${id}`;
        else if (type === 'meditation') url = `/meditation/${id}`;
        else if (type === 'wfh') url = `/wfh/${id}`;
        else if (type === 'service') url = `/services/${id}`;

        if (url && !dynamicUrls.includes(url)) dynamicUrls.push(url);
      });
    } catch(e) {
      console.error("Failed to fetch from Firebase", e);
    }
  } else {
    console.log("Skipping Firebase fetch since database is not available.");
  }

  const allUrls = [...new Set([...staticPages, ...dynamicUrls])];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
  <url>
    <loc>${baseUrl}${url.replace(/&/g, '&amp;')}</loc>
    <changefreq>${url === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap.trim());
  console.log('✅ Generated public/sitemap.xml successfully!');
  process.exit(0);
}

generateSitemap().catch(e => {
  console.error("❌ Sitemap generation failed:", e);
  process.exit(0);
});
