const fetch = require("undici").fetch;
const fs = require("fs");

async function extractGamePks() {
  // Generate today's date in YYYY-MM-DD format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  // Construct the URL with today's date
  const url = `https://statsapi.mlb.com/api/v1/schedule?date=${formattedDate}&sportId=1`;


  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text(); // Get raw error text
      throw new Error(`API request failed with status ${response.status}: ${text}`);
    }

    const data = await response.json();

    // Safely access game list
    const games = data.dates?.[0]?.games || [];

    // Extract gamePk values
    const gamePks = games.map(game => game.gamePk);

    console.log("Extracted gamePks:", gamePks);

    return gamePks;

  } catch (err) {
    console.error("🚨", err.message);
    return [];
  }
}

// Run the script
module.exports.default = extractGamePks;