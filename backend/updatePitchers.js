const { fetch } = require("undici");
const { DateTime } = require("luxon");
const extractGamePks = require("./extractGamePks").default;

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
      HR9: stat.homeRunsPer9 || "N/A"
    };
  } catch (err) {
    console.error(`❌ Error fetching stats for pitcher ${pitcherId}:`, err.message);
    return { ERA: "Error", HR9: "Error" };
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

    for (const side of ["home", "away"]) {
      const players = data.liveData?.boxscore?.teams?.[side]?.players || {};

      for (const key in players) {
        const player = players[key];

        const isStarter =
          player.position?.code === "1" &&
          player.stats?.pitching?.gamesStarted > 0;

        if (isStarter) {
          const stats = await getPitchingStats(player.person.id);

          result.push({
            gamePk,
            team: side,
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

// Main function
async function extractStartingPitchersWithStats() {
  console.log("⚾ Getting today's starting pitchers with stats...");
  const gamePks = await extractGamePks();

  const allPitchers = [];

  for (const gamePk of gamePks) {
    const starters = await getStartingPitchersForGame(gamePk);
    allPitchers.push(...starters);
  }

  console.log(`✅ Found ${allPitchers.length} starting pitchers`);
  return allPitchers;
}

// Run standalone
if (require.main === module) {
  extractStartingPitchersWithStats()
    .then((pitchers) => {
      console.log("\n📊 Starting Pitchers:");
      pitchers.forEach((p) => {
        console.log(`${p.name} (${p.team}) | ERA: ${p.ERA}, HR/9: ${p.HR9}`);
      });
    })
    .catch(console.error);
}

module.exports.default = extractStartingPitchersWithStats;
