# TxLINE World Cup Agent

**Version:** 0.9.3

Autonomous multi-agent trading system built on TxLINE's live World Cup data feed. Three independent agents run competing strategies against the same real-time feed, with all decisions, bankrolls, and outcomes tracked and exposed through a live dashboard and Telegram alerts.

Built for Superteam's Trading Tools & Agents track (TxLINE World Cup Hackathon).

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000?style=for-the-badge&logo=vercel)](https://txline-worldcup-agent.vercel.app)
[![Analytics](https://img.shields.io/badge/Analytics-Dashboard-35d17d?style=for-the-badge)](https://txline-worldcup-agent.vercel.app/analytics.html)
[![GitHub](https://img.shields.io/badge/GitHub-Freedomwithin-181717?style=for-the-badge&logo=github)](https://github.com/Freedomwithin/txline-worldcup-agent)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/worldcup_agent_bot)

---

## Demo Video

**Live Demo Walkthrough (2:50 min):**

[![Demo Video](https://img.shields.io/badge/Watch_on-Vimeo-1AB7EA?style=for-the-badge&logo=vimeo)](https://vimeo.com/1210043885)

**Or download directly:**
[Github download](./public/assets/Live_Demos/txline-worldcup-agent_demo_v1.mp4)

---

## Screenshots

### Live Dashboard
![Dashboard](./public/assets/ui_screenshots/dashboard.png)

### Agent Analytics
![Analytics](./public/assets/ui_screenshots/agent_analytics.png)

---

## Overview

Three ML-driven agents read the same TxLINE feed and each generate independent trading signals every polling cycle — no manual input, approval, or override in the prediction path. Every signal, bankroll change, and settled outcome is logged and served through a public API, so performance can be verified in real time rather than taken on faith.

Settlement (comparing a signal against a completed match's real result) is fully autonomous when TxLINE's historical scores endpoint returns data for that fixture. Where it doesn't — see TxLINE feedback below — an authenticated manual recovery tool exists to input the real score so the same deterministic settlement logic can run. That tool is a documented fallback for a specific upstream data gap, not part of the trading logic itself: it never fabricates or estimates a result, it only lets a real score be entered when the automatic path can't retrieve one.

**Live Dashboard:** [txline-worldcup-agent.vercel.app](https://txline-worldcup-agent.vercel.app)
**Analytics:** [txline-worldcup-agent.vercel.app/analytics.html](https://txline-worldcup-agent.vercel.app/analytics.html)
**Telegram Bot:** [@worldcup_agent_bot](https://t.me/worldcup_agent_bot)

---

## How It Works

```
TxLINE feed (fixtures + scores)
        │
        ▼
  api/server.js (polling + normalization)
        │
        ▼
  ML Agent Arena  ──►  3 independent agents evaluate the same snapshot
        │                  each executes its own strategy, no shared state
        ▼
  Agent state (bankroll, trades, win/loss) persisted per cycle
        │
        ├──► /api/matches       → live dashboard (fixtures, agent status, predictions)
        ├──► /api/history       → analytics dashboard (throttled 15-min snapshots)
        ├──► /api/admin/scores  → authenticated manual score recovery (fallback only)
        └──► Telegram Bot       → match alerts, leaderboard updates
```

Signal generation runs autonomously on every polling cycle with no human step. Settlement outcomes are always one of: a real boolean result (from TxLINE or a manually-entered real score), `null` for HOLD trades, or `'pending'` when no result is available yet — never a randomized or estimated value.

## Agents

| Agent | Signal | Strategy |
|-------|--------|----------|
| ML Prophet | Statistical pattern detection across match events | Flags recurring pre-shift patterns in scoring and momentum data, sized by confidence |
| Sentinel AI | ML pattern detection + market sentiment | Weights the same pattern signal against sentiment/consensus direction before acting |
| Simple Momentum | Trend following | Baseline agent — no pattern detection, used as a control to benchmark the other two against |

*Strategy detail and thresholds are documented in `src/ml_agent.js` and `src/ml_agent_arena.js`.*

---

## Dashboards

### Live Dashboard
- Real-time match monitoring with 30-second auto-refresh
- Match status indicators: live, soon, upcoming, completed
- **Next Match** countdown timer
- **Agent Leaderboard** showing top performing agent
- Agent predictions with confidence scores (BUY/SELL/HOLD)
- World Cup match badges and per-match event counts
- Per-agent status: bankroll, trade count, win/loss record, last action
- Click any match for detailed view with agent activity

### Analytics Dashboard
- Bankroll comparison across agents
- Win rate comparison
- Win/loss record breakdown
- Trade volume share
- Bankroll trend over time, sampled at 15-minute intervals via `/api/history`

### Telegram Bot

**Commands:**
| Command | What it does |
|---------|--------------|
| `/matches` | 📅 Upcoming World Cup matches with time-until-kickoff |
| `/predictions` | 🔮 Live agent predictions with confidence % |
| `/leaderboard` | 🏆 Agent rankings by bankroll with medal icons |
| `/agents` | 🤖 Detailed agent stats & strategies |
| `/live` | 🔴 Currently live matches with elapsed time |
| `/status` | 📊 System health & data source |
| `/odds [fixtureId]` | 📈 Live odds for a match |
| `/stats [fixtureId]` | ⚽ Match stats: goals, cards, substitutions |
| `/settle` | 🔗 Last on-chain settlement transaction |

**Features:**
- ⚽ Auto-match alerts when goals or cards occur
- 📊 Real-time agent predictions sent to your phone
- 🏆 Leaderboard updates showing top performing agent
- 📈 Live odds and match stats on demand

[Try it on Telegram](https://t.me/worldcup_agent_bot)

[Try it on Telegram](https://t.me/worldcup_agent_bot)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Vercel serverless functions |
| Frontend | HTML, CSS, JavaScript, Chart.js |
| Data | TxLINE (Devnet) |
| Blockchain | Solana (Devnet) |
| Deployment | Vercel |
| Auth | JWT + API token (TxLINE), keyed header auth (admin recovery endpoint) |
| Notifications | Telegram Bot API |

---

## TxLINE Integration

| Endpoint | Used for |
|----------|----------|
| `/fixtures/snapshot` | Current fixture state, pulled each polling cycle |
| `/scores/historical/{fixtureId}` | Historical score data for settlement; primary, autonomous path |

**Feedback on the TxLINE API:**
> The `/fixtures/snapshot` endpoint was reliable and easy to integrate — clean, normalized fixture data every cycle. The main friction was `/scores/historical/{fixtureId}`: for several fixtures we tracked, it returned no data even after the match had concluded, which meant our settlement logic — comparing an agent's signal against the real result — had nothing to settle against. Rather than fill that gap with an estimated or randomized outcome, we built an authenticated manual recovery path so a real score can still be entered and run through the same deterministic settlement code. It's a fallback for that specific gap, not a substitute for the live endpoint, and we'd be glad to share fixture IDs where this occurred if useful for debugging on TxLINE's side.

---

## Project Structure

```
txline-worldcup-agent/
├── api/
│   └── server.js              # API layer: polling, ML agents, history + admin endpoints
├── public/
│   ├── index.html              # Live dashboard with predictions and leaderboard
│   ├── analytics.html          # Analytics dashboard
│   └── assets/
│       ├── ui_screenshots/     # Screenshots for README
│       │   ├── dashboard.png
│       │   └── agent_analytics.png
│       └── Live_Demos/         # Demo video
│           └── txline-worldcup-agent_demo_v1.mp4
├── src/
│   ├── ml_agent.js             # Pattern detection logic with FIFA rankings
│   ├── ml_agent_arena.js       # Multi-agent orchestration
│   ├── arena_state.js          # Disk-persisted agent state
│   ├── history.js              # Throttled snapshot storage
│   ├── manual_scores.js        # Manual score persistence (recovery path)
│   ├── onchain_settlement.js   # Solana devnet settlement
│   ├── telegram_bot.js         # Telegram bot integration
│   └── ...
├── scripts/
│   └── set-score.js            # Authenticated CLI for manual score recovery
├── data/
│   ├── team_rankings.json      # FIFA rankings reference data
│   ├── historical_matches.json
│   ├── arena_state.json        # Persisted agent state
│   ├── manual_scores.json      # Manually recovered scores, if any
│   └── history.json            # Agent snapshot history
├── package.json
├── vercel.json
├── README.md
└── CHANGELOG.md
```

---

## Installation

```bash
git clone https://github.com/Freedomwithin/txline-worldcup-agent.git
cd txline-worldcup-agent
npm install
cp .env.example .env
# Add TxLINE credentials, Telegram bot token, and ADMIN_KEY to .env
```

`ADMIN_KEY` gates the `/api/admin/scores` recovery endpoint — required for local testing and must also be set as a Vercel environment variable in production.

## Deployment

```bash
vercel --prod
```

---

## Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Get your bot token
3. Get your chat ID by sending a message to the bot
4. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to `.env`

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for full version history.

| Version | Date | Key Features |
|---------|------|--------------|
| 0.9.3 | 2026-07-15 | Admin endpoint authentication (`X-Admin-Key`), bug fixes |
| 0.9.2 | 2026-07-15 | Manual score recovery system, removed `Math.random()` from settlement, deterministic settlement tests |
| 0.9.1 | 2026-07-14 | Vercel-only deployment, confirmed arena state persistence |
| 0.9.0 | 2026-07-14 | Documentation pass, architecture cleanup |
| 0.8.3 | 2026-07-13 | Demo video added, README polish |
| 0.8.2 | 2026-07-13 | Telegram bot integration, match alerts, leaderboard updates |
| 0.8.1 | 2026-07-13 | Fixed analytics navigation, enhanced UI |
| 0.8.0 | 2026-07-13 | Next Match countdown, Leaderboard, Confidence scores |
| 0.7.0 | 2026-07-13 | On-chain settlement, Match Detail Modal |
| 0.6.0 | 2026-07-13 | UI Overhaul, Analytics Dashboard |

---

## License

MIT © 2026 Jonathon Koerner

---

Built for the TxLINE World Cup Hackathon.