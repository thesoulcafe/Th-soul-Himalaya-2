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
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  app.use(express.json());

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, "uploads");
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
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Only images and videos are allowed"));
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
      // 1. Fetch from Firestore
      const contentSnap = await getDocs(collection(db, "content"));
      contentSnap.forEach(doc => {
        const data = doc.data();
        const type = data.type;
        const id = doc.id;
        if (type === 'tour') dynamicUrls.push(`/tours?id=${id}`);
        else if (type === 'trekk' || type === 'trek') dynamicUrls.push(`/trekks?id=${id}`);
        else if (type === 'yoga') dynamicUrls.push(`/yoga?id=${id}`);
        else if (type === 'meditation') dynamicUrls.push(`/meditation?id=${id}`);
      });

      // 2. Fallback to constants if firestore is empty or missing something
      const constantsPath = path.join(process.cwd(), 'src', 'constants.ts');
      const content = fs.readFileSync(constantsPath, 'utf-8');
      const idMatches = (content.match(/id:\s*['"](.*?)['"]/g) || []) as string[];
      idMatches.forEach(m => {
        const id = m.split(/['"]/)[1];
        let url = null;
        if (id.startsWith('tour-')) url = `/tours?id=${id}`;
        else if (id.startsWith('trekk-')) url = `/trekks?id=${id}`;
        else if (id.startsWith('yoga-')) url = `/yoga?id=${id}`;
        else if (id.startsWith('med-')) url = `/meditation?id=${id}`;
        
        if (url && !dynamicUrls.includes(url)) dynamicUrls.push(url);
      });
    } catch (e) {
      console.error("Failed to generate package URLs for sitemap:", e);
    }

    const allUrls = [...new Set([...staticPages, ...dynamicUrls])];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>${url === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  app.post("/api/upload", (req, res) => {
    console.log("[Server] Received upload request");
    
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: err.message });
      }
      
      console.log("[Server] Upload parsed. File:", req.file ? req.file.originalname : "none");
      
      try {
        if (!req.file) {
          console.error("[Server] No file uploaded in request");
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Construct the URL to access the uploaded file
        const fileUrl = `/uploads/${req.file.filename}`;
        console.log(`[Server] File saved successfully: ${fileUrl}`);

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
        const templatePath = path.resolve(__dirname, 'index.html');
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

      const id = url.searchParams.get('id');
      const absoluteUrl = `${protocol}://${host}${urlStr}`;

      // Default Values
      let title = "The Soul Himalaya | Spiritual Adventures & Wellness Treks";
      let description = "Experience curated spiritual adventures, wellness retreats, and eco-tours in Tosh and Parvati Valley. Discover The Soul Cafe, Tosh.";
      let image = "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=1200&h=630&q=80";
      
      let metaOverridden = false;

      // --- PRIORITY 1: Dynamic Content Overrides (Tours/Trekks details from Firestore 'content' collection) ---
      if (id) {
        try {
          const docRef = doc(db, "content", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const docData = docSnap.data();
            // CRITICAL FIX: Extract properties from the nested 'data' field!
            const pkg = docData?.data || {};
            
            const pkgTitle = pkg.title || pkg.name;
            if (pkgTitle) {
              title = pkg.seoData?.metaTitle || `${pkgTitle} | The Soul Himalaya`;
            }
            if (pkg.description || pkg.seoData?.metaDescription) {
              description = pkg.seoData?.metaDescription || pkg.description || description;
            }
            
            // Image Logic: SEO specific image > first image in array > standard image
            let pkgImg = pkg.seoImage || pkg.seoData?.ogImageUrl;
            if (!pkgImg && pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) {
              pkgImg = pkg.images[0];
            }
            if (!pkgImg) pkgImg = pkg.image;
            
            if (pkgImg) {
              image = pkgImg;
            }
            metaOverridden = true;
            console.log(`[Meta] Dynamic content injected for ID: ${id}, Title: ${title}, Image: ${image}`);
          } else {
            console.log(`[Meta] Content doc not found in Firestore for ID: ${id}`);
          }
        } catch (e) {
          console.warn("[Meta] Content lookup failed:", e);
        }
      }

      // --- PRIORITY 2: Check seo_settings collection (Programmatic SEO) ---
      if (!metaOverridden) {
        try {
          const seoQuery = query(collection(db, "seo_settings"), where("path", "==", urlStr));
          const seoSnap = await getDocs(seoQuery);
          if (!seoSnap.empty) {
            const seoData = seoSnap.docs[0].data();
            title = seoData.title || seoData.metaTitle || title;
            description = seoData.description || seoData.metaDescription || description;
            image = seoData.ogImage || seoData.ogImageUrl || image;
            metaOverridden = true;
            console.log(`[Meta] SEO record found in seo_settings for full path: ${urlStr}`);
          } else {
            // Check for path-only match (without query params)
            const pQuery = query(collection(db, "seo_settings"), where("path", "==", urlPath));
            const pSnap = await getDocs(pQuery);
            if (!pSnap.empty) {
              const pData = pSnap.docs[0].data();
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

      // --- PRIORITY 3: Path-based Hardcoded Fallbacks ---
      if (!metaOverridden) {
        if (urlPath.includes('/parvati-valley')) {
          title = "The Valley of Shadows & Light | Parvati Valley Spotlight";
          description = "Deep dive into the Parvati Valley—a place of ancient democracies, divine legends, and the ethereal glow of sacred mists.";
          image = "https://images.unsplash.com/photo-1544333323-167bb3098522?auto=format&fit=crop&w=1200&h=630&q=80";
          metaOverridden = true;
        } else if (urlPath.includes('/soul-cafe')) {
          title = "The Soul Cafe, Tosh | A Sanctuary for Dreamers";
          description = "Located in the mystical heights of Tosh, a sanctuary for dreamers and trekkers.";
          image = "https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg";
          metaOverridden = true;
        }
      }

      // --- Final Polish & Injection ---
      // Ensure image is absolute
      if (image && typeof image === 'string' && !image.startsWith('http')) {
        image = `${protocol}://${host}${image.startsWith('/') ? '' : '/'}${image}`;
      }
      
      // Optimize unsplash
      if (image && typeof image === 'string' && image.includes('unsplash.com')) {
        image = image.replace(/&w=\d+/, '&w=1200').replace(/&h=\d+/, '&h=630').replace(/&q=\d+/, '&q=40');
        if (!image.includes('&h=')) image += '&h=630';
        if (!image.includes('&q=')) image += '&q=40';
        if (!image.includes('&fit=crop')) image += '&fit=crop';
      }

      // Respect limits safely
      if (title && typeof title === 'string' && title.length > 60) {
        title = title.substring(0, 57) + "...";
      }
      if (description && typeof description === 'string' && description.length > 160) {
        description = description.substring(0, 157) + "...";
      }

      const metaTags = `
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:site_name" content="The Soul Himalaya">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${absoluteUrl}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">`;

      let finalHtml = html;
      
      // Order-independent tag filtering
      finalHtml = finalHtml
        .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
        .replace(/<meta[^>]*(?:name|property|itemprop)=["'](?:description|og:[^"']*|twitter:[^"']*|title|image)["'][^>]*\/?>/gi, '');

      if (finalHtml.includes('<head>')) {
        return finalHtml.replace('<head>', `<head>${metaTags}`);
      }
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

