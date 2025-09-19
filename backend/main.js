const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { DateTime } = require("luxon");

// Import pitcher logic (still using .default — may need same fix)
const getTodaysPitchers = require("./updatePitchers").default;

require("dotenv").config();

const app = express();

// ✅ FIX: Remove trailing space in origin URL
app.use(cors({
  origin: [
    "https://charlies-mlb-hafp6xoz8-charlie-hristovs-projects.vercel.app", // ← No space!
    "http://localhost:8080"
  ],
  methods: ["GET"]
}));

app.use(bodyParser.json());

const port = process.env.PORT || 8080;
const host = "0.0.0.0";

const url = process.env.MONGODB_URI;
const dbName = "mlb_data";

// ✅ Keep connection options — they prevent TLS/IPv6 errors
const client = new MongoClient(url, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
});

let db;

// 🔐 Admin Key Middleware
function requireAdminKey(req, res, next) {
  const key = req.query.key;
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid or missing admin key" });
  }
  next();
}

// ---------------- ADMIN ROUTES ----------------

// ✅ FIXED: Removed .default()
app.get("/admin/update-homeruns", requireAdminKey, async (req, res) => {
  try {
    console.log("🔄 Running updateHomeruns.js...");
    const updateHomeruns = require("./updateHomeruns"); // Load module
    await updateHomeruns(); // Call directly
    console.log("✅ Homerun data updated successfully");
    res.status(200).json({ success: true, message: "Homerun data updated" });
  } catch (err) {
    console.error("🚨 Failed to update homeruns:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});

// ✅ FIXED: Removed .default()
app.get("/admin/update-leaderboard", requireAdminKey, async (req, res) => {
  try {
    console.log("🔄 Running updateLeaderboard.js...");
    const updateLeaderboard = require("./updateLeaderboard");
    await updateLeaderboard();
    console.log("✅ Leaderboard updated successfully");
    res.status(200).json({ success: true, message: "Leaderboard updated" });
  } catch (err) {
    console.error("🚨 Failed to update leaderboard:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});

// ---------------- PUBLIC ROUTES ----------------

app.get("/daily_homeruns", async (req, res) => {
  try {
    let { date } = req.query;
    const testMode = process.env.TEST_MODE === "true";

    if (testMode) date = "2025-05-23";
    if (!date && !testMode) {
      date = DateTime.now().setZone("America/New_York").toISODate();
    }

    console.log("📅 Fetching daily HRs for:", date);

    // ✅ Make sure "homeruns" collection exists in Atlas
    const results = await db.collection("homeruns").find({ date }).toArray();
    const sortedResults = results.sort((a, b) => (b.totalDistance || 0) - (a.totalDistance || 0));
    res.status(200).json(sortedResults);

  } catch (err) {
    console.error("🚨 Error fetching daily homeruns:", err.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

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

// ✅ Friendly root route
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
      console.log(`💡 Update homeruns: /admin/update-homeruns?key=${process.env.ADMIN_KEY}`);
      console.log(`💡 Update leaderboard: /admin/update-leaderboard?key=${process.env.ADMIN_KEY}`);
    });

  } catch (err) {
    console.error("🚨 Failed to connect to MongoDB:", err.message);
    console.error("🔗 URI used:", url ? url.replace(/\/\/(.+):(.+)@/, "//***:***@") : "MISSING");
    process.exit(1);
  }
}

startServer();