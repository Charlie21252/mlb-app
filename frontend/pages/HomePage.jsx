import { useState, useEffect } from "react";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const [homeruns, setHomeruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [isToday, setIsToday] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");

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
        setDebugInfo(`Found ${data.length} home runs for ${selectedDate}`);
        
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
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setIsToday(newDate === getLocalDate());
  };

  const toggleToToday = () => {
    const today = getLocalDate();
    setSelectedDate(today);
    setIsToday(true);
  };

  const toggleToYesterday = () => {
    const yesterday = getYesterdayDate();
    setSelectedDate(yesterday);
    setIsToday(false);
  };

  // Manual refresh button for testing
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
      }
    } catch (err) {
      console.error('🚨 Manual update error:', err);
    }
  };

  return (
    <div className="App" style={{ fontFamily: "sans-serif", paddingBottom: "50px" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>
        ⚾ MLB Homeruns for{" "}
        {isToday
          ? "Today"
          : selectedDate === getYesterdayDate()
          ? "Yesterday"
          : selectedDate}
      </h1>

      {/* Date Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Date Picker */}
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          style={{
            padding: "8px",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        {/* Show Today Button */}
        <button
          onClick={toggleToToday}
          disabled={isToday}
          style={{
            padding: "10px 16px",
            backgroundColor: isToday ? "#ccc" : "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Show Today
        </button>

        {/* Show Yesterday Button */}
        <button
          onClick={toggleToYesterday}
          disabled={!isToday && selectedDate === getYesterdayDate()}
          style={{
            padding: "10px 16px",
            backgroundColor:
              !isToday && selectedDate === getYesterdayDate() ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Show Yesterday
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: "center", fontSize: "1.2rem" }}>Loading data...</p>
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
            Check the browser console (F12) for more details
          </small>
        </div>
      )}

      {/* No Data */}
      {!loading && !error && homeruns.length === 0 && (
        <p style={{ textAlign: "center", fontStyle: "italic", color: "#777" }}>
          No homeruns recorded for {selectedDate} yet...
          <br />
          <small style={{ color: "#999" }}>
            Try the "Force Update" button to refresh data from MLB API
          </small>
        </p>
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
          <p style={{ textAlign: "center", color: "#555" }}>
            <strong>{homeruns.length}</strong> player(s) hit a homerun on {selectedDate}
          </p>

          {homeruns.map((player, index) => (
            <div
              key={index}
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
                  height: "185px",
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
              <div>
                <h2 style={{ margin: "0", fontSize: "1.4rem", color: "#333" }}>
                  {player.name || "Unknown Player"}
                </h2>
                <p style={{ margin: "4px 0", color: "#666", fontStyle: "italic" }}>
                  {player.description || "Hit a home run"}
                </p>
                <p style={{ margin: "4px 0", color: "#333" }}>
                  Exit Velo:{" "}
                  {player.launchSpeed ? `${player.launchSpeed} mph` : "Launch speed N/A"}
                </p>
                <p style={{ margin: "4px 0", color: "#555" }}>
                  Total Distance:{" "}
                  {player.totalDistance ? `${player.totalDistance} ft` : "Distance N/A"}
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
            Data sourced from MLB API • Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}