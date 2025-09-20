// updatePitchers.js
require('dotenv').config();
const { fetch } = require("undici");
const { MongoClient } = require("mongodb");
const { DateTime } = require("luxon");
const { extractGamePks } = require("./extractGamePks");

// MongoDB connection
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is missing!");

const dbName = "mlb_data";

// Helper: Eastern Time ISO date
const getEasternDate = () =>
  DateTime.now().setZone("America/New_York").toISODate();

// Get season pitching stats for a player
async function getPitchingStats(pitcherId) {
  const url = `https://statsapi.mlb.com/api/v1/people/${pitcherId}/stats?stats=season&group=pitching&season=2025`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!res.ok) throw new Error("Bad stat fetch");

    const data = await res.json();
    const stat = data.stats?.[0]?.splits?.[0]?.stat || {};

    return {
      ERA: stat.era || "N/A",
      HR9: stat.homeRunsPer9 || "N/A",
      wins: stat.wins || 0,
      losses: stat.losses || 0,
      strikeouts: stat.strikeOuts || 0,
      whip: stat.whip || "N/A"
    };
  } catch (err) {
    console.error(`❌ Error fetching stats for pitcher ${pitcherId}:`, err.message);
    return { ERA: "Error", HR9: "Error", wins: 0, losses: 0, strikeouts: 0, whip: "Error" };
  }
}

// For a given gamePk, extract the starting pitchers (1 per team)
async function getStartingPitchersForGame(gamePk) {
  const url = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!res.ok) throw new Error("Failed to fetch live game data");

    const data = await res.json();
    const result = [];

    // Get team info
    const homeTeam = data.gameData?.teams?.home?.name || "Unknown Team";
    const awayTeam = data.gameData?.teams?.away?.name || "Unknown Team";

    for (const side of ["home", "away"]) {
      const players = data.liveData?.boxscore?.teams?.[side]?.players || {};
      const teamName = side === "home" ? homeTeam : awayTeam;

      for (const key in players) {
        const player = players[key];

        const isStarter =
          player.position?.code === "1" &&
          player.stats?.pitching?.gamesStarted > 0;

        if (isStarter) {
          const stats = await getPitchingStats(player.person.id);

          result.push({
            gamePk,
            team: teamName,
            teamSide: side,
            playerId: player.person.id,
            name: player.person.fullName,
            ...stats,
            date: getEasternDate()
          });
        }
      }
    }

    return result;
  } catch (err) {
    console.error(`❌ Game ${gamePk} failed:`, err.message);
    return [];
  }
}

// Update database with pitcher data
async function updateDatabaseWithPitchers(pitchers) {
  const today = getEasternDate();

  if (pitchers.length === 0) {
    console.log("❌ No pitchers to insert");
    return;
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("pitchers");

    // Clear today's data
    await collection.deleteMany({ date: today });

    // Insert new pitcher data
    await collection.insertMany(pitchers);
    console.log(`✅ Inserted ${pitchers.length} starting pitchers`);

  } catch (err) {
    console.error("❌ DB update error:", err.message);
  } finally {
    await client.close();
  }
}

// Main function to get pitchers and store in database
async function updateStartingPitchers() {
  console.log("⚾ Getting today's starting pitchers with stats...");
  
  try {
    const gamePks = await extractGamePks();
    const allPitchers = [];

    for (const gamePk of gamePks) {
      const starters = await getStartingPitchersForGame(gamePk);
      allPitchers.push(...starters);
    }

    console.log(`✅ Found ${allPitchers.length} starting pitchers`);
    
    // Store in database
    await updateDatabaseWithPitchers(allPitchers);
    
    return allPitchers;
  } catch (err) {
    console.error("🚨 Error updating starting pitchers:", err.message);
    return [];
  }
}

// Function to get pitchers from database (for API endpoint)
async function getTodaysStartingPitchers() {
  const today = getEasternDate();
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("pitchers");

    const pitchers = await collection.find({ date: today }).toArray();
    return pitchers;

  } catch (err) {
    console.error("❌ Error fetching pitchers from DB:", err.message);
    return [];
  } finally {
    await client.close();
  }
}

// Export both functions
module.exports = { 
  updateStartingPitchers, 
  getTodaysStartingPitchers,
  default: getTodaysStartingPitchers  // Keep compatibility with existing import
};