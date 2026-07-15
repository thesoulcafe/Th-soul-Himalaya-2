const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { streamText } = require("ai");
const { createGoogleGenerativeAI } = require("@ai-sdk/google");

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// Enable CORS
app.use(cors({ origin: true }));
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "The Soul Himalaya API is running on Firebase Functions" });
});

// Chatbot Endpoint
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

    const apiKey = process.env.GEMINI_API_KEY || (functions.config().gemini && functions.config().gemini.apikey);
    const google = createGoogleGenerativeAI({ apiKey });

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
        - End with 3 support-oriented suggestions starting with "[SUGGESTION]".`,
    });

    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("AI Chat failed:", error);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

// Razorpay Initialization
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID || (functions.config().razorpay && functions.config().razorpay.key_id) || 'rzp_live_TD7OkloTGugSlw';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || (functions.config().razorpay && functions.config().razorpay.key_secret) || 'iwt0CQTRvVYS0sAYVeX95qUJ';
    
    if (!key_id || !key_secret) {
      throw new Error("Razorpay API keys are missing.");
    }
    
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
};

// Razorpay Endpoints
app.post("/api/razorpay/order", async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const options = {
      amount: Math.round(req.body.amount * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ error: error.message || error.description || "Failed to create Razorpay order" });
  }
});

app.post("/api/razorpay/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  
  const key_secret = process.env.RAZORPAY_KEY_SECRET || (functions.config().razorpay && functions.config().razorpay.key_secret) || 'iwt0CQTRvVYS0sAYVeX95qUJ';
  
  const expectedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(body.toString())
    .digest("hex");
    
  if (expectedSignature === razorpay_signature) {
    res.json({ status: "success" });
  } else {
    res.status(400).json({ status: "failure", error: "Invalid signature" });
  }
});

app.post("/api/upload", (req, res) => {
  res.status(400).json({ 
    error: "Upload fallback is disabled in Firebase Functions. Please configure CORS in Firebase Storage for direct client upload." 
  });
});

exports.api = functions.https.onRequest(app);
