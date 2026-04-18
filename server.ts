import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Endpoint for Generative UI
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, profile } = req.body;
      
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
        system: `You are the Soul Guide at Soul Himalaya. Help users with travel plans, bookings, and regional info. Use tools to show maps, itineraries, or price quotes. ${personalization}`,
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

  // Razorpay Create Order
  app.post("/api/razorpay/order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;

      if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
      }

      const razorpay = getRazorpay();
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Razorpay order creation failed:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create Razorpay order" });
    }
  });

  // Razorpay Verify Signature
  app.post("/api/razorpay/verify", (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const secret = process.env.RAZORPAY_KEY_SECRET;

      if (!secret) {
        return res.status(500).json({ error: "RAZORPAY_KEY_SECRET is missing" });
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        res.json({ status: "success", message: "Payment verified successfully" });
      } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
      }
    } catch (error) {
      console.error("Razorpay verification failed:", error);
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
