// main.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { DateTime } = require("luxon");

// Import update functions
const { runUpdate, getGameHighlights } = require("./updateHomeruns");
const { fetch } = require("undici");
const { updateStatLeaders } = require("./extractStatLeaders");
const { updateStartingPitchers, getTodaysStartingPitchers } = require("./updatePitchers");

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

// ---------------- UTILITY FUNCTIONS ----------------

// Scheduled update function
async function runScheduledUpdates() {
  console.log("🔄 Running scheduled data updates...");
  
  try {
    console.log("📊 Updating daily home runs...");
    await runUpdate();
    
    console.log("🏆 Updating leaderboard...");
    await updateStatLeaders();
    
    console.log("⚾ Updating starting pitchers...");
    await updateStartingPitchers();
    
    console.log("✅ All scheduled updates completed successfully");
  } catch (err) {
    console.error("❌ Scheduled update failed:", err.message);
  }
}

// ---------------- ROUTES ----------------

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

    const results = await db.collection("initial connection").find({ date }).toArray();
    const sortedResults = results.sort((a, b) => (b.totalDistance || 0) - (a.totalDistance || 0));
    
    console.log(`📊 Found ${results.length} home runs for ${date}`);
    res.status(200).json(sortedResults);

  } catch (err) {
    console.error("🚨 Error fetching daily homeruns:", err.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// GET /highlights?date=YYYY-MM-DD
// Returns { [playerId]: videoUrl } for all homers on that date.
// Looks up gamePks from stored homer records; falls back to MLB schedule API if not stored.
app.get("/highlights", async (req, res) => {
  try {
    let { date } = req.query;
    if (!date) date = DateTime.now().setZone("America/New_York").toISODate();

    // Get unique gamePks from stored homer records
    const homers = await db.collection("initial connection").find({ date }).toArray();
    let gamePks = [...new Set(homers.map(h => h.gamePk).filter(Boolean))];

    // Fallback: fetch gamePks directly from MLB schedule API for this date
    if (!gamePks.length) {
      const scheduleRes = await fetch(
        `https://statsapi.mlb.com/api/v1/schedule?date=${date}&sportId=1`,
        { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } }
      );
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        gamePks = (scheduleData.dates?.[0]?.games || []).map(g => g.gamePk);
      }
    }

    if (!gamePks.length) return res.json({});

    // Fetch highlights for every game in parallel
    const maps = await Promise.all(gamePks.map(gid => getGameHighlights(gid)));
    const result = {};
    maps.forEach(map => map.forEach((url, pid) => { result[pid] = url; }));

    console.log(`🎬 Highlights for ${date}: ${Object.keys(result).length} players across ${gamePks.length} games`);
    res.json(result);
  } catch (err) {
    console.error("🚨 Error fetching highlights:", err.message);
    res.status(500).json({ error: "Error fetching highlights" });
  }
});

// GET /analytics/odds
// Derives HR prop odds from each top hitter's AB/HR rate; matches player to today's game.
app.get("/analytics/odds", async (req, res) => {
  try {
    const today = DateTime.now().setZone("America/New_York").toISODate();
    const players = await db.collection("leaderboard").find({ date: today }).sort({ HR: -1 }).toArray();
    if (!players.length) return res.json([]);

    // Build a team→{opponent, gamePk} map from the pitchers collection
    const pitchers = await db.collection("pitchers").find({ date: today }).toArray();
    const teamGameMap = {};
    const gamePkTeams = {};
    pitchers.forEach(p => {
      if (!gamePkTeams[p.gamePk]) gamePkTeams[p.gamePk] = [];
      gamePkTeams[p.gamePk].push(p.team);
    });
    Object.entries(gamePkTeams).forEach(([gk, teams]) => {
      if (teams.length >= 2) {
        teamGameMap[teams[0]] = teams[1];
        teamGameMap[teams[1]] = teams[0];
      }
    });

    function deriveOdds(abPerHr) {
      const abph = parseFloat(abPerHr);
      if (!abph || abph <= 0) return null;
      const probPerAB = 1 / abph;
      const p = 1 - Math.pow(1 - probPerAB, 3.5); // ~3.5 ABs per game
      if (p <= 0 || p >= 1) return null;
      const adj = p * 0.82; // bookmaker vig
      return adj >= 0.5
        ? `-${Math.round((adj / (1 - adj)) * 100)}`
        : `+${Math.round(((1 - adj) / adj) * 100)}`;
    }

    const odds = players.map(player => {
      const opponent = teamGameMap[player.team];
      const game = opponent ? `${player.team} vs ${opponent}` : player.team;
      const line = deriveOdds(player.abPerHr);
      const confidence = player.HR >= 8 ? "High" : player.HR >= 5 ? "Med" : "Low";
      const trend = player.HR >= 10 ? "up" : player.HR >= 6 ? "neutral" : "down";
      return {
        playerName: player.name, playerId: player.playerId, team: player.team,
        HR: player.HR, abPerHr: player.abPerHr, game, line, confidence, trend,
      };
    }).filter(o => o.line !== null);

    res.json(odds);
  } catch (err) {
    console.error("🚨 Error fetching analytics odds:", err.message);
    res.status(500).json({ error: "Error fetching odds" });
  }
});

// GET /leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const today = DateTime.now().setZone("America/New_York").toISODate();
    console.log("📅 Fetching leaderboard for:", today);

    const leaders = await db.collection("leaderboard").find({ date: today }).sort({ HR: -1 }).toArray();
    
    console.log(`🏆 Found ${leaders.length} players in leaderboard for ${today}`);
    
    if (leaders.length === 0) {
      return res.status(404).json({ 
        error: "No leaderboard data available for today",
        date: today 
      });
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
    const pitcherData = await getTodaysStartingPitchers();
    res.status(200).json(pitcherData);
  } catch (err) {
    console.error("🚨 Error fetching pitcher data:", err.message);
    res.status(500).json({ error: "Failed to fetch pitcher data" });
  }
});

// Manual update trigger endpoint for testing
app.post("/update-data", async (req, res) => {
  try {
    console.log("🔄 Manual data update triggered...");
    
    await runUpdate();
    await updateStatLeaders();
    await updateStartingPitchers();
    
    res.json({ 
      success: true, 
      message: "All data updated successfully",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Manual update failed:", err.message);
    res.status(500).json({ 
      error: err.message,
      success: false 
    });
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await db.admin().ping();
    
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to check collections
app.get("/debug/collections", async (req, res) => {
  try {
    const collections = await db.listCollections().toArray();
    
    let collectionInfo = {};
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      collectionInfo[col.name] = { count };
    }
    
    res.json({
      database: dbName,
      collections: collectionInfo,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- START SERVER ----------------
async function startServer() {
  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
    await client.connect();
    db = client.db(dbName);
    
    // Test the connection
    await db.admin().ping();
    console.log("✅ Connected to MongoDB Atlas successfully");
    
    // List existing collections
    const collections = await db.listCollections().toArray();
    console.log("📁 Available collections:", collections.map(c => c.name));
    
    // Start the server
    app.listen(port, host, () => {
      console.log(`🚀 Server running at http://${host}:${port}`);
      console.log(`🔗 Health check: http://${host}:${port}/health`);
      console.log(`🛠️  Manual update: POST http://${host}:${port}/update-data`);
    });

    // Run initial data update after server starts (wait 10 seconds for server to be ready)
    setTimeout(async () => {
      console.log("🎯 Running initial data population...");
      await runScheduledUpdates();
    }, 10000);

    // Set up periodic updates every 30 minutes
    setInterval(runScheduledUpdates, 30 * 60 * 1000);
    console.log("⏰ Scheduled updates every 30 minutes");

  } catch (err) {
    console.error("🚨 Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

startServer();