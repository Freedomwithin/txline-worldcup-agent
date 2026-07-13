# Changelog

## [0.5.0] - 2026-07-13

### Added
- **3 ML-Powered Agents**: Replaced simple agents with ML-powered agents
  - 🧠 **ML Prophet**: Uses ML pattern detection for predictions
  - 🤖 **Sentinel AI**: Combines ML with market sentiment analysis
  - 📈 **Simple Momentum**: Baseline agent following trends
- **Analytics Dashboard**: New `/analytics.html` with Chart.js visualizations
  - Bankroll comparison chart
  - Win rate distribution
  - Trade history visualization
  - Performance radar chart
- **ML Pattern Detector**: Statistical analysis for momentum, volatility, and trend detection

### Enhanced
- **Agent Arena**: 3 agents competing instead of 2
- **Dashboard**: Dynamic agent rendering (supports any number of agents)
- **API**: Returns full agent stats including win rates

## [0.4.0] - 2026-07-12

### Added
- Match Detail Modal: Click any match to view detailed information
- Agent Performance History: Tracks agent performance over time
- Agent Activity Display: Shows which agent is active on each match
- Clickable Match Cards: Hover effects and smooth transitions
- Enhanced Dashboard Stats: Added World Cup counter

## [0.3.0] - 2026-07-12

### Added
- Live Web Dashboard: Deployed to Vercel
- API Endpoint: `/api/matches` returns real-time data
- Environment Variables: Support for `TXLINE_JWT`, `TXLINE_API_TOKEN`
- Auto-refresh: Dashboard updates every 30 seconds

## [0.2.0] - 2026-07-12

### Added
- Agent Arena: Two agents (Momentum vs Contrarian)
- Realtime Monitor: Continuous polling with event detection
- Sharp Movement Detector: Detects sudden changes in match activity

## [0.1.0] - 2026-07-11

### Added
- Initial agent implementation
- TxLINE API integration
- JWT and API token authentication
- Support for `/fixtures/snapshot` and `/scores/historical/{fixtureId}` endpoints
