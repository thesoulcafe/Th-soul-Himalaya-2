import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({ origin: true }));
  app.use(express.json());

  // Upload directory configuration
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || ".png";
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });

  const upload = multer({ storage });

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "The Soul Himalaya API is running" });
  });

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
          The user is ${profile.displayName || "a traveler"}.
          Himalayan Experience Level: ${profile.experienceLevel || "unknown"}.
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
          - You MUST ONLY use information currently present on the official website. 
          - NEVER perform outside research.
           
          IDENTITY & BRAND:
          - You are the primary interface for customer service. Tone: Welcoming, soulful. 
          - Use "Namaste" and mountain-inspired metaphors sparingly.
           
          CUSTOMER CARE DOMAINS:
          1. TOUR BOOKINGS: Help with itinerary details, pricing (Tours, Trekks, Yoga).
          2. SHOP & SHIPPING (Soul Cart): Provide updates on Macrame product orders. 
          3. POLICIES: 
              - Cancellation: 100% refund if cancelled 15 days before the trip. 50% refund for 7-14 days. No refund for less than 7 days.
          4. TROUBLESHOOTING: Help with order mismatches, login issues.
           
          ACTION PROTOCOLS:
          - Provide contact details if complex (WhatsApp: +91-7018594247, Email: info@thesoulhimalaya.com).
           
          ${personalization}
           
          RULES:
          - Keep responses concise (4-5 lines).
          - Use tools ONLY when relevant.`,
      });

      result.pipeTextStreamToResponse(res);
    } catch (error) {
      console.error("AI Chat failed:", error);
      res.status(500).json({ error: "AI service unavailable" });
    }
  });

  let razorpayInstance: Razorpay | null = null;
  const getRazorpay = () => {
    if (!razorpayInstance) {
      const key_id = "rzp_live_TD7OkloTGugSlw";
      const key_secret = "iwt0CQTRvVYS0sAYVeX95qUJ";
      if (!key_id || !key_secret) {
        throw new Error("Razorpay API keys are missing.");
      }
      razorpayInstance = new Razorpay({ key_id, key_secret });
    }
    return razorpayInstance;
  };

  app.post("/api/razorpay/order", async (req, res) => {
    try {
      const razorpay = getRazorpay();
      const options = {
        amount: Math.round(req.body.amount * 100),
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ error: error.message || "Failed to create Razorpay order" });
    }
  });

  app.post("/api/razorpay/verify", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", "iwt0CQTRvVYS0sAYVeX95qUJ")
      .update(body.toString())
      .digest("hex");
    if (expectedSignature === razorpay_signature) {
      res.json({ status: "success" });
    } else {
      res.status(400).json({ status: "failure", error: "Invalid signature" });
    }
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
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
          url: fileUrl,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
      } catch (error: any) {
        console.error("File processing error:", error);
        res.status(500).json({ error: "Failed to process uploaded file" });
      }
    });
  });

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  function isHtmlRequest(req: express.Request, urlPath: string): boolean {
    if (urlPath === "/") return true;
    const accept = req.headers.accept || "";
    if (accept.includes("text/html") || accept.includes("*/*")) return true;
    return false;
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
