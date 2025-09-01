// updateHomeruns.js
const { fetch } = require("undici");
const { MongoClient } = require("mongodb");

// MongoDB connection
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
const dbName = "mlb_data";

// Import extractGamePks function
const extractGamePks = require("./extractGamePks").default;

function getTodayDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

async function getGameFeed(gameId) {
  const url = `https://statsapi.mlb.com/api/v1.1/game/${gameId}/feed/live`; 

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Bad response for game ${gameId}`);
    const data = await response.json();
    return data?.liveData?.plays?.allPlays || [];
  } catch (err) {
    console.error(`🚨 Error fetching feed for game ${gameId}:`, err.message);
    return [];
  }
}

function extractFirstHomerunsFromPlays(plays) {
  const seen = {};
  const date = getTodayDate();
  const homers = [];

  plays.forEach((play) => {
    const batter = play.matchup?.batter;
    const playerId = batter?.id;
    const name = batter?.fullName;

    if (!playerId || !name || seen[playerId]) return;

    if (play.result?.eventType === "home_run") {
      const hitData = play.playEvents?.find(event => event.hitData)?.hitData || {};

      homers.push({
        name,
        playerId,
        description: play.result.description || "Hit a home run",
        imageUrl: batter
          ? `https://content.mlb.com/images/mlb/2025/players/headshots/${playerId}.jpg` 
          : `https://robohash.org/${encodeURIComponent(name)}?set=set4`,
        launchSpeed: hitData.launchSpeed ? Number(hitData.launchSpeed).toFixed(1) : null,
        totalDistance: hitData.totalDistance || null,
        date
      });

      seen[playerId] = true;
    }
  });

  return homers;
}

async function updateDatabaseWithHomeruns(homeruns) {
  const dbClient = new MongoClient(uri);
  const today = getTodayDate();

  try {
    await dbClient.connect();
    const db = dbClient.db(dbName);
    const collection = db.collection("daily_homeruns");

    // Clear today's data
    await collection.deleteMany({ date: today });

    if (homeruns.length > 0) {
      await collection.insertMany(homeruns);
      console.log(`✅ Inserted ${homeruns.length} homerun(s)`);
      homeruns.forEach(hr => {
        console.log(`${hr.name} | ${hr.launchSpeed} mph | ${hr.totalDistance} ft`);
      });
    } else {
      console.log("❌ No homeruns found today.");
    }

  } catch (err) {
    console.error("🚨 Error updating database:", err.message);
  } finally {
    await dbClient.close();
  }
}

async function getTodayHomeRunHitters() {
  try {
    const gamePks = await extractGamePks();
    let allHomers = [];

    for (const gameId of gamePks) {
      const plays = await getGameFeed(gameId);
      const homers = extractFirstHomerunsFromPlays(plays);
      allHomers = [...allHomers, ...homers];
    }

    return allHomers;

  } catch (err) {
    console.error("🚨 Error getting today's HR hitters:", err.message);
    return [];
  }
}

async function runUpdate() {
  console.log("🔄 Fetching today's HR hitters...");
  const hitters = await getTodayHomeRunHitters();
  await updateDatabaseWithHomeruns(hitters);
}

// 👉 Instead of running immediately, export the function
module.exports = { runUpdate, getTodayHomeRunHitters };