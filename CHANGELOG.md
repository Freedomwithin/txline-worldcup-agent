# Changelog

## [0.4.0] - 2026-07-12

### Added
- **Match Detail Modal**: Click any match to view detailed information including competition, status, start time, and agent activity
- **Agent Performance History**: Tracks Momentum and Contrarian agent performance over time (bankroll, trades, wins/losses)
- **Agent Activity Display**: Shows which agent is active on each match with real-time updates
- **Clickable Match Cards**: Hover effects and smooth transitions on match cards
- **Enhanced Dashboard Stats**: Added World Cup counter to stats grid
- **Better Error Handling**: Improved error messages and loading states

### Enhanced
- **UI/UX**: Better visual hierarchy, hover effects, and responsive design
- **API**: Added agent decisions and activity tracking to API responses
- **Dashboard**: Real-time agent updates every 30 seconds
- **Mobile Responsiveness**: Improved layout for mobile devices

## [0.3.0] - 2026-07-12

### Added
- **Live Web Dashboard**: Deployed to Vercel at https://txline-worldcup-agent.vercel.app
- **API Endpoint**: `/api/matches` returns real-time World Cup fixture data
- **Environment Variables**: Support for `TXLINE_JWT`, `TXLINE_API_TOKEN`, `TXLINE_API_URL`
- **Local Development**: `vercel dev` for testing locally
- **Auto-refresh**: Dashboard updates every 60 seconds

### Enhanced
- **Error Handling**: Better error messages for missing credentials
- **CORS Support**: API endpoints allow cross-origin requests
- **Logging**: More detailed logs for debugging

## [0.2.0] - 2026-07-12

### Added
- **Agent Arena**: Two agents (Momentum vs Contrarian) compete on the same data
- **Realtime Monitor**: Continuous polling with event detection
- **Sharp Movement Detector**: Detects sudden changes in match activity
- **Submission Summary**: Auto-generates hackathon submission checklist
- **Demo Runner**: `run_all.sh` executes all features in sequence

### Enhanced
- Dashboard shows live/upcoming status with icons
- Pattern analysis includes team statistics
- All scripts use consistent authentication

## [0.1.0] - 2026-07-11

### Added
- Initial agent implementation
- Live match monitoring
- Match dashboard
- Pattern analysis
- Enhanced agent with match categorization
- TxLINE API integration
- JWT and API token authentication
- Support for `/fixtures/snapshot` and `/scores/historical/{fixtureId}` endpoints

### Technical
- Node.js setup
- Axios for API calls
- Dotenv for configuration
- Project structure
