import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { streamText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

  // Razorpay Create Order
  app.post("/api/razorpay/order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
      console.log(`[Razorpay] Creating order: Amount=${amount}, Currency=${currency}, Receipt=${receipt}`);

      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Valid amount is required" });
      }

      if (amount < 1) {
        return res.status(400).json({ error: "Amount must be at least ₹1.00" });
      }

      const razorpay = getRazorpay();
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt,
      };

      const order = await razorpay.orders.create(options);
      console.log(`[Razorpay] Order created successfully: ID=${order.id}`);
      res.json(order);
    } catch (error) {
      console.error("[Razorpay] Order creation failed:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create Razorpay order" });
    }
  });

  // Razorpay Verify Signature
  app.post("/api/razorpay/verify", (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      console.log(`[Razorpay] Verifying payment: OrderId=${razorpay_order_id}, PaymentId=${razorpay_payment_id}`);
      
      const secret = process.env.RAZORPAY_KEY_SECRET;

      if (!secret) {
        console.error("[Razorpay] Verification failed: RAZORPAY_KEY_SECRET is missing");
        return res.status(500).json({ error: "RAZORPAY_KEY_SECRET is missing" });
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        console.log("[Razorpay] Verification successful");
        res.json({ status: "success", message: "Payment verified successfully" });
      } else {
        console.warn("[Razorpay] Verification failed: Signature mismatch");
        res.status(400).json({ status: "failure", message: "Invalid signature" });
      }
    } catch (error) {
      console.error("[Razorpay] Verification failed:", error);
      res.status(500).json({ error: "Verification failed" });
    }
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
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
