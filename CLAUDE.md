# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MLB stats app with a Node.js/Express backend and React/Vite frontend. The backend fetches live data from the official MLB StatsAPI, stores it in MongoDB Atlas, and serves it to the frontend via REST endpoints.

## Commands

### Backend
```bash
cd backend
npm install
node main.js          # Start server on port 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # Dev server at http://localhost:5173
npm run build         # Production build → dist/
npm run lint          # ESLint check
```

There are no automated tests.

## Architecture

**Data pipeline:**
1. `extractGamePks.js` — Fetches today's MLB schedule to get game IDs (`gamePk`)
2. `updateHomeruns.js` — Uses game IDs to fetch HR play-by-play data
3. `updatePitchers.js` — Uses game IDs to fetch starting pitcher assignments
4. `extractStatLeaders.js` — Fetches season HR leaderboard independently

The backend runs all updates on a 30-minute cron schedule and exposes `POST /update-data` for manual triggers.

**MongoDB collections** (`mlb_data` database):
- `"initial connection"` — Daily home run events (player, description, launchSpeed, totalDistance)
- `"pitchers"` — Starting pitchers per game (ERA, HR9, wins, losses, whip)
- `"leaderboard"` — Top 10 season HR leaders (HR, RBI, AVG, OPS, SB, abPerHr)

**Frontend routes** (React Router, defined in `src/App.jsx`):
- `/` → `HomePage.jsx` — Today's home runs
- `/leaderboard` → `Leaderboard.jsx` — Season leaderboard
- `/pitchers` → `StartingPitchers.jsx` — Today's game matchups

**API URL switching:** `frontend/.env` sets `VITE_API_URL=https://mlb-backend.onrender.com` for production. Pages detect `localhost` in the URL to switch to `http://localhost:8080` in development.

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/daily_homeruns?date=YYYY-MM-DD` | Home runs for a given date |
| GET | `/leaderboard` | Top 10 HR hitters |
| GET | `/pitchers` | Today's starting pitchers |
| POST | `/update-data` | Trigger all data refreshes |
| GET | `/health` | Health check |

## Environment

**`backend/.env`:**
```
MONGODB_URI=...
PORT=8080
TEST_MODE=false
```

**`frontend/.env`:**
```
VITE_API_URL=https://mlb-backend.onrender.com
```

## Deployment

- **Backend:** Render.com
- **Frontend:** Vercel
