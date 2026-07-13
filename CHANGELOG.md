# Changelog

## [0.7.0] - 2026-07-13

### Added
- **On-chain Settlement**: Agent trades recorded on Solana devnet with real transaction signatures via Memo program
- **Match Detail Modal**: Full modal with match details, agent activity, and keyboard support (Escape to close)
- **Keyboard Accessibility**: Enter/Space to open match, Escape to close modal
- **Screenshots**: Added dashboard and analytics screenshots to README

### Fixed
- API route ordering: `/api/history` and `/api/matches` now properly handled
- Modal now correctly wired to live match data
- Server static file serving for production

### Enhanced
- Modal styling matches pitch theme (dark panel, gold accent, dashed detail rows)
- Keyboard navigation for match cards (`tabindex="0"`, `role="button"`)
- Click-outside and Escape key to close modal

## [0.6.0] - 2026-07-13

### Added
- **History Endpoint**: `/api/history` with throttled snapshots (15-min intervals)
- **Agent Activity Display**: Shows which agents are active on each match

### Enhanced
- **UI Overhaul**: Pitch-inspired design with grass green (#35d17d), gold (#ffcc4d)
- **Typography**: Bebas Neue, Manrope, JetBrains Mono
- **Agent Cards**: Win-rate progress bars, color-coded bankroll
- **Live Indicator**: Pulsing dot on live matches
- **Analytics Page**: Live charts with Chart.js

## [0.5.0] - 2026-07-13

### Added
- **3 ML-Powered Agents**: ML Prophet, Sentinel AI, Simple Momentum
- **ML Pattern Detector**: Statistical analysis for momentum, volatility, and trend detection
- **Real FIFA Rankings**: Team data for Argentina, France, Spain, England, Brazil, Australia, Vietnam, Myanmar

## [0.4.0] - 2026-07-12

### Added
- Match Detail Modal (original implementation)
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
