# 🌍 TxLINE World Cup Agent

A real-time agent for monitoring World Cup matches using TxLINE's Solana-powered sports data API. Features 3 ML-powered agents competing in an arena.

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
- Trade history visualization
- Performance radar chart

### 🎯 Live Dashboard

- Real-time match monitoring
- Auto-refresh every 30 seconds
- Match status indicators (Live/Soon/Upcoming/Completed)
- World Cup match badges
- Click for match details

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
│   └── server.js              # API with ML agent logic
├── public/
│   ├── index.html             # Main dashboard
│   └── analytics.html         # Analytics dashboard
├── src/
│   ├── ml_agent.js            # ML pattern detector
│   ├── ml_agent_arena.js      # 3-agent arena
│   ├── live_monitor.js        # Live match monitoring
│   ├── pattern_analyzer.js    # Pattern analysis
│   └── agent_arena.js         # Original agent arena
├── package.json
├── vercel.json
├── README.md
└── CHANGELOG.md
```

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
# Deploy to Vercel
vercel --prod
```

---

## 📝 Update Log

<!-- 
================================================================================
UPDATE INSTRUCTIONS:
When adding a new feature, add it to the "Latest Updates" section below.
Move older updates to the CHANGELOG.md file.
================================================================================
-->

### Latest Updates (v0.5.0)

| Date | Feature | Description |
|------|---------|-------------|
| 2026-07-13 | 🤖 3 ML Agents | Added ML Prophet, Sentinel AI, Simple Momentum |
| 2026-07-13 | 📊 Analytics Dashboard | Added Chart.js visualizations |
| 2026-07-12 | 🔍 Match Detail Modal | Click matches for detailed info |
| 2026-07-12 | 🚀 Vercel Deployment | Live at txline-worldcup-agent.vercel.app |

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
