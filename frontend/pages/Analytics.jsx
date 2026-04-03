import { useState } from "react";

const mockHRProbabilities = [
  {
    gamePk: 1,
    awayTeam: "New York Yankees", homeTeam: "Boston Red Sox",
    awayPitcher: { name: "Gerrit Cole", ERA: 3.12, HR9: 1.1, playerId: 543037 },
    homePitcher: { name: "Brayan Bello", ERA: 3.88, HR9: 0.9, playerId: 681911 },
    awayHRProb: 62, homeHRProb: 55,
  },
  {
    gamePk: 2,
    awayTeam: "Los Angeles Dodgers", homeTeam: "San Francisco Giants",
    awayPitcher: { name: "Tyler Glasnow", ERA: 3.45, HR9: 1.4, playerId: 607192 },
    homePitcher: { name: "Logan Webb", ERA: 3.25, HR9: 0.7, playerId: 657277 },
    awayHRProb: 70, homeHRProb: 42,
  },
  {
    gamePk: 3,
    awayTeam: "Atlanta Braves", homeTeam: "Philadelphia Phillies",
    awayPitcher: { name: "Spencer Strider", ERA: 2.95, HR9: 1.2, playerId: 675911 },
    homePitcher: { name: "Zack Wheeler", ERA: 3.07, HR9: 0.8, playerId: 554430 },
    awayHRProb: 66, homeHRProb: 58,
  },
  {
    gamePk: 4,
    awayTeam: "Houston Astros", homeTeam: "Texas Rangers",
    awayPitcher: { name: "Framber Valdez", ERA: 2.91, HR9: 0.6, playerId: 664285 },
    homePitcher: { name: "Nathan Eovaldi", ERA: 3.77, HR9: 1.3, playerId: 434564 },
    awayHRProb: 50, homeHRProb: 68,
  },
];

const mockPlayerAnalytics = [
  { name: "Aaron Judge",    team: "New York Yankees",      playerId: 592450, HR: 12, launchAngle: 18.4, hardHitPct: 58.2, barrelPct: 22.1, exitVeloAvg: 96.8, oddsToHRToday: "+140" },
  { name: "Shohei Ohtani",  team: "Los Angeles Dodgers",   playerId: 660271, HR: 11, launchAngle: 16.9, hardHitPct: 55.7, barrelPct: 19.8, exitVeloAvg: 95.4, oddsToHRToday: "+160" },
  { name: "Pete Alonso",    team: "New York Mets",         playerId: 624413, HR: 10, launchAngle: 17.2, hardHitPct: 52.1, barrelPct: 18.3, exitVeloAvg: 94.1, oddsToHRToday: "+175" },
  { name: "Matt Olson",     team: "Atlanta Braves",        playerId: 621566, HR: 9,  launchAngle: 15.8, hardHitPct: 51.4, barrelPct: 17.9, exitVeloAvg: 93.7, oddsToHRToday: "+190" },
  { name: "Kyle Schwarber", team: "Philadelphia Phillies", playerId: 656941, HR: 9,  launchAngle: 20.1, hardHitPct: 49.8, barrelPct: 16.5, exitVeloAvg: 92.9, oddsToHRToday: "+195" },
];

const mockBettingLines = [
  { game: "NYY @ BOS", market: "Aaron Judge HR",    line: "+140", confidence: "High", trend: "up" },
  { game: "LAD @ SF",  market: "Shohei Ohtani HR",  line: "+160", confidence: "High", trend: "up" },
  { game: "ATL @ PHI", market: "Matt Olson HR",     line: "+190", confidence: "Med",  trend: "neutral" },
  { game: "ATL @ PHI", market: "Bryce Harper HR",   line: "+210", confidence: "Med",  trend: "up" },
  { game: "HOU @ TEX", market: "Yordan Alvarez HR", line: "+175", confidence: "High", trend: "up" },
  { game: "HOU @ TEX", market: "Corey Seager HR",   line: "+220", confidence: "Low",  trend: "down" },
  { game: "LAD @ SF",  market: "Freddie Freeman HR", line: "+230", confidence: "Low", trend: "neutral" },
  { game: "NYY @ BOS", market: "Rafael Devers HR",  line: "+200", confidence: "Med",  trend: "up" },
];

const teamColors = {
  "New York Yankees": "#1C2F61", "Boston Red Sox": "#BD1B2E",
  "Los Angeles Dodgers": "#005A9C", "San Francisco Giants": "#FD5A1E",
  "Atlanta Braves": "#CE1141", "Philadelphia Phillies": "#E81A2D",
  "Houston Astros": "#EB6E1F", "Texas Rangers": "#C0111F",
  "New York Mets": "#002D72",
};

const TABS = [
  { label: "HR Probability", key: "prob" },
  { label: "Player Analytics", key: "player" },
  { label: "Betting Lines", key: "betting" },
];

const confidenceStyle = {
  High:    { bg: "rgba(39,174,96,0.15)",  border: "rgba(39,174,96,0.35)",  color: "#27ae60" },
  Med:     { bg: "rgba(241,196,15,0.15)", border: "rgba(241,196,15,0.35)", color: "#d4ac0d" },
  Low:     { bg: "rgba(192,57,43,0.15)",  border: "rgba(192,57,43,0.35)",  color: "#c0392b" },
};

const trendIcon = { up: "↑", down: "↓", neutral: "→" };
const trendColor = { up: "#27ae60", down: "#c0392b", neutral: "var(--text-muted)" };

function ProbBar({ value, color }) {
  return (
    <div style={{
      flex: 1, height: 6, background: "var(--elevated)", borderRadius: 3, overflow: "hidden",
    }}>
      <div style={{
        width: `${value}%`, height: "100%", borderRadius: 3,
        background: color || "var(--gold)",
        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: `0 0 8px ${color}66`,
      }} />
    </div>
  );
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
        <div style={{
          width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: 2,
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="page-wide">
      <div className="page-header">
        <p className="page-eyebrow">Statcast & Odds</p>
        <h1 className="page-title">
          Analytics <span className="accent">&amp; Odds</span>
        </h1>
        <span className="stat-pill" style={{ background: "rgba(241,196,15,0.1)", borderColor: "rgba(241,196,15,0.25)", color: "#d4ac0d" }}>
          Placeholder data — live stats coming soon
        </span>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 4, marginBottom: 32,
        background: "var(--surface)", border: "1px solid var(--border-subtle)",
        borderRadius: 10, padding: 4, width: "fit-content", margin: "0 auto 32px",
      }}>
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

      {/* ── HR Probability ── */}
      {activeTab === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{
            textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem",
            marginBottom: 8, fontFamily: "var(--font-data)", fontStyle: "italic",
          }}>
            Estimated probability of at least one HR in each matchup, based on pitcher HR/9 rates.
          </p>
          {mockHRProbabilities.map((game) => {
            const awayColor = teamColors[game.awayTeam] || "#484f58";
            const homeColor = teamColors[game.homeTeam] || "#484f58";
            return (
              <div key={game.gamePk} className="card">
                {/* Header */}
                <div style={{
                  background: `linear-gradient(90deg, ${awayColor}33, var(--elevated) 50%, ${homeColor}33)`,
                  borderBottom: "1px solid var(--border-subtle)",
                  padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--text)" }}>
                    {game.awayTeam}
                  </span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
                    @
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--text)" }}>
                    {game.homeTeam}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 0 }}>
                  {/* Away */}
                  {[
                    { pitcher: game.awayPitcher, prob: game.homeHRProb, color: homeColor, battingTeam: game.homeTeam },
                    { pitcher: game.homePitcher, prob: game.awayHRProb, color: awayColor, battingTeam: game.awayTeam },
                  ].map((side, i) => (
                    <>
                      {i === 1 && <div key="div" style={{ background: "var(--border-subtle)" }} />}
                      <div key={i} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: "50%", overflow: "hidden",
                            border: `2px solid ${i === 0 ? awayColor : homeColor}55`, flexShrink: 0,
                            background: "var(--elevated)",
                          }}>
                            <img
                              src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${side.pitcher.playerId}/headshot/67/current.png`}
                              alt={side.pitcher.name}
                              onError={e => { e.target.style.display = "none"; }}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "var(--text)" }}>
                              {side.pitcher.name}
                            </div>
                            <div style={{ fontFamily: "var(--font-data)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                              ERA {side.pitcher.ERA} · HR/9 {side.pitcher.HR9}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-data)", fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                            {side.battingTeam} HR probability
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <ProbBar value={side.prob} color={side.color} />
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--gold)", minWidth: 42, textAlign: "right" }}>
                              {side.prob}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Player Analytics ── */}
      {activeTab === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{
            textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem",
            marginBottom: 8, fontFamily: "var(--font-data)", fontStyle: "italic",
          }}>
            Statcast metrics for top HR hitters — launch angle, hard hit %, barrel %, exit velocity.
          </p>
          {mockPlayerAnalytics.map((player) => {
            const color = teamColors[player.team] || "#484f58";
            return (
              <div key={player.playerId} className="card">
                {/* Player header */}
                <div style={{
                  background: `linear-gradient(90deg, ${color}55, ${color}22)`,
                  borderBottom: "1px solid var(--border-subtle)",
                  padding: "14px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", overflow: "hidden",
                    border: `2px solid ${color}88`, flexShrink: 0, background: "var(--elevated)",
                  }}>
                    <img
                      src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${player.playerId}/headshot/67/current.png`}
                      alt={player.name}
                      onError={e => { e.target.style.display = "none"; }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--text)" }}>
                      {player.name}
                    </div>
                    <div style={{ fontFamily: "var(--font-data)", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
                      {player.team}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "var(--gold)", lineHeight: 1 }}>
                      {player.HR}
                    </div>
                    <div style={{ fontFamily: "var(--font-data)", fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>
                      HRs
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
                  <MiniStatBar
                    label="Launch Angle"
                    display={`${player.launchAngle}°`}
                    value={(player.launchAngle / 30) * 100}
                    color="#5b8cda"
                  />
                  <MiniStatBar
                    label="Hard Hit %"
                    display={`${player.hardHitPct}%`}
                    value={player.hardHitPct}
                    color="#e67e22"
                  />
                  <MiniStatBar
                    label="Barrel %"
                    display={`${player.barrelPct}%`}
                    value={Math.min(player.barrelPct * 4, 100)}
                    color="#c0392b"
                  />
                  <MiniStatBar
                    label="Avg Exit Velo"
                    display={`${player.exitVeloAvg} mph`}
                    value={((player.exitVeloAvg - 85) / 20) * 100}
                    color="#27ae60"
                  />
                </div>

                {/* Odds chip */}
                <div style={{
                  padding: "12px 20px",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{
                    fontFamily: "var(--font-data)", fontSize: "0.72rem", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)",
                  }}>
                    HR Odds Today
                  </span>
                  <span style={{
                    fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--gold)",
                  }}>
                    {player.oddsToHRToday}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Betting Lines ── */}
      {activeTab === 2 && (
        <div>
          <p style={{
            textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem",
            marginBottom: 20, fontFamily: "var(--font-data)", fontStyle: "italic",
          }}>
            Home run prop betting lines with trend and confidence indicators.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mockBettingLines.map((row, i) => {
              const conf = confidenceStyle[row.confidence];
              return (
                <div
                  key={i}
                  className="card"
                  style={{
                    display: "flex", alignItems: "center", padding: "14px 20px", gap: 16,
                  }}
                >
                  {/* Game */}
                  <span style={{
                    fontFamily: "var(--font-data)", fontSize: "0.75rem", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)",
                    minWidth: 80, flexShrink: 0,
                  }}>
                    {row.game}
                  </span>

                  {/* Market */}
                  <span style={{
                    fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--text)",
                    flex: 1,
                  }}>
                    {row.market}
                  </span>

                  {/* Trend */}
                  <span style={{
                    fontFamily: "var(--font-display)", fontSize: "1.2rem",
                    color: trendColor[row.trend], minWidth: 20, textAlign: "center",
                  }}>
                    {trendIcon[row.trend]}
                  </span>

                  {/* Line */}
                  <span style={{
                    fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--gold)",
                    minWidth: 60, textAlign: "right", letterSpacing: "0.02em",
                  }}>
                    {row.line}
                  </span>

                  {/* Confidence badge */}
                  <span style={{
                    background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color,
                    padding: "3px 12px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0,
                  }}>
                    {row.confidence}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="data-note" style={{ marginTop: 24 }}>
            Lines are illustrative placeholders · Real odds integration coming soon
          </p>
        </div>
      )}
    </div>
  );
}
