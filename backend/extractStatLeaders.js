// updateStatLeaders.js
require('dotenv').config();
const { fetch } = require("undici");
const { MongoClient } = require("mongodb");
const { DateTime } = require("luxon");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is missing!");

const dbName = "mlb_data";

// Leaderboard URL for Home Runs only
const hrLeaderUrl =
  "https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=homeRuns&season=2025&limit=10&playerPool=ALL";

// Use Luxon to get today's date in Eastern Time
const getEasternDate = () =>
  DateTime.now().setZone("America/New_York").toISODate();

async function extractTopHittersWithFullStats() {
  try {
    console.log("📊 Fetching top HR hitters...");

    const today = getEasternDate();

    // Step 1: Get Top HR Hitters
    const hrResponse = await fetch(hrLeaderUrl);
    if (!hrResponse.ok) throw new Error("Failed to fetch HR leaders");
    const hrData = await hrResponse.json();

    const hrLeaders = hrData.leagueLeaders?.find(
      (l) => l.leaderCategory === "homeRuns"
    )?.leaders;

    if (!hrLeaders || hrLeaders.length === 0) {
      console.warn("⚠️ No HR leaders found");
      return [];
    }

    const players = [];

    // Step 2: For each player, fetch full stats sequentially
    for (const leader of hrLeaders) {
      const playerId = leader.person.id;
      const playerName = leader.person.fullName;
      const team = leader.team?.name || "Unknown Team";
      const position = leader.position?.abbreviation || "N/A";

      console.log(`🔍 Fetching full stats for ${playerName} (${playerId})`);

      const statsUrl = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&group=hitting&season=2025`;
      const statsRes = await fetch(statsUrl);

      if (!statsRes.ok) {
        console.error(`❌ Failed to fetch stats for ${playerName}`);
        continue;
      }

      const statsData = await statsRes.json();
      const seasonStats = statsData.stats[0]?.splits[0]?.stat || {};

      const safeParseFloat = (val) => (val ? parseFloat(val) : 0);
      const safeParseInt = (val) => (val ? parseInt(val, 10) : 0);

      players.push({
        name: playerName,
        playerId,
        team,
        position,
        HR: safeParseInt(seasonStats.homeRuns),
        RBI: safeParseInt(seasonStats.rbi),
        AVG: safeParseFloat(seasonStats.avg).toFixed(3),
        OPS: safeParseFloat(seasonStats.ops).toFixed(3),
        SB: safeParseInt(seasonStats.stolenBases),
        abPerHr: safeParseFloat(seasonStats.atBatsPerHomeRun).toFixed(2),
        date: today,
      });
    }

    // Sort by HR
    players.sort((a, b) => b.HR - a.HR);

    // Assign ranks with tie handling
    let rank = 1;
    let prevHR = null;

    return players.map((player, index) => {
      const hr = player.HR;
      if (hr !== prevHR) rank = index + 1;
      prevHR = hr;

      const tied = players.findIndex((p) => p.HR === hr) < index;
      return {
        ...player,
        rank: tied ? `T-${rank}` : rank,
      };
    });

  } catch (err) {
    console.error("🚨 Error fetching player stats:", err.message);
    return [];
  }
}

async function updateDatabaseWithStatLeaders(players) {
  const today = getEasternDate();

  if (players.length === 0) {
    console.log("❌ No players to insert");
    return;
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("leaderboard");

    // Clear today's data
    await collection.deleteMany({ date: today });

    // Insert new stats
    await collection.insertMany(players);
    console.log(`✅ Inserted ${players.length} players`);

  } catch (err) {
    console.error("❌ DB update error:", err.message);
  } finally {
    await client.close();
  }
}

async function updateStatLeaders() {
  console.log("🔄 Updating HR leaderboard with full stats...");
  const players = await extractTopHittersWithFullStats();
  await updateDatabaseWithStatLeaders(players);
}

module.exports = { updateStatLeaders, extractTopHittersWithFullStats };