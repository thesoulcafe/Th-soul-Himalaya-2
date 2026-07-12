import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { 
  DEFAULT_TOURS, DEFAULT_TREKKS, DEFAULT_YOGA, 
  DEFAULT_MEDITATION, DEFAULT_ADVENTURE, DEFAULT_WFH, 
  DEFAULT_SERVICES 
} from "./src/constants";

dotenv.config();

import { streamText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Initialize Firebase for server-side meta tags
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[Server] Starting in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[Server] Working directory: ${process.cwd()}`);

  // Redirect www to non-www for SEO score
  app.use((req, res, next) => {
    const host = req.headers.host || '';
    if (host.startsWith('www.')) {
      const nonWwwHost = host.slice(4);
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      return res.redirect(301, `${protocol}://${nonWwwHost}${req.originalUrl}`);
    }
    next();
  });

  app.use(express.json());

  app.get("/sitemap.xml", async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'thesoulhimalaya.com';
    const baseUrl = `${protocol}://${host}`;

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
      '/parvati-valley/kheerganga'
    ];

    let dynamicUrls: string[] = [];
    try {
      // 1. Fetch from Firestore seo_settings (Master list)
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

      // 2. Fallback to Content
      const contentSnap = await getDocs(collection(db, "content"));
      contentSnap.forEach(doc => {
        const data = doc.data();
        const type = data.type;
        const id = doc.id;
        let urlPath = null;
        if (type === 'tour') urlPath = `/tours/${id}`;
        else if (type === 'trekk' || type === 'trek') urlPath = `/trekks/${id}`;
        else if (type === 'yoga') urlPath = `/yoga/${id}`;
        else if (type === 'meditation') urlPath = `/meditation/${id}`;
        else if (type === 'wfh') urlPath = `/wfh/${id}`;
        else if (type === 'service') urlPath = `/services/${id}`;
        
        if (urlPath && !dynamicUrls.includes(urlPath)) {
            dynamicUrls.push(urlPath);
        }
      });

      // 3. Fallback to constants if firestore is missing something
      const constantsPath = path.join(process.cwd(), 'src', 'constants.ts');
      const content = fs.readFileSync(constantsPath, 'utf-8');
      const idMatches = (content.match(/id:\s*['"](.*?)['"]/g) || []) as string[];
      idMatches.forEach(m => {
        const id = m.split(/['"]/)[1];
        let url = null;
        if (id.startsWith('tour-')) url = `/tours/${id}`;
        else if (id.startsWith('trekk-')) url = `/trekks/${id}`;
        else if (id.startsWith('yoga-')) url = `/yoga/${id}`;
        else if (id.startsWith('med-')) url = `/meditation/${id}`;
        
        if (url && !dynamicUrls.includes(url)) dynamicUrls.push(url);
      });
    } catch (e) {
      console.error("Failed to generate package URLs for sitemap:", e);
    }

    const allUrls = [...new Set([...staticPages, ...dynamicUrls])];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => {
    // encode ampersands
    const pathEncoded = url.replace(/&/g, '&amp;');
    // Add trailing slash for main root if it's empty
    const fullLoc = url === '' ? `${baseUrl}/` : `${baseUrl}${pathEncoded}`;
    return `
  <url>
    <loc>${fullLoc}</loc>
    <changefreq>${url === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  }).join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure Multer for local storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const isImgExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext);
      if (file.mimetype.startsWith("image/") || isImgExt) {
        cb(null, true);
      } else {
        cb(new Error("Only images are allowed"));
      }
    },
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // AI Chat Endpoint for Generative UI
  app.post("/api/chat", async (req, res) => {
    console.log("Chat request received:", req.body.messages?.length, "messages");
    try {
      const { messages, profile } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages are required" });
      }

      let personalization = "";
      if (profile) {
        personalization = `
          The user is ${profile.displayName || 'a traveler'}.
          Himalayan Experience Level: ${profile.experienceLevel || 'unknown'}.
          Trek Preferences: ${JSON.stringify(profile.trekPreferences || {})}.
          Loyalty Points: ${profile.loyaltyPoints || 0}.
          Use this information to personalize your responses and recommendations.
        `;
      }

      const result = await streamText({
        model: google("gemini-1.5-flash"),
        messages,
        system: `You are the "Soul Guide" at 'The Soul Himalaya' (thesoulhimalaya.com). You are the official 24/7 Customer Care Support.
        
        STRICT KNOWLEDGE BOUNDARY (CRITICAL):
        - You MUST ONLY use information currently present on the official website (thesoulhimalaya.com) or provided in this context. 
        - NEVER perform outside research or use general LLM knowledge to answer questions about treks, tours, or geography. If the data is not on thesoulhimalaya.com, you DO NOT KNOW IT.
        - You are not a travel researcher; you are a thesoulhimalaya.com concierge.
        - If a user asks about something not explicitly offered by The Soul Himalaya, politely inform them that you are authorized only to discuss our specific curated experiences.
        
        IDENTITY & BRAND:
        - You are the primary interface for customer service. Tone: Welcoming, soulful, yet highly efficient and helpful. 
        - Use "Namaste" and mountain-inspired metaphors sparingly.
        
        CUSTOMER CARE DOMAINS:
        1. TOUR BOOKINGS: Help with itinerary details, pricing (Tours, Trekks, Yoga), and booking status for our specific packages.
        2. SHOP & SHIPPING (Soul Cart): Provide updates on Macrame product orders sold on thesoulhimalaya.com. 
        3. POLICIES: 
            - Cancellation: 100% refund if cancelled 15 days before the trip. 50% refund for 7-14 days. No refund for less than 7 days.
            - Shipping: Macrame items ship within 3-5 business days. International shipping takes 10-15 days.
            - Payments: We currently use "Reserve Spot" (Manual Verification) for bookings.
        4. TROUBLESHOOTING: Help with order mismatches, login issues, or payment doubts regarding our platform.
        
        ACTION PROTOCOLS:
        - If an issue is complex: Provide our contact details (WhatsApp: +91-7018594247, Email: info@thesoulhimalaya.com).
        - Identity Verification: ALWAYS ask for an Order ID or the user's registered name before discussing specific transactions.
        
        ${personalization}
        
        RULES:
        - Keep responses concise (4-5 lines).
        - Use tools ONLY when relevant.
        - End with 3 support-oriented suggestions starting with "[SUGGESTION]".`,
        tools: {
          showItinerary: {
            description: "Show a detailed itinerary for a specific place or tour",
            inputSchema: z.object({
              place: z.string().describe("The Himalayan location (e.g. Kasol, Manali)"),
              days: z.number().describe("Number of days for the itinerary"),
            }),
            execute: async ({ place, days }: { place: string; days: number }) => {
              return { success: true, place, days };
            },
          },
          showTours: {
            description: "Show a list of tour packages based on category or query",
            inputSchema: z.object({
              category: z.string().optional().describe("Filter by category like Romantic, Wellness, Adventure"),
              limit: z.number().optional().default(3).describe("Number of tours to show"),
            }),
            execute: async ({ category, limit }: { category?: string; limit?: number }) => {
              // In a real app, this would query Firestore. For now we describe what to show.
              return { success: true, category: category || 'Recommended', limit };
            },
          },
          bookingCalendar: {
            description: "Display a booking calendar or date picker for a specific tour",
            inputSchema: z.object({
              tourId: z.string().describe("The ID of the tour to book"),
              tourTitle: z.string().describe("The title of the tour"),
            }),
            execute: async ({ tourId, tourTitle }: { tourId: string; tourTitle: string }) => {
              return { success: true, tourId, tourTitle };
            },
          },
        },
      });

      result.pipeTextStreamToResponse(res);
    } catch (error) {
      console.error("AI Chat failed:", error);
      res.status(500).json({ error: "AI service unavailable" });
    }
  });

  // Lazy Razorpay Initialization
  let razorpayInstance: Razorpay | null = null;
  const getRazorpay = () => {
    if (!razorpayInstance) {
      const key_id = process.env.VITE_RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!key_id || !key_secret) {
        throw new Error("Razorpay API keys (VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are missing from environment variables.");
      }
      
      razorpayInstance = new Razorpay({
        key_id,
        key_secret,
      });
    }
    return razorpayInstance;
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "The Soul Himalaya API is running" });
  });

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: *
Allow: /
Disallow: /api/
Disallow: /uploads/

Sitemap: https://thesoulhimalaya.com/sitemap.xml
`);
  });



  app.post("/api/upload", (req, res) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: err.message });
      }
      
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Construct the URL to access the uploaded file
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
          url: fileUrl,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
      } catch (error) {
        console.error("Upload handler failed:", error);
        res.status(500).json({ error: "Failed to process upload" });
      }
    });
  });

  // Razorpay remains defined in dependencies for future use but endpoints are disabled for "Reserve Only" version.
  app.post("/api/razorpay/order", (req, res) => {
    res.status(403).json({ error: "Online payments are currently disabled. Please use the 'Reserve Spot' option." });
  });

  app.post("/api/razorpay/verify", (req, res) => {
    res.status(403).json({ error: "Online payments are currently disabled." });
  });

  // Mock Bookings API
  const bookings: any[] = [];
  app.post("/api/bookings", (req, res) => {
    const booking = { id: Date.now(), ...req.body, status: 'pending', createdAt: new Date() };
    bookings.push(booking);
    res.status(201).json(booking);
  });

  app.get("/api/bookings", (req, res) => {
    res.json(bookings);
  });

  // Helper to determine if we should serve HTML for a given request
  function isHtmlRequest(req: express.Request, urlPath: string): boolean {
    if (urlPath === '/') return true;

    const accept = req.headers.accept || '';
    if (accept.includes('text/html') || accept.includes('*/*')) return true;

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const botKeywords = [
      'facebookexternalhit', 'twitterbot', 'slackbot', 'discordbot', 
      'googlebot', 'bot', 'crawler', 'spider', 'whatsapp', 'linkedinbot'
    ];
    
    if (botKeywords.some(keyword => userAgent.includes(keyword))) {
      return true;
    }

    return false;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Use custom to handle index.html manually for meta injection
    });
    
    app.use(vite.middlewares);

    // Dynamic Meta Tag handler for development
    app.get('*', async (req, res, next) => {
      const urlStr = req.originalUrl || req.url;
      const urlPath = urlStr.split('?')[0];
      const hasExtension = urlPath.includes('.') && !urlPath.endsWith('.html');
      const isViteInternal = urlPath.startsWith('/@') || urlPath.includes('node_modules') || urlPath.startsWith('/@id/');
      
      if (isViteInternal || hasExtension || !isHtmlRequest(req, urlPath)) {
        return next();
      }

      console.log(`[Dev] Serving HTML for: ${urlStr}`);
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        if (!fs.existsSync(templatePath)) {
          console.error(`[Dev] index.html not found at ${templatePath}`);
          return next();
        }
        
        const template = await fs.promises.readFile(templatePath, 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(urlStr, template);
        
        // Inject dynamic tags
        const finalHtml = await injectMetaTags(req, transformedHtml);
        
        res.status(200)
           .set({ 
             'Content-Type': 'text/html',
             'Cache-Control': 'no-cache',
             'X-Powered-By': 'The Soul Himalaya Server'
           })
           .send(finalHtml);
      } catch (e) {
        if (vite) {
          vite.ssrFixStacktrace(e as Error);
        }
        console.error("[Dev] HTML Transformation error:", e);
        res.status(500).send("Transformation Error: " + (e as Error).message);
      }
    });

  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files first
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', async (req, res) => {
      const urlStr = req.originalUrl || req.url;
      const urlPath = urlStr.split('?')[0];
      
      // Prevent serving HTML for missing assets (avoids MIME type errors)
      const isAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|map|webp|avif)$/i.test(urlPath);

      if (isAsset || !isHtmlRequest(req, urlPath)) {
        return res.status(404).send("Not Found");
      }

      try {
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
          return res.status(500).send("Build artifact index.html missing. Please run build.");
        }
        
        const html = await fs.promises.readFile(indexPath, 'utf-8');
        const finalHtml = await injectMetaTags(req, html);
        res.status(200)
           .set({ 
             'Content-Type': 'text/html',
             'Cache-Control': 'public, max-age=3600',
             'X-Powered-By': 'The Soul Himalaya Server (Prod)'
           })
           .send(finalHtml);
      } catch (e) {
        console.error("[Prod] Failed to serve index.html:", e);
        res.status(500).send("Internal Server Error");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// -----------------------------------------------------------------------------
// Dynamic Meta Tag Injection Helper
// -----------------------------------------------------------------------------

async function injectMetaTags(req: express.Request, html: string) {
  // Increase timeout to 3s for slower DB lookups on cold starts
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Timeout")), 3000)
  );

  try {
    const metaPromise = (async () => {
      const urlStr = req.originalUrl || req.url;
      const urlPath = urlStr.split('?')[0];
      const userAgent = req.headers['user-agent'] || '';
      
      // Resilient host/proto detection
      let rawHost = req.headers['x-forwarded-host'] || req.headers.host || 'thesoulhimalaya.com';
      let host = (Array.isArray(rawHost) ? rawHost[0] : rawHost) as string;
      let rawProto = req.headers['x-forwarded-proto'] || 'https';
      let protocol = (Array.isArray(rawProto) ? rawProto[0] : rawProto) as string;
      host = host.replace(/^https?:\/\//, '');

      // Force secure protocol for production domain
      if (host.includes('thesoulhimalaya.com')) {
        protocol = 'https';
      }

      let url: URL;
      try {
        url = new URL(urlStr, `${protocol}://${host}`);
      } catch (e) {
        url = new URL('/', 'https://thesoulhimalaya.com');
      }

      let id = url.searchParams.get('id');
      const pathParts = urlPath.split('/').filter(Boolean);
      if (!id && pathParts.length >= 2 && ['tours', 'trekks', 'yoga', 'meditation', 'adventure', 'wfh', 'service'].includes(pathParts[0])) {
        id = pathParts[1].split('&')[0];
      }
      
      const absoluteUrl = `${protocol}://${host}${urlStr}`;

      // Default Values
      let title = "The Soul Himalaya | Spiritual Adventures & Wellness Treks";
      let description = "Experience curated spiritual adventures, wellness retreats, and eco-tours in Tosh and Parvati Valley. Discover The Soul Cafe, Tosh.";
      let image = "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp";
      let metaOverridden = false;

      // --- STEP 1: Content-based overrides (Tours/Trekks details) - HIGHEST PRIORITY ---
      if (id) {
        try {
          const docRef = doc(db, "content", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const rawData = docSnap.data();
            const pkg = rawData.data || rawData; // Fallback to rawData for older structures
            title = pkg.seoData?.metaTitle || `${pkg.title || pkg.name || 'Tour'} | The Soul Himalaya`;
            description = pkg.seoData?.metaDescription || pkg.shortDescription || pkg.description || description;
            
            // Image Logic: SEO specific image > first in array > thumb image
            let pkgImg = pkg.seoImage || pkg.seoData?.ogImageUrl;
            if (!pkgImg && pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) {
              pkgImg = pkg.images[0];
            }
            if (!pkgImg) pkgImg = pkg.image || pkg.coverImage;
            
            image = pkgImg || image;
            metaOverridden = true;
            console.log(`[Meta] Specific Content found for ${id}, injecting dynamic meta tags`);
          } else {
            // Fallback to local constants
            const allPackages = [
              ...DEFAULT_TOURS, ...DEFAULT_TREKKS, ...DEFAULT_YOGA,
              ...DEFAULT_MEDITATION, ...DEFAULT_ADVENTURE, ...DEFAULT_WFH,
              ...DEFAULT_SERVICES
            ];
            const pkg: any = allPackages.find(p => p.id === id);
            if (pkg) {
              title = `${pkg.title || pkg.name || 'Tour'} | The Soul Himalaya`;
              description = pkg.shortDescription || pkg.description || description;
              image = pkg.image || pkg.coverImage || image;
              metaOverridden = true;
              console.log(`[Meta] Specific Content found for ${id} in constants, injecting dynamic meta tags`);
            }
          }
        } catch (e) {
          console.warn("[Meta] Content lookup failed:", e);
        }
      }

      // --- STEP 1.5: Helmets of Gods Dynamic Articles ---
      if (!metaOverridden && urlPath.startsWith('/helmets-of-gods/')) {
        try {
          const articleSlug = urlPath.replace('/helmets-of-gods/', '');
          const q = query(collection(db, "helmets_of_gods"), where("slug", "==", articleSlug));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const articleData = snap.docs[0].data();
            title = `${articleData.title} | Helmets of Gods`;
            description = articleData.metaDescription || description;
            metaOverridden = true;
            console.log(`[Meta] Helmets of Gods article found for ${articleSlug}`);
          }
        } catch (error) {
          console.warn("[Meta] Helmets of Gods lookup failed:", error);
        }
      }

      // --- STEP 2: Check seo_settings collection (Programmatic SEO) - SECOND PRIORITY ---
      if (!metaOverridden) {
        try {
          const seoQuery = query(collection(db, "seo_settings"), where("path", "==", urlStr));
          const seoSnap = await getDocs(seoQuery);
          if (!seoSnap.empty) {
            const sortedDocs = seoSnap.docs.sort((a, b) => {
              const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : (a.data().createdAt || 0);
              const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : (b.data().createdAt || 0);
              return bTime - aTime;
            });
            const seoData = sortedDocs[0].data();
            title = seoData.title || seoData.metaTitle || title;
            description = seoData.description || seoData.metaDescription || description;
            image = seoData.ogImage || seoData.ogImageUrl || image;
            metaOverridden = true;
            console.log(`[Meta] SEO record found in seo_settings for path: ${urlStr}`);
          } else {
            // Check for path-only match (without query params)
            const pQuery = query(collection(db, "seo_settings"), where("path", "==", urlPath));
            const pSnap = await getDocs(pQuery);
            if (!pSnap.empty) {
              const sortedDocs = pSnap.docs.sort((a, b) => {
                const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : (a.data().createdAt || 0);
                const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : (b.data().createdAt || 0);
                return bTime - aTime;
              });
              const pData = sortedDocs[0].data();
              title = pData.title || pData.metaTitle || title;
              description = pData.description || pData.metaDescription || description;
              image = pData.ogImage || pData.ogImageUrl || image;
              metaOverridden = true;
              console.log(`[Meta] SEO record found in seo_settings for path only: ${urlPath}`);
            }
          }
        } catch (e) {
          console.warn("[Meta] seo_settings lookup failed:", e);
        }
      }

      // --- STEP 3: Path-based Hardcoded Fallbacks - THIRD PRIORITY ---
      if (!metaOverridden) {
        if (urlPath === '/parvati-valley') {
          title = "The Valley of Shadows & Light | Parvati Valley Spotlight";
          description = "Deep dive into the Parvati Valley—a place of ancient democracies, divine legends, and the ethereal glow of sacred mists.";
          image = "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp";
        } else if (urlPath.includes('/soul-cafe')) {
          title = "The Soul Cafe, Tosh | A Sanctuary for Dreamers";
          description = "Located in the mystical heights of Tosh, a sanctuary for dreamers and trekkers.";
          image = "https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg";
        }
      }

      // --- Final Polish & Injection ---
      // Ensure image is absolute
      if (image && !image.startsWith('http')) {
        image = `${protocol}://${host}${image.startsWith('/') ? '' : '/'}${image}`;
      }
      
      // Optimize unsplash
      if (image.includes('unsplash.com')) {
        image = image.replace(/&w=\d+/, '&w=1200').replace(/&h=\d+/, '&h=630').replace(/&q=\d+/, '&q=40');
        if (!image.includes('&h=')) image += '&h=630';
        if (!image.includes('&q=')) image += '&q=40';
        if (!image.includes('&fit=crop')) image += '&fit=crop';
      }

      // Respect limits
      if (title.length > 60) title = title.substring(0, 57) + "...";
      if (description.length > 160) description = description.substring(0, 157) + "...";

      const metaTags = `
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="${absoluteUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${absoluteUrl}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">`;

      const jsonLd = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${title.replace(/"/g, '\\"')}",
  "description": "${description.replace(/"/g, '\\"')}",
  "url": "${absoluteUrl}",
  "image": "${image.replace(/"/g, '\\"')}",
  "publisher": {
    "@type": "Organization",
    "name": "The Soul Himalaya",
    "logo": {
      "@type": "ImageObject",
      "url": "https://i.postimg.cc/LXFYQ7WK/Untitled-design-(1).png?v=2"
    }
  }
}
</script>
`;

      const fallbackHtml = `
<main style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;" class="seo-crawler-content">
  <h1>${title}</h1>
  <h2>Experience Authentic Himalayan Tourism in Tosh</h2>
  <p>${description}</p>
  <p>Welcome to The Soul Himalaya. We specialize in curating transformational journeys through the majestic Parvati Valley in Himachal Pradesh. Our mission is to combine breathtaking high-altitude adventure with profound spiritual wellness, offering travelers a deeply authentic and sustainable Himalayan experience. Whether you're looking to challenge yourself on pristine mountain trails or seeking inner peace through our guided yoga and meditation retreats, our team of local experts has crafted an itinerary that perfectly aligns with your soulful travel desires.</p>
  <h3>Our Core Offerings</h3>
  <p>We pride ourselves on offering a diverse range of handcrafted mountain experiences designed to elevate your stay in Tosh, Kasol, and the broader Parvati Valley region. Enjoy exclusive access to hidden trails, pristine camping spots, and serene meditation areas. Through our platform, you will find:</p>
  <ul>
    <li><a href="/">The Soul Himalaya Home</a></li>
    <li><a href="/tours">Incredible Tour Packages in Himachal Pradesh</a></li>
    <li><a href="/trekks">High-Altitude Trekking in Parvati Valley</a></li>
    <li><a href="/yoga">Transformational Yoga Retreats in Tosh</a></li>
    <li><a href="/meditation">Peaceful Meditation and Spiritual Packages</a></li>
    <li><a href="/wfh">Work From Mountains &amp; Remote Workations</a></li>
    <li><a href="/adventure">Thrilling Adventure Packages</a></li>
    <li><a href="/services">Holistic Travel Services</a></li>
  </ul>
  <h3>Why Choose The Soul Himalaya?</h3>
  <p>We believe in eco-friendly and community-driven tourism. By traveling with us, you are directly supporting the local artisans, guides, and families that call the Himalaya's home. From enjoying specialty coffee at The Soul Cafe to staying in our rustic, scenic locations, every detail is considered to ensure you enjoy optimal privacy, deep comfort, and raw nature.</p>
  <p>Discover our hand-woven macramé and local artisan crafts at our <a href="/shop">Himalayan Artisan Shop</a>, browse our comprehensive <a href="/guide">Travel Guide</a> for essential Parvati Valley travel tips, or simply soak in the aesthetic beauty of the mountains through our visually stunning <a href="/gallery">Gallery</a>.</p>
  <h3>Explore Further</h3>
  <p>Explore <a href="/parvati-valley">the diverse trails and natural wonders of Parvati Valley</a> to plan your optimal holiday. For bespoke inquiries, custom corporate tour packages, or general assistance, please <a href="/contact">contact us</a>. Read deeper into our vision for sustainable tourism on our <a href="/about">About Us</a> page, and discover how our dedicated team ensures your Himalayan escape is perfectly safe, utterly breathtaking, and wholly unforgettable.</p>
  <p><em>The Soul Himalaya &ndash; Reconnect with nature. Reconnect with yourself. Find your authentic mountain rhythm.</em></p>
</main>
`;

      let finalHtml = html;
      
      // Remove all existing meta tags in <head> related to SEO and the default title
      finalHtml = finalHtml
        .replace(/<title>.*?<\/title>/ims, '')
        .replace(/<meta\s+name=["'](title|description|twitter:[a-z]+)["']\s+content=["'].*?["']\s*\/?>/gims, '')
        .replace(/<meta\s+property=["'](og:[a-z]+)["']\s+content=["'].*?["']\s*\/?>/gims, '');

      // Inject the dynamic tags just before </head>
      finalHtml = finalHtml.replace('</head>', `\n${metaTags}\n${jsonLd}\n</head>`);
      
      // Inject fallback semantic content required for some crawlers
      finalHtml = finalHtml.replace('<!-- SSR_CONTENT_PLACEHOLDER -->', fallbackHtml);

      return finalHtml;
    })();

    return await Promise.race([metaPromise, timeoutPromise]) as string;
  } catch (error) {
    console.error("[Meta] Injection failed:", error);
    return html;
  }
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});

