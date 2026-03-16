import { useState } from "react";

// ─── Mock Data (replace with API calls later) ────────────────────────────────

const mockHRProbabilities = [
  {
    gamePk: 1,
    awayTeam: "New York Yankees",
    homeTeam: "Boston Red Sox",
    awayPitcher: { name: "Gerrit Cole", ERA: 3.12, HR9: 1.1, playerId: 543037 },
    homePitcher: { name: "Brayan Bello", ERA: 3.88, HR9: 0.9, playerId: 681911 },
    awayHRProb: 62,
    homeHRProb: 55,
  },
  {
    gamePk: 2,
    awayTeam: "Los Angeles Dodgers",
    homeTeam: "San Francisco Giants",
    awayPitcher: { name: "Tyler Glasnow", ERA: 3.45, HR9: 1.4, playerId: 607192 },
    homePitcher: { name: "Logan Webb", ERA: 3.25, HR9: 0.7, playerId: 657277 },
    awayHRProb: 70,
    homeHRProb: 42,
  },
  {
    gamePk: 3,
    awayTeam: "Atlanta Braves",
    homeTeam: "Philadelphia Phillies",
    awayPitcher: { name: "Spencer Strider", ERA: 2.95, HR9: 1.2, playerId: 675911 },
    homePitcher: { name: "Zack Wheeler", ERA: 3.07, HR9: 0.8, playerId: 554430 },
    awayHRProb: 66,
    homeHRProb: 58,
  },
  {
    gamePk: 4,
    awayTeam: "Houston Astros",
    homeTeam: "Texas Rangers",
    awayPitcher: { name: "Framber Valdez", ERA: 2.91, HR9: 0.6, playerId: 664285 },
    homePitcher: { name: "Nathan Eovaldi", ERA: 3.77, HR9: 1.3, playerId: 434564 },
    awayHRProb: 50,
    homeHRProb: 68,
  },
];

const mockPlayerAnalytics = [
  { name: "Aaron Judge", team: "New York Yankees", playerId: 592450, HR: 12, launchAngle: 18.4, hardHitPct: 58.2, barrelPct: 22.1, exitVeloAvg: 96.8, oddsToHRToday: "+140" },
  { name: "Shohei Ohtani", team: "Los Angeles Dodgers", playerId: 660271, HR: 11, launchAngle: 16.9, hardHitPct: 55.7, barrelPct: 19.8, exitVeloAvg: 95.4, oddsToHRToday: "+160" },
  { name: "Pete Alonso", team: "New York Mets", playerId: 624413, HR: 10, launchAngle: 17.2, hardHitPct: 52.1, barrelPct: 18.3, exitVeloAvg: 94.1, oddsToHRToday: "+175" },
  { name: "Matt Olson", team: "Atlanta Braves", playerId: 621566, HR: 9, launchAngle: 15.8, hardHitPct: 51.4, barrelPct: 17.9, exitVeloAvg: 93.7, oddsToHRToday: "+190" },
  { name: "Kyle Schwarber", team: "Philadelphia Phillies", playerId: 656941, HR: 9, launchAngle: 20.1, hardHitPct: 49.8, barrelPct: 16.5, exitVeloAvg: 92.9, oddsToHRToday: "+195" },
];

const mockBettingLines = [
  { game: "NYY @ BOS", market: "Aaron Judge HR", line: "+140", confidence: "High", trend: "up" },
  { game: "LAD @ SF",  market: "Shohei Ohtani HR", line: "+160", confidence: "High", trend: "up" },
  { game: "ATL @ PHI", market: "Matt Olson HR", line: "+190", confidence: "Med", trend: "neutral" },
  { game: "ATL @ PHI", market: "Bryce Harper HR", line: "+210", confidence: "Med", trend: "up" },
  { game: "HOU @ TEX", market: "Yordan Alvarez HR", line: "+175", confidence: "High", trend: "up" },
  { game: "HOU @ TEX", market: "Corey Seager HR", line: "+220", confidence: "Low", trend: "down" },
  { game: "LAD @ SF",  market: "Freddie Freeman HR", line: "+230", confidence: "Low", trend: "neutral" },
  { game: "NYY @ BOS", market: "Rafael Devers HR", line: "+200", confidence: "Med", trend: "up" },
];

// ─── Team colors ──────────────────────────────────────────────────────────────

const teamColors = {
  "New York Yankees": "#1C2F61",
  "Boston Red Sox": "#BD1B2E",
  "Los Angeles Dodgers": "#005A9C",
  "San Francisco Giants": "#FD5A1E",
  "Atlanta Braves": "#CE1141",
  "Philadelphia Phillies": "#E81A2D",
  "Houston Astros": "#EB6E1F",
  "Texas Rangers": "#C0111F",
  "New York Mets": "#002D72",
};

const teamSecondaryColors = {
  "New York Yankees": "#C4CED4",
  "Boston Red Sox": "#0C2340",
  "Los Angeles Dodgers": "#EF3E42",
  "San Francisco Giants": "#27251F",
  "Atlanta Braves": "#13274F",
  "Philadelphia Phillies": "#002D72",
  "Houston Astros": "#002D62",
  "Texas Rangers": "#003278",
  "New York Mets": "#FF5910",
};

function getTextColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 125 ? "black" : "white";
}

function ProbBar({ value, color }) {
  return (
    <div style={{ width: "100%", backgroundColor: "#e9ecef", borderRadius: "6px", height: "10px", overflow: "hidden" }}>
      <div style={{ width: `${value}%`, backgroundColor: color, height: "100%", borderRadius: "6px", transition: "width 0.5s ease" }} />
    </div>
  );
}

const confidenceColors = { High: "#28a745", Med: "#ffc107", Low: "#dc3545" };
const trendSymbols = { up: "↑", down: "↓", neutral: "→" };
const trendColors  = { up: "#28a745", down: "#dc3545", neutral: "#888" };

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ["HR Probability", "Player Analytics", "Betting Lines"];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: '"Roboto", sans-serif', padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "6px" }}>
        Analytics &amp; Odds
      </h2>
      <p style={{ textAlign: "center", color: "#888", fontSize: "0.9rem", marginBottom: "24px", fontStyle: "italic" }}>
        ⚠️ Placeholder data — live stats coming soon
      </p>

      {/* Tab bar */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.95rem",
              backgroundColor: activeTab === i ? "#2C3E50" : "#e9ecef",
              color: activeTab === i ? "white" : "#444",
              transition: "background 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab 0: HR Probability ── */}
      {activeTab === 0 && (
        <div>
          <p style={{ textAlign: "center", color: "#555", marginBottom: "20px", fontSize: "0.95rem" }}>
            Estimated probability that at least one HR is hit in today's matchups, based on pitcher HR/9 rates and team HR tendencies.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mockHRProbabilities.map((game) => {
              const awayColor = teamColors[game.awayTeam] || "#555";
              const homeColor = teamColors[game.homeTeam] || "#555";
              return (
                <div key={game.gamePk} style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", background: "#fff" }}>
                  {/* Header */}
                  <div style={{ backgroundColor: "#2C3E50", color: "white", padding: "10px 16px", fontWeight: "bold", fontSize: "1rem" }}>
                    {game.awayTeam} <span style={{ opacity: 0.5 }}>@</span> {game.homeTeam}
                  </div>

                  <div style={{ padding: "16px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    {/* Away side */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <img
                          src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${game.awayPitcher.playerId}/headshot/67/current.png`}
                          alt={game.awayPitcher.name}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/48x48/999/fff?text=?"; }}
                          style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `2px solid ${awayColor}` }}
                        />
                        <div>
                          <div style={{ fontWeight: "bold", color: awayColor }}>{game.awayPitcher.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "#777" }}>ERA {game.awayPitcher.ERA} · HR/9 {game.awayPitcher.HR9}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "6px" }}>
                        HR probability vs this starter
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <ProbBar value={game.homeHRProb} color={homeColor} />
                        <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: homeColor, minWidth: 36 }}>{game.homeHRProb}%</span>
                      </div>
                    </div>

                    <div style={{ width: "1px", backgroundColor: "#eee", alignSelf: "stretch" }} />

                    {/* Home side */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <img
                          src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${game.homePitcher.playerId}/headshot/67/current.png`}
                          alt={game.homePitcher.name}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/48x48/999/fff?text=?"; }}
                          style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `2px solid ${homeColor}` }}
                        />
                        <div>
                          <div style={{ fontWeight: "bold", color: homeColor }}>{game.homePitcher.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "#777" }}>ERA {game.homePitcher.ERA} · HR/9 {game.homePitcher.HR9}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "6px" }}>
                        HR probability vs this starter
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <ProbBar value={game.awayHRProb} color={awayColor} />
                        <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: awayColor, minWidth: 36 }}>{game.awayHRProb}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 1: Player Analytics ── */}
      {activeTab === 1 && (
        <div>
          <p style={{ textAlign: "center", color: "#555", marginBottom: "20px", fontSize: "0.95rem" }}>
            Deep Statcast metrics for top HR hitters — launch angle, hard hit %, barrel %, and avg exit velocity.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mockPlayerAnalytics.map((player, i) => {
              const color = teamColors[player.team] || "#444";
              const secondary = teamSecondaryColors[player.team] || "#999";
              const textCol = getTextColor(color);
              return (
                <div key={player.playerId} style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  {/* Player header */}
                  <div style={{ background: `linear-gradient(to right, ${color}, ${secondary})`, color: textCol, padding: "12px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                    <img
                      src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${player.playerId}/headshot/67/current.png`}
                      alt={player.name}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/56x56/999/fff?text=?"; }}
                      style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", fontSize: "1.15rem" }}>{player.name}</div>
                      <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>{player.team}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "2rem", fontWeight: "bold", lineHeight: 1 }}>{player.HR}</div>
                      <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>HRs</div>
                    </div>
                  </div>

                  {/* Stat grid */}
                  <div style={{ background: "#fff", padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                    {[
                      { label: "Launch Angle", value: `${player.launchAngle}°`, bar: (player.launchAngle / 30) * 100, color: "#5b8cda" },
                      { label: "Hard Hit %",   value: `${player.hardHitPct}%`,  bar: player.hardHitPct,              color: "#e67e22" },
                      { label: "Barrel %",     value: `${player.barrelPct}%`,   bar: player.barrelPct * 3,           color: "#e74c3c" },
                      { label: "Avg Exit Velo",value: `${player.exitVeloAvg} mph`, bar: ((player.exitVeloAvg - 85) / 20) * 100, color: "#27ae60" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "3px" }}>{stat.label}</div>
                        <div style={{ fontWeight: "bold", fontSize: "1rem", marginBottom: "5px" }}>{stat.value}</div>
                        <ProbBar value={Math.min(stat.bar, 100)} color={stat.color} />
                      </div>
                    ))}

                    {/* Odds chip */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f8f9fa", borderRadius: "8px", padding: "8px" }}>
                      <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "3px" }}>HR Odds Today</div>
                      <div style={{ fontWeight: "bold", fontSize: "1.3rem", color: "#2C3E50" }}>{player.oddsToHRToday}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 2: Betting Lines ── */}
      {activeTab === 2 && (
        <div>
          <p style={{ textAlign: "center", color: "#555", marginBottom: "20px", fontSize: "0.95rem" }}>
            Home run prop betting lines with trend and confidence indicators.
          </p>
          <div style={{ overflowX: "auto", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead>
                <tr style={{ backgroundColor: "#2C3E50", color: "white" }}>
                  {["Game", "Market", "Line", "Trend", "Confidence"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "bold", fontSize: "0.9rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockBettingLines.map((row, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f8f9fa" : "#fff", borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "12px 16px", fontSize: "0.9rem", color: "#555", whiteSpace: "nowrap" }}>{row.game}</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", fontSize: "0.95rem" }}>{row.market}</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", fontSize: "1.1rem", color: "#2C3E50" }}>{row.line}</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", fontSize: "1.2rem", color: trendColors[row.trend] }}>
                      {trendSymbols[row.trend]}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        backgroundColor: confidenceColors[row.confidence],
                        color: "white",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}>
                        {row.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#aaa", marginTop: "16px" }}>
            Lines are illustrative placeholders. Real odds integration coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
