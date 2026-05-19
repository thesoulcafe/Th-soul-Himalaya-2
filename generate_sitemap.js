import fs from 'fs';
import path from 'path';

// Load constants to get dynamic ids
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

let dynamicUrls = [];

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
