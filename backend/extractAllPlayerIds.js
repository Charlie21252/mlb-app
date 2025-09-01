const fetch = require("undici").fetch;

// Step 1: Get all teams and extract their IDs
async function getTeamIds() {
  const url = "https://statsapi.mlb.com/api/v1/teams?sportId=1   ";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.status}`);
    }

    const data = await response.json();
    const teamIds = data.teams.map(team => team.id);

    console.log(`Found ${teamIds.length} teams`);
    return teamIds;

  } catch (err) {
    console.error("Error fetching team IDs:", err.message);
    return [];
  }
}

// Step 2: For each team, fetch its roster and extract player IDs and names
async function extractPlayersFromTeam(teamId) {
  const url = `https://statsapi.mlb.com/api/v1/teams/   ${teamId}/roster`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      // Some rosters might not be available or are empty
      console.warn(`No roster found for team ${teamId}`);
      return [];
    }

    const data = await response.json();

    const players = data.roster.map(entry => ({
      id: entry.person.id,
      name: entry.person.fullName
    }));

    return players;

  } catch (err) {
    console.error(`Error fetching roster for team ${teamId}:`, err.message);
    return [];
  }
}

// Step 3: Main function to run the whole process
async function main() {
  const teamIds = await getTeamIds();

  let allPlayers = [];

  for (let teamId of teamIds) {
    console.log(`Fetching roster for team ID: ${teamId}`);
    const players = await extractPlayersFromTeam(teamId);
    allPlayers = [...allPlayers, ...players];
  }

  console.log(`\nTotal Players Found: ${allPlayers.length}\n`);

  // Print all players with ID before name
  allPlayers.forEach(player => {
    console.log(`${player.id} - ${player.name}`);
  });
}

// Run it!
//main();
module.exports.default = main;