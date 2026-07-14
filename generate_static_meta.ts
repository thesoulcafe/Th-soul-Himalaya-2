import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { 
  DEFAULT_TOURS, DEFAULT_TREKKS, DEFAULT_YOGA, 
  DEFAULT_MEDITATION, DEFAULT_ADVENTURE, DEFAULT_WFH, 
  DEFAULT_SERVICES 
} from './src/constants';

let db = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  } else {
    console.warn("⚠️ firebase-applet-config.json not found. Dynamic static meta pages from Firestore will be skipped.");
  }
} catch (e) {
  console.error("⚠️ Failed to initialize Firebase in generate_static_meta.ts:", e);
}

async function generateStaticHTML() {
  const distDir = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distDir)) {
    console.log("Dist directory not found, skipping static meta generation.");
    return;
  }

  const baseHtmlFile = path.join(distDir, 'index.html');
  if (!fs.existsSync(baseHtmlFile)) {
    console.log("dist/index.html not found.");
    return;
  }

  const baseHtml = fs.readFileSync(baseHtmlFile, 'utf8');

  // Track the pages we've built to avoid duplicates
  const builtPaths = new Set();

  function WriteTargetHTML(targetRelativePath, title, description, image) {
      if (builtPaths.has(targetRelativePath)) return;
      builtPaths.add(targetRelativePath);

      const url = `https://thesoulhimalaya.com${targetRelativePath}`;
      const metaTags = `
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">

<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${url}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
      `;

      let newHtml = baseHtml
        .replace(/<title>.*?<\/title>/ims, '')
        .replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/gims, '')
        .replace(/<meta\s+property=["'](og:[a-z]+)["']\s+content=["'].*?["']\s*\/?>/gims, '')
        .replace(/<meta\s+name=["'](twitter:[a-z]+)["']\s+content=["'].*?["']\s*\/?>/gims, '');

      newHtml = newHtml.replace('</head>', `\n${metaTags}\n</head>`);

      // targetRelativePath is like /tours/tour-1  -> We need to build /tours/tour-1/index.html
      const targetDir = path.join(distDir, ...targetRelativePath.split('/').filter(Boolean));
      fs.mkdirSync(targetDir, { recursive: true });

      fs.writeFileSync(path.join(targetDir, 'index.html'), newHtml);
      console.log(`Generated static Meta HTML for: ${targetRelativePath}`);
  }

  // 1. Firebase SEO settings
  if (db) {
    try {
      const seoSnap = await getDocs(collection(db, "seo_settings"));
      seoSnap.forEach(doc => {
        const data = doc.data();
        const p = data.path;
        if (!p) return;
        // if p comes in as /tours?id=123 we must rewrite it to /tours/123 for static generation
        let staticPath = p;
        if (p.includes('?id=')) {
          const [base_path, qs] = p.split('?id=');
          staticPath = `${base_path}/${qs}`;
        }
        WriteTargetHTML(
          staticPath,
          data.title || 'The Soul Himalaya',
          data.description || '',
          data.ogImage || 'https://i.postimg.cc/wMSWmFKB/IMG-1095.webp'
        );
      });
    } catch (e) {
      console.error("Failed to build from seo_settings", e);
    }

    // 2. Firebase Content
    try {
      const contentSnap = await getDocs(collection(db, "content"));
      contentSnap.forEach(doc => {
        const pkg = doc.data();
        const type = pkg.type;
        const id = doc.id;
        let urlPath = null;
        if (type === 'tour') urlPath = `/tours/${id}`;
        else if (type === 'trekk' || type === 'trek') urlPath = `/trekks/${id}`;
        else if (type === 'yoga') urlPath = `/yoga/${id}`;
        else if (type === 'meditation') urlPath = `/meditation/${id}`;
        else if (type === 'wfh') urlPath = `/wfh/${id}`;
        else if (type === 'service') urlPath = `/services/${id}`;

        if (!urlPath) return;

        const title = pkg.seoData?.metaTitle || `${pkg.title || pkg.name} | The Soul Himalaya`;
        const description = pkg.seoData?.metaDescription || pkg.shortDescription || pkg.description || "Experience curated retreats and adventures in Parvati Valley.";
        let image = pkg.seoImage || pkg.seoData?.ogImageUrl;
        if (!image && pkg.images && pkg.images.length > 0) image = pkg.images[0];
        if (!image) image = pkg.image || pkg.coverImage || "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp";

        WriteTargetHTML(urlPath, title, description, image);
      });
    } catch (e) {
      console.error("Failed to build from content", e);
    }
  } else {
    console.log("Skipping Firebase fetch since database is not available.");
  }

  // 3. Fallback to constants
  const allPackages = [
    { prefix: 'tours', items: DEFAULT_TOURS },
    { prefix: 'trekks', items: DEFAULT_TREKKS },
    { prefix: 'yoga', items: DEFAULT_YOGA },
    { prefix: 'meditation', items: DEFAULT_MEDITATION },
    { prefix: 'adventure', items: DEFAULT_ADVENTURE },
    { prefix: 'wfh', items: DEFAULT_WFH },
    { prefix: 'services', items: DEFAULT_SERVICES }
  ];

  for (const category of allPackages) {
    for (const item of category.items) {
      const pkg = item as any;
      if (!pkg.id) continue;
      
      const title = `${pkg.title || pkg.name} | The Soul Himalaya`;
      const description = pkg.shortDescription || pkg.description || "Experience curated retreats and adventures in Parvati Valley with The Soul Himalaya.";
      const image = pkg.image || pkg.coverImage || "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp";
      const urlPath = `/${category.prefix}/${pkg.id}`;

      WriteTargetHTML(urlPath, title, description, image);
    }
  }

  // Generate generic pages too
  const generics = [
    { path: '/services', title: "Himalayan Services & Retreats | The Soul Himalaya", desc: "Premium Himalayan services.", img: "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp" },
    { path: '/tours', title: "Tours & Backpacking | The Soul Himalaya", desc: "Discover mountain tour packages.", img: "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp" },
    { path: '/trekks', title: "Himalayan Trekking | The Soul Himalaya", desc: "High-altitude glacier treks.", img: "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp" },
    { path: '/yoga', title: "Yoga Retreats | The Soul Himalaya", desc: "Himalayan yoga journeys.", img: "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp" },
    { path: '/meditation', title: "Meditation in Parvati | The Soul Himalaya", desc: "Peaceful silence and mindfulness.", img: "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp" },
    { path: '/about', title: "About Soul Himalaya | Sustainable Tourism & Empowerment", desc: "Learn about The Soul Himalaya's dedication to sustainable tourism, environmental preservation, and uplifting local Parvati Valley communities through mindful travel.", img: "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp" },
    { path: '/tour-packages', title: "Tour Packages in Himachal Pradesh | Parvati Valley Treks", desc: "Book your soulful tour package in Himachal Pradesh. Experience high-altitude trekking, curated corporate tours, and mindful adventures in the Parvati Valley.", img: "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp" },
    { path: '/holistic-packages-trekking', title: "Curated Retreats, Treks & Wellness Services Soul Himalaya", desc: "Explore the full range of Soul Himalaya services. From high-altitude trekking and bespoke corporate tours to wellness sanctuaries and digital remote workations.", img: "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp" },
    { path: '/parvati-valley', title: "Parvati Valley Explorer | The Soul Himalaya", desc: "Explore the magic of Tosh.", img: "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp" }
  ];
  for (const g of generics) {
    WriteTargetHTML(g.path, g.title, g.desc, g.img);
  }
}

generateStaticHTML().then(() => {
  console.log("✅ Static HTML generation complete!");
  process.exit(0);
}).catch((e) => {
  console.error("⚠️ Static HTML generation completed with warnings/errors:", e);
  process.exit(0);
});
