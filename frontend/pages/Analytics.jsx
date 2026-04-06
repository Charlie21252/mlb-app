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
  "Athletics": "#003831", "Chicago White Sox": "#27251F",
  "Cincinnati Reds": "#C6011F",
};

const TABS = [
  { label: "Player Analytics", key: "player" },
  { label: "Betting Lines", key: "betting" },
];

const confidenceStyle = {
  High: { bg: "rgba(39,174,96,0.15)",  border: "rgba(39,174,96,0.35)",  color: "#27ae60" },
  Med:  { bg: "rgba(241,196,15,0.15)", border: "rgba(241,196,15,0.35)", color: "#d4ac0d" },
  Low:  { bg: "rgba(192,57,43,0.15)",  border: "rgba(192,57,43,0.35)",  color: "#c0392b" },
};

const trendIcon  = { up: "↑", down: "↓", neutral: "→" };
const trendColor = { up: "#27ae60", down: "#c0392b", neutral: "var(--text-muted)" };

function getApiBase() {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return isDev ? "http://localhost:8080" : "https://mlb-app-k5mr.onrender.com";
}

function deriveOddsFromAbPerHr(abPerHr) {
  const abph = parseFloat(abPerHr);
  if (!abph || abph <= 0) return null;
  const p = 1 - Math.pow(1 - 1 / abph, 3.5);
  if (p <= 0 || p >= 1) return null;
  const adj = p * 0.82;
  return adj >= 0.5
    ? `-${Math.round((adj / (1 - adj)) * 100)}`
    : `+${Math.round(((1 - adj) / adj) * 100)}`;
}


function MiniStatBar({ value, color, label, display }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--font-data)", fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", color: "var(--text)" }}>
          {display}
        </span>
      </div>
      <div style={{ height: 4, background: "var(--elevated)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}


export default function Analytics() {
  const [activeTab, setActiveTab] = useState(0); // 0=player, 1=betting

  // Player Analytics state
  const [players, setPlayers]       = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError]   = useState("");

  // Betting Lines state
  const [odds, setOdds]           = useState([]);
  const [oddsLoading, setOddsLoading] = useState(false);
  const [oddsError, setOddsError]   = useState("");

  useEffect(() => {
    if (activeTab === 0 && players.length === 0 && !playersLoading) {
      setPlayersLoading(true);
      fetch(`${getApiBase()}/leaderboard`)
        .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
        .then(data => setPlayers(data))
        .catch(e => setPlayersError(e.message))
        .finally(() => setPlayersLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 1 && odds.length === 0 && !oddsLoading) {
      setOddsLoading(true);
      fetch(`${getApiBase()}/analytics/odds`)
        .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
        .then(data => setOdds(data))
        .catch(e => setOddsError(e.message))
        .finally(() => setOddsLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="page-wide">
      <div className="page-header">
        <p className="page-eyebrow">Statcast &amp; Odds</p>
        <h1 className="page-title">
          Analytics <span className="accent">&amp; Odds</span>
        </h1>
      </div>

      {/* Tab bar */}
      <div className="analytics-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(i)}
            style={{
              fontFamily: "var(--font-data)", fontWeight: 700, fontSize: "0.8rem",
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "8px 20px", borderRadius: 7, border: "none", cursor: "pointer",
              transition: "all var(--transition)",
              background: activeTab === i ? "var(--gold)" : "transparent",
              color: activeTab === i ? "#0d1117" : "var(--text-secondary)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Player Analytics ── */}
      {activeTab === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 8, fontFamily: "var(--font-data)", fontStyle: "italic" }}>
            Season Statcast metrics for the top HR hitters — exit velocity, launch angle, barrel &amp; hard hit rates.
          </p>

          {playersLoading && <p className="loading-text">Loading player data…</p>}
          {playersError && (
            <div className="state-box error">
              <p className="state-title">Could not load players</p>
              <p className="state-desc">{playersError}</p>
            </div>
          )}

          {!playersLoading && !playersError && players.length === 0 && (
            <div className="state-box">
              <p className="state-title">No player data yet today</p>
              <p className="state-desc">Try "Update Now" on the home page to refresh data.</p>
            </div>
          )}

          {players.map((player) => {
            const color = teamColors[player.team] || "#484f58";
            const hasStatcast = player.exitVeloAvg != null;
            const oddsLine = deriveOddsFromAbPerHr(player.abPerHr);
            return (
              <div key={player.playerId} className="card">
                {/* Header */}
                <div style={{ background: `linear-gradient(90deg, ${color}55, ${color}22)`, borderBottom: "1px solid var(--border-subtle)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: `2px solid ${color}88`, flexShrink: 0, background: "var(--elevated)" }}>
                    <img src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${player.playerId}/headshot/67/current.png`} alt={player.name} onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--text)" }}>{player.name}</div>
                    <div style={{ fontFamily: "var(--font-data)", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>{player.team}</div>
                  </div>
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                    {[
                      { val: player.HR,  label: "HR" },
                      { val: player.RBI, label: "RBI" },
                      { val: player.AVG, label: "AVG" },
                      { val: player.OPS, label: "OPS" },
                    ].map(({ val, label }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: label === "HR" ? "2rem" : "1.2rem", color: label === "HR" ? "var(--gold)" : "var(--text)", lineHeight: 1 }}>{val ?? "—"}</div>
                        <div style={{ fontFamily: "var(--font-data)", fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statcast bars */}
                <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
                  {hasStatcast ? (
                    <>
                      <MiniStatBar label="Exit Velo Avg" display={`${player.exitVeloAvg?.toFixed(1)} mph`} value={((player.exitVeloAvg - 85) / 20) * 100} color="#27ae60" />
                      <MiniStatBar label="Launch Angle" display={`${player.launchAngle?.toFixed(1)}°`} value={(player.launchAngle / 30) * 100} color="#5b8cda" />
                      <MiniStatBar label="Barrel %" display={`${player.barrelPct?.toFixed(1)}%`} value={Math.min(player.barrelPct * 4, 100)} color="#c0392b" />
                      <MiniStatBar label="Hard Hit %" display={`${player.hardHitPct?.toFixed(1)}%`} value={player.hardHitPct} color="#e67e22" />
                    </>
                  ) : (
                    <>
                      <MiniStatBar label="AB per HR" display={player.abPerHr ?? "—"} value={player.abPerHr ? Math.max(0, 100 - (player.abPerHr / 30) * 100) : 0} color="#27ae60" />
                      <MiniStatBar label="OPS" display={player.OPS ?? "—"} value={player.OPS ? (parseFloat(player.OPS) / 1.2) * 100 : 0} color="#5b8cda" />
                      <MiniStatBar label="RBI" display={player.RBI ?? "—"} value={player.RBI ? Math.min((player.RBI / 60) * 100, 100) : 0} color="#e67e22" />
                      <MiniStatBar label="SB" display={player.SB ?? "—"} value={player.SB ? Math.min((player.SB / 20) * 100, 100) : 0} color="#9b59b6" />
                    </>
                  )}
                </div>

                {/* Odds chip */}
                {oddsLine && (
                  <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                      Est. HR Odds Today
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--gold)" }}>
                      {oddsLine}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Betting Lines ── */}
      {activeTab === 1 && (
        <div>
          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 20, fontFamily: "var(--font-data)", fontStyle: "italic" }}>
            Home run prop lines derived from each player's season AB/HR rate.
          </p>

          {oddsLoading && <p className="loading-text">Loading betting lines…</p>}
          {oddsError && (
            <div className="state-box error">
              <p className="state-title">Could not load odds</p>
              <p className="state-desc">{oddsError}</p>
            </div>
          )}

          {!oddsLoading && !oddsError && odds.length === 0 && (
            <div className="state-box">
              <p className="state-title">No odds data yet today</p>
              <p className="state-desc">Try "Update Now" on the home page to refresh leaderboard data.</p>
            </div>
          )}

          {!oddsLoading && !oddsError && odds.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {odds.map((row, i) => {
                const conf = confidenceStyle[row.confidence] || confidenceStyle.Low;
                const color = teamColors[row.team] || "#484f58";
                return (
                  <div key={i} className="card">
                    <div className="betting-row" style={{ width: "100%" }}>
                      {/* Player photo + name */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid ${color}66`, background: "var(--elevated)" }}>
                          <img src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${row.playerId}/headshot/67/current.png`} alt={row.playerName} onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {row.playerName} HR
                          </div>
                          <div style={{ fontFamily: "var(--font-data)", fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {row.game}
                          </div>
                        </div>
                      </div>

                      {/* Trend */}
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: trendColor[row.trend], minWidth: 20, textAlign: "center" }}>
                        {trendIcon[row.trend]}
                      </span>

                      {/* Line */}
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--gold)", minWidth: 60, textAlign: "right", letterSpacing: "0.02em" }}>
                        {row.line}
                      </span>

                      {/* Confidence */}
                      <span style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color, padding: "3px 12px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
                        {row.confidence}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="data-note" style={{ marginTop: 24 }}>
            Odds derived from season AB/HR rate · Not financial advice
          </p>
        </div>
      )}
    </div>
  );
}
