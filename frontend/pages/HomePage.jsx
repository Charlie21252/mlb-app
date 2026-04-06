import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import HRCollage from "../components/HRCollage.jsx";

const teamColors = {
  "New York Yankees": "#1C2F61", "Chicago Cubs": "#0E3386",
  "Los Angeles Dodgers": "#005A9C", "Philadelphia Phillies": "#E81A2D",
  "Arizona Diamondbacks": "#A71930", "Atlanta Braves": "#CE1141",
  "Boston Red Sox": "#BD1B2E", "Houston Astros": "#EB6E1F",
  "San Francisco Giants": "#FD5A1E", "Tampa Bay Rays": "#787EC6",
  "Toronto Blue Jays": "#134A8A", "Washington Nationals": "#AB0003",
  "Cleveland Guardians": "#0C234B", "Detroit Tigers": "#FA4616",
  "Minnesota Twins": "#002B5C", "Oakland Athletics": "#003831",
  "Seattle Mariners": "#005C5C", "Texas Rangers": "#C0111F",
  "Colorado Rockies": "#33006F", "Miami Marlins": "#00A3E0",
  "Milwaukee Brewers": "#0A2351", "Pittsburgh Pirates": "#FDB827",
  "St. Louis Cardinals": "#BD1E22", "Kansas City Royals": "#004687",
  "San Diego Padres": "#2F2478", "Baltimore Orioles": "#DF6108",
  "Los Angeles Angels": "#BA0046", "New York Mets": "#002D72",
};

function getDateWithOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatDateLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function getApiBase() {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return isDev ? "http://localhost:8080" : "https://mlb-app-k5mr.onrender.com";
}

function PlayerPhoto({ playerId, name }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div style={{
      width: 90, height: 118, flexShrink: 0, borderRadius: 8,
      overflow: "hidden", background: "var(--elevated)", position: "relative",
    }}>
      {!errored && (
        <img
          src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${playerId}/headshot/67/current.png`}
          alt={name}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: loaded ? "block" : "none" }}
        />
      )}
      {(!loaded || errored) && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", color: "var(--text-muted)", fontSize: "0.65rem",
          letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-data)",
        }}>
          {errored ? "N/A" : "..."}
        </div>
      )}
    </div>
  );
}

function StatBlock({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--gold)",
        lineHeight: 1, letterSpacing: "0.01em",
      }}>
        {value ?? "—"}
      </div>
      <div style={{
        fontFamily: "var(--font-data)", fontSize: "0.68rem", fontWeight: 600,
        letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)",
        marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [homeruns, setHomeruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCollage, setShowCollage] = useState(false);
  const [collageHomeruns, setCollageHomeruns] = useState([]);
  const [loadingHighlights, setLoadingHighlights] = useState(false);
  const [dayOffset, setDayOffset] = useState(0); // 0 = today, -1 = yesterday

  const selectedDate = getDateWithOffset(dayOffset);

  const fetchData = async (offset = dayOffset) => {
    setLoading(true);
    setError("");
    setShowCollage(false);
    try {
      const date = getDateWithOffset(offset);
      const res = await fetch(`${getApiBase()}/daily_homeruns?date=${date}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setHomeruns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(0); }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getApiBase()}/update-data`, { method: "POST" });
      if (res.ok) setTimeout(() => window.location.reload(), 2000);
      else throw new Error(`Server error ${res.status}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        {/* Day navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 6 }}>
          <button
            onClick={() => { setDayOffset(-1); fetchData(-1); }}
            disabled={dayOffset === -1 || loading}
            style={{
              background: "none", border: "none", cursor: dayOffset === -1 ? "default" : "pointer",
              color: dayOffset === -1 ? "var(--text-muted)" : "var(--text-secondary)",
              fontFamily: "var(--font-data)", fontSize: "0.72rem", letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "4px 8px", opacity: dayOffset === -1 ? 0.35 : 1,
              transition: "opacity 0.15s",
            }}
          >
            ‹ Yesterday
          </button>
          <span style={{
            fontFamily: "var(--font-data)", fontSize: "0.72rem", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--text-muted)",
          }}>
            {formatDateLabel(dayOffset)}
          </span>
          <button
            onClick={() => { setDayOffset(0); fetchData(0); }}
            disabled={dayOffset === 0 || loading}
            style={{
              background: "none", border: "none", cursor: dayOffset === 0 ? "default" : "pointer",
              color: dayOffset === 0 ? "var(--text-muted)" : "var(--text-secondary)",
              fontFamily: "var(--font-data)", fontSize: "0.72rem", letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "4px 8px", opacity: dayOffset === 0 ? 0.35 : 1,
              transition: "opacity 0.15s",
            }}
          >
            Today ›
          </button>
        </div>

        <h1 className="page-title">
          {dayOffset === 0 ? "Today's" : "Yesterday's"} <span className="accent">Bombs</span>
        </h1>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {!loading && !error && (
            <span className="stat-pill">
              {homeruns.length} HR{homeruns.length !== 1 ? "s" : ""}
            </span>
          )}
          {!loading && !error && homeruns.length > 0 && (
            <button
              className="btn btn-gold"
              disabled={loadingHighlights}
              onClick={async () => {
                setLoadingHighlights(true);
                try {
                  const res = await fetch(`${getApiBase()}/highlights?date=${selectedDate}`);
                  const videoMap = res.ok ? await res.json() : {};
                  setCollageHomeruns(homeruns.map(hr => ({
                    ...hr,
                    videoUrl: videoMap[String(hr.playerId)] || hr.videoUrl || null,
                  })));
                } catch {
                  setCollageHomeruns(homeruns);
                } finally {
                  setLoadingHighlights(false);
                  setShowCollage(true);
                }
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <polygon points="5,2 14,8 5,14" fill="currentColor"/>
              </svg>
              {loadingHighlights ? "Loading…" : "Watch Highlights"}
            </button>
          )}
          {dayOffset === 0 && (
            <button
              className="btn btn-red"
              onClick={handleUpdate}
              disabled={loading}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13.65 2.35A8 8 0 1 0 15 8h-2a6 6 0 1 1-1.05-3.37L10 6h5V1l-1.35 1.35z" fill="currentColor"/>
              </svg>
              {loading ? "Updating…" : "Update Now"}
            </button>
          )}
        </div>

        {dayOffset === 0 && (
          <p style={{
            fontFamily: "var(--font-data)", fontSize: "0.72rem", color: "var(--text-muted)",
            letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 10, marginBottom: 0,
          }}>
            Auto-refreshes every 30 min
          </p>
        )}
      </div>

      {loading && <p className="loading-text">Loading home runs…</p>}

      {error && (
        <div className="state-box error">
          <p className="state-title">Could not load data</p>
          <p className="state-desc">{error}<br />Backend may be offline. Try "Update Now" or check back soon.</p>
        </div>
      )}

      {!loading && !error && homeruns.length === 0 && (
        <div className="state-box">
          <p className="state-title">{dayOffset === 0 ? "No home runs yet today" : "No home runs found"}</p>
          <p className="state-desc">{dayOffset === 0 ? "Games may not have started, or no home runs have been hit yet. Check back soon." : "No home run data was recorded for this date."}</p>
        </div>
      )}

      {!loading && !error && homeruns.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {homeruns.map((player, index) => {
            const accentColor = teamColors[player.team] || "var(--gold)";
            return (
              <div
                key={player.playerId || index}
                className="card"
                style={{ borderLeft: `3px solid ${accentColor}` }}
              >
                <div className="hr-card-inner">
                  {/* Rank */}
                  <div className="hr-card-rank">
                    <span style={{
                      fontFamily: "var(--font-display)", fontSize: "1rem",
                      color: "var(--text-muted)", letterSpacing: "0.02em",
                    }}>
                      {index + 1}
                    </span>
                  </div>

                  {/* Photo + Info */}
                  <div className="hr-card-body">
                    <div style={{ padding: "16px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                      <PlayerPhoto playerId={player.playerId} name={player.name} />
                    </div>

                    <div className="hr-card-info">
                      <div>
                        <h2 style={{
                          fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--text)",
                          margin: 0, letterSpacing: "0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {player.name || "Unknown Player"}
                        </h2>
                        {player.team && (
                          <p style={{
                            fontFamily: "var(--font-data)", fontSize: "0.75rem", fontWeight: 600,
                            letterSpacing: "0.08em", color: "var(--text-secondary)", margin: "2px 0 0 0",
                            textTransform: "uppercase",
                          }}>
                            {player.team}
                          </p>
                        )}
                      </div>

                      {player.description && (
                        <p style={{
                          fontFamily: "var(--font-data)", fontSize: "0.82rem", color: "var(--text-secondary)",
                          margin: 0, lineHeight: 1.5, fontStyle: "italic",
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {player.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hr-card-stats">
                    <StatBlock
                      value={player.launchSpeed ? `${player.launchSpeed}` : null}
                      label="mph exit velo"
                    />
                    <StatBlock
                      value={player.totalDistance ? `${player.totalDistance}` : null}
                      label="ft distance"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && (
        <p className="data-note">
          MLB StatsAPI · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      <AnimatePresence>
        {showCollage && (
          <HRCollage homeruns={collageHomeruns} onClose={() => setShowCollage(false)} dayOffset={dayOffset} />
        )}
      </AnimatePresence>
    </div>
  );
}
