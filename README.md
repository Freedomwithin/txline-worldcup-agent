# 🌍 TxLINE World Cup Agent

A real-time agent for monitoring World Cup matches using TxLINE's Solana-powered sports data API. Live dashboard, agent arena, and pattern analysis all in one.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000?style=for-the-badge&logo=vercel)](https://txline-worldcup-agent.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Freedomwithin-181717?style=for-the-badge&logo=github)](https://github.com/Freedomwithin/txline-worldcup-agent)
[![TxLINE](https://img.shields.io/badge/Powered_By-TxLINE-FF5722?style=for-the-badge)](https://txline.txodds.com)

## 🚀 Live Demo

**View the live dashboard:** [https://txline-worldcup-agent.vercel.app](https://txline-worldcup-agent.vercel.app)

The dashboard shows:
- 🔴 Live matches currently in progress
- 📅 Upcoming matches with start times
- ✅ Completed matches
- 🏆 World Cup match identification

## 📊 Features

### 1. Live Dashboard
- Real-time match monitoring
- Auto-refresh every 60 seconds
- Match status indicators (Live/Soon/Upcoming/Completed)
- World Cup match badges
- Statistics: total, live, upcoming, completed

### 2. Agent Arena
Two competing agents analyze the same data:

| Agent | Strategy | Description |
|-------|----------|-------------|
| **Momentum Agent** | Follows trends | Buys when activity increases |
| **Contrarian Agent** | Fades trends | Sells when activity is high |

### 3. Pattern Analysis
- Competition breakdown
- Team appearance statistics
- Upcoming match schedule
- Match pattern detection

### 4. Sharp Movement Detector
- Detects sudden changes in match activity
- Tracks score event intensity
- Logs significant movements

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express |
| **Frontend** | HTML, CSS, JavaScript |
| **API** | TxLINE (Devnet) |
| **Deployment** | Vercel |
| **Authentication** | JWT + API Token |

## 📁 Project Structure

```
txline-worldcup-agent/
├── api/
│   └── server.js          # API endpoint for matches
├── public/
│   └── index.html         # Dashboard frontend
├── src/
│   ├── live_monitor.js    # Live match monitoring
│   ├── dashboard.js       # Match dashboard
│   ├── pattern_analyzer.js # Pattern analysis
│   ├── agent_arena.js     # Agent competition
│   ├── sharp_detector.js  # Sharp movement detection
│   └── realtime_monitor.js # Realtime updates
├── scripts/
│   ├── test_token.js      # API token testing
│   └── subscribe.js       # On-chain subscription
├── .env.example           # Environment template
├── vercel.json            # Vercel deployment config
├── package.json           # Dependencies
├── README.md              # This file
└── CHANGELOG.md           # Version history
```

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Freedomwithin/txline-worldcup-agent.git
cd txline-worldcup-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your TxLINE credentials
```

### 4. Get TxLINE API Token

```bash
# Get a guest JWT
curl -X POST https://txline-dev.txodds.com/auth/guest/start

# Run the subscription script
TOKEN_MINT_ADDRESS=4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG \
ANCHOR_PROVIDER_URL="https://api.devnet.solana.com" \
ANCHOR_WALLET="./_keys/testuser-wallet-1.json" \
yarn ts-node examples/devnet/scripts/subscription_free_tier.ts
```

### 5. Run Locally

```bash
# Development mode
vercel dev

# Production mode
node server.js
```

## 🚀 Deployment

Deployed on Vercel with automatic deployments from GitHub:

```bash
# Deploy to production
vercel --prod
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/matches` | GET | Returns all matches with status |
| `/api/matches?worldcup=true` | GET | Returns only World Cup matches |

## 🏗️ TxLINE Endpoints Used

| Endpoint | Description |
|----------|-------------|
| `/fixtures/snapshot` | Get current fixtures |
| `/scores/historical/{fixtureId}` | Get historical scores |

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the web server |
| `npm run monitor` | Live match monitoring |
| `npm run dashboard` | Show dashboard |
| `npm run analyze` | Pattern analysis |
| `npm run arena` | Agent vs Agent competition |

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT © 2026 Jonathon Koerner

## 🙏 Acknowledgments

- [TxLINE](https://txline.txodds.com) for the sports data API
- [Superteam](https://earn.superteam.fun) for the hackathon
- [Solana](https://solana.com) for the blockchain infrastructure

---
Built for the TxLINE World Cup Hackathon 🏆
