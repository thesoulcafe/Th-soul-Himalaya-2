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
        system: `You are the Soul Guide at 'The Soul Himalaya', a 24/7 soulful customer support agent and expert local friend.
        
        CAPABILITIES:
        1. Multi-Domain Knowledge: Tour packages and Macrame (Soul Cart) product shipping.
        2. Tone: Soulful, welcoming, professional. Like a helpful local expert.
        3. Action-Oriented: Troubleshooting for booking/upload issues. Offer human support if needed.
        4. Information Retrieval: Structured to pull from Firebase (Tours, Orders, Users).
        5. Constraint: ALWAYS ask for an Order ID before discussing specific orders or payments.
        6. Interactivity: Use tools to show images, tour cards, and booking calendars.
        
        ${personalization}
        
        RULES:
        - Concise responses (4-5 lines).
        - Use tools for itineraries, showing specific tours, or opening a booking calendar.
        - End with 3 suggestions starting with "[SUGGESTION]".`,
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
    
    // Custom middleware to inject meta tags in development
    app.use(async (req, res, next) => {
      // Check if it's a browser/crawler request for a page
      const isHtml = req.headers.accept?.includes('text/html') || 
                     !req.url.includes('.') || 
                     req.headers['user-agent']?.includes('WhatsApp') ||
                     req.headers['user-agent']?.includes('facebookexternalhit');

      if (req.method !== 'GET' || !isHtml) {
        return next();
      }

      try {
        const url = req.originalUrl;
        const html = await fs.promises.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(url, html);
        
        // Inject dynamic tags
        const finalHtml = await injectMetaTags(req, transformedHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', async (req, res) => {
      try {
        const html = await fs.promises.readFile(path.join(distPath, 'index.html'), 'utf-8');
        const finalHtml = await injectMetaTags(req, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      } catch (e) {
        console.error("Failed to serve index.html:", e);
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
  try {
    const constants = await import('./src/constants.ts');
    const { 
      DEFAULT_TOURS = [], 
      DEFAULT_TREKKS = [], 
      DEFAULT_YOGA = [], 
      DEFAULT_MEDITATION = [], 
      DEFAULT_ADVENTURE = [], 
      DEFAULT_WFH = [] 
    } = constants;

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

    const allPackages = [
      ...DEFAULT_TOURS,
      ...DEFAULT_TREKKS,
      ...DEFAULT_YOGA,
      ...DEFAULT_MEDITATION,
      ...DEFAULT_ADVENTURE,
      ...DEFAULT_WFH
    ];

    let pkg = allPackages.find(p => p.id === id) as any;

    if (!pkg && id) {
      try {
        const docRef = doc(db, "content", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          pkg = { id, ...docData.data };
        }
      } catch (e) {
        console.error("Firestore lookup failed:", e);
      }
    }

    if (pkg) {
      const pkgTitle = pkg.title || pkg.name || "Soul Himalaya Experience";
      title = `The Soul Himalaya - ${pkgTitle}`;
      
      let highlightsStr = "";
      if (pkg.highlights && Array.isArray(pkg.highlights)) {
        highlightsStr = " Highlights: " + pkg.highlights.join(", ") + ".";
      } else if (pkg.features && Array.isArray(pkg.features)) {
        highlightsStr = " Features: " + pkg.features.join(", ") + ".";
      }

      description = (pkg.description || `Experience ${pkgTitle} in the Parvati Valley.`) + 
                    ` Duration: ${pkg.duration || 'Flexible'}. Price: ${pkg.price || 'Contact for details'}.` + 
                    highlightsStr;
      
      if (description.length > 200) {
        description = description.substring(0, 197) + "...";
      }

      image = pkg.image || image;
      
      // Optimize unsplash image for share preview (1200x630)
      if (image.includes('unsplash.com')) {
        image = image.replace(/&w=\d+/, '&w=1200').replace(/&h=\d+/, '&h=630');
        if (!image.includes('&h=')) image += '&h=630';
      }
    }

    if (image.startsWith('/')) {
      image = `${protocol}://${host}${image}`;
    }

    const metaTags = `
    <!-- Dynamic Social Meta Tags -->
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
    <meta property="og:site_name" content="The Soul Himalaya">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${absoluteUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    `;

    // Strip existing common meta tags and title to avoid duplicates
    let cleanedHtml = html
      .replace(/<title>.*?<\/title>/gi, '')
      .replace(/<meta name="description".*?>/gi, '')
      .replace(/<meta property="og:.*?".*?>/gi, '')
      .replace(/<meta name="twitter:.*?".*?>/gi, '');

    // Inject tags immediately after <head>
    return cleanedHtml
      .replace('<head>', `<head>\n<title>${title}</title>${metaTags}`);
  } catch (error) {
    console.error("Meta injection failed:", error);
    return html;
  }
}

startServer();
