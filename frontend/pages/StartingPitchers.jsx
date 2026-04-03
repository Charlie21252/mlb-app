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

function StatChip({ label, value }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "var(--elevated)", borderRadius: 8, padding: "8px 14px", minWidth: 60,
    }}>
      <span style={{
        fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--gold)",
        lineHeight: 1, letterSpacing: "0.01em",
      }}>
        {value ?? "—"}
      </span>
      <span style={{
        fontFamily: "var(--font-data)", fontSize: "0.62rem", fontWeight: 700,
        letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: 4,
      }}>
        {label}
      </span>
    </div>
  );
}

function PitcherSide({ pitcher, align = "left" }) {
  const color = teamColors[pitcher.team] || "#484f58";
  const isRight = align === "right";

  return (
    <div
      className={isRight ? "pitcher-side-right" : undefined}
      style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: isRight ? "flex-end" : "flex-start",
        padding: "20px",
      }}
    >
      {/* Photo + name */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: 12, flexDirection: isRight ? "row-reverse" : "row",
        marginBottom: 16,
      }}>
        <div style={{
          width: 72, height: 96, borderRadius: 8, overflow: "hidden",
          border: `2px solid ${color}44`, flexShrink: 0,
          background: "var(--elevated)",
        }}>
          <img
            src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${pitcher.playerId}/headshot/67/current.png`}
            alt={pitcher.name}
            onError={e => { e.target.style.display = "none"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ textAlign: isRight ? "right" : "left" }}>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--text)",
            letterSpacing: "0.01em", marginBottom: 4,
          }}>
            {pitcher.name}
          </div>
          <div style={{
            display: "inline-block",
            background: `${color}22`,
            border: `1px solid ${color}55`,
            color: color,
            padding: "2px 10px",
            borderRadius: 100,
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            filter: "brightness(1.35)",
          }}>
            {pitcher.team}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", gap: 8,
        flexDirection: isRight ? "row-reverse" : "row",
        flexWrap: "wrap",
      }}>
        <StatChip label="ERA" value={pitcher.ERA} />
        <StatChip label="HR/9" value={pitcher.HR9} />
        {(pitcher.wins !== undefined || pitcher.losses !== undefined) && (
          <StatChip label="W-L" value={`${pitcher.wins ?? 0}-${pitcher.losses ?? 0}`} />
        )}
        {pitcher.whip && <StatChip label="WHIP" value={pitcher.whip} />}
      </div>
    </div>
  );
}

export default function StartingPitchers() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getApiBase()}/pitchers`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      const grouped = {};
      for (const pitcher of data) {
        if (!grouped[pitcher.gamePk]) grouped[pitcher.gamePk] = [];
        grouped[pitcher.gamePk].push(pitcher);
      }
      setGames(Object.values(grouped));
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
        <p className="page-eyebrow">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="page-title">
          On the <span className="accent">Mound</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {!loading && !error && (
            <span className="stat-pill">{games.length} game{games.length !== 1 ? "s" : ""} today</span>
          )}
          <button className="btn btn-ghost" onClick={fetchData} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.65 2.35A8 8 0 1 0 15 8h-2a6 6 0 1 1-1.05-3.37L10 6h5V1l-1.35 1.35z" fill="currentColor"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading && <p className="loading-text">Loading today's matchups…</p>}

      {error && (
        <div className="state-box error">
          <p className="state-title">Could not load pitchers</p>
          <p className="state-desc">{error}</p>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div className="state-box">
          <p className="state-title">No matchups yet</p>
          <p className="state-desc">Pitcher assignments haven't been released yet for today's games.</p>
        </div>
      )}

      {!loading && !error && games.length > 0 && (
        <div className="pitchers-grid">
          {games.map((matchup, index) => {
            const [away, home] = matchup.length >= 2 ? [matchup[0], matchup[1]] : [matchup[0], null];
            const awayColor = teamColors[away?.team] || "#484f58";
            const homeColor = home ? (teamColors[home.team] || "#484f58") : "#484f58";

            return (
              <div key={index} className="card">
                {/* Header bar */}
                <div style={{
                  background: `linear-gradient(90deg, ${awayColor}33 0%, var(--elevated) 48%, ${homeColor}33 100%)`,
                  borderBottom: "1px solid var(--border-subtle)",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}>
                  <span style={{
                    fontFamily: "var(--font-data)", fontSize: "0.68rem", fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)",
                  }}>
                    Game Matchup
                  </span>
                </div>

                {/* Pitchers */}
                <div className="pitcher-card-body">
                  {away && <PitcherSide pitcher={away} align="left" />}

                  {/* VS divider */}
                  <div className="pitcher-vs">
                    <span style={{
                      fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "var(--text-muted)",
                      letterSpacing: "0.1em",
                    }}>
                      VS
                    </span>
                  </div>

                  {home && <PitcherSide pitcher={home} align="right" />}
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
    </div>
  );
}
