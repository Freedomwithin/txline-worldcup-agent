# TxLINE World Cup Agent

A real-time agent for monitoring World Cup matches using TxLINE's Solana-powered sports data API.

## Overview

This agent fetches live World Cup data from TxLINE and provides:

- 📊 **Live Match Monitoring** - Track matches that are currently live or starting soon
- 📅 **Match Dashboard** - View all World Cup fixtures with status indicators
- 🔍 **Pattern Analysis** - Analyze team appearances, competitions, and match patterns
- ⚡ **Sharp Movement Detection** - Detect significant odds shifts in real-time

## Prerequisites

- Node.js 20+ or Python 3.12+
- A Solana wallet with devnet SOL
- TxLINE API access (free tier for World Cup)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Freedomwithin/txline-agent.git
cd txline-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your wallet and API credentials
```

### 4. Get Your API Token

```bash
# Get a guest JWT
curl -X POST https://txline-dev.txodds.com/auth/guest/start

# Run the subscription script
TOKEN_MINT_ADDRESS=4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG \
ANCHOR_PROVIDER_URL="https://api.devnet.solana.com" \
ANCHOR_WALLET="./_keys/testuser-wallet-1.json" \
yarn ts-node examples/devnet/scripts/subscription_free_tier.ts
```

## Usage

### Live Monitor

Monitor matches that are currently live or starting soon:

```bash
node src/live_monitor.js
```

Output:
```
🔴 Live Score Monitor Starting...
================================

📊 Found 5 World Cup fixtures

🏟️  France vs Spain
   Status: 🔴 LIVE/SOON
   Start: 7/14/2026, 3:00:00 PM
   ⏰ 45 minutes until kickoff
```

### Dashboard

View all World Cup fixtures with status indicators:

```bash
node src/dashboard.js
```

Output:
```
📊 WORLD CUP DASHBOARD
======================

📅 MATCH SCHEDULE
-----------------

🔴 France vs Spain
   📍 7/14/2026 at 3:00:00 PM

⏳ England vs Argentina
   📍 7/15/2026 at 3:00:00 PM
```

### Pattern Analysis

Analyze team patterns and competition statistics:

```bash
node src/pattern_analyzer.js
```

Output:
```
📊 PATTERN ANALYSIS
===================

🏆 Competitions:
   World Cup: 2 matches
   Friendlies: 3 matches

⚽ Top Teams:
   France: 1 appearances
   Spain: 1 appearances
   England: 1 appearances
```

## Project Structure

```
txline-agent/
├── src/
│   ├── live_monitor.js      # Live match monitoring
│   ├── dashboard.js         # Match dashboard
│   ├── pattern_analyzer.js  # Pattern analysis
│   └── enhanced_agent.js    # Main agent with all features
├── scripts/
│   ├── test_token.js        # API token testing
│   └── subscribe.js         # On-chain subscription
├── .env                     # Environment variables
├── .jwt                     # Guest JWT
├── .apitoken                # API token
├── README.md                # This file
└── CHANGELOG.md             # Version history
```

## Configuration

### .env File

```env
NETWORK=devnet
SOLANA_RPC=https://api.devnet.solana.com
TXLINE_API_TOKEN=your_api_token_here
TXLINE_API_URL=https://txline-dev.txodds.com/api
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/fixtures/snapshot` | GET | Get current fixtures |
| `/scores/historical/{fixtureId}` | GET | Get historical scores |
| `/odds/snapshot` | GET | Get odds (limited availability) |

## Features

### ✅ Implemented
- Fixture fetching
- Match categorization (Live/Upcoming/Historic)
- Score checking for completed matches
- Pattern analysis
- Dashboard view

### 🚧 In Progress
- Real-time odds monitoring
- Sharp movement detection
- Agent vs Agent arena
- Telegram/Slack alerts

## Troubleshooting

### "404 - Not Found"
- Some endpoints may not be available on devnet
- Use `/fixtures/snapshot` instead of `/fixtures`
- Use `/scores/historical/{fixtureId}` for scores

### "401 - Unauthorized"
- Your JWT may have expired
- Get a fresh JWT: `curl -X POST https://txline-dev.txodds.com/auth/guest/start`

### "Missing API token"
- Your API token may not be activated
- Run the subscription script to activate

## Resources

- [TxLINE Documentation](https://txline.txodds.com/documentation/quickstart)
- [World Cup Free Tier](https://txline.txodds.com/documentation/worldcup)
- [TxLINE GitHub](https://github.com/txodds/tx-on-chain)

## License

MIT © 2026 Jonathon Koerner
