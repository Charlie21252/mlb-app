import { useState, useEffect } from "react";

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

function getApiBase() {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return isDev ? "http://localhost:8080" : "https://mlb-app-k5mr.onrender.com";
}

const STAT_COLS = [
  { key: "HR",      label: "HR",    title: "Home Runs" },
  { key: "RBI",     label: "RBI",   title: "Runs Batted In" },
  { key: "AVG",     label: "AVG",   title: "Batting Average", fmt: v => parseFloat(v)?.toFixed(3).replace(/^0/, "") || ".000" },
  { key: "OPS",     label: "OPS",   title: "On-base + Slugging", fmt: v => parseFloat(v)?.toFixed(3) || "0.000" },
  { key: "SB",      label: "SB",    title: "Stolen Bases" },
  { key: "abPerHr", label: "AB/HR", title: "At-bats Per Home Run", fmt: v => parseFloat(v)?.toFixed(1) || "—" },
];

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getApiBase()}/leaderboard`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setLeaders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="page-wide">
      <div className="page-header">
        <p className="page-eyebrow">2026 Season</p>
        <h1 className="page-title">
          Power <span className="accent">Rankings</span>
        </h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={fetchData} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.65 2.35A8 8 0 1 0 15 8h-2a6 6 0 1 1-1.05-3.37L10 6h5V1l-1.35 1.35z" fill="currentColor"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading && <p className="loading-text">Loading leaderboard…</p>}

      {error && (
        <div className="state-box error">
          <p className="state-title">Could not load leaderboard</p>
          <p className="state-desc">{error}</p>
        </div>
      )}

      {!loading && !error && leaders.length === 0 && (
        <div className="state-box">
          <p className="state-title">No data available</p>
          <p className="state-desc">Leaderboard data hasn't been populated yet for today.</p>
        </div>
      )}

      {!loading && !error && leaders.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontFamily: "var(--font-data)", fontSize: "0.9rem",
          }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={{ ...thStyle, textAlign: "left", paddingLeft: 16 }}>Player</th>
                <th style={thStyle}>Team</th>
                {STAT_COLS.map(col => (
                  <th key={col.key} title={col.title} style={thStyle}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaders.map((player, index) => {
                const teamColor = teamColors[player.team] || "#484f58";
                const isTop3 = index < 3;
                const rankColors = ["#e8b84b", "#c0c0c0", "#cd7f32"];

                return (
                  <tr
                    key={player.playerId || index}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background var(--transition)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--elevated)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Rank */}
                    <td style={{ ...tdStyle, width: 52, textAlign: "center" }}>
                      <span style={{
                        fontFamily: "var(--font-display)",
                        fontSize: isTop3 ? "1.1rem" : "0.9rem",
                        color: isTop3 ? rankColors[index] : "var(--text-muted)",
                      }}>
                        {player.rank || index + 1}
                      </span>
                    </td>

                    {/* Player name + photo */}
                    <td style={{ ...tdStyle, paddingLeft: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%", overflow: "hidden",
                          border: `2px solid ${teamColor}`, flexShrink: 0,
                          background: "var(--elevated)",
                        }}>
                          <img
                            src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${player.playerId}/headshot/67/current.png`}
                            alt={player.name}
                            onError={e => { e.target.style.display = "none"; }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <span style={{
                          fontFamily: "var(--font-display)", fontSize: "0.95rem",
                          color: "var(--text)", letterSpacing: "0.01em", whiteSpace: "nowrap",
                        }}>
                          {player.name}
                        </span>
                      </div>
                    </td>

                    {/* Team */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <span style={{
                        display: "inline-block",
                        background: `${teamColor}22`,
                        border: `1px solid ${teamColor}55`,
                        color: teamColor === "#FDB827" ? "#FDB827" : teamColor,
                        padding: "3px 10px",
                        borderRadius: 100,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        filter: "brightness(1.3)",
                      }}>
                        {player.team?.replace("St. Louis", "STL").replace("New York", "NY").replace("Los Angeles", "LA").replace("San Francisco", "SF").replace("Tampa Bay", "TB").replace("Kansas City", "KC").replace("San Diego", "SD").replace("Washington", "WSH").replace("Cleveland", "CLE") || "—"}
                      </span>
                    </td>

                    {/* Stats */}
                    {STAT_COLS.map(col => {
                      const raw = player[col.key];
                      const val = col.fmt ? col.fmt(raw) : (raw ?? "—");
                      return (
                        <td key={col.key} style={{ ...tdStyle, textAlign: "center" }}>
                          {col.key === "HR" ? (
                            <span style={{
                              fontFamily: "var(--font-display)", fontSize: "1.3rem",
                              color: "var(--gold)", letterSpacing: "0.01em",
                            }}>
                              {val}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                              {val}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <p className="data-note">
          MLB StatsAPI · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}

const thStyle = {
  padding: "12px 16px",
  textAlign: "center",
  fontFamily: "var(--font-data)",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  borderBottom: "1px solid var(--border)",
  background: "var(--surface)",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px 16px",
  verticalAlign: "middle",
};
