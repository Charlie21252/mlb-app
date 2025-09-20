import { useState, useEffect } from "react";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const [homeruns, setHomeruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  // Always use today's date
  const selectedDate = getLocalDate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setDebugInfo("");

      try {
        // Better API URL detection
        const isDevelopment = 
          window.location.hostname === "localhost" || 
          window.location.hostname === "127.0.0.1" ||
          process.env.NODE_ENV === "development";

        const API_BASE_URL = isDevelopment 
          ? "http://localhost:8080" 
          : "https://mlb-app-k5mr.onrender.com";

        setDebugInfo(`Using API: ${API_BASE_URL}`);
        console.log(`🔗 Calling API: ${API_BASE_URL}/daily_homeruns?date=${selectedDate}`);

        const response = await fetch(
          `${API_BASE_URL}/daily_homeruns?date=${selectedDate}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(`📊 Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API Error: ${response.status} - ${errorText}`);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log(`📈 Received data:`, data);
        
        setHomeruns(data);
        setDebugInfo(`Found ${data.length} home runs for today`);
        
      } catch (err) {
        const errorMsg = `Failed to load data: ${err.message}`;
        setError(errorMsg);
        setDebugInfo(`Error: ${err.message}`);
        console.error('🚨 Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Removed selectedDate dependency since it's always today

  // Manual refresh button
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
      console.log('🔄 Triggering manual update...');
      const updateResponse = await fetch(`${API_BASE_URL}/update-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (updateResponse.ok) {
        console.log('✅ Manual update successful');
        // Wait a bit then refetch data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('❌ Manual update failed:', updateResponse.status);
        setError('Failed to update data from server');
      }
    } catch (err) {
      console.error('🚨 Manual update error:', err);
      setError('Failed to connect to server for update');
    }
  };

  return (
    <div className="App" style={{ fontFamily: "sans-serif", paddingBottom: "50px" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>
        ⚾ MLB Home Runs for Today
      </h1>

      {/* Debug Info (only show in development)
      {debugInfo && window.location.hostname === "localhost" && (
        <p style={{ 
          textAlign: "center", 
          fontSize: "0.9rem", 
          color: "#666", 
          backgroundColor: "#f0f0f0",
          padding: "8px",
          borderRadius: "4px",
          margin: "10px auto",
          maxWidth: "600px"
        }}>
          🔍 Debug: {debugInfo}
        </p>
      )} */}

      {/* Update Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Update Button */}
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          style={{
            padding: "12px 20px",
            backgroundColor: loading ? "#ccc" : "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Updating..." : "Update Now"}
        </button>
        
        {/* Auto-update message */}
        <p style={{ 
          fontSize: "0.85rem", 
          color: "#666", 
          textAlign: "center",
          margin: "0",
          fontStyle: "italic"
        }}>
          Data automatically updates every 30 minutes
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#666" }}>
          Loading today's home runs...
        </p>
      )}

      {/* Error */}
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
            Try the "Update Now" button or check back later
          </small>
        </div>
      )}

      {/* No Data */}
      {!loading && !error && homeruns.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          padding: "30px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          margin: "20px auto",
          maxWidth: "600px"
        }}>
          <p style={{ fontStyle: "italic", color: "#777", fontSize: "1.1rem", margin: "0 0 10px 0" }}>
            No home runs recorded for today yet...
          </p>
          <small style={{ color: "#999" }}>
            Games may not have started or no home runs have been hit yet today
          </small>
        </div>
      )}

      {/* Results */}
      {!loading && !error && homeruns.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "0 20px",
          }}
        >
          <p style={{ textAlign: "center", color: "#555", fontSize: "1.1rem" }}>
            <strong>{homeruns.length}</strong> player{homeruns.length !== 1 ? 's' : ''} hit a home run today
          </p>

          {homeruns.map((player, index) => (
            <div
              key={player.playerId || index}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              {/* Player Image */}
              <div
                style={{
                  width: "100px",
                  height: "130px",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: "2px solid #ddd",
                  backgroundColor: "#f9f9f9",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "#aaa",
                  fontWeight: "bold",
                  position: "relative",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${player.playerId}/headshot/67/current.png`}
                  alt={player.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "none",
                  }}
                  onLoad={(e) => {
                    e.target.style.display = "block";
                    e.target.nextSibling?.remove();
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    let placeholder = e.target.nextSibling;
                    if (!placeholder || placeholder.tagName !== "DIV") {
                      placeholder = document.createElement("div");
                      placeholder.innerText = "No Image";
                      Object.assign(placeholder.style, {
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#999",
                        textAlign: "center",
                        fontFamily: "sans-serif",
                      });
                      e.target.parentNode.appendChild(placeholder);
                    }
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#bbb",
                    textAlign: "center",
                    fontFamily: "sans-serif",
                  }}
                >
                  Loading...
                </div>
              </div>

              {/* Player Info */}
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 8px 0", fontSize: "1.4rem", color: "#333" }}>
                  {player.name || "Unknown Player"}
                </h2>
                <p style={{ margin: "4px 0", color: "#666", fontStyle: "italic" }}>
                  {player.description || "Hit a home run"}
                </p>
                <p style={{ margin: "4px 0", color: "#333" }}>
                  <strong>Exit Velocity:</strong>{" "}
                  {player.launchSpeed ? `${player.launchSpeed} mph` : "N/A"}
                </p>
                <p style={{ margin: "4px 0", color: "#555" }}>
                  <strong>Distance:</strong>{" "}
                  {player.totalDistance ? `${player.totalDistance} ft` : "N/A"}
                </p>
              </div>
            </div>
          ))}

          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#aaa",
              marginTop: "30px",
            }}
          >
            Data sourced from MLB API • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}