import { useState, useEffect } from "react";

const teamColors = {
  "New York Yankees": "#1C2F61",
  "Chicago Cubs": "#0E3386",
  "Los Angeles Dodgers": "#005A9C",
  "Philadelphia Phillies": "#E81A2D",
  "Arizona Diamondbacks": "#A71930",
  "Atlanta Braves": "#CE1141",
  "Boston Red Sox": "#BD1B2E",
  "Houston Astros": "#EB6E1F",
  "San Francisco Giants": "#FD5A1E",
  "Tampa Bay Rays": "#787EC6",
  "Toronto Blue Jays": "#134A8A",
  "Washington Nationals": "#AB0003",
  "Cleveland Guardians": "#0C234B",
  "Detroit Tigers": "#FA4616",
  "Minnesota Twins": "#002B5C",
  "Oakland Athletics": "#003831",
  "Seattle Mariners": "#005C5C",
  "Texas Rangers": "#C0111F",
  "Colorado Rockies": "#33006F",
  "Miami Marlins": "#00A3E0",
  "Milwaukee Brewers": "#0A2351",
  "Pittsburgh Pirates": "#FDB827",
  "St. Louis Cardinals": "#BD1E22",
  "Kansas City Royals": "#9E1A32",
  "San Diego Padres": "#2F2478",
  "Baltimore Orioles": "#DF4695",
  "Los Angeles Angels": "#BA0046"
};

const teamSecondaryColors = {
  "New York Yankees": "#C4CED4",
  "Chicago Cubs": "#CC3433",
  "Los Angeles Dodgers": "#EF3E42",
  "Philadelphia Phillies": "#002D72",
  "Arizona Diamondbacks": "#E3D4AD",
  "Atlanta Braves": "#13274F",
  "Boston Red Sox": "#0C2340",
  "Houston Astros": "#002D62",
  "San Francisco Giants": "#27251F",
  "Tampa Bay Rays": "#00285E",
  "Toronto Blue Jays": "#1D2D5C",
  "Washington Nationals": "#14225A",
  "Cleveland Guardians": "#E31937",
  "Detroit Tigers": "#0C2340",
  "Minnesota Twins": "#D31145",
  "Oakland Athletics": "#FFD800",
  "Seattle Mariners": "#0C2C56",
  "Texas Rangers": "#003278",
  "Colorado Rockies": "#C4CED4",
  "Miami Marlins": "#EF3340",
  "Milwaukee Brewers": "#FFC52F",
  "Pittsburgh Pirates": "#27251F",
  "St. Louis Cardinals": "#0C2340",
  "Kansas City Royals": "#004687",
  "San Diego Padres": "#FFC425",
  "Baltimore Orioles": "#000000",
  "Los Angeles Angels": "#C4CED4"
};

function getTextColor(bgColor) {
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? "black" : "white";
}

export default function StartingPitchers() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/pitchers");
        if (!res.ok) throw new Error("Failed to load pitchers");
        const data = await res.json();

        // Group pitchers by gamePk (two per game)
        const grouped = {};
        for (const pitcher of data) {
          if (!grouped[pitcher.gamePk]) grouped[pitcher.gamePk] = [];
          grouped[pitcher.gamePk].push(pitcher);
        }

        setGames(Object.values(grouped));
      } catch (err) {
        setError("Could not load pitchers");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ fontFamily: '"Roboto", sans-serif', padding: "20px", textAlign: "center" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>🎯 Starting Pitchers Today</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
        {games.map((matchup, index) => (
          <div
            key={index}
            style={{
              width: "100%",
              maxWidth: "500px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              overflow: "hidden",
              background: "#f9f9f9"
            }}
          >
            {matchup.map((pitcher, idx) => {
              const teamName = pitcher.team;
              const color1 = teamColors[teamName] || "#666";
              const color2 = teamSecondaryColors[teamName] || "#999";
              const gradient = `linear-gradient(to right, ${color1}, ${color2})`;
              const textColor = getTextColor(color1);

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "15px",
                    background: gradient,
                    color: textColor
                  }}
                >
                  <img
                    src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${pitcher.playerId}/headshot/67/current.png`}
                    alt={pitcher.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/50?text=No+Image";
                    }}
                    style={{ width: "70px", height: "100px", borderRadius: "50%", marginRight: "15px" }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ fontSize: "1.2rem" }}>{pitcher.name}</strong>
                    <p style={{ margin: 0 }}>ERA: {pitcher.ERA}</p>
                    <p style={{ margin: 0 }}>HR/9: {pitcher.HR9}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
