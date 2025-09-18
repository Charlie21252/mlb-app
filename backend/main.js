const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { DateTime } = require("luxon");

// Import pitcher update logic
const getTodaysPitchers = require("./updatePitchers").default;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use PORT from Render or default 8080
const port = process.env.PORT || 8080;
const host = "0.0.0.0";

// MongoDB Atlas URI from environment variables
require("dotenv").config();
const url = process.env.MONGODB_URI;
const dbName = "mlb_data";
const client = new MongoClient(url);

let db;

// ---------------- ROUTES ----------------

// GET /daily_homeruns?date=YYYY-MM-DD
app.get("/daily_homeruns", async (req, res) => {
  try {
    let { date } = req.query;
    const testMode = process.env.TEST_MODE === "true";

    if (testMode) date = "2025-05-23";
    if (!date && !testMode) date = DateTime.now().setZone("America/New_York").toISODate();

    console.log("📅 Fetching daily HRs for:", date);

    const results = await db.collection("initial connection").find({ date }).toArray();
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
    if (leaders.length === 0) return res.status(404).json({ error: "No leaderboard data available for today" });

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

// ---------------- START SERVER ----------------
async function startServer() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("🔌 Connected to MongoDB Atlas");

    app.listen(port, host, () => {
      console.log(`🚀 App listening at http://${host}:${port}`);
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

startServer();
