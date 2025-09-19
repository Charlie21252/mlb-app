import { useState, useEffect } from "react";

// Primary team colors
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

// Secondary team colors
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

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("https://mlb-app-k5mr.onrender.com/leaderboard");
        if (!response.ok) throw new Error("No data found");
        const data = await response.json();
        setLeaders(data);
      } catch (err) {
        setError("Could not load stat leaders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ fontFamily: '"Roboto", sans-serif', padding: "20px", textAlign: "center" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
        🏆 Top 10 Home Run Hitters – 2025 Season
      </h2>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && leaders.length === 0 && <p>No stat leaders found</p>}

      {!loading && !error && leaders.length > 0 && (
        <div style={{ overflowX: "auto", borderRadius: "10px" }}>
          <table
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              borderCollapse: "collapse",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#444", color: "white" }}>
                <th style={tableHeaderStyle}>#</th>
                <th style={tableHeaderStyle}>Player</th>
                <th style={tableHeaderStyle}>Team</th>
                <th style={tableHeaderStyle}>HR</th>
                <th style={tableHeaderStyle}>RBI</th>
                <th style={tableHeaderStyle}>AVG</th>
                <th style={tableHeaderStyle}>OPS</th>
                <th style={tableHeaderStyle}>SB</th>
                <th style={tableHeaderStyle}>Abs Per HR</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((player, index) => {
                const mainColor = teamColors[player.team] || "#f2f2f2";
                const secondaryColor = teamSecondaryColors[player.team] || "#ffffff";
                const textColor = getTextColor(mainColor);
                const gradient = `linear-gradient(to right, ${mainColor}, ${secondaryColor})`;

                return (
                  <tr key={index} style={{ background: gradient, color: textColor }}>
                    <td style={tableCellStyle}>{player.rank || index + 1}</td>
                    <td style={{ ...tableCellStyle, display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${player.playerId}/headshot/67/current.png`}
                        alt={player.name}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50?text=No+Image ";
                        }}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "30%",
                          objectFit: "cover",
                          border: "1.5px solid white",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                        }}
                      />
                      {player.name}
                    </td>
                    <td style={tableCellStyle}>{player.team}</td>
                    <td
                      style={{
                        ...tableCellStyle,
                        fontWeight: "bold",
                        fontSize: "1.4rem"
                      }}
                    >
                      {player.HR || 0}
                    </td>
                    <td style={tableCellStyle}>{player.RBI || 0}</td>
                    <td style={tableCellStyle}>
                      {parseFloat(player.AVG)?.toFixed(3).substring(1) || ".000"}
                    </td>
                    <td style={tableCellStyle}>
                      {parseFloat(player.OPS)?.toFixed(3) || "0.000"}
                    </td>
                    <td style={tableCellStyle}>{player.SB || 0}</td>
                    <td style={tableCellStyle}>
                      {parseFloat(player.abPerHr)?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center"
};

const tableCellStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "center"
};