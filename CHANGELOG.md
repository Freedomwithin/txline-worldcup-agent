# Changelog

## [0.6.0] - 2026-07-13

### Added
- **History Endpoint**: `/api/history` with throttled snapshots (15-min intervals)
- **Match Detail Modal**: Click any match to view competition, status, start time, and agent activity
- **Agent Activity Display**: Shows which agents are active on each match

### Enhanced
- **UI Overhaul**: Pitch-inspired design with grass green (#35d17d), gold (#ffcc4d), and diagonal stripe background
- **Typography**: Bebas Neue for headings, Manrope for body, JetBrains Mono for stats
- **Agent Cards**: Win-rate progress bars, color-coded bankroll (green/red/gold)
- **Live Indicator**: Pulsing dot on live matches
- **Analytics Page**: Live charts with Chart.js (bankroll, win rate, W/L record, trade volume)
- **Auto-refresh**: 30-second polling on both dashboard and analytics

### Fixed
- Match detail modal re-added after UI overhaul
- Agent data now dynamically handles 3 agents (ML Prophet, Sentinel AI, Simple Momentum)

## [0.5.0] - 2026-07-13

### Added
- **3 ML-Powered Agents**: ML Prophet, Sentinel AI, Simple Momentum
- **ML Pattern Detector**: Statistical analysis for momentum, volatility, and trend detection
- **Real FIFA Rankings**: Team data including Argentina (#1), France (#2), Spain (#3), England (#4), Brazil (#5), Australia (#24), Vietnam (#115), Myanmar (#162)

## [0.4.0] - 2026-07-12

### Added
- Match Detail Modal
- Agent Performance History
- Clickable Match Cards
- Enhanced Dashboard Stats

## [0.3.0] - 2026-07-12

### Added
- Live Web Dashboard deployed to Vercel
- API Endpoint: `/api/matches`
- Auto-refresh: 30 seconds

## [0.2.0] - 2026-07-12

### Added
- Agent Arena (2 agents: Momentum vs Contrarian)
- Realtime Monitor with event detection
- Sharp Movement Detector

## [0.1.0] - 2026-07-11

### Added
- Initial agent implementation
- TxLINE API integration
- JWT and API token authentication
