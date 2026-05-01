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
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
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

    let packageUrls: string[] = [];
    try {
      // Import constants to get all IDs
      const constantsPath = path.join(process.cwd(), 'src', 'constants.ts');
      // We read file directly to avoid complex import issues in this environment
      const content = fs.readFileSync(constantsPath, 'utf-8');
      const idMatches = content.match(/id:\s*['"](.*?)['"]/g) || [];
      const ids = idMatches.map(m => m.split(/['"]/)[1]);
      
      const uniqueIds = Array.from(new Set(ids));
      packageUrls = uniqueIds.map(id => {
        if (id.startsWith('tour-')) return `/tours?id=${id}`;
        if (id.startsWith('trekk-')) return `/trekks?id=${id}`;
        if (id.startsWith('yoga-')) return `/yoga?id=${id}`;
        if (id.startsWith('med-')) return `/meditation?id=${id}`;
        if (id.startsWith('adv-')) return `/adventure?id=${id}`;
        if (id.startsWith('wfh-')) return `/wfh?id=${id}`;
        return null;
      }).filter(Boolean) as string[];
    } catch (e) {
      console.error("Failed to generate package URLs for sitemap:", e);
    }

    const allUrls = [...staticPages, ...packageUrls];
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
      
      // Specifically target navigation requests (HTML)
      // Check if the path looks like a route (no extension) or ends in .html
      // Also avoid Vite internal paths starting with /@
      const urlPath = urlStr.split('?')[0];
      const isViteInternal = urlPath.startsWith('/@') || urlPath.includes('node_modules');
      const isAsset = urlPath.includes('.') && !urlPath.endsWith('.html');
      
      if (isViteInternal || isAsset) {
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
      const isAsset = urlPath.includes('.') && !urlPath.endsWith('.html');
      
      if (isAsset) {
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
      const userAgent = req.headers['user-agent'] || '';
      
      // Resilient URL parsing
      let rawHost = req.headers['x-forwarded-host'] || req.headers.host || 'thesoulhimalaya.com';
      let host = (Array.isArray(rawHost) ? rawHost[0] : rawHost) as string;
      
      let rawProto = req.headers['x-forwarded-proto'] || 'https';
      let protocol = (Array.isArray(rawProto) ? rawProto[0] : rawProto) as string;
      
      // Ensure host doesn't have protocol
      host = host.replace(/^https?:\/\//, '');

      let url: URL;
      try {
        url = new URL(urlStr, `${protocol}://${host}`);
      } catch (e) {
        console.warn(`[Meta] Invalid URL construction for ${urlStr} on ${host}, falling back to defaults.`);
        url = new URL('/', 'https://thesoulhimalaya.com');
      }

      const id = url.searchParams.get('id');
      console.log(`[Meta] Request for: ${urlStr}, ID: ${id || 'none'}`);
      
      // If we are on the production domain but host says something else (like internal IP), force it
      if (host.includes('run.app') || host.includes('localhost') || host.includes('127.0.0.1')) {
         // Keep it for dev/testing
      } else {
         host = 'thesoulhimalaya.com';
      }
      
      const absoluteUrl = `${protocol}://${host}${urlStr}`;

      let title = "The Soul Himalaya | Spiritual Adventures & Wellness Treks";
      let description = "Experience curated spiritual adventures, wellness retreats, and eco-tours in Tosh and Parvati Valley. Discover The Soul Cafe, Tosh.";
      let image = "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=1200&h=630&q=80";

      let pkg: any = null;

      // 0. Handle Path-based defaults (if no ID)
      if (!id) {
        if (urlStr.includes('/parvati-valley')) {
          title = "The Valley of Shadows & Light | Parvati Valley Spotlight";
          description = "Deep dive into the Parvati Valley—a place of ancient democracies, divine legends, and the ethereal glow of sacred mists.";
          image = "https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg";
        } else if (urlStr.includes('/tours')) {
          title = "Curated Tours | The Soul Himalaya";
          description = "Discover our handpicked mountain journeys across the Kullu and Parvati valleys.";
        } else if (urlStr.includes('/trekks')) {
          title = "Mountain Trekks | High Altitude Adventures";
          description = "From easy waterfalls to challenging glaciers, find your path in the Himalayas.";
        } else if (urlStr.includes('/yoga')) {
          title = "Yoga Retreats in the Himalayas | The Soul Himalaya";
          description = "Hatha, Vinyasa and Sadhana in the quiet hamlets of Kalga and Pulga.";
        } else if (urlStr.includes('/meditation')) {
          title = "Meditation Retreats | Find Inner Peace";
          description = "Experience deep silence and mindfulness in the remote high-altitude wilderness.";
        } else if (urlStr.includes('/soul-cafe')) {
          title = "The Soul Cafe, Tosh | A Sanctuary for Dreamers";
          description = "Located in the mystical heights of Tosh, a sanctuary for dreamers and trekkers.";
          image = "https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg";
        } else if (urlStr.includes('/guide')) {
          title = "Soul Support | The Soul Guide | Regional Intelligence";
          description = "Expert logistical insights, mountain dynamics, and regional intelligence for the Kullu-Parvati-Manali corridor.";
        }
      }

      // 1. Try Firestore First (Most up to date)
      if (id) {
        try {
          const docRef = doc(db, "content", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const docData = docSnap.data();
            console.log(`[Meta] Firestore data found for ${id}`);
            pkg = { id, ...(docData.data || docData) };
          }
        } catch (e) {
          console.error("[Meta] Firestore lookup failed:", e);
        }
      }

      // 2. Try Constants Fallback (If not in Firestore) - IMPROVED PARSING
      if (!pkg && id) {
        try {
          const constantsPath = path.join(process.cwd(), 'src', 'constants.ts');
          const content = fs.readFileSync(constantsPath, 'utf-8');
          // Find the block containing the ID. We search for the ID and then look backwards for the opening brace.
          const idIndex = content.indexOf(`id: '${id}'`) === -1 ? content.indexOf(`id: "${id}"`) : content.indexOf(`id: '${id}'`);
          
          if (idIndex !== -1) {
            // Find the start of the object {
            let startIndex = content.lastIndexOf('{', idIndex);
            // Find the end of the object }
            let endIndex = content.indexOf('}', idIndex);
            
            if (startIndex !== -1 && endIndex !== -1) {
               const pkgStr = content.substring(startIndex, endIndex + 1);
               
               const titleMatch = pkgStr.match(/title:\s*['"](.*?)['"]/);
               const nameMatch = pkgStr.match(/name:\s*['"](.*?)['"]/);
               const imageMatch = pkgStr.match(/image:\s*['"](.*?)['"]/);
               const imagesMatch = pkgStr.match(/images:\s*\[(.*?)\]/s);
               const descMatch = pkgStr.match(/description:\s*['"](.*?)['"]/);
               
               pkg = {
                 id,
                 title: titleMatch ? titleMatch[1] : (nameMatch ? nameMatch[1] : 'Soul Himalaya Experience'),
                 image: imageMatch ? imageMatch[1] : undefined,
                 images: imagesMatch ? imagesMatch[1].split(',').map(s => s.trim().replace(/['"]/g, '')) : undefined,
                 description: descMatch ? descMatch[1] : undefined
               };
               console.log(`[Meta] Found package in Constants via improved search: ${id}`);
            }
          }
        } catch (e) {
          console.warn("[Meta] Could not parse constants.ts for fallback:", e);
        }
      }

      // 3. Hamlet Support
      if (urlStr.startsWith('/parvati-valley/')) {
        const hamletId = urlStr.split('/').pop()?.split('?')[0]?.toLowerCase();
        const hamletNames: Record<string, string> = {
          malana: "Malana",
          tosh: "Tosh",
          pulga: "Pulga",
          kheerganga: "Kheerganga"
        };
        if (hamletId && hamletNames[hamletId]) {
          title = `${hamletNames[hamletId]} | The Hamlets of the Gods | The Soul Himalaya`;
          description = `Explore the mystical village of ${hamletNames[hamletId]} in the Parvati Valley. Discover its unique history, culture, and ancient spiritual traditions.`;
        }
      }

      if (pkg) {
        const pkgTitle = pkg.title || pkg.name || "Soul Himalaya Experience";
        title = `${pkgTitle} | The Soul Himalaya`;
        
        let desc = pkg.description || `Experience ${pkgTitle} with The Soul Himalaya.`;
        if (pkg.duration) desc += ` Duration: ${pkg.duration}.`;
        
        description = desc;
        if (description.length > 200) {
          description = description.substring(0, 197) + "...";
        }

        // Image Handling
        if (pkgTitle.toLowerCase().includes('valley of shadows')) {
          image = "https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg";
        } else {
          image = pkg.image || (Array.isArray(pkg.images) && pkg.images.length > 0 ? pkg.images[0] : image);
        }
        
        // Optimize Unsplash images
        if (image.includes('unsplash.com')) {
          image = image.replace(/&w=\d+/, '&w=1200').replace(/&h=\d+/, '&h=630');
          if (!image.includes('&h=')) image += '&h=630';
          if (!image.includes('&fit=crop')) image += '&fit=crop';
        }
      }

      // Ensure image is absolute
      if (!image.startsWith('http')) {
        image = `${protocol}://${host}${image.startsWith('/') ? '' : '/'}${image}`;
      }

      const metaTags = `
      <!-- Dynamic SEO Tags -->
      <title>${title}</title>
      <meta name="description" content="${description}">
      <link rel="canonical" href="${absoluteUrl}">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="website">
      <meta property="og:url" content="${absoluteUrl}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${image}">
      <meta property="og:image:alt" content="${title}">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:site_name" content="The Soul Himalaya">

      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${image}">
      `;

      // Inject before </head>
      if (html.includes('</head>')) {
        // Remove existing titles and descriptions from index.html during injection to avoid browser confusion
        const cleanedHtml = html.replace(/<title>.*?<\/title>/gi, '')
                                .replace(/<meta name="description" content=".*?">/gi, '');
        return cleanedHtml.replace('</head>', `${metaTags}\n</head>`);
      }
      return html;
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

