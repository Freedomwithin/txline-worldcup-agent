# 🌍 TxLINE World Cup Agent

A real-time agent for monitoring World Cup matches using TxLINE's Solana-powered sports data API. Features 3 ML-powered agents competing in an arena with live analytics.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000?style=for-the-badge&logo=vercel)](https://txline-worldcup-agent.vercel.app)
[![Analytics](https://img.shields.io/badge/Analytics-Dashboard-6366f1?style=for-the-badge)](https://txline-worldcup-agent.vercel.app/analytics.html)
[![GitHub](https://img.shields.io/badge/GitHub-Freedomwithin-181717?style=for-the-badge&logo=github)](https://github.com/Freedomwithin/txline-worldcup-agent)

---

## 🚀 Live Demo

**Main Dashboard:** [txline-worldcup-agent.vercel.app](https://txline-worldcup-agent.vercel.app)

**Analytics Dashboard:** [txline-worldcup-agent.vercel.app/analytics.html](https://txline-worldcup-agent.vercel.app/analytics.html)

---

## 📊 Features

### 🤖 ML-Powered Agents

| Agent | Strategy | Description |
|-------|----------|-------------|
| 🧠 **ML Prophet** | ML Pattern Detection | Uses statistical ML to detect patterns in match data |
| 🤖 **Sentinel AI** | ML + Market Sentiment | Combines ML with market sentiment analysis |
| 📈 **Simple Momentum** | Follows Trends | Baseline agent for comparison |

### 📈 Analytics Dashboard
- Bankroll comparison charts
- Win rate distribution
- Win/Loss record
- Trade volume share
- Historical bankroll trends (throttled to 15-min intervals)

### 🎯 Live Dashboard
- Real-time match monitoring with auto-refresh
- Match status indicators (Live/Soon/Upcoming/Completed)
- World Cup match badges
- Click for match details with agent activity

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express |
| **Frontend** | HTML, CSS, JavaScript, Chart.js |
| **API** | TxLINE (Devnet) |
| **Deployment** | Vercel |
| **Authentication** | JWT + API Token |

---

## 📁 Project Structure

```
txline-worldcup-agent/
├── api/
│   └── server.js              # API with ML agents + history endpoint
├── public/
│   ├── index.html             # Main dashboard with modal
│   └── analytics.html         # Analytics dashboard
├── src/
│   ├── ml_agent.js            # ML pattern detector
│   ├── ml_agent_arena.js      # 3-agent arena
│   ├── history.js             # Throttled history endpoint
│   └── ...
├── data/
│   ├── team_rankings.json     # Real FIFA rankings
│   ├── historical_matches.json # Match data
│   └── history.json           # Agent snapshot history
├── package.json
├── vercel.json
├── README.md
└── CHANGELOG.md
```

---

## 📝 Latest Updates (v0.6.0)

| Date | Feature | Description |
|------|---------|-------------|
| 2026-07-13 | 🎨 UI Overhaul | Pitch-inspired design with new colors and typography |
| 2026-07-13 | 📊 History Endpoint | `/api/history` with 15-min throttled snapshots |
| 2026-07-13 | 🏟️ Match Modal | Click matches for details and agent activity |
| 2026-07-13 | 🤖 3 ML Agents | ML Prophet, Sentinel AI, Simple Momentum |
| 2026-07-13 | 📈 Analytics | Live Chart.js visualizations |

---

## 🔧 Installation

```bash
git clone https://github.com/Freedomwithin/txline-worldcup-agent.git
cd txline-worldcup-agent
npm install
cp .env.example .env
# Edit .env with your TxLINE credentials
```

---

## 🚀 Deployment

```bash
vercel --prod
```

---

## 📋 TxLINE Endpoints Used

| Endpoint | Description |
|----------|-------------|
| `/fixtures/snapshot` | Get current fixtures |
| `/scores/historical/{fixtureId}` | Get historical scores |

---

## 📄 License

MIT © 2026 Jonathon Koerner

---
Built for the TxLINE World Cup Hackathon 🏆
