const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { DateTime } = require("luxon");

// Import update functions
const getTodaysPitchers = require("./updatePitchers").default;

// Load environment variables
require("dotenv").config();

const app = express();
app.use(cors({
  origin: [
    "https://charlies-mlb-hafp6xoz8-charlie-hristovs-projects.vercel.app", // ← Replace with your actual Vercel app URL
    "http://localhost:8080"               // For local dev
  ],
  methods: ["GET"]
}));
app.use(bodyParser.json());

// Use PORT from Render or default 8080
const port = process.env.PORT || 8080;
const host = "0.0.0.0"; // Required for Render

// MongoDB Atlas URI + connection options
const url = process.env.MONGODB_URI;
const dbName = "mlb_data";

// Add critical connection options to avoid TLS/IPv6 issues on Render
const client = new MongoClient(url, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // 👉 Forces IPv4 – fixes common "tlsv1 alert internal error"
});

let db;

// 🔐 Admin Auth Middleware
function requireAdminKey(req, res, next) {
  const key = req.query.key;
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid or missing admin key" });
  }
  next();
}

// ---------------- ADMIN ROUTES ----------------

// GET /admin/update-homeruns?key=SECRET
app.get("/admin/update-homeruns", requireAdminKey, async (req, res) => {
  try {
    console.log("🔄 Running updateHomeruns.js...");
    const updateModule = require("./updateHomeruns");
    await updateModule.default(); // Adjust if export style differs
    console.log("✅ Homerun data updated successfully");
    res.status(200).json({ success: true, message: "Homerun data updated" });
  } catch (err) {
    console.error("🚨 Failed to update homeruns:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});

// GET /admin/update-leaderboard?key=SECRET
app.get("/admin/update-leaderboard", requireAdminKey, async (req, res) => {
  try {
    console.log("🔄 Running updateLeaderboard.js...");
    const updateModule = require("./updateLeaderboard");
    await updateModule.default(); // Adjust if needed
    console.log("✅ Leaderboard updated successfully");
    res.status(200).json({ success: true, message: "Leaderboard updated" });
  } catch (err) {
    console.error("🚨 Failed to update leaderboard:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});

// ---------------- PUBLIC ROUTES ----------------

// GET /daily_homeruns?date=YYYY-MM-DD
app.get("/daily_homeruns", async (req, res) => {
  try {
    let { date } = req.query;
    const testMode = process.env.TEST_MODE === "true";

    if (testMode) date = "2025-05-23";
    if (!date && !testMode) {
      date = DateTime.now().setZone("America/New_York").toISODate();
    }

    console.log("📅 Fetching daily HRs for:", date);

    // ✅ FIX: Change collection name from "initial connection" → real name
    const results = await db.collection("homeruns").find({ date }).toArray();
    const sortedResults = results.sort((a, b) => (b.totalDistance || 0) - (a.totalDistance || 0));
    res.status(200).json(sortedResults);

  } catch (err) {
    console.error("🚨 Error fetching daily homeruns:", err.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// GET /leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const today = DateTime.now().setZone("America/New_York").toISODate();
    console.log("📅 Fetching leaderboard for:", today);

    const leaders = await db.collection("leaderboard").find({ date: today }).sort({ HR: -1 }).toArray();
    if (leaders.length === 0) {
      return res.status(404).json({ error: "No leaderboard data available for today" });
    }

    res.status(200).json(leaders);
  } catch (err) {
    console.error("🚨 Error fetching leaderboard:", err.message);
    res.status(500).json({ error: "Error fetching leaderboard" });
  }
});

// GET /pitchers
app.get("/pitchers", async (req, res) => {
  try {
    console.log("🔄 Fetching today's starting pitchers...");
    const pitcherData = await getTodaysPitchers();
    res.status(200).json(pitcherData);
  } catch (err) {
    console.error("🚨 Error fetching pitcher data:", err.message);
    res.status(500).json({ error: "Failed to fetch pitcher data" });
  }
});

// Optional: Friendly welcome at root
app.get("/", (req, res) => {
  res.status(200).json({
    message: "⚾ MLB Stats API is running!",
    endpoints: [
      "/daily_homeruns?date=YYYY-MM-DD",
      "/leaderboard",
      "/pitchers",
      "/admin/update-homeruns?key=YOUR_KEY",
      "/admin/update-leaderboard?key=YOUR_KEY"
    ]
  });
});

// ---------------- START SERVER ----------------
async function startServer() {
  // Validate required environment variables
  if (!url) {
    console.error("🚨 MONGODB_URI is missing! Set it in environment variables.");
    process.exit(1);
  }

  if (!process.env.ADMIN_KEY) {
    console.warn("⚠️ ADMIN_KEY not set – admin routes are unprotected!");
  }

  try {
    await client.connect();
    db = client.db(dbName);
    console.log("🔌 Connected to MongoDB Atlas successfully!");

    app.listen(port, host, () => {
      console.log(`🚀 App listening at http://${host}:${port}`);
      console.log(`💡 Trigger updates via:`);
      console.log(`   https://mlb-app-k5mr.onrender.com/admin/update-homeruns?key=${process.env.ADMIN_KEY}`);
      console.log(`   https://mlb-app-k5mr.onrender.com/admin/update-leaderboard?key=${process.env.ADMIN_KEY}`);
    });

  } catch (err) {
    console.error("🚨 Failed to connect to MongoDB:", err.message);
    console.error("🔗 URI used:", url ? url.replace(/\/\/(.+):(.+)@/, "//***:***@") : "MISSING");
    process.exit(1);
  }
}

startServer();