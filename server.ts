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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);

    // Dynamic Meta Tag Fallback for crawlers and link previews
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      const isHtml = req.headers.accept?.includes('text/html') || !url.includes('.');
      
      if (req.method !== 'GET' || !isHtml) {
        return next();
      }

      console.log(`[Dev] Serving transformed HTML for: ${url}`);
      try {
        const html = await fs.promises.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(url, html);
        
        // Inject dynamic tags
        const finalHtml = await injectMetaTags(req, transformedHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        console.error("[Dev] HTML Transformation error:", e);
        next(e);
      }
    });

  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', async (req, res) => {
      try {
        const html = await fs.promises.readFile(path.join(distPath, 'index.html'), 'utf-8');
        const finalHtml = await injectMetaTags(req, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
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
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Timeout")), 1500)
  );

  try {
    const metaPromise = (async () => {
      const urlStr = req.originalUrl;
      const url = new URL(urlStr, `http://${req.headers.host || 'localhost'}`);
      const id = url.searchParams.get('id');
      
      // Get protocol and host dynamically
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers.host || 'thesoulhimalaya.com';
      const absoluteUrl = `${protocol}://${host}${urlStr}`;

      let title = "Soul Himalaya - Soulful Travel in Kullu & Parvati Valley";
      let description = "Curated soulful travel experiences in the heart of the Himalayas. Explore romantic getaways, wellness retreats, and high-altitude adventures.";
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
        } else if (urlStr.includes('/meditation')) {
          title = "Meditation Retreats | Find Inner Peace";
          description = "Experience deep silence and mindfulness in the remote high-altitude wilderness.";
        }
      }

      // 1. Try Firestore First (Most up to date)
      if (id) {
        try {
          const docRef = doc(db, "content", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const docData = docSnap.data();
            pkg = { id, ...docData.data };
            console.log(`[Meta] Found package in Firestore: ${id}`);
          }
        } catch (e) {
          console.error("[Meta] Firestore lookup failed:", e);
        }
      }

      // 2. Try Constants Fallback (If not in Firestore)
      if (!pkg && id) {
        try {
          const constants = await import('./src/constants.ts');
          const allPackages = [
            ...(constants.DEFAULT_TOURS || []),
            ...(constants.DEFAULT_TREKKS || []),
            ...(constants.DEFAULT_YOGA || []),
            ...(constants.DEFAULT_MEDITATION || []),
            ...(constants.DEFAULT_ADVENTURE || []),
            ...(constants.DEFAULT_WFH || [])
          ];
          pkg = allPackages.find(p => p.id === id);
          if (pkg) console.log(`[Meta] Found package in Constants: ${id}`);
        } catch (e) {
          // This might fail in production if .ts files aren't pre-compiled
          console.warn("[Meta] Could not import constants.ts, skipping local fallback.");
        }
      }

      if (pkg) {
        const pkgTitle = pkg.title || pkg.name || "Soul Himalaya Experience";
        title = `${pkgTitle} | Soul Himalaya`;
        
        let highlightsStr = "";
        if (pkg.highlights && Array.isArray(pkg.highlights)) {
          highlightsStr = " Highlights: " + pkg.highlights.join(", ") + ".";
        } else if (pkg.features && Array.isArray(pkg.features)) {
          highlightsStr = " Features: " + pkg.features.join(", ") + ".";
        }

        let itineraryStr = "";
        if (pkg.theExperience) {
           const itineraryBrief = pkg.theExperience.split('\n')
            .filter((l: string) => l.toLowerCase().startsWith('day') || l.toLowerCase().startsWith('step'))
            .slice(0, 3)
            .join(' | ');
           if (itineraryBrief) itineraryStr = " Experience: " + itineraryBrief + ".";
        }

        description = (pkg.description || `Experience ${pkgTitle} in the Parvati Valley.`) + 
                      ` Duration: ${pkg.duration || 'Flexible'}.` + 
                      highlightsStr + itineraryStr;
        
        if (description.length > 200) {
          description = description.substring(0, 197) + "...";
        }

        // Special Case: The Valley of Shadows & Light should ALWAYS use the specific image
        if (pkgTitle.toLowerCase().includes('valley of shadows')) {
          image = "https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg";
        } else {
          image = pkg.image || image;
        }
        
        // Optimize unsplash image for share preview (1200x630 is optimal for WhatsApp/FB)
        if (image.includes('unsplash.com')) {
          image = image.replace(/&w=\d+/, '&w=1200').replace(/&h=\d+/, '&h=630');
          if (!image.includes('&h=')) image += '&h=630';
          if (!image.includes('&fit=crop')) image += '&fit=crop';
        }
      }

      if (!image.startsWith('http')) {
        if (image.startsWith('/')) {
          image = `${protocol}://${host}${image}`;
        } else {
          image = `${protocol}://${host}/${image}`;
        }
      }

      const metaTags = `
      <!-- Dynamic SEO -->
      <title>${title}</title>
      <meta name="description" content="${description}">
      <link rel="canonical" href="${absoluteUrl}">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="website">
      <meta property="og:url" content="${absoluteUrl}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${image}">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:type" content="image/jpeg">
      <meta property="og:site_name" content="The Soul Himalaya">
      <meta property="og:locale" content="en_IN">

      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:url" content="${absoluteUrl}">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${image}">
      `;

      // Remove existing SEO tags to prevent duplicates which confuse crawlers
      let cleanedHtml = html;

      // Inject before placeholder
      return cleanedHtml.replace('<!-- SEO_TAGS_PLACEHOLDER -->', `${metaTags}`);
    })();

    return await Promise.race([metaPromise, timeoutPromise]) as string;
  } catch (error) {
    console.error("Meta injection failed or timed out:", error);
    return html;
  }
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});

