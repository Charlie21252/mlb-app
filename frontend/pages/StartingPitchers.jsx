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
  "Los Angeles Angels": "#BA0046",
  "New York Mets": "#002D72"
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
  "Los Angeles Angels": "#C4CED4",
  "New York Mets": "#FF5910"
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
  const [debugInfo, setDebugInfo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setDebugInfo("");

    try {
      // Better API URL detection (same as other components)
      const isDevelopment = 
        window.location.hostname === "localhost" || 
        window.location.hostname === "127.0.0.1" ||
        process.env.NODE_ENV === "development";

      const API_BASE_URL = isDevelopment 
        ? "http://localhost:8080" 
        : "https://mlb-app-k5mr.onrender.com";

      setDebugInfo(`Using API: ${API_BASE_URL}`);
      console.log(`⚾ Calling pitchers API: ${API_BASE_URL}/pitchers`);

      const response = await fetch(`${API_BASE_URL}/pitchers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📊 Pitchers response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Pitchers API Error: ${response.status} - ${errorText}`);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`📈 Received pitcher data:`, data);

      // Group pitchers by gamePk (two per game)
      const grouped = {};
      for (const pitcher of data) {
        if (!grouped[pitcher.gamePk]) grouped[pitcher.gamePk] = [];
        grouped[pitcher.gamePk].push(pitcher);
      }

      const gamesList = Object.values(grouped);
      setGames(gamesList);
      setDebugInfo(`Found ${gamesList.length} games with ${data.length} starting pitchers`);

    } catch (err) {
      const errorMsg = `Failed to load pitchers: ${err.message}`;
      setError(errorMsg);
      setDebugInfo(`Error: ${err.message}`);
      console.error('🚨 Pitchers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setLoading(true);
    setError("");
    
    try {
      const isDevelopment = 
        window.location.hostname === "localhost" || 
        window.location.hostname === "127.0.0.1";

      const API_BASE_URL = isDevelopment 
        ? "http://localhost:8080" 
        : "https://mlb-app-k5mr.onrender.com";

      // Trigger manual update
      console.log('🔄 Triggering pitcher update...');
      const updateResponse = await fetch(`${API_BASE_URL}/update-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (updateResponse.ok) {
        console.log('✅ Manual update successful');
        // Wait a bit then refetch data
        setTimeout(() => {
          fetchData();
        }, 2000);
      } else {
        console.error('❌ Manual update failed:', updateResponse.status);
      }
    } catch (err) {
      console.error('🚨 Manual update error:', err);
    }
  };

  return (
    <div style={{ fontFamily: '"Roboto", sans-serif', padding: "20px", textAlign: "center" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>
        Today's Starting Pitchers
      </h2>

      {/* Debug Info (only show in development) */}
      {debugInfo && window.location.hostname === "localhost" && (
        <p style={{ 
          fontSize: "0.9rem", 
          color: "#666", 
          backgroundColor: "#f0f0f0",
          padding: "8px",
          borderRadius: "4px",
          margin: "10px auto 20px auto",
          maxWidth: "600px"
        }}>
          🔍 Debug: {debugInfo}
        </p>
      )}

      {/* Control Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            padding: "10px 16px",
            backgroundColor: loading ? "#ccc" : "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            marginRight: "10px",
            opacity: loading ? 0.6 : 1
          }}
        >
          🔄 Refresh Data
        </button>

        <button
          onClick={handleManualRefresh}
          disabled={loading}
          style={{
            padding: "10px 16px",
            backgroundColor: loading ? "#ccc" : "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            opacity: loading ? 0.6 : 1
          }}
        >
          🔄 Force Update
        </button>
      </div>

      {/* Auto-update message */}
      <p style={{ 
        fontSize: "0.85rem", 
        color: "#666", 
        textAlign: "center",
        margin: "0 0 20px 0",
        fontStyle: "italic"
      }}>
        Data automatically updates every 5 minutes
      </p>

      {loading && (
        <p style={{ fontSize: "1.2rem", color: "#666" }}>
          Loading starting pitchers...
        </p>
      )}
      
      {error && (
        <div style={{ 
          color: "red", 
          textAlign: "center", 
          fontSize: "1.1rem",
          backgroundColor: "#ffe6e6",
          padding: "15px",
          borderRadius: "8px",
          margin: "20px auto",
          maxWidth: "600px",
          border: "1px solid #ffcccc"
        }}>
          <strong>Error:</strong> {error}
          <br />
          <small style={{ color: "#666" }}>
            Check the browser console (F12) for more details
          </small>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          padding: "30px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          margin: "20px auto",
          maxWidth: "600px"
        }}>
          <p style={{ fontStyle: "italic", color: "#777", fontSize: "1.1rem", margin: "0 0 10px 0" }}>
            No starting pitcher data available for today
          </p>
          <small style={{ color: "#999" }}>
            Games may not have started or pitcher data may not be available yet
          </small>
        </div>
      )}

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
            <div style={{ 
              backgroundColor: "#333", 
              color: "white", 
              padding: "10px", 
              fontSize: "0.9rem",
              fontWeight: "bold"
            }}>
              Game Matchup
            </div>
            
            {matchup.map((pitcher, idx) => {
              const teamName = pitcher.team;
              const color1 = teamColors[teamName] || "#666";
              const color2 = teamSecondaryColors[teamName] || "#999";
              const gradient = `linear-gradient(to right, ${color1}, ${color2})`;
              const textColor = getTextColor(color1);

              return (
                <div
                  key={pitcher.playerId || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "15px",
                    background: gradient,
                    color: textColor,
                    borderBottom: idx === 0 ? "2px solid rgba(255,255,255,0.2)" : "none"
                  }}
                >
                  <img
                    src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${pitcher.playerId}/headshot/67/current.png`}
                    alt={pitcher.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/70x100/666/fff?text=No+Image";
                    }}
                    style={{ 
                      width: "70px", 
                      height: "100px", 
                      borderRadius: "8px", 
                      marginRight: "15px",
                      objectFit: "cover",
                      border: "2px solid rgba(255,255,255,0.3)"
                    }}
                  />
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "8px" }}>
                      {pitcher.name}
                    </div>
                    <div style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                      <strong>{teamName}</strong>
                    </div>
                    <div style={{ display: "flex", gap: "15px", fontSize: "0.85rem" }}>
                      <span><strong>ERA:</strong> {pitcher.ERA}</span>
                      <span><strong>HR/9:</strong> {pitcher.HR9}</span>
                    </div>
                    {(pitcher.wins !== undefined || pitcher.losses !== undefined) && (
                      <div style={{ display: "flex", gap: "15px", fontSize: "0.85rem", marginTop: "4px" }}>
                        <span><strong>W-L:</strong> {pitcher.wins || 0}-{pitcher.losses || 0}</span>
                        {pitcher.strikeouts && <span><strong>K:</strong> {pitcher.strikeouts}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {!loading && !error && games.length > 0 && (
        <p style={{
          textAlign: "center",
          fontSize: "0.9rem",
          color: "#aaa",
          marginTop: "30px",
        }}>
          Data sourced from MLB API • Last updated: {new Date().toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}